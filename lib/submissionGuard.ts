/**
 * Guard for public form-submission API routes. Applies:
 *   1. Honeypot check — if a hidden `_hp` field is non-empty, reject silently.
 *   2. CSRF double-submit verification (cookie vs header + HMAC).
 *   3. Optional IP-based rate limiting via the existing rateLimit helper.
 *
 * Usage:
 *   const guard = await guardSubmission(request, body, { rateLimit: { limit: 5 } });
 *   if (!guard.ok) return guard.response;
 */
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import {
  verifyCsrfToken,
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
} from "@/lib/csrf";

type GuardOptions = {
  /** If set, applies IP-based rate limiting. */
  rateLimit?: { limit?: number; windowMs?: number };
  /** Skip CSRF (e.g. for non-form internal endpoints). Default false. */
  skipCsrf?: boolean;
};

type GuardResult =
  | { ok: true; ip: string }
  | { ok: false; response: NextResponse };

/** Extract the caller's IP from standard proxy headers. */
function extractIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

/** Read a cookie value from the Cookie header. */
function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export async function guardSubmission(
  request: Request,
  body: unknown,
  options: GuardOptions = {}
): Promise<GuardResult> {
  const ip = extractIp(request);

  // 1. Rate limit (if requested)
  if (options.rateLimit) {
    const { allowed } = rateLimit({
      ip,
      limit: options.rateLimit.limit ?? 5,
      windowMs: options.rateLimit.windowMs ?? 60_000,
    });
    if (!allowed) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "Too many requests. Please try again shortly." },
          { status: 429 }
        ),
      };
    }
  }

  // 2. Honeypot — hidden field that real users never touch.
  const bodyObj =
    body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const hp = bodyObj._hp;
  if (typeof hp === "string" && hp.trim() !== "") {
    // Silently pretend success to avoid giving bots signal.
    return {
      ok: false,
      response: NextResponse.json({ success: true }),
    };
  }

  // 3. CSRF double-submit
  if (!options.skipCsrf) {
    const headerToken = request.headers.get(CSRF_HEADER_NAME);
    const cookieToken = readCookie(request, CSRF_COOKIE_NAME);
    const valid = await verifyCsrfToken(headerToken, cookieToken);
    if (!valid) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "Invalid or missing CSRF token" },
          { status: 403 }
        ),
      };
    }
  }

  return { ok: true, ip };
}

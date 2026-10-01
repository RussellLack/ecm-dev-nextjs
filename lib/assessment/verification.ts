// lib/assessment/verification.ts
// Server-side checks that decide whether a completed assessment counts as a
// qualified lead (and so whether the browser may push qualify_lead).
//
// Three layers, all evaluated here on the server:
//   1. Honeypot: the hidden `website` field must be empty.
//   2. Minimum completion time: real visitors take longer than MIN_COMPLETION_MS.
//   3. Cloudflare Turnstile: the widget token must verify with siteverify.
//
// Pure module (no Next.js imports) so it can be unit-tested with Node's
// native TypeScript support. The route in app/api/assessment/verify wraps it.

/** Bots observed in GA4 finished in about 2 seconds; real visitors take far longer. */
export const MIN_COMPLETION_MS = 8_000;

/** A startedAt older than this is stale or forged. */
export const MAX_COMPLETION_MS = 24 * 60 * 60 * 1000;

export const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

const TURNSTILE_TIMEOUT_MS = 5_000;

export type RejectReason =
  | "honeypot"
  | "bad_timestamp"
  | "too_fast"
  | "no_secret"
  | "no_token"
  | "turnstile_failed"
  | "turnstile_unreachable";

export type VerificationOutcome =
  | { qualified: true }
  | { qualified: false; reason: RejectReason };

export interface VerificationOptions {
  /** TURNSTILE_SECRET_KEY. Missing means nothing can qualify. */
  secret?: string;
  /** Visitor IP, forwarded to Turnstile as remoteip when known. */
  ip?: string;
  /** Injectable clock and fetch for tests. */
  now?: number;
  fetchImpl?: typeof fetch;
}

export async function verifyAssessmentCompletion(
  body: unknown,
  options: VerificationOptions = {},
): Promise<VerificationOutcome> {
  const b = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const now = options.now ?? Date.now();

  if (typeof b.website === "string" && b.website.length > 0) {
    return { qualified: false, reason: "honeypot" };
  }

  const startedAt = b.startedAt;
  if (typeof startedAt !== "number" || !Number.isFinite(startedAt)) {
    return { qualified: false, reason: "bad_timestamp" };
  }
  const elapsed = now - startedAt;
  if (elapsed > MAX_COMPLETION_MS) {
    return { qualified: false, reason: "bad_timestamp" };
  }
  if (elapsed < MIN_COMPLETION_MS) {
    return { qualified: false, reason: "too_fast" };
  }

  if (!options.secret) return { qualified: false, reason: "no_secret" };

  const token = typeof b.turnstileToken === "string" ? b.turnstileToken : "";
  if (!token) return { qualified: false, reason: "no_token" };

  const form = new URLSearchParams({ secret: options.secret, response: token });
  if (options.ip) form.set("remoteip", options.ip);

  try {
    const res = await (options.fetchImpl ?? fetch)(TURNSTILE_VERIFY_URL, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(TURNSTILE_TIMEOUT_MS),
    });
    const result = (await res.json()) as { success?: boolean };
    return result.success === true
      ? { qualified: true }
      : { qualified: false, reason: "turnstile_failed" };
  } catch {
    // Network error or timeout reaching Cloudflare, not a failed challenge.
    // Fail safe: count nothing, never surface an error to the visitor.
    return { qualified: false, reason: "turnstile_unreachable" };
  }
}

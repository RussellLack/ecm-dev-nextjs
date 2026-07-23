import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * On-demand revalidation endpoint.
 *
 * POST here to invalidate specific ISR paths the moment content changes, so
 * pages can carry a long `revalidate` (3600s) AND still show freshly
 * published content immediately. Keeps day-to-day traffic on the cached CDN
 * bucket while avoiding stale content.
 *
 * Auth: shared secret in the `x-revalidate-secret` header, compared in
 * constant time against REVALIDATE_SECRET. Body: { paths?: string[] }.
 * Callers: the intel Studio "Publish to feed" / "Reject" actions
 * (cross-origin, hence CORS below) and, ideally, a Sanity webhook.
 */

export const dynamic = "force-dynamic";

const ALLOWED_ORIGINS = new Set([
  "https://ecm-dev-intel.sanity.studio",
  "http://localhost:3333",
]);

function corsHeaders(origin: string | null): Record<string, string> {
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "content-type, x-revalidate-secret",
      "Access-Control-Max-Age": "86400",
    };
  }
  return {};
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length || a.length === 0) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin")),
  });
}

export async function POST(req: Request) {
  const cors = corsHeaders(req.headers.get("origin"));
  const expected = process.env.REVALIDATE_SECRET ?? "";
  const provided = req.headers.get("x-revalidate-secret") ?? "";
  if (!expected || !safeEqual(provided, expected)) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401, headers: cors },
    );
  }

  let body: { paths?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    // empty/invalid body is fine — nothing to revalidate
  }

  const paths = Array.isArray(body.paths)
    ? (body.paths.filter((p) => typeof p === "string" && p.startsWith("/")) as string[]).slice(0, 50)
    : [];

  for (const p of paths) revalidatePath(p);

  return NextResponse.json({ ok: true, revalidated: { paths } }, { headers: cors });
}

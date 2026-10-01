import { NextResponse } from "next/server";
import { guardSubmission } from "@/lib/submissionGuard";
import { verifyAssessmentCompletion } from "@/lib/assessment/verification";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/assessment/verify
 *
 * Called by the browser after an assessment result is already on screen. It
 * decides whether the completion counts as a qualified lead; only then does
 * the client push qualify_lead to the dataLayer. Nothing is stored and no
 * email is sent.
 *
 * Every outcome, including a failed CSRF check or rate limit, answers
 * HTTP 200 { ok: true, qualified: boolean } so bots get no signal and the
 * visitor never sees an error.
 *
 * Body: {
 *   startedAt: number          (ms timestamp captured when the assessment rendered)
 *   website?: string          (honeypot, must be empty)
 *   turnstileToken?: string   (Cloudflare Turnstile widget token)
 * }
 */
export async function POST(request: Request) {
  const answer = (qualified: boolean) => NextResponse.json({ ok: true, qualified });

  try {
    const body = await request.json().catch(() => ({}));

    const guard = await guardSubmission(request, body, {
      rateLimit: { limit: 10, windowMs: 60_000 },
    });
    if (!guard.ok) {
      console.info("Assessment verify rejected: guard", guard.response.status);
      return answer(false);
    }

    const ip =
      request.headers.get("x-nf-client-connection-ip") ??
      (guard.ip !== "unknown" ? guard.ip : undefined);

    const outcome = await verifyAssessmentCompletion(body, {
      secret: process.env.TURNSTILE_SECRET_KEY,
      ip,
    });

    if (!outcome.qualified) {
      if (outcome.reason === "turnstile_unreachable" || outcome.reason === "no_secret") {
        console.error("Assessment verify:", outcome.reason);
      } else {
        console.info("Assessment verify rejected:", outcome.reason);
      }
    }

    return answer(outcome.qualified);
  } catch (error: unknown) {
    console.error("Assessment verify error:", error);
    return answer(false);
  }
}

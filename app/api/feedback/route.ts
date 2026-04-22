import { NextResponse } from "next/server";
import { guardSubmission } from "@/lib/submissionGuard";
import { createFeedbackEvent, patchFeedbackComment } from "@/lib/feedback.server";
import { hashInputs, generateFeedbackToken } from "@/lib/estimator/hash";
import { MODEL_VERSION } from "@/lib/estimator/coefficients";
import type {
  FeedbackSubmission,
  FeedbackResponse,
} from "@/lib/estimator/types";

// Netlify Blobs requires the node runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function deriveRegion(acceptLanguage: string | null): string {
  if (!acceptLanguage) return "OTHER";
  const lower = acceptLanguage.toLowerCase();
  if (/^en-gb|-gb/i.test(lower)) return "UK";
  if (/-us/i.test(lower)) return "US";
  if (/-(de|fr|es|it|nl|pl|pt|sv|da|fi|no)/i.test(lower)) return "EU";
  if (/-(jp|cn|kr|hk|tw|sg|in|au|nz)/i.test(lower)) return "APAC";
  return "OTHER";
}

const VALID_REACTIONS = new Set(["too_low", "about_right", "too_high", "not_sure"]);

export async function POST(
  request: Request,
): Promise<NextResponse<FeedbackResponse>> {
  let body: FeedbackSubmission & { _hp?: string };
  try {
    body = (await request.json()) as FeedbackSubmission & { _hp?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const guard = await guardSubmission(request, body, {
    rateLimit: { limit: 10, windowMs: 60_000 },
  });
  if (!guard.ok) {
    const status = guard.response.status;
    const data = (await guard.response.json().catch(() => ({}))) as {
      error?: string;
      success?: boolean;
    };
    if (data.success) return NextResponse.json({ ok: true });
    return NextResponse.json(
      { ok: false, error: data.error ?? "Rejected" },
      { status },
    );
  }

  if (!body.reaction || !body.inputs || !body.computed) {
    return NextResponse.json(
      { ok: false, error: "Missing required fields: reaction, inputs, computed" },
      { status: 400 },
    );
  }
  if (!VALID_REACTIONS.has(body.reaction)) {
    return NextResponse.json({ ok: false, error: "Invalid reaction" }, { status: 400 });
  }
  if (body.comment && body.comment.length > 140) {
    return NextResponse.json({ ok: false, error: "Comment exceeds 140 chars" }, { status: 400 });
  }

  const token = generateFeedbackToken();
  const inputProfileHash = hashInputs(body.inputs);
  const region = deriveRegion(request.headers.get("accept-language"));
  const userAgent = (request.headers.get("user-agent") ?? "").slice(0, 500);

  try {
    await createFeedbackEvent({
      submittedAt: new Date().toISOString(),
      token,
      modelVersion: body.modelVersion ?? MODEL_VERSION,
      inputProfileHash,
      inputProfile: body.inputs,
      computedTotalUsd: body.computed.total,
      computedLayers: body.computed.layers,
      scenarioShown: body.scenarioShown ?? "one_level_up_maturity",
      reaction: body.reaction,
      comment: body.comment ?? null,
      userAgent,
      clientHintRegion: region,
    });
  } catch (err) {
    console.error("[api/feedback] Blob write failed", err);
    return NextResponse.json({ ok: false, error: "Storage error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, token });
}

export async function PATCH(
  request: Request,
): Promise<NextResponse<FeedbackResponse>> {
  let body: { token?: string; comment?: string; _hp?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const guard = await guardSubmission(request, body, {
    rateLimit: { limit: 10, windowMs: 60_000 },
  });
  if (!guard.ok) {
    const status = guard.response.status;
    const data = (await guard.response.json().catch(() => ({}))) as {
      error?: string;
      success?: boolean;
    };
    if (data.success) return NextResponse.json({ ok: true });
    return NextResponse.json(
      { ok: false, error: data.error ?? "Rejected" },
      { status },
    );
  }

  if (!body.token || typeof body.token !== "string") {
    return NextResponse.json({ ok: false, error: "Missing token" }, { status: 400 });
  }
  if (typeof body.comment !== "string") {
    return NextResponse.json({ ok: false, error: "Missing comment" }, { status: 400 });
  }
  if (body.comment.length > 140) {
    return NextResponse.json({ ok: false, error: "Comment exceeds 140 chars" }, { status: 400 });
  }

  const updated = await patchFeedbackComment(body.token, body.comment);
  if (!updated) {
    return NextResponse.json({ ok: false, error: "Token not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, token: body.token });
}

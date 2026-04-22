import { NextResponse } from "next/server";
import { guardSubmission } from "@/lib/submissionGuard";
import {
  createEstimatorLead,
  patchEstimatorLeadActivation,
} from "@/lib/feedback.server";
import { hashInputs } from "@/lib/estimator/hash";
import { MODEL_VERSION } from "@/lib/estimator/coefficients";
import { getCRMProvider, SnovioCRMProvider } from "@/lib/assessment/crm";
import type { EstimatorInputs, LayerCosts } from "@/lib/estimator/types";

// Netlify Blobs + Snov.io push both require the node runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface EmailCaptureBody {
  email?: string;
  consentGiven?: boolean;
  consentText?: string;
  consentVersion?: string;
  consentSource?: "pdf_request" | "book_call";
  modelVersion?: string;
  inputs?: EstimatorInputs;
  computed?: { total: number; layers: LayerCosts };
  _hp?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_SOURCES = new Set<EmailCaptureBody["consentSource"]>([
  "pdf_request",
  "book_call",
]);

export async function POST(request: Request) {
  let body: EmailCaptureBody;
  try {
    body = (await request.json()) as EmailCaptureBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const guard = await guardSubmission(request, body, {
    rateLimit: { limit: 5, windowMs: 60_000 },
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

  if (!body.email || !EMAIL_RE.test(body.email)) {
    return NextResponse.json(
      { ok: false, error: "Valid email is required" },
      { status: 400 },
    );
  }
  if (body.consentGiven !== true) {
    return NextResponse.json(
      { ok: false, error: "Consent is required" },
      { status: 400 },
    );
  }
  if (!body.inputs || !body.computed) {
    return NextResponse.json(
      { ok: false, error: "Missing inputs or computed" },
      { status: 400 },
    );
  }
  const source: "pdf_request" | "book_call" = VALID_SOURCES.has(body.consentSource)
    ? (body.consentSource as "pdf_request" | "book_call")
    : "pdf_request";

  const capturedAt = new Date().toISOString();
  const userAgent = (request.headers.get("user-agent") ?? "").slice(0, 500);

  let lead;
  try {
    lead = await createEstimatorLead({
      capturedAt,
      email: body.email,
      consentSource: source,
      modelVersion: body.modelVersion ?? MODEL_VERSION,
      inputProfileHash: hashInputs(body.inputs),
      inputProfile: body.inputs,
      computedTotalUsd: body.computed.total,
      computedLayers: body.computed.layers,
      consent: {
        given: true,
        text: typeof body.consentText === "string" ? body.consentText : null,
        version: typeof body.consentVersion === "string" ? body.consentVersion : null,
        capturedAt,
      },
      activation: { pushedToCrm: false, pushedAt: null, error: null },
      userAgent,
    });
  } catch (err) {
    console.error("[api/feedback/email] Blob write failed", err);
    return NextResponse.json({ ok: false, error: "Storage error" }, { status: 500 });
  }

  // Snov.io push — synchronous so the Netlify function doesn't freeze before
  // the promise resolves. Mirrors the pattern in /api/assessment/tool-email.
  const crm = getCRMProvider();
  if (crm instanceof SnovioCRMProvider) {
    try {
      await crm.pushToolProspect({
        toolType: "localisation-cost",
        email: body.email,
        consentVersion: body.consentVersion,
      });
      await patchEstimatorLeadActivation(lead._id, {
        pushedToCrm: true,
        pushedAt: new Date().toISOString(),
        error: null,
      });
    } catch (err: unknown) {
      console.error("[api/feedback/email] Snov.io push failed (non-blocking):", err);
      await patchEstimatorLeadActivation(lead._id, {
        pushedToCrm: false,
        pushedAt: new Date().toISOString(),
        error: err instanceof Error ? err.message : String(err),
      }).catch(() => {});
    }
  }

  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { guardSubmission } from "@/lib/submissionGuard";
import { createSubmission, type GateSubmissionRecord } from "@/lib/submissions.server";
import { getCRMProvider, SnovioCRMProvider } from "@/lib/assessment/crm";
import {
  GATE_ACCESS_COOKIE,
  GATE_ACCESS_MAX_AGE,
  GATE_CONSENT_TEXT,
  GATE_CONSENT_VERSION,
} from "@/lib/assessment/gate";

// Blobs + Resend require the Node runtime (not edge).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Internal notification recipient — override via env if it ever changes. */
const NOTIFY_EMAIL = process.env.GATE_NOTIFY_EMAIL || "rl@ecm.dev";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * POST /api/assessment/gate
 *
 * Registration gate that fronts every assessment tool. The submit click is the
 * consent moment: it stores the lead in Netlify Blobs with a verbatim consent
 * audit trail, pushes the contact to Snov.io, emails an internal notification
 * to rl@ecm.dev, and sets a short-lived access cookie so the tool unlocks.
 *
 * No results/PDF are sent here — the visitor gets those at the end of the
 * assessment via the existing tool-email flow.
 *
 * Body: {
 *   toolSlug: string          — e.g. "process", "content-operations-maturity"
 *   toolTitle?: string        — human label, for the notification + record
 *   email: string             — required
 *   firstName?: string
 *   company?: string
 *   consentGiven: true        — required functional consent
 *   marketingOptIn?: boolean  — optional future-communications opt-in
 *   consultRequested?: boolean— optional consultant read-through request
 *   tracking?: object
 *   _hp?: string              — honeypot (must be empty)
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Honeypot + CSRF + rate limit (5/min per IP)
    const guard = await guardSubmission(request, body, {
      rateLimit: { limit: 5, windowMs: 60_000 },
    });
    if (!guard.ok) return guard.response;

    const toolSlug = typeof body.toolSlug === "string" ? body.toolSlug.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const firstName =
      typeof body.firstName === "string" ? body.firstName.trim() : "";
    const company = typeof body.company === "string" ? body.company.trim() : "";
    const toolTitle =
      typeof body.toolTitle === "string" && body.toolTitle.trim()
        ? body.toolTitle.trim()
        : toolSlug;
    const marketingOptIn = body.marketingOptIn === true;
    const consultRequested = body.consultRequested === true;

    if (!toolSlug || !email) {
      return NextResponse.json(
        { error: "toolSlug and email are required" },
        { status: 400 },
      );
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 },
      );
    }
    // Functional consent is the required basis for storing + emailing results.
    if (body.consentGiven !== true) {
      return NextResponse.json(
        { error: "Consent is required to start the assessment." },
        { status: 400 },
      );
    }

    const nowIso = new Date().toISOString();

    // ─── Archive the lead in Netlify Blobs (consent audit trail) ───
    let submissionId = "";
    try {
      const record = await createSubmission<GateSubmissionRecord>({
        kind: "gate",
        _type: "gateRegistration",
        toolSlug,
        toolTitle,
        submittedAt: nowIso,
        firstName,
        email,
        company,
        tracking: body.tracking || {},
        consent: {
          given: true,
          text: GATE_CONSENT_TEXT,
          version: GATE_CONSENT_VERSION,
          capturedAt: nowIso,
        },
        marketingOptIn,
        consultRequested,
        activation: { pushedToCrm: false, pushedAt: null, error: null },
      });
      submissionId = record._id;
    } catch (err: unknown) {
      // Blobs must succeed — the audit record is the source of truth. Reject so
      // the visitor can retry rather than silently losing their consent record.
      console.error("Gate submission archive failed:", err);
      return NextResponse.json(
        { error: "Could not save your registration. Please try again." },
        { status: 500 },
      );
    }

    // ─── Activate in Snov.io (best-effort, never blocks the response) ───
    const crm = getCRMProvider();
    if (crm instanceof SnovioCRMProvider) {
      try {
        await crm.pushToolProspect({
          toolType: toolSlug,
          email,
          firstName,
          company,
          consentVersion: GATE_CONSENT_VERSION,
        });
      } catch (err: unknown) {
        console.error("Snov.io gate push failed (non-blocking):", err);
      }
    }

    // ─── Internal notification to rl@ecm.dev — every submission ───
    await sendInternalNotification({
      email,
      firstName,
      company,
      toolTitle,
      consultRequested,
      marketingOptIn,
      submissionId,
      submittedAt: nowIso,
      tracking: body.tracking || {},
    });

    // ─── Grant access via cookie so the tool unlocks ───
    const res = NextResponse.json({ ok: true, submissionId });
    const secure = new URL(request.url).protocol === "https:";
    res.cookies.set(GATE_ACCESS_COOKIE, "1", {
      httpOnly: false, // client gate component reads this to skip the form
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: GATE_ACCESS_MAX_AGE,
    });
    return res;
  } catch (error: unknown) {
    console.error("Gate registration error:", error);
    return NextResponse.json(
      { error: "Failed to register. Please try again." },
      { status: 500 },
    );
  }
}

/* ─── Internal notification email ─── */

async function sendInternalNotification(lead: {
  email: string;
  firstName: string;
  company: string;
  toolTitle: string;
  consultRequested: boolean;
  marketingOptIn: boolean;
  submissionId: string;
  submittedAt: string;
  tracking: Record<string, unknown>;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — skipping gate notification email");
    return;
  }

  const subject = lead.consultRequested
    ? `[ACTION] Consultant read-through requested — ${lead.toolTitle}`
    : `New assessment registration — ${lead.toolTitle}`;

  const row = (label: string, value: string) =>
    `<tr><td style="padding:4px 12px 4px 0;color:#6e6e6e;font-family:Helvetica,Arial,sans-serif;font-size:13px;">${escapeHtml(
      label,
    )}</td><td style="padding:4px 0;color:#264a37;font-family:Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;">${escapeHtml(
      value,
    )}</td></tr>`;

  const track = lead.tracking as Record<string, string | undefined>;
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8" /></head>
<body style="margin:0;padding:24px;background:#f5f5f5;font-family:Helvetica,Arial,sans-serif;">
  <table width="560" cellpadding="0" cellspacing="0" style="margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #ececec;">
    <tr><td style="background:#316148;padding:20px 24px;">
      <p style="margin:0 0 4px;color:#AAF870;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">ECM.DEV · Assessment gate</p>
      <h1 style="margin:0;color:#fff;font-size:18px;">${
        lead.consultRequested ? "Consultant read-through requested" : "New registration"
      }</h1>
    </td></tr>
    <tr><td style="padding:20px 24px;">
      <table cellpadding="0" cellspacing="0" style="width:100%;">
        ${row("Assessment", lead.toolTitle)}
        ${row("Email", lead.email)}
        ${lead.firstName ? row("First name", lead.firstName) : ""}
        ${lead.company ? row("Company", lead.company) : ""}
        ${row("Consultant read-through", lead.consultRequested ? "REQUESTED" : "no")}
        ${row("Marketing opt-in", lead.marketingOptIn ? "yes" : "no")}
        ${row("Registered at", lead.submittedAt)}
        ${track.utmSource ? row("UTM source", track.utmSource) : ""}
        ${track.utmCampaign ? row("UTM campaign", track.utmCampaign) : ""}
        ${track.landingPage ? row("Landing page", track.landingPage) : ""}
        ${row("Record ID", lead.submissionId)}
      </table>
    </td></tr>
  </table>
</body></html>`;

  try {
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "ECM.DEV <onboarding@resend.dev>",
        to: NOTIFY_EMAIL,
        reply_to: lead.email,
        subject,
        html,
      }),
    });
    if (!resendRes.ok) {
      const err = await resendRes.text().catch(() => "");
      console.error("Gate notification email failed:", resendRes.status, err);
    }
  } catch (err: unknown) {
    console.error("Gate notification email error (non-blocking):", err);
  }
}

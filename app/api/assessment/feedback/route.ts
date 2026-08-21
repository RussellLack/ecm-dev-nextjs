import { NextResponse } from "next/server";
import { guardSubmission } from "@/lib/submissionGuard";
import {
  getSubmissionRecord,
  patchSubmissionRecord,
} from "@/lib/submissions.server";
import { sendEmail } from "@/lib/postmark.server";

// Blobs + Postmark require the Node runtime (not edge).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Internal notification recipient — override via env if it ever changes. */
const NOTIFY_EMAIL = process.env.FEEDBACK_NOTIFY_EMAIL || "rl@ecm.dev";

const Q1_OPTIONS = new Set(["Not very", "Somewhat", "Mostly", "Very accurately"]);
const Q2_OPTIONS = new Set(["Not likely", "Maybe", "Likely", "Very likely"]);
const MAX_COMMENT_LENGTH = 2000;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Honeypot + CSRF + rate limit (5/min per IP) — same guard every public
    // assessment POST route uses.
    const guard = await guardSubmission(request, body, {
      rateLimit: { limit: 5, windowMs: 60_000 },
    });
    if (!guard.ok) return guard.response;

    const { submissionId, q1, q2, comment } = body;

    if (!submissionId || typeof submissionId !== "string") {
      return NextResponse.json(
        { error: "submissionId is required" },
        { status: 400 },
      );
    }
    if (!Q1_OPTIONS.has(q1) || !Q2_OPTIONS.has(q2)) {
      return NextResponse.json(
        { error: "Invalid answer" },
        { status: 400 },
      );
    }

    const trimmedComment =
      typeof comment === "string" ? comment.trim().slice(0, MAX_COMMENT_LENGTH) : "";

    const record = await getSubmissionRecord(submissionId);
    if (!record || record.kind !== "assessment") {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 },
      );
    }

    const submittedAt = new Date().toISOString();
    await patchSubmissionRecord(submissionId, {
      feedback: { q1, q2, comment: trimmedComment, submittedAt },
    });

    // Awaited, not fire-and-forget: on Netlify serverless the function
    // runtime can freeze as soon as the response is sent, so a background
    // promise here would never reliably complete (see tool-email/route.ts's
    // Snov.io push for the same constraint). A failed send is still
    // non-fatal to the visitor -- sendInternalNotification only logs, it
    // never throws -- the feedback itself is already safely stored above.
    await sendInternalNotification({
      assessmentTitle: record.assessment?.title || "Content Infrastructure Maturity Assessment",
      q1,
      q2,
      comment: trimmedComment,
      submissionId,
      submittedAt,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Assessment feedback error:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback. Please try again." },
      { status: 500 },
    );
  }
}

async function sendInternalNotification(feedback: {
  assessmentTitle: string;
  q1: string;
  q2: string;
  comment: string;
  submissionId: string;
  submittedAt: string;
}): Promise<void> {
  const row = (label: string, value: string) =>
    `<tr><td style="padding:4px 12px 4px 0;color:#6e6e6e;font-family:Helvetica,Arial,sans-serif;font-size:13px;">${escapeHtml(
      label,
    )}</td><td style="padding:4px 0;color:#264a37;font-family:Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;">${escapeHtml(
      value,
    )}</td></tr>`;

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8" /></head>
<body style="margin:0;padding:24px;background:#f5f5f5;font-family:Helvetica,Arial,sans-serif;">
  <table width="560" cellpadding="0" cellspacing="0" style="margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #ececec;">
    <tr><td style="background:#316148;padding:20px 24px;">
      <p style="margin:0 0 4px;color:#AAF870;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">ECM.DEV · Assessment feedback</p>
      <h1 style="margin:0;color:#fff;font-size:18px;">New feedback submitted</h1>
    </td></tr>
    <tr><td style="padding:20px 24px;">
      <table cellpadding="0" cellspacing="0" style="width:100%;">
        ${row("Assessment", feedback.assessmentTitle)}
        ${row("How accurately did this reflect their content operation?", feedback.q1)}
        ${row("How likely are they to act on the next step?", feedback.q2)}
        ${row("Submitted at", feedback.submittedAt)}
        ${row("Record ID", feedback.submissionId)}
      </table>
      ${
        feedback.comment
          ? `<div style="margin-top:16px;padding:14px 16px;background:#f9f9f9;border-radius:8px;">
              <p style="margin:0 0 4px;color:#6e6e6e;font-family:Helvetica,Arial,sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Comment</p>
              <p style="margin:0;color:#264a37;font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;">${escapeHtml(feedback.comment)}</p>
            </div>`
          : ""
      }
    </td></tr>
  </table>
</body></html>`;

  const sendResult = await sendEmail({
    to: NOTIFY_EMAIL,
    subject: `New assessment feedback — ${feedback.assessmentTitle}`,
    html,
  });
  if (!sendResult.ok && sendResult.reason === "send_failed") {
    console.error("Feedback notification email failed:", sendResult.error);
  }
}

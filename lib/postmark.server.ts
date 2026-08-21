/**
 * Shared Postmark send helper.
 *
 * Replaces five near-identical raw `fetch("https://api.resend.com/emails")`
 * call sites (report, gate, tool-email, cms-implementation/send, feedback)
 * with one place that knows how to talk to Postmark. Resend was migrated
 * away from because the ecm.dev sending domain there was never DNS-verified
 * (status "failed" — DKIM/SPF records never added), so every email these
 * routes tried to send was silently failing. Postmark's ecm.dev domain is
 * verified and sending correctly (confirmed with a live test send).
 *
 * Callers keep the existing "skip gracefully if unconfigured" behaviour by
 * checking `result.reason === "not_configured"` — this preserves the exact
 * messaging each route already had for a missing API key in local/dev
 * environments, rather than treating it as a hard failure.
 */

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  /** Defaults to EMAIL_FROM env var. */
  from?: string;
  /** Set on internal-notification sends so replying goes to the visitor, not the notification inbox. */
  replyTo?: string;
}

export type SendEmailResult =
  | { ok: true }
  | { ok: false; reason: "not_configured" | "send_failed"; error: string };

export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const token = process.env.POSTMARK_API_TOKEN;
  if (!token) {
    console.warn("POSTMARK_API_TOKEN not set — skipping email delivery");
    return { ok: false, reason: "not_configured", error: "POSTMARK_API_TOKEN not set" };
  }

  try {
    const res = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": token,
      },
      body: JSON.stringify({
        From: params.from || process.env.EMAIL_FROM || "ECM.DEV <rl@ecm.dev>",
        To: params.to,
        Subject: params.subject,
        HtmlBody: params.html,
        MessageStream: "outbound",
        ...(params.replyTo ? { ReplyTo: params.replyTo } : {}),
      }),
    });

    const data = await res.json().catch(() => null);

    // Postmark signals failure two ways: a non-2xx status, or (occasionally,
    // e.g. a suppressed/inactive recipient) a 200 with a non-zero ErrorCode
    // in the body. Check both.
    if (!res.ok || !data || data.ErrorCode !== 0) {
      const detail = data
        ? `Postmark ${data.ErrorCode}: ${data.Message}`
        : `Postmark HTTP ${res.status}`;
      console.error("Postmark send failed:", detail);
      return { ok: false, reason: "send_failed", error: detail };
    }

    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Postmark send error:", message);
    return { ok: false, reason: "send_failed", error: message };
  }
}

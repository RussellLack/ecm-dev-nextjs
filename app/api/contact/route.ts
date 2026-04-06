import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

/** Escape HTML special characters to prevent XSS in email templates */
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
    // Rate limit: 5 submissions per minute per IP
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "unknown";
    const { allowed } = rateLimit({ ip, limit: 5, windowMs: 60_000 });
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again shortly." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, email, message } = body;

    // Basic validation
    if (!email || !message) {
      return NextResponse.json(
        { error: "Email and message are required" },
        { status: 400 }
      );
    }

    // Always log to console (useful in dev + production debugging)
    console.log("━━━ NEW CONTACT FORM SUBMISSION ━━━");
    console.log(`Name:    ${firstName} ${lastName}`);
    console.log(`Email:   ${email}`);
    console.log(`Message: ${message}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Send via Resend
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.warn("RESEND_API_KEY not set — skipping email delivery");
      return NextResponse.json({ success: true });
    }

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "ECM.DEV Contact <onboarding@resend.dev>",
        to: "rl@ecm.dev",
        reply_to: email,
        subject: `New enquiry from ${escapeHtml(firstName || "")} ${escapeHtml(lastName || "")}`.trim(),
        html: [
          `<h2>New contact form submission</h2>`,
          `<p><strong>Name:</strong> ${escapeHtml(firstName || "")} ${escapeHtml(lastName || "")}</p>`,
          `<p><strong>Email:</strong> <a href="mailto:${encodeURI(email)}">${escapeHtml(email)}</a></p>`,
          `<hr />`,
          `<p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>`,
        ].join("\n"),
      }),
    });

    if (!resendRes.ok) {
      const err = await resendRes.text();
      console.error("Resend error:", err);
      throw new Error("Email delivery failed");
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

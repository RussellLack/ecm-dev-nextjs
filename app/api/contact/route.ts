import { NextResponse } from "next/server";
import { guardSubmission } from "@/lib/submissionGuard";

/**
 * Contact form handler.
 *
 * Flow:
 *   1. guardSubmission -> CSRF double-submit + honeypot + 5/min rate limit
 *   2. Validate required fields
 *   3. Forward payload to Netlify Forms as application/x-www-form-urlencoded
 *
 * Netlify detects the `contact` form at build time from public/__forms.html.
 * Email notifications are configured in the Netlify dashboard
 * (Site -> Forms -> Form notifications).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Honeypot + CSRF + rate limit (5/min per IP)
    const guard = await guardSubmission(request, body, {
      rateLimit: { limit: 5, windowMs: 60_000 },
    });
    if (!guard.ok) return guard.response;

    const { firstName, lastName, email, message } = body as {
      firstName?: string;
      lastName?: string;
      email?: string;
      message?: string;
    };

    if (!email || !message) {
      return NextResponse.json(
        { error: "Email and message are required" },
        { status: 400 }
      );
    }

    // Build the site URL Netlify Forms POSTs to. Prefer the deployed URL
    // (set automatically by Netlify at build/runtime) and fall back to the
    // canonical production domain.
    const siteUrl =
      process.env.URL ||
      process.env.DEPLOY_PRIME_URL ||
      "https://ecm.dev";

    const payload = new URLSearchParams({
      "form-name": "contact",
      firstName: firstName ?? "",
      lastName: lastName ?? "",
      email,
      message,
    });

    const netlifyRes = await fetch(siteUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: payload.toString(),
    });

    if (!netlifyRes.ok) {
      const err = await netlifyRes.text().catch(() => "");
      console.error(
        "Netlify Forms submission failed:",
        netlifyRes.status,
        err.slice(0, 500)
      );
      throw new Error("Form submission failed");
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

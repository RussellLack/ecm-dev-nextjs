import { NextResponse } from "next/server";
import { guardSubmission } from "@/lib/submissionGuard";

/**
 * AI Content Readiness Audit signup handler (homepage strip).
 *
 * Flow mirrors the contact form:
 *   1. guardSubmission -> CSRF double-submit + honeypot + 5/min rate limit
 *   2. Validate required fields
 *   3. Forward payload to Netlify Forms as application/x-www-form-urlencoded
 *
 * Netlify detects the `audit-request` form at build time from
 * public/__forms.html. Email notifications are configured in the Netlify
 * dashboard (Site -> Forms -> Form notifications).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Honeypot + CSRF + rate limit (5/min per IP)
    const guard = await guardSubmission(request, body, {
      rateLimit: { limit: 5, windowMs: 60_000 },
    });
    if (!guard.ok) return guard.response;

    const { fullName, workEmail, company, websiteUrl, notes } = body as {
      fullName?: string;
      workEmail?: string;
      company?: string;
      websiteUrl?: string;
      notes?: string;
    };

    if (!fullName || !workEmail || !company || !websiteUrl) {
      return NextResponse.json(
        { error: "Name, work email, company and website URL are required" },
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
      "form-name": "audit-request",
      fullName,
      workEmail,
      company,
      websiteUrl,
      notes: notes ?? "",
    });

    const netlifyRes = await fetch(`${siteUrl.replace(/\/$/, "")}/__forms.html`, {
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
    console.error("Audit request form error:", error);
    return NextResponse.json(
      { error: "Failed to send request" },
      { status: 500 }
    );
  }
}

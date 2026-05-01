import { NextResponse } from "next/server";
import { getToolSubmission } from "@/lib/assessment/queries";
import { guardSubmission } from "@/lib/submissionGuard";
import {
  patchSubmissionRecord,
  type ToolSubmissionRecord,
} from "@/lib/submissions.server";
import { getCRMProvider, SnovioCRMProvider } from "@/lib/assessment/crm";
import type {
  CmsImplementationInputs,
  CmsImplementationResult,
} from "@/lib/assessment/cms-implementation/types";

// Blobs requires the Node runtime (not edge).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/assessment/cms-implementation/send
 *
 * Email-gated delivery of the CMS Implementation Cost Estimator result.
 * Mirrors /api/assessment/tool-email but with a bespoke HTML template that
 * shows the TCO band, breakdown table, and shareable link.
 *
 * Body: {
 *   submissionId: string         — from prior /api/assessment/tool-submit
 *   email: string
 *   name?: string
 *   company?: string
 *   role?: string
 *   consentGiven: boolean        — required true
 *   consentText?: string
 *   consentVersion?: string
 *   bookCall?: boolean           — optional flag to surface Calendly CTA
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const guard = await guardSubmission(request, body, {
      rateLimit: { limit: 5, windowMs: 60_000 },
    });
    if (!guard.ok) return guard.response;

    const {
      submissionId,
      email,
      name,
      company,
      role,
      consentGiven,
      consentText,
      consentVersion,
      bookCall,
    } = body;

    if (!submissionId || !email) {
      return NextResponse.json(
        { error: "submissionId and email are required" },
        { status: 400 },
      );
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 },
      );
    }
    if (consentGiven !== true) {
      return NextResponse.json(
        { error: "Consent is required to send the results email." },
        { status: 400 },
      );
    }

    const submission = await getToolSubmission(submissionId);
    if (!submission || submission.toolType !== "cms-implementation") {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 },
      );
    }

    /* ── Patch Blobs with email + consent audit trail ─────────────────── */
    const nowIso = new Date().toISOString();
    const displayName = (name || submission.name || "").toString();
    const patch: Partial<ToolSubmissionRecord> = {
      email,
      name: displayName,
      role: role || submission.role || "",
      company: company || submission.company || "",
      consent: {
        given: true,
        text: typeof consentText === "string" ? consentText : null,
        version: typeof consentVersion === "string" ? consentVersion : null,
        capturedAt: nowIso,
      },
    };
    await patchSubmissionRecord(submissionId, patch).catch((err: unknown) =>
      console.error(
        "Failed to patch CMS-implementation submission record:",
        err,
      ),
    );

    /* ── Snov.io push (non-blocking on error) ─────────────────────────── */
    const crm = getCRMProvider();
    if (crm instanceof SnovioCRMProvider) {
      const [firstName, ...rest] = displayName.split(/\s+/);
      try {
        await crm.pushToolProspect({
          toolType: "cms-implementation",
          email,
          firstName,
          lastName: rest.join(" "),
          company: company || submission.company,
          role: role || submission.role,
          consentVersion:
            typeof consentVersion === "string" ? consentVersion : undefined,
        });
        await patchSubmissionRecord(submissionId, {
          activation: {
            pushedToCrm: true,
            pushedAt: new Date().toISOString(),
            error: null,
          },
        });
      } catch (err: unknown) {
        console.error("Snov.io CMS-implementation push failed:", err);
        await patchSubmissionRecord(submissionId, {
          activation: {
            pushedToCrm: false,
            pushedAt: new Date().toISOString(),
            error: err instanceof Error ? err.message : String(err),
          },
        }).catch(() => {});
      }
    }

    /* ── Send the email ───────────────────────────────────────────────── */
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("RESEND_API_KEY not set — skipping email delivery");
      return NextResponse.json({
        success: true,
        warning: "Email delivery skipped (no API key)",
      });
    }

    const inputs: CmsImplementationInputs = JSON.parse(submission.answers);
    const result: CmsImplementationResult = JSON.parse(submission.results);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ecm.dev";
    const resultsUrl = `${baseUrl}/assessment/cms-implementation/result/${submissionId}`;
    const pdfUrl = `${baseUrl}/api/assessment/pdf?sid=${submissionId}&type=cms-implementation`;

    const html = buildCmsImplementationEmail({
      result,
      inputs,
      name: displayName,
      resultsUrl,
      pdfUrl,
      bookCall: bookCall === true,
    });

    const horizon = inputs.runtime?.horizon ?? 3;
    const sym = currencySymbol(result.currency);
    const m = result.currencyMultiplier;
    const total = horizon === 5 ? result.fiveYearTotal : result.threeYearTotal;
    const subject = `Your CMS Implementation TCO — ${fmt(total.low * m, sym)}–${fmt(total.high * m, sym)} over ${horizon} years`;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "ECM.DEV <onboarding@resend.dev>",
        to: email,
        subject,
        html,
      }),
    });

    if (!resendRes.ok) {
      const err = await resendRes.text();
      console.error("Resend error:", err);
      return NextResponse.json(
        { error: "Failed to send email. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, resultsUrl });
  } catch (error: unknown) {
    console.error("CMS-implementation email error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 },
    );
  }
}

/* ── HTML template ─────────────────────────────────────────────────────── */

function buildCmsImplementationEmail({
  result,
  inputs,
  name,
  resultsUrl,
  pdfUrl,
  bookCall,
}: {
  result: CmsImplementationResult;
  inputs: CmsImplementationInputs;
  name: string;
  resultsUrl: string;
  pdfUrl: string;
  bookCall: boolean;
}): string {
  const firstName = name?.split(" ")[0] || "there";
  const horizon = inputs.runtime.horizon;
  const m = result.currencyMultiplier;
  const sym = currencySymbol(result.currency);
  const total = horizon === 5 ? result.fiveYearTotal : result.threeYearTotal;
  const benefit = inputs.options?.useTeiBenefit
    ? result.benefit.tei
    : result.benefit.conservative;
  const benefitTotal =
    horizon === 5 ? benefit.fiveYearValue : benefit.threeYearValue;

  const breakdownRows = [
    {
      label: "Year 1 implementation",
      r: result.breakdown.implementation,
      cadence: "One-off",
    },
    {
      label: "Contingency",
      r: result.breakdown.contingency,
      cadence: "One-off",
    },
    {
      label: "Annual licence",
      r: result.breakdown.licence,
      cadence: "Annual",
    },
    {
      label: "Annual hosting + run team",
      r: result.breakdown.hosting,
      cadence: "Annual",
    },
    {
      label: "Annual vendor support",
      r: result.breakdown.vendorSupport,
      cadence: "Annual",
    },
    {
      label: "Out-year enhancement",
      r: result.breakdown.outYearEnhancement,
      cadence: "Annual (Y2+)",
    },
  ];

  const breakdownHtml = breakdownRows
    .map(
      (row) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#333;">
            ${escapeHtml(row.label)}
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#999;text-align:center;">
            ${escapeHtml(row.cadence)}
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#333;text-align:right;font-variant-numeric:tabular-nums;">
            ${fmt(row.r.low * m, sym)} – ${fmt(row.r.high * m, sym)}
          </td>
        </tr>`,
    )
    .join("");

  const notesHtml = result.flags.notes
    .map(
      (n) =>
        `<li style="padding:4px 0;font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#666;line-height:1.5;">${escapeHtml(n)}</li>`,
    )
    .join("");

  const tier = inputs.target.tier;
  const vendor = inputs.target.vendor || "—";
  const horizonLabel = `${horizon}-year`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background-color:#f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:40px 20px;">
    <tr><td align="center">
      <table width="640" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

        <!-- Header -->
        <tr>
          <td style="background-color:#0B1F0E;padding:36px 40px;">
            <p style="margin:0 0 6px;font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#AAF870;text-transform:uppercase;letter-spacing:2px;font-weight:600;">ECM.DEV · Assessment</p>
            <h1 style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:24px;color:#ffffff;font-weight:700;line-height:1.25;">CMS Implementation Cost — ${horizonLabel} TCO</h1>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding:32px 40px 16px;">
            <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#666;line-height:1.6;">
              Hi ${escapeHtml(firstName)} — here's the take-away from the estimator. The shareable link
              below renders the same calculation; pass it to your CFO or
              steering group with no extra steps for them.
            </p>
          </td>
        </tr>

        <!-- Headline TCO -->
        <tr>
          <td style="padding:0 40px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0B1F0E;border-radius:10px;">
              <tr>
                <td style="padding:24px 28px;">
                  <p style="margin:0 0 4px;font-family:Helvetica,Arial,sans-serif;font-size:10px;color:rgba(170,248,112,0.7);text-transform:uppercase;letter-spacing:2px;font-weight:600;">Indicative ${horizonLabel} TCO</p>
                  <p style="margin:0 0 12px;font-family:Helvetica,Arial,sans-serif;font-size:30px;color:#AAF870;font-weight:700;line-height:1.1;font-variant-numeric:tabular-nums;">
                    ${fmt(total.low * m, sym)} – ${fmt(total.high * m, sym)}
                  </p>
                  <p style="margin:0 0 14px;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:rgba(255,255,255,0.7);">
                    Mid case ${fmt(total.mid * m, sym)} · ${escapeHtml(confidenceLabel(result.flags.confidence))}
                  </p>
                  <div style="border-top:1px solid rgba(170,248,112,0.2);padding-top:14px;">
                    <p style="margin:0 0 4px;font-family:Helvetica,Arial,sans-serif;font-size:10px;color:rgba(170,248,112,0.7);text-transform:uppercase;letter-spacing:2px;font-weight:600;">Net of benefit</p>
                    <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:20px;color:#AAF870;font-weight:700;font-variant-numeric:tabular-nums;">
                      ${fmt((total.low - benefitTotal.high) * m, sym)} – ${fmt((total.high - benefitTotal.low) * m, sym)}
                    </p>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Scenario summary -->
        <tr>
          <td style="padding:0 40px 20px;">
            <h3 style="margin:0 0 10px;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#333;font-weight:700;">Scenario</h3>
            <table width="100%" cellpadding="0" cellspacing="0" style="font-family:Helvetica,Arial,sans-serif;font-size:13px;">
              ${[
                ["Org size", inputs.org.size],
                ["Region", inputs.org.region],
                ["Current platform", inputs.current.platform],
                ["Target tier", tier],
                ["Specific vendor", vendor],
                ["Sites / locales", `${inputs.scope.sites} / ${inputs.scope.locales}`],
                ["Editors", String(inputs.runtime.editors)],
              ]
                .map(
                  ([l, v]) =>
                    `<tr><td style="padding:3px 0;color:#999;width:140px;">${escapeHtml(l)}</td><td style="padding:3px 0;color:#333;">${escapeHtml(String(v))}</td></tr>`,
                )
                .join("")}
            </table>
          </td>
        </tr>

        <!-- Breakdown -->
        <tr>
          <td style="padding:0 40px 20px;">
            <h3 style="margin:0 0 10px;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#333;font-weight:700;">Cost breakdown</h3>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0f0f0;border-radius:8px;overflow:hidden;">
              <tr>
                <td style="background-color:#fafafa;padding:8px 12px;font-family:Helvetica,Arial,sans-serif;font-size:10px;color:#999;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Line</td>
                <td style="background-color:#fafafa;padding:8px 12px;font-family:Helvetica,Arial,sans-serif;font-size:10px;color:#999;text-transform:uppercase;letter-spacing:1px;font-weight:700;text-align:center;">Cadence</td>
                <td style="background-color:#fafafa;padding:8px 12px;font-family:Helvetica,Arial,sans-serif;font-size:10px;color:#999;text-transform:uppercase;letter-spacing:1px;font-weight:700;text-align:right;">Range</td>
              </tr>
              ${breakdownHtml}
            </table>
          </td>
        </tr>

        ${
          notesHtml
            ? `<tr>
          <td style="padding:0 40px 20px;">
            <h3 style="margin:0 0 8px;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#333;font-weight:700;">Notes</h3>
            <ul style="margin:0;padding-left:18px;">${notesHtml}</ul>
          </td>
        </tr>`
            : ""
        }

        <!-- CTA buttons -->
        <tr>
          <td style="padding:24px 40px 16px;text-align:center;">
            <a href="${resultsUrl}" style="display:inline-block;padding:14px 28px;background-color:#AAF870;color:#0B1F0E;font-family:Helvetica,Arial,sans-serif;font-size:14px;font-weight:700;text-decoration:none;border-radius:30px;margin:4px;">View shareable link</a>
            <a href="${pdfUrl}" style="display:inline-block;padding:14px 28px;background-color:#f0f0f0;color:#333;font-family:Helvetica,Arial,sans-serif;font-size:14px;font-weight:700;text-decoration:none;border-radius:30px;margin:4px;">Download PDF</a>
          </td>
        </tr>

        ${
          bookCall
            ? `<tr>
          <td style="padding:8px 40px 16px;text-align:center;">
            <p style="margin:0 0 10px;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#666;line-height:1.5;">
              You asked about a benchmarking call. We'll be in touch within
              one working day with options. If you'd rather pick a slot now:
            </p>
            <a href="https://ecm.dev/contact" style="display:inline-block;padding:10px 22px;background-color:#0B1F0E;color:#AAF870;font-family:Helvetica,Arial,sans-serif;font-size:13px;font-weight:700;text-decoration:none;border-radius:30px;">Book a call →</a>
          </td>
        </tr>`
            : `<tr>
          <td style="padding:8px 40px 24px;text-align:center;">
            <p style="margin:0 0 10px;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#666;line-height:1.5;">
              Want help tightening the range or stress-testing the assumptions?
            </p>
            <a href="https://ecm.dev/contact" style="font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#0B1F0E;font-weight:600;text-decoration:underline;">Book a 30-min benchmarking call</a>
          </td>
        </tr>`
        }

        <!-- Methodology link -->
        <tr>
          <td style="padding:0 40px 24px;">
            <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#999;line-height:1.6;border-top:1px solid #eee;padding-top:14px;">
              Curious how the numbers are derived? The
              <a href="${escapeHtml(process.env.NEXT_PUBLIC_SITE_URL || "https://ecm.dev")}/assessment/cms-implementation/methodology" style="color:#0B1F0E;font-weight:600;">methodology page</a>
              documents every coefficient with its source and confidence rating
              (A / B / C). Coefficients are refreshed quarterly. Model version
              ${escapeHtml(result.modelVersion)}.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:#f9f9f9;padding:24px 40px;border-top:1px solid #eee;">
            <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#999;text-align:center;">
              ECM.DEV — Content Operations Intelligence<br />
              <a href="https://ecm.dev" style="color:#999;">ecm.dev</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/* ── Helpers ───────────────────────────────────────────────────────────── */

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function currencySymbol(c: "USD" | "GBP" | "EUR"): string {
  return c === "USD" ? "$" : c === "GBP" ? "£" : "€";
}

function fmt(value: number, sym: string): string {
  if (value === 0) return `${sym}0`;
  if (Math.abs(value) >= 1_000_000) {
    return `${value < 0 ? "-" : ""}${sym}${Math.abs(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${value < 0 ? "-" : ""}${sym}${Math.round(Math.abs(value) / 1_000).toLocaleString("en-GB")}k`;
  }
  return `${value < 0 ? "-" : ""}${sym}${Math.round(Math.abs(value)).toLocaleString("en-GB")}`;
}

function confidenceLabel(c: "A" | "B" | "C"): string {
  return c === "A" ? "High confidence" : c === "B" ? "Medium confidence" : "Indicative only";
}

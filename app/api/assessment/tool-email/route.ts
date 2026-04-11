import { NextResponse } from "next/server";
import { getToolSubmission } from "@/lib/assessment/queries";
import { guardSubmission } from "@/lib/submissionGuard";
import { patchSubmissionRecord, type ToolSubmissionRecord } from "@/lib/submissions.server";
import { getCRMProvider, SnovioCRMProvider } from "@/lib/assessment/crm";

// Blobs requires the Node runtime (not edge).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    // Honeypot + CSRF + rate limit (5/min per IP)
    const guard = await guardSubmission(request, body, {
      rateLimit: { limit: 5, windowMs: 60_000 },
    });
    if (!guard.ok) return guard.response;

    const { submissionId, email, name, consentGiven, consentText, consentVersion } = body;

    if (!submissionId || !email) {
      return NextResponse.json(
        { error: "submissionId and email are required" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Consent gate — explicit opt-in required to send the email and to push
    // the contact to Snov.io.
    if (consentGiven !== true) {
      return NextResponse.json(
        { error: "Consent is required to send the results email." },
        { status: 400 }
      );
    }

    const submission = await getToolSubmission(submissionId);
    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // ─── Patch the Blobs record with email + consent audit trail ───
    const nowIso = new Date().toISOString();
    const displayName = (name || submission.name || "").toString();
    const patch: Partial<ToolSubmissionRecord> = {
      email,
      name: displayName,
      consent: {
        given: true,
        text: typeof consentText === "string" ? consentText : null,
        version: typeof consentVersion === "string" ? consentVersion : null,
        capturedAt: nowIso,
      },
    };
    await patchSubmissionRecord(submissionId, patch).catch((err: unknown) =>
      console.error("Failed to patch tool submission record:", err),
    );

    // ─── Activate in Snov.io (fire-and-forget) ───
    const crm = getCRMProvider();
    if (crm instanceof SnovioCRMProvider) {
      const [firstName, ...rest] = displayName.split(/\s+/);
      crm
        .pushToolProspect({
          toolType: submission.toolType,
          email,
          firstName,
          lastName: rest.join(" "),
          company: submission.company,
          role: submission.role,
          consentVersion:
            typeof consentVersion === "string" ? consentVersion : undefined,
        })
        .then(() =>
          patchSubmissionRecord(submissionId, {
            activation: {
              pushedToCrm: true,
              pushedAt: new Date().toISOString(),
              error: null,
            },
          }),
        )
        .catch((err: unknown) => {
          console.error("Snov.io tool push failed (non-blocking):", err);
          void patchSubmissionRecord(submissionId, {
            activation: {
              pushedToCrm: false,
              pushedAt: new Date().toISOString(),
              error: err instanceof Error ? err.message : String(err),
            },
          });
        });
    }

    const results =
      typeof submission.results === "string"
        ? JSON.parse(submission.results)
        : submission.results;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("RESEND_API_KEY not set — skipping email delivery");
      return NextResponse.json({
        success: true,
        warning: "Email delivery skipped (no API key)",
      });
    }

    const isProcess = submission.toolType === "process";
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ecm.dev";
    const resultsUrl = isProcess
      ? `${baseUrl}/assessment/process/results?sid=${submissionId}`
      : `${baseUrl}/assessment/lead-magnet/results?sid=${submissionId}`;
    const pdfUrl = isProcess
      ? `${baseUrl}/api/assessment/pdf?sid=${submissionId}&type=process`
      : `${baseUrl}/api/assessment/pdf?sid=${submissionId}&type=lead-magnet`;

    const subject = isProcess
      ? `Your Process Assessment — Pre-Diagnostic Brief`
      : `Your Lead Magnet Analysis — ${results.readiness || 0}% Readiness`;

    const html = isProcess
      ? buildProcessEmail(results, submission.name || "", resultsUrl, pdfUrl)
      : buildLeadMagnetEmail(results, submission.name || "", resultsUrl, pdfUrl);

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
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Tool email error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}

/* ─── Process Assessment Email ─── */

function buildProcessEmail(
  results: any,
  name: string,
  resultsUrl: string,
  pdfUrl: string
): string {
  const firstName = name?.split(" ")[0] || "there";

  const flagsHtml = (results.flags || [])
    .slice(0, 5)
    .map(
      (f: any) =>
        `<div style="padding:8px 12px;margin-bottom:6px;border-radius:6px;background-color:${f.type === "critical" ? "#FEF2F2" : "#FFFBEB"};border-left:3px solid ${f.type === "critical" ? "#EF4444" : "#F59E0B"};font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#333;">${escapeHtml(f.msg)}</div>`
    )
    .join("");

  const topicsHtml = (results.topics || [])
    .slice(0, 5)
    .map(
      (t: string, i: number) =>
        `<div style="padding:6px 0;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#333;"><span style="color:#AAF870;font-weight:700;margin-right:6px;">${i + 1}.</span>${escapeHtml(t)}</div>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background-color:#f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

        <!-- Header -->
        <tr>
          <td style="background-color:#0B1F0E;padding:36px 40px;">
            <p style="margin:0 0 6px;font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#AAF870;text-transform:uppercase;letter-spacing:2px;font-weight:600;">ECM.DEV</p>
            <h1 style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:22px;color:#ffffff;font-weight:700;">Pre-Diagnostic Brief</h1>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding:32px 40px 16px;">
            <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#666;line-height:1.6;">
              Hi ${escapeHtml(firstName)}, here is your process assessment brief.
            </p>
          </td>
        </tr>

        <!-- Summary -->
        <tr>
          <td style="padding:0 40px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:50%;padding:12px 16px;background-color:#f9f9f9;border-radius:8px;vertical-align:top;">
                  <p style="margin:0 0 4px;font-family:Helvetica,Arial,sans-serif;font-size:10px;color:#999;text-transform:uppercase;letter-spacing:1px;">Process State</p>
                  <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:16px;color:#333;font-weight:700;">${escapeHtml(results.ratingLabel || "—")}</p>
                </td>
                <td style="width:8px;"></td>
                <td style="width:50%;padding:12px 16px;background-color:#f9f9f9;border-radius:8px;vertical-align:top;">
                  <p style="margin:0 0 4px;font-family:Helvetica,Arial,sans-serif;font-size:10px;color:#999;text-transform:uppercase;letter-spacing:1px;">Business Impact</p>
                  <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:16px;color:#333;font-weight:700;">${escapeHtml(results.impactLabel || "—")}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Process overview -->
        <tr>
          <td style="padding:0 40px 20px;">
            <h3 style="margin:0 0 10px;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#333;font-weight:700;">Process Overview</h3>
            <table width="100%" cellpadding="0" cellspacing="0" style="font-family:Helvetica,Arial,sans-serif;font-size:13px;">
              ${[
                ["Domain", results.domain],
                ["Type", results.processType],
                ["Frequency", results.frequency],
                ["People", results.people],
                ["Duration", results.duration],
              ]
                .map(
                  ([l, v]) =>
                    `<tr><td style="padding:4px 0;color:#999;width:100px;">${l}</td><td style="padding:4px 0;color:#333;">${escapeHtml(v || "—")}</td></tr>`
                )
                .join("")}
            </table>
          </td>
        </tr>

        <!-- Divider -->
        <tr><td style="padding:0 40px;"><div style="height:1px;background-color:#eee;"></div></td></tr>

        <!-- Flags -->
        ${
          flagsHtml
            ? `<tr>
          <td style="padding:20px 40px 8px;">
            <h3 style="margin:0 0 10px;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#333;font-weight:700;">Consultant Flags</h3>
            ${flagsHtml}
          </td>
        </tr>`
            : ""
        }

        <!-- Topics -->
        ${
          topicsHtml
            ? `<tr>
          <td style="padding:16px 40px 8px;">
            <h3 style="margin:0 0 10px;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#333;font-weight:700;">Discussion Topics</h3>
            ${topicsHtml}
          </td>
        </tr>`
            : ""
        }

        <!-- CTA buttons -->
        <tr>
          <td style="padding:24px 40px 16px;text-align:center;">
            <a href="${resultsUrl}" style="display:inline-block;padding:14px 32px;background-color:#AAF870;color:#0B1F0E;font-family:Helvetica,Arial,sans-serif;font-size:14px;font-weight:700;text-decoration:none;border-radius:30px;margin-right:8px;">View full results</a>
            <a href="${pdfUrl}" style="display:inline-block;padding:14px 32px;background-color:#f0f0f0;color:#333;font-family:Helvetica,Arial,sans-serif;font-size:14px;font-weight:700;text-decoration:none;border-radius:30px;">Download PDF</a>
          </td>
        </tr>

        <!-- Secondary CTA -->
        <tr>
          <td style="padding:8px 40px 32px;text-align:center;">
            <p style="margin:0 0 12px;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#666;">
              Want to discuss your process assessment with ECM?
            </p>
            <a href="https://ecm.dev/contact" style="font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#AAF870;font-weight:600;text-decoration:underline;">Book a discovery call</a>
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

/* ─── Lead Magnet Email ─── */

function buildLeadMagnetEmail(
  results: any,
  name: string,
  resultsUrl: string,
  pdfUrl: string
): string {
  const firstName = name?.split(" ")[0] || "there";
  const readiness = results.readiness || 0;
  const readinessColor =
    readiness >= 75 ? "#34D399" : readiness >= 50 ? "#FBBF24" : "#FB923C";

  const formatsHtml = (results.topThree || [])
    .map(
      (f: any, i: number) =>
        `<div style="padding:14px 16px;margin-bottom:8px;border-radius:8px;background-color:#f9f9f9;border:1px solid #eee;">
          <p style="margin:0 0 4px;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#333;font-weight:700;">${i + 1}. ${escapeHtml(f.name)}</p>
          <p style="margin:0 0 4px;font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#666;">${escapeHtml(f.description)}</p>
          <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#999;">Effort: ${escapeHtml(f.effort)} &middot; Timeline: ${escapeHtml(f.timeToCreate)}</p>
        </div>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background-color:#f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

        <!-- Header -->
        <tr>
          <td style="background-color:#0B1F0E;padding:36px 40px;">
            <p style="margin:0 0 6px;font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#AAF870;text-transform:uppercase;letter-spacing:2px;font-weight:600;">ECM.DEV</p>
            <h1 style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:22px;color:#ffffff;font-weight:700;">Lead Magnet Analysis</h1>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding:32px 40px 16px;">
            <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#666;line-height:1.6;">
              Hi ${escapeHtml(firstName)}, here are your lead magnet recommendations.
            </p>
          </td>
        </tr>

        <!-- Readiness Score -->
        <tr>
          <td style="padding:0 40px 20px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:24px;vertical-align:bottom;">
                  <span style="font-family:Helvetica,Arial,sans-serif;font-size:54px;font-weight:700;color:${readinessColor};line-height:1;">${readiness}%</span>
                </td>
                <td style="vertical-align:bottom;padding-bottom:12px;">
                  <span style="display:inline-block;padding:5px 14px;border-radius:20px;background-color:${readinessColor};color:#fff;font-family:Helvetica,Arial,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">${escapeHtml(results.readinessLabel || "")}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Top formats -->
        <tr>
          <td style="padding:0 40px 20px;">
            <h3 style="margin:0 0 12px;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#333;font-weight:700;">Your Top 3 Formats</h3>
            ${formatsHtml}
          </td>
        </tr>

        <!-- Priority gap -->
        ${
          results.biggestGap
            ? `<tr>
          <td style="padding:0 40px 20px;">
            <div style="padding:16px;border-radius:8px;background-color:#FFFBEB;border:1px solid #FDE68A;">
              <p style="margin:0 0 4px;font-family:Helvetica,Arial,sans-serif;font-size:10px;color:#92400E;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Priority gap to close</p>
              <p style="margin:0 0 4px;font-family:Helvetica,Arial,sans-serif;font-size:16px;color:#92400E;font-weight:700;">${escapeHtml(results.biggestGap.dimension)}</p>
              <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#B45309;">Current: ${results.biggestGap.current}/5 &middot; Required: ${results.biggestGap.required}/5</p>
            </div>
          </td>
        </tr>`
            : ""
        }

        <!-- CTA buttons -->
        <tr>
          <td style="padding:16px 40px 16px;text-align:center;">
            <a href="${resultsUrl}" style="display:inline-block;padding:14px 32px;background-color:#AAF870;color:#0B1F0E;font-family:Helvetica,Arial,sans-serif;font-size:14px;font-weight:700;text-decoration:none;border-radius:30px;margin-right:8px;">View full results</a>
            <a href="${pdfUrl}" style="display:inline-block;padding:14px 32px;background-color:#f0f0f0;color:#333;font-family:Helvetica,Arial,sans-serif;font-size:14px;font-weight:700;text-decoration:none;border-radius:30px;">Download PDF</a>
          </td>
        </tr>

        <!-- Secondary CTA -->
        <tr>
          <td style="padding:8px 40px 32px;text-align:center;">
            <p style="margin:0 0 12px;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#666;">
              Want help building your lead magnet?
            </p>
            <a href="https://ecm.dev/contact" style="font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#AAF870;font-weight:600;text-decoration:underline;">Talk to the team</a>
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

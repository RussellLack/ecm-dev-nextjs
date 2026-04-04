import { NextResponse } from "next/server";
import { getSubmission, getMaturityBands, getServiceRecommendations } from "@/lib/assessment/queries";
import { writeClient } from "@/lib/sanityWrite";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { submissionId, email, name } = body;

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

    // Fetch submission data
    const submission = await getSubmission(submissionId);
    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // Fetch bands for full band info
    const [bands, recommendations] = await Promise.all([
      getMaturityBands(submission.assessment._id),
      getServiceRecommendations(),
    ]);

    const band = bands.find(
      (b: any) =>
        submission.totalScore >= b.minScore && submission.totalScore <= b.maxScore
    ) || bands[0];

    // Map recommendations for weak areas
    const weakAreas: string[] = submission.weakAreas || [];
    const mappedRecs: Array<{
      title: string;
      summary: string;
      dimensionTitle: string;
    }> = [];

    for (const dimKey of weakAreas) {
      const matching = recommendations
        .filter(
          (r: any) =>
            r.dimension?.key?.current === dimKey &&
            submission.bandLevel <= (r.minBandLevel || 4)
        )
        .sort((a: any, b: any) => (a.priority || 0) - (b.priority || 0));

      for (const rec of matching.slice(0, 2)) {
        mappedRecs.push({
          title: rec.title,
          summary: rec.summary || "",
          dimensionTitle:
            submission.dimensionScores?.find((d: any) => d.dimensionKey === dimKey)
              ?.dimensionTitle || dimKey,
        });
      }
    }

    // Update submission with email (captures the lead)
    if (!submission.email) {
      await writeClient
        .patch(submissionId)
        .set({
          email,
          firstName: name || submission.firstName || "",
        })
        .commit()
        .catch((err: any) =>
          console.error("Failed to update submission with email:", err)
        );
    }

    // Send email via Resend
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("RESEND_API_KEY not set — skipping email delivery");
      return NextResponse.json({
        success: true,
        warning: "Email delivery skipped (no API key)",
      });
    }

    const firstName = name?.split(" ")[0] || "there";

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "ECM.DEV <onboarding@resend.dev>",
        to: email,
        subject: `Your Content Operations Maturity Report — ${submission.totalScore}% (${band?.title || submission.bandTitle})`,
        html: buildReportEmail({
          firstName,
          totalScore: submission.totalScore,
          bandTitle: band?.title || submission.bandTitle || "",
          bandHeadline: band?.headline || "",
          bandDescription: band?.description || "",
          bandColor: band?.color || "#6B7280",
          bandLevel: submission.bandLevel,
          dimensionScores: submission.dimensionScores || [],
          weakAreas,
          recommendations: mappedRecs,
        }),
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
    console.error("Report email error:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}

// ─── Full Report Email HTML ───
function buildReportEmail({
  firstName,
  totalScore,
  bandTitle,
  bandHeadline,
  bandDescription,
  bandColor,
  bandLevel,
  dimensionScores,
  weakAreas,
  recommendations,
}: {
  firstName: string;
  totalScore: number;
  bandTitle: string;
  bandHeadline: string;
  bandDescription: string;
  bandColor: string;
  bandLevel: number;
  dimensionScores: Array<{
    dimensionKey: string;
    dimensionTitle: string;
    score: number;
  }>;
  weakAreas: string[];
  recommendations: Array<{
    title: string;
    summary: string;
    dimensionTitle: string;
  }>;
}) {
  // Band level bar
  const bandLevels = [
    { level: 1, label: "Ad Hoc" },
    { level: 2, label: "Developing" },
    { level: 3, label: "Structured" },
    { level: 4, label: "Optimised" },
  ];

  const bandBar = bandLevels
    .map(
      (b) =>
        `<td style="width:25%;text-align:center;padding:4px 2px;">
          <div style="height:6px;border-radius:3px;background-color:${
            b.level <= bandLevel ? bandColor : "#E5E5E5"
          };margin-bottom:4px;"></div>
          <span style="font-family:Helvetica,Arial,sans-serif;font-size:10px;color:${
            b.level === bandLevel ? "#333333" : "#AAAAAA"
          };">${b.label}</span>
        </td>`
    )
    .join("");

  // Dimension score rows
  const dimensionRows = dimensionScores
    .map((d) => {
      const isWeak = weakAreas.includes(d.dimensionKey);
      const barColor = isWeak ? "#D97706" : "#AAF870";
      return `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#333;padding-bottom:4px;">
                ${d.dimensionTitle}${isWeak ? ' <span style="color:#D97706;font-size:10px;font-weight:600;">Needs attention</span>' : ""}
              </td>
              <td style="font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#333;text-align:right;font-weight:600;padding-bottom:4px;">
                ${d.score}%
              </td>
            </tr>
            <tr>
              <td colspan="2">
                <div style="width:100%;height:8px;background-color:#f0f0f0;border-radius:4px;overflow:hidden;">
                  <div style="width:${d.score}%;height:8px;background-color:${barColor};border-radius:4px;"></div>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
    })
    .join("");

  // Recommendation cards
  const recCards =
    recommendations.length > 0
      ? `<tr>
        <td style="padding:0 40px 32px;">
          <h3 style="margin:0 0 16px;font-family:Helvetica,Arial,sans-serif;font-size:16px;color:#333;font-weight:700;">Where to Focus Next</h3>
          ${recommendations
            .map(
              (rec) => `<div style="background-color:#f9f9f9;border:1px solid #eee;border-radius:8px;padding:16px 20px;margin-bottom:12px;">
              <p style="margin:0 0 2px;font-family:Helvetica,Arial,sans-serif;font-size:10px;color:#999;text-transform:uppercase;letter-spacing:1px;">${rec.dimensionTitle}</p>
              <p style="margin:0 0 6px;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#1a1a2e;font-weight:600;">${rec.title}</p>
              ${rec.summary ? `<p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#666;line-height:1.5;">${rec.summary}</p>` : ""}
            </div>`
            )
            .join("")}
        </td>
      </tr>`
      : "";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background-color:#f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

        <!-- Header -->
        <tr>
          <td style="background-color:#1a1a2e;padding:36px 40px;">
            <p style="margin:0 0 6px;font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#AAF870;text-transform:uppercase;letter-spacing:2px;font-weight:600;">ECM.DEV</p>
            <h1 style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:22px;color:#ffffff;font-weight:700;">Content Operations Maturity Report</h1>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding:32px 40px 12px;">
            <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#666;line-height:1.6;">
              Hi ${firstName}, here is your personalised assessment report.
            </p>
          </td>
        </tr>

        <!-- Overall Score -->
        <tr>
          <td style="padding:20px 40px 8px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:24px;vertical-align:bottom;">
                  <span style="font-family:Helvetica,Arial,sans-serif;font-size:60px;font-weight:700;color:${bandColor};line-height:1;">${totalScore}%</span>
                </td>
                <td style="vertical-align:bottom;padding-bottom:12px;">
                  <span style="display:inline-block;padding:5px 14px;border-radius:20px;background-color:${bandColor};color:#1a1a2e;font-family:Helvetica,Arial,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">${bandTitle}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Band Progress Bar -->
        <tr>
          <td style="padding:8px 40px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>${bandBar}</tr>
            </table>
          </td>
        </tr>

        <!-- Band Description -->
        ${bandHeadline || bandDescription ? `<tr>
          <td style="padding:0 40px 24px;">
            ${bandHeadline ? `<p style="margin:0 0 6px;font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#1a1a2e;font-weight:600;">${bandHeadline}</p>` : ""}
            ${bandDescription ? `<p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#666;line-height:1.6;">${bandDescription}</p>` : ""}
          </td>
        </tr>` : ""}

        <!-- Divider -->
        <tr><td style="padding:0 40px;"><div style="height:1px;background-color:#eee;"></div></td></tr>

        <!-- Dimension Scores -->
        <tr>
          <td style="padding:24px 40px 8px;">
            <h3 style="margin:0 0 12px;font-family:Helvetica,Arial,sans-serif;font-size:16px;color:#333;font-weight:700;">Score by Dimension</h3>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${dimensionRows}
            </table>
          </td>
        </tr>

        <!-- Spacing -->
        <tr><td style="height:24px;"></td></tr>

        <!-- Recommendations -->
        ${recCards}

        <!-- CTA -->
        <tr>
          <td style="padding:8px 40px 40px;text-align:center;">
            <p style="margin:0 0 16px;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#666;">
              Want to discuss your results and explore next steps?
            </p>
            <a href="https://ecm.dev/contact" style="display:inline-block;padding:14px 36px;background-color:#AAF870;color:#1a1a2e;font-family:Helvetica,Arial,sans-serif;font-size:14px;font-weight:700;text-decoration:none;border-radius:30px;">Talk to us</a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:#f9f9f9;padding:24px 40px;border-top:1px solid #eee;">
            <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#999;text-align:center;">
              ECM.DEV — Content Infrastructure for the AI Enterprise<br />
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

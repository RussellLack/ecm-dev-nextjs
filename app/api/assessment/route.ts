import { NextResponse } from "next/server";
import { writeClient } from "@/lib/sanityWrite";
import { getAssessment, getMaturityBands, getServiceRecommendations } from "@/lib/assessment/queries";
import { calculateScores } from "@/lib/assessment/scoring";
import { getCRMProvider, classifyIntent } from "@/lib/assessment/crm";
import { guardSubmission } from "@/lib/submissionGuard";
import type { SubmissionPayload, SanityAssessment, SanityMaturityBand, SanityServiceRecommendation } from "@/lib/assessment/types";

export async function POST(request: Request) {
  try {
    const body: SubmissionPayload = await request.json();

    // Honeypot + CSRF + rate limit (5/min per IP)
    const guard = await guardSubmission(request, body, {
      rateLimit: { limit: 5, windowMs: 60_000 },
    });
    if (!guard.ok) return guard.response;

    // ─── Validate (contact is now optional) ───
    if (!body.assessmentId || !body.answers?.length) {
      return NextResponse.json(
        { error: "assessmentId and answers are required" },
        { status: 400 }
      );
    }

    // ─── Fetch assessment data for scoring ───
    const assessment: SanityAssessment | null = await getAssessment(body.assessmentId);
    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    const [bands, recommendations]: [SanityMaturityBand[], SanityServiceRecommendation[]] =
      await Promise.all([
        getMaturityBands(assessment._id),
        getServiceRecommendations(),
      ]);

    if (!bands.length) {
      return NextResponse.json(
        { error: "No maturity bands configured for this assessment" },
        { status: 500 }
      );
    }

    // ─── Calculate scores ───
    const scoring = calculateScores(body.answers, assessment, bands, recommendations);

    // ─── Store submission in Sanity ───
    const submission = await writeClient.create({
      _type: "assessmentSubmission",
      assessment: { _type: "reference", _ref: assessment._id },
      submittedAt: new Date().toISOString(),
      firstName: body.contact?.firstName || "",
      lastName: body.contact?.lastName || "",
      email: body.contact?.email || "",
      company: body.contact?.company || "",
      role: body.contact?.role || "",
      phone: body.contact?.phone || "",
      totalScore: scoring.totalScore,
      bandLevel: scoring.bandLevel,
      bandTitle: scoring.bandTitle,
      dimensionScores: scoring.dimensionScores.map((d) => ({
        _key: d.dimensionKey,
        dimensionKey: d.dimensionKey,
        dimensionTitle: d.dimensionTitle,
        score: d.score,
      })),
      weakAreas: scoring.weakAreas,
      answers: body.answers.map((a) => ({
        _key: a.questionId,
        questionId: a.questionId,
        optionId: a.optionId,
      })),
      tracking: body.tracking || {},
      requestedContact: body.requestedContact || false,
      timeToCompleteSeconds: body.timeToCompleteSeconds || null,
    });

    // ─── CRM sync + automation (only if contact provided) ───
    if (body.contact?.email) {
      const crm = getCRMProvider();
      const crmData = {
        contact: body.contact,
        scoring,
        tracking: body.tracking || {},
        assessmentTitle: assessment.title,
        submissionId: submission._id,
        requestedContact: body.requestedContact || false,
        timeToCompleteSeconds: body.timeToCompleteSeconds,
      };

      // Fire-and-forget — don't block the response on CRM
      Promise.all([
        crm.syncSubmission(crmData),
        crm.triggerAutomation({
          type: classifyIntent(scoring, body.requestedContact || false),
          data: crmData,
        }),
        crm.triggerAutomation({
          type: "submission_complete",
          data: crmData,
        }),
      ]).catch((err) => {
        console.error("CRM sync error (non-blocking):", err);
      });
    }

    // ─── Return submission ID for redirect to results ───
    return NextResponse.json({
      submissionId: submission._id,
      assessmentSlug: assessment.slug.current,
      scoring,
    });
  } catch (error: unknown) {
    console.error("Assessment submission error:", error);
    return NextResponse.json(
      { error: "Failed to process assessment" },
      { status: 500 }
    );
  }
}

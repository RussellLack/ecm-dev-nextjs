import { NextResponse } from "next/server";
import { createSubmission, type AssessmentSubmissionRecord } from "@/lib/submissions.server";
import { getAssessment, getMaturityBands, getServiceRecommendations } from "@/lib/assessment/queries";
import { calculateScores } from "@/lib/assessment/scoring";
import { guardSubmission } from "@/lib/submissionGuard";
import type { SubmissionPayload, SanityAssessment, SanityMaturityBand, SanityServiceRecommendation } from "@/lib/assessment/types";

// Route must run on Node (Blobs requires node runtime, not edge).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    // ─── Archive submission to Netlify Blobs ───
    // Sanity is no longer the submissions store — it stays read-only for CMS
    // content (assessment definitions, maturity bands, recommendations).
    // The record is stored in a denormalised shape that mirrors the old
    // Sanity `assessmentSubmission` doc, so results pages and downstream
    // routes don't have to change.
    //
    // NB: no Snov.io push happens here. Consent is captured later by the
    // /api/assessment/report route when the user enters their email to
    // receive the full report — that's the real opt-in moment.
    const submission = await createSubmission<AssessmentSubmissionRecord>({
      kind: "assessment",
      _type: "assessmentSubmission",
      submittedAt: new Date().toISOString(),
      assessment: {
        _id: assessment._id,
        title: assessment.title,
        slug: assessment.slug,
        resultsIntro: assessment.resultsIntro,
        resultsCtaHeading: assessment.resultsCtaHeading,
        resultsCtaBody: assessment.resultsCtaBody,
      },
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
        dimensionKey: d.dimensionKey,
        dimensionTitle: d.dimensionTitle,
        score: d.score,
      })),
      weakAreas: scoring.weakAreas,
      answers: body.answers.map((a) => ({
        questionId: a.questionId,
        optionId: a.optionId,
      })),
      tracking: body.tracking || {},
      requestedContact: body.requestedContact || false,
      timeToCompleteSeconds: body.timeToCompleteSeconds ?? null,
      consent: {
        given: false,
        text: null,
        version: null,
        capturedAt: null,
      },
      activation: {
        pushedToCrm: false,
        pushedAt: null,
        error: null,
      },
    });

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

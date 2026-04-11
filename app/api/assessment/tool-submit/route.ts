import { NextResponse } from "next/server";
import { createSubmission, type ToolSubmissionRecord } from "@/lib/submissions.server";
import { guardSubmission } from "@/lib/submissionGuard";

// Blobs requires the Node runtime (not edge).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/assessment/tool-submit
 *
 * Saves a self-contained assessment tool submission (Process or Lead Magnet)
 * to Netlify Blobs and returns the submission ID for shareable results URLs.
 *
 * Sanity is no longer involved in this path. The toolSubmission schema type
 * was already orphaned (not registered in the Studio) and the data is now
 * stored in Blobs under `submissions/{id}.json`.
 *
 * The Snov.io push happens later in /api/assessment/tool-email when the user
 * explicitly opts in to receive their result by email — that's the consent
 * moment. The initial POST here just creates the archive record.
 *
 * Body: {
 *   toolType: "process" | "lead-magnet"
 *   answers: object     — raw answers (will be JSON.stringified)
 *   results: object     — pre-computed results (will be JSON.stringified)
 *   contact?: { name, email, role, company }
 *   consentGiven?: boolean
 *   tracking?: object
 *   timeToCompleteSeconds?: number
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Honeypot + CSRF + rate limit (5/min per IP)
    const guard = await guardSubmission(request, body, {
      rateLimit: { limit: 5, windowMs: 60_000 },
    });
    if (!guard.ok) return guard.response;

    if (!body.toolType || !body.answers || !body.results) {
      return NextResponse.json(
        { error: "toolType, answers, and results are required" },
        { status: 400 }
      );
    }

    if (!["process", "lead-magnet"].includes(body.toolType)) {
      return NextResponse.json(
        { error: "Invalid toolType" },
        { status: 400 }
      );
    }

    // Validate email format if contact provided
    if (body.contact?.email && !EMAIL_RE.test(body.contact.email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const submission = await createSubmission<ToolSubmissionRecord>({
      kind: "tool",
      _type: "toolSubmission",
      toolType: body.toolType,
      submittedAt: new Date().toISOString(),
      name: body.contact?.name || "",
      email: body.contact?.email || "",
      role: body.contact?.role || "",
      company: body.contact?.company || "",
      // Matches old Sanity shape: answers/results are JSON-stringified.
      answers: JSON.stringify(body.answers),
      results: JSON.stringify(body.results),
      tracking: body.tracking || {},
      timeToCompleteSeconds: body.timeToCompleteSeconds ?? null,
      consent: {
        given: body.consentGiven === true,
        text: body.consentText ?? null,
        version: body.consentVersion ?? null,
        capturedAt: body.consentGiven === true ? new Date().toISOString() : null,
      },
      activation: {
        pushedToCrm: false,
        pushedAt: null,
        error: null,
      },
    });

    return NextResponse.json({
      submissionId: submission._id,
      toolType: body.toolType,
    });
  } catch (error: unknown) {
    console.error("Tool submission error:", error);
    return NextResponse.json(
      { error: "Failed to save submission" },
      { status: 500 }
    );
  }
}

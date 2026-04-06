import { NextResponse } from "next/server";
import { writeClient } from "@/lib/sanityWrite";

/**
 * POST /api/assessment/tool-submit
 *
 * Saves a self-contained assessment tool submission (Process or Lead Magnet)
 * to Sanity and returns the submission ID for shareable results URLs.
 *
 * Body: {
 *   toolType: "process" | "lead-magnet"
 *   answers: object     — raw answers
 *   results: object     — pre-computed results
 *   contact?: { name, email, role, company }
 *   consentGiven?: boolean
 *   timeToCompleteSeconds?: number
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

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

    const submission = await writeClient.create({
      _type: "toolSubmission",
      toolType: body.toolType,
      submittedAt: new Date().toISOString(),
      name: body.contact?.name || "",
      email: body.contact?.email || "",
      role: body.contact?.role || "",
      company: body.contact?.company || "",
      consentGiven: body.consentGiven || false,
      answers: JSON.stringify(body.answers),
      results: JSON.stringify(body.results),
      tracking: body.tracking || {},
      timeToCompleteSeconds: body.timeToCompleteSeconds || null,
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

import { NextResponse } from "next/server";
import { guardSubmission } from "@/lib/submissionGuard";
import {
  patchSubmissionRecord,
  getSubmissionRecord,
  type ToolSubmissionRecord,
} from "@/lib/submissions.server";
import { getCRMProvider, SnovioCRMProvider } from "@/lib/assessment/crm";

// Blobs requires the Node runtime (not edge).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/assessment/cms-implementation/enrich
 *
 * Optional second-step enrichment for the CMS Implementation assessment.
 * The visitor has already received their PDF + shareable link via the
 * initial email-only submit. This endpoint lets them optionally provide
 * name / company / role + book-call flag, which gets patched into the
 * existing Blobs record and re-pushed to Snov so the CRM record is
 * complete.
 *
 * Body: {
 *   submissionId: string         — from prior /api/assessment/tool-submit
 *   name?: string
 *   company?: string
 *   role?: string
 *   bookCall?: boolean
 *   marketingOptIn?: boolean
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const guard = await guardSubmission(request, body, {
      rateLimit: { limit: 5, windowMs: 60_000 },
    });
    if (!guard.ok) return guard.response;

    const { submissionId, name, company, role, bookCall, marketingOptIn } = body;

    if (!submissionId) {
      return NextResponse.json(
        { error: "submissionId is required" },
        { status: 400 },
      );
    }

    const record = await getSubmissionRecord(submissionId);
    if (
      !record ||
      record.kind !== "tool" ||
      record.toolType !== "cms-implementation"
    ) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 },
      );
    }
    const submission = record as ToolSubmissionRecord;

    const displayName = (name || submission.name || "").toString();

    // Patch the Blobs record. Don't clobber existing values with empty
    // strings — only set what the visitor actually provided.
    const patch: Partial<ToolSubmissionRecord> = {};
    if (name) patch.name = displayName;
    if (company) patch.company = company;
    if (role) patch.role = role;
    // Stash the optional flags inside `tracking` (free-form blob) so we
    // don't bloat the typed record shape for two booleans.
    if (typeof bookCall === "boolean" || typeof marketingOptIn === "boolean") {
      patch.tracking = {
        ...submission.tracking,
        ...(typeof bookCall === "boolean" ? { bookCall } : {}),
        ...(typeof marketingOptIn === "boolean" ? { marketingOptIn } : {}),
      };
    }

    if (Object.keys(patch).length > 0) {
      await patchSubmissionRecord(submissionId, patch).catch((err: unknown) =>
        console.error(
          "Failed to patch CMS-implementation enrichment record:",
          err,
        ),
      );
    }

    // Re-push to Snov.io with enriched name (de-duped by email).
    if (name || company || role) {
      const crm = getCRMProvider();
      if (crm instanceof SnovioCRMProvider) {
        const [firstName, ...rest] = displayName.split(/\s+/);
        try {
          await crm.pushToolProspect({
            toolType: "cms-implementation",
            email: submission.email,
            firstName,
            lastName: rest.join(" "),
            company: company || submission.company,
            role: role || submission.role,
          });
        } catch (err: unknown) {
          console.error(
            "Snov.io CMS-implementation enrichment push failed:",
            err,
          );
          // Non-blocking — visitor doesn't see this; we just stash the error.
          await patchSubmissionRecord(submissionId, {
            activation: {
              pushedToCrm: submission.activation?.pushedToCrm ?? false,
              pushedAt: new Date().toISOString(),
              error: err instanceof Error ? err.message : String(err),
            },
          }).catch(() => {});
        }
      }
    }

    return NextResponse.json({ success: true, bookCall: bookCall === true });
  } catch (error: unknown) {
    console.error("CMS-implementation enrichment error:", error);
    return NextResponse.json(
      { error: "Failed to save enrichment" },
      { status: 500 },
    );
  }
}

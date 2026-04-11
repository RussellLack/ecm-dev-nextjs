import { getStore } from "@netlify/blobs";
import { randomUUID } from "node:crypto";
import type { TrackingData } from "./assessment/types";

/**
 * ──────────────────────────────────────────────────────────────────────────
 * Submissions archive — Netlify Blobs
 * ──────────────────────────────────────────────────────────────────────────
 *
 * Replaces the previous Sanity writeClient-backed storage for form
 * submissions. Sanity remains the source of truth for CMS content
 * (assessment definitions, maturity bands, recommendations), but per-visitor
 * PII is written to Netlify Blobs so the Sanity dataset can stay public on
 * the Free tier.
 *
 * Record shape is deliberately flat and denormalised to match the old
 * Sanity `assessmentSubmission` / `toolSubmission` document shapes. Results
 * pages, PDF route, and email senders therefore don't need to change — they
 * call the same `getSubmission` / `getToolSubmission` helpers in
 * `lib/assessment/queries.ts`, which now route through this module.
 *
 * Key format: `submissions/{id}.json` — flat, no date partitioning. The `id`
 * is a UUID generated at create time and is the stable handle used in the
 * shareable results URL.
 *
 * Blob store name: `submissions`
 */

const STORE_NAME = "submissions";

export type SubmissionKind = "assessment" | "tool";

/**
 * Denormalised submission record written to Blobs. Fields map 1:1 to the
 * old Sanity `assessmentSubmission` / `toolSubmission` documents.
 */
export interface AssessmentSubmissionRecord {
  _id: string;
  kind: "assessment";
  _type: "assessmentSubmission";
  submittedAt: string;

  // Denormalised assessment reference (was a Sanity ref, now inlined).
  assessment: {
    _id: string;
    title: string;
    slug: { current: string };
    resultsIntro?: string;
    resultsCtaHeading?: string;
    resultsCtaBody?: string;
  };

  // Contact (may be empty strings on initial submit; filled in later by the
  // report route when the user opts in to receive the email).
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  role: string;
  phone: string;

  // Scoring output.
  totalScore: number;
  bandLevel: number;
  bandTitle: string;
  dimensionScores: Array<{
    dimensionKey: string;
    dimensionTitle: string;
    score: number;
  }>;
  weakAreas: string[];

  // Raw answers + behaviour.
  answers: Array<{ questionId: string; optionId: string }>;
  tracking: TrackingData;
  requestedContact: boolean;
  timeToCompleteSeconds: number | null;

  // Consent audit trail — set when the user opts in via the results page.
  consent: {
    given: boolean;
    text: string | null;
    version: string | null;
    capturedAt: string | null;
  };

  // Snov.io activation state — mirrors the push for the audit record.
  activation: {
    pushedToCrm: boolean;
    pushedAt: string | null;
    error: string | null;
  };
}

export interface ToolSubmissionRecord {
  _id: string;
  kind: "tool";
  _type: "toolSubmission";
  toolType: "process" | "lead-magnet";
  submittedAt: string;

  name: string;
  email: string;
  role: string;
  company: string;

  // JSON-stringified blobs (mirrors old Sanity shape so PDF/email routes
  // that JSON.parse() these fields continue to work unchanged).
  answers: string;
  results: string;
  tracking: Record<string, unknown>;
  timeToCompleteSeconds: number | null;

  consent: {
    given: boolean;
    text: string | null;
    version: string | null;
    capturedAt: string | null;
  };

  activation: {
    pushedToCrm: boolean;
    pushedAt: string | null;
    error: string | null;
  };
}

export type SubmissionRecord =
  | AssessmentSubmissionRecord
  | ToolSubmissionRecord;

function key(id: string): string {
  return `submissions/${id}.json`;
}

function store() {
  return getStore(STORE_NAME);
}

/**
 * Create a new submission record. Generates a UUID and returns the written
 * record. Must succeed — if Blobs is unreachable the submission is rejected
 * so the user can retry.
 */
export async function createSubmission<R extends SubmissionRecord>(
  partial: Omit<R, "_id">,
): Promise<R> {
  const id = randomUUID();
  const record = { ...partial, _id: id } as R;
  await store().setJSON(key(id), record);
  return record;
}

/**
 * Read a submission record by ID. Returns null if not found (so callers can
 * render 404s the same way they did with Sanity).
 */
export async function getSubmissionRecord(
  id: string,
): Promise<SubmissionRecord | null> {
  const data = await store().get(key(id), { type: "json" });
  if (!data) return null;
  return data as SubmissionRecord;
}

/**
 * Shallow-merge a patch into an existing submission record. Used by the
 * report route when the user enters their email to receive the report —
 * we backfill `email`, `firstName`, and `consent.*` and flip the
 * `activation.*` bits once the Snov.io push succeeds.
 *
 * Returns the updated record, or null if no record exists for the ID.
 */
export async function patchSubmissionRecord(
  id: string,
  patch: Partial<SubmissionRecord>,
): Promise<SubmissionRecord | null> {
  const current = await getSubmissionRecord(id);
  if (!current) return null;
  const next = { ...current, ...patch } as SubmissionRecord;
  await store().setJSON(key(id), next);
  return next;
}

import { getStore } from "@netlify/blobs";
import { randomUUID } from "node:crypto";
import type { EstimatorInputs, LayerCosts, FeedbackReaction } from "./estimator/types";

/**
 * Estimator feedback events — Netlify Blobs.
 *
 * Separate store from `submissions` because the shape is different and the
 * concern is distinct: high-volume anonymous signal on model accuracy, no
 * PII, no CRM activation. Mirrors the `submissions.server.ts` patterns
 * (flat key space, JSON records, token-keyed PATCH).
 *
 * Store name: `estimator-feedback`
 * Key format: `events/{id}.json`, plus a `by-token/{token}.json` alias that
 * points back to the id so PATCH-by-token stays O(1).
 */

const STORE_NAME = "estimator-feedback";
const LEAD_STORE_NAME = "estimator-emails";

export interface FeedbackEventRecord {
  _id: string;
  submittedAt: string;
  token: string;
  modelVersion: string;
  inputProfileHash: string;
  inputProfile: EstimatorInputs;
  computedTotalUsd: number;
  computedLayers: LayerCosts;
  scenarioShown: string;
  reaction: FeedbackReaction;
  comment: string | null;
  userAgent: string;
  clientHintRegion: string;
}

function eventKey(id: string): string {
  return `events/${id}.json`;
}
function tokenKey(token: string): string {
  return `by-token/${token}.json`;
}

function store() {
  return getStore(STORE_NAME);
}

export async function createFeedbackEvent(
  partial: Omit<FeedbackEventRecord, "_id">,
): Promise<FeedbackEventRecord> {
  const id = randomUUID();
  const record: FeedbackEventRecord = { ...partial, _id: id };
  const s = store();
  await Promise.all([
    s.setJSON(eventKey(id), record),
    s.setJSON(tokenKey(record.token), { id }),
  ]);
  return record;
}

// ───────── Estimator lead (email) captures ─────────

export interface EstimatorLeadRecord {
  _id: string;
  capturedAt: string;
  email: string;
  consentSource: "pdf_request" | "book_call";
  modelVersion: string;
  inputProfileHash: string;
  inputProfile: EstimatorInputs;
  computedTotalUsd: number;
  computedLayers: LayerCosts;
  consent: {
    given: boolean;
    text: string | null;
    version: string | null;
    capturedAt: string;
  };
  activation: {
    pushedToCrm: boolean;
    pushedAt: string | null;
    error: string | null;
  };
  userAgent: string;
}

function leadStore() {
  return getStore(LEAD_STORE_NAME);
}
function leadKey(id: string): string {
  return `leads/${id}.json`;
}

export async function createEstimatorLead(
  partial: Omit<EstimatorLeadRecord, "_id">,
): Promise<EstimatorLeadRecord> {
  const id = randomUUID();
  const record: EstimatorLeadRecord = { ...partial, _id: id };
  await leadStore().setJSON(leadKey(id), record);
  return record;
}

export async function patchEstimatorLeadActivation(
  id: string,
  activation: EstimatorLeadRecord["activation"],
): Promise<void> {
  const s = leadStore();
  const existing = await s.get(leadKey(id), { type: "json" });
  if (!existing) return;
  const next: EstimatorLeadRecord = {
    ...(existing as EstimatorLeadRecord),
    activation,
  };
  await s.setJSON(leadKey(id), next);
}

// ───────── Feedback comment PATCH ─────────

export async function patchFeedbackComment(
  token: string,
  comment: string,
): Promise<FeedbackEventRecord | null> {
  const s = store();
  const alias = await s.get(tokenKey(token), { type: "json" });
  if (!alias || typeof (alias as { id?: unknown }).id !== "string") return null;
  const id = (alias as { id: string }).id;
  const existing = await s.get(eventKey(id), { type: "json" });
  if (!existing) return null;
  const next: FeedbackEventRecord = {
    ...(existing as FeedbackEventRecord),
    comment: comment.slice(0, 140),
  };
  await s.setJSON(eventKey(id), next);
  return next;
}

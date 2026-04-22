// hash.ts — deterministic normalisation and SHA-256 hashing of input profiles.
// Used server-side in the /api/feedback route to cluster feedback by identical scenarios.

import crypto from "node:crypto";
import type { EstimatorInputs } from "./types";

/**
 * Normalise an EstimatorInputs object into a deterministic JSON string.
 * - Sort keys alphabetically at every level
 * - Round floats to 2 decimal places
 * - Drop UI-only fields (displayCurrency) — they don't affect the cost
 * The goal: two semantically identical input profiles produce identical strings.
 */
export function normaliseInputs(inputs: EstimatorInputs): string {
  const normalised = {
    aiCoordGap: inputs.aiCoordGap,
    aiShare: round2(inputs.aiShare),
    cadence: inputs.cadence,
    channelMix: roundMix(inputs.channelMix),
    contentMix: roundMix(inputs.contentMix),
    fragmentation: inputs.fragmentation,
    languages: inputs.languages,
    maturity: inputs.maturity,
    regulated: inputs.regulated,
    rework: inputs.rework,
    volume: inputs.volume,
  };
  return JSON.stringify(normalised, Object.keys(normalised).sort());
}

/**
 * Produce a SHA-256 hex hash of the normalised input profile.
 * Deterministic: same inputs always produce the same hash.
 */
export function hashInputs(inputs: EstimatorInputs): string {
  const normalised = normaliseInputs(inputs);
  return crypto.createHash("sha256").update(normalised).digest("hex");
}

/**
 * Generate a 12-char random token used to later PATCH a comment onto a
 * previously-submitted feedback event. Not for security — just opacity.
 */
export function generateFeedbackToken(): string {
  return crypto.randomBytes(6).toString("hex"); // 12 hex chars
}

// ---- helpers ----

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function roundMix<T extends object>(mix: T): T {
  const out: Record<string, number> = {};
  const entries = Object.entries(mix as Record<string, number>);
  for (const [key, value] of entries.sort(([a], [b]) => a.localeCompare(b))) {
    out[key] = round2(value);
  }
  return out as T;
}

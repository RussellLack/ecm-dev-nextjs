/**
 * Assessment gate — shared constants + access-cookie helpers.
 *
 * The gate sits in front of every assessment tool. Registering (email +
 * functional consent) sets a short-lived access cookie so the visitor is not
 * re-gated on every tool for the duration of the cookie.
 *
 * This module is framework-neutral so it can be imported from both the gate
 * API route (server) and the AssessmentGate component (client). The cookie
 * helpers no-op on the server (guard for `document`).
 *
 * When the gate consent copy changes, bump GATE_CONSENT_VERSION so the audit
 * trail can distinguish records captured under the new copy from the old. Keep
 * GATE_CONSENT_TEXT in sync with the checkbox actually rendered — this is the
 * verbatim string stored on the Blobs record for GDPR auditability.
 */

export const GATE_CONSENT_VERSION = "2026-07-18-gate-v1";

export const GATE_CONSENT_TEXT =
  "I agree that ECM.DEV can process the details I provide to run this " +
  "assessment and send me my results, in line with the Privacy Policy. " +
  "My data is handled under GDPR and never shared with third parties.";

/** Non-HttpOnly so the client gate component can read it to skip the form. */
export const GATE_ACCESS_COOKIE = "ecm_assess_access";

/** 30 days. */
export const GATE_ACCESS_MAX_AGE = 60 * 60 * 24 * 30;

/** True if the current browser already holds a gate-access cookie. */
export function hasGateAccess(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .some((c) => c.trim().startsWith(`${GATE_ACCESS_COOKIE}=1`));
}

/** Set the gate-access cookie client-side (mirrors the server Set-Cookie). */
export function setGateAccess(): void {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${GATE_ACCESS_COOKIE}=1; Max-Age=${GATE_ACCESS_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
}

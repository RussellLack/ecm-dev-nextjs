/**
 * Shared consent constants for the assessment + tool results flows.
 *
 * When the consent copy on the results pages changes, bump CONSENT_VERSION
 * so the audit trail can distinguish records captured under the new copy
 * from records captured under the old one. Keep CONSENT_TEXT in sync with
 * whatever is actually rendered to the user — this is the verbatim string
 * stored on the Blobs submission record for GDPR auditability.
 */

export const CONSENT_VERSION = "2026-04-11-v1";

export const CONSENT_TEXT =
  "I consent to ECM.dev storing the information I have provided above for " +
  "the purpose of sending me my assessment results and, if applicable, " +
  "supporting a future engagement. Your data is handled in accordance with " +
  "GDPR and our privacy policy. We will never share your information with " +
  "third parties.";

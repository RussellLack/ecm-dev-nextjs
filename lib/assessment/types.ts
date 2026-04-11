/* ─── Assessment Types ─── */

export interface DimensionScore {
  dimensionKey: string;
  dimensionTitle: string;
  score: number; // percentage 0-100
}

export interface ScoringResult {
  totalScore: number; // percentage 0-100
  dimensionScores: DimensionScore[];
  bandLevel: number;
  bandTitle: string;
  bandHeadline: string;
  bandDescription: string;
  bandColor: string;
  weakAreas: string[]; // dimension keys, weakest first
  recommendations: Recommendation[];
}

export interface Recommendation {
  title: string;
  summary: string;
  dimensionKey: string;
  dimensionTitle: string;
  serviceHref?: string;
  serviceTitle?: string;
}

export interface SubmissionPayload {
  assessmentId: string;
  answers: AnswerEntry[];
  contact?: ContactInfo;
  tracking: TrackingData;
  requestedContact?: boolean;
  timeToCompleteSeconds?: number;
  /**
   * Explicit, unchecked-by-default opt-in captured in the results UI.
   * When true, the server is allowed to push the contact to the external CRM
   * (Snov.io). When false or missing, the submission is archived to Netlify
   * Blobs but no activation occurs. Required for GDPR audit trail.
   */
  consentGiven?: boolean;
  /** Verbatim consent text the user ticked, for audit log. */
  consentText?: string;
  /** Version string of the consent copy (e.g. "2026-04-11-v1"). */
  consentVersion?: string;
}

export interface AnswerEntry {
  questionId: string;
  optionId: string;
}

export interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  role?: string;
  phone?: string;
}

export interface TrackingData {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  referrer?: string;
  landingPage?: string;
}

/* ─── Sanity Data Shapes (fetched via GROQ) ─── */

export interface SanityAssessment {
  _id: string;
  title: string;
  slug: { current: string };
  subtitle?: string;
  introText?: string;
  estimatedMinutes?: number;
  sections: SanitySection[];
  resultsIntro?: string;
  resultsCtaHeading?: string;
  resultsCtaBody?: string;
}

export interface SanitySection {
  _key: string;
  title: string;
  description?: string;
  questions: SanityQuestion[];
}

export interface SanityQuestion {
  _key: string;
  questionId: string;
  text: string;
  helpText?: string;
  inputType: "single" | "multi";
  options: SanityOption[];
  conditionalOn?: {
    questionId: string;
    optionId: string;
  };
}

export interface SanityOption {
  _key: string;
  optionId: string;
  label: string;
  dimensionScores: SanityDimensionScore[];
}

export interface SanityDimensionScore {
  dimension: {
    _id: string;
    title: string;
    key: { current: string };
  };
  points: number;
}

export interface SanityMaturityBand {
  _id: string;
  title: string;
  level: number;
  minScore: number;
  maxScore: number;
  headline?: string;
  description?: string;
  color?: string;
}

export interface SanityServiceRecommendation {
  _id: string;
  title: string;
  summary?: string;
  priority: number;
  minBandLevel: number;
  dimension: {
    _id: string;
    title: string;
    key: { current: string };
  };
  service?: {
    title: string;
    category: string;
  };
}

export interface SubmissionResult {
  submissionId: string;
  assessmentSlug: string;
  scoring: ScoringResult;
}

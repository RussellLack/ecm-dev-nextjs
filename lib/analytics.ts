// lib/analytics.ts
// Lead-funnel analytics helpers for the assessment tools + contact form.
//
// All lead events are pushed to window.dataLayer, where GTM forwards them to
// GA4 (see the "GA4 - assessment funnel events" tag). Event names and the
// lead_type dimension are defined here as constants so a typo can't fragment
// the GA4 reporting dimension.

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Event names the GTM trigger regex listens for. */
export type LeadEventName =
  | "qualify_lead"
  | "lead_submit"
  | "close_convert_lead";

/** Controlled, low-cardinality set of lead_type values. */
export const LEAD_TYPE = {
  /** Visitor completed an assessment (no PDF ordered). */
  qualified: "qualified",
  /** Visitor completed an assessment AND ordered an emailed PDF copy. */
  pdfEmailed: "pdf_emailed",
  /** Visitor converted via the contact form (books a call). */
  bookedCall: "booked_call",
} as const;

export type LeadType = (typeof LEAD_TYPE)[keyof typeof LEAD_TYPE];

/** tool_name slugs for the assessment tools. Contact form derives its slug
 *  from the referring assessment (?from=) and falls back to "contact". */
export const TOOL_NAME = {
  process: "process",
  leadMagnet: "lead-magnet",
  contact: "contact",
} as const;

/** The six params every lead event carries, matching the GA4 tag. For lead
 *  events, step_number / total_steps / completion_time_seconds are not
 *  meaningful and default to null. */
export interface LeadEventParams {
  tool_name: string;
  source_page: string;
  step_number: number | null;
  total_steps: number | null;
  completion_time_seconds: number | null;
  lead_type: LeadType;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/**
 * Push a lead event to the dataLayer. Safe to call from client components;
 * no-ops on the server or if dataLayer is unavailable. Any params not supplied
 * default to null so the shape always matches the GA4 tag.
 */
export function pushLeadEvent(
  event: LeadEventName,
  params: Partial<LeadEventParams> & Pick<LeadEventParams, "tool_name" | "lead_type">
): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    tool_name: params.tool_name,
    source_page: params.source_page ?? window.location.pathname,
    step_number: params.step_number ?? null,
    total_steps: params.total_steps ?? null,
    completion_time_seconds: params.completion_time_seconds ?? null,
    lead_type: params.lead_type,
  });
}

/**
 * Read the referring assessment slug from the ?from= query param (set on the
 * "Book a discovery call" / "Talk to the team" links). Falls back to the
 * contact slug when the visitor arrived at /contact directly. Never returns
 * anything other than a known TOOL_NAME value.
 */
export function referringToolName(): string {
  if (typeof window === "undefined") return TOOL_NAME.contact;
  const from = new URLSearchParams(window.location.search).get("from");
  if (from === TOOL_NAME.process) return TOOL_NAME.process;
  if (from === TOOL_NAME.leadMagnet) return TOOL_NAME.leadMagnet;
  return TOOL_NAME.contact;
}

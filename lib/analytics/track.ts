/**
 * lib/analytics/track.ts — Assessment funnel event tracking.
 *
 * dataLayer-ONLY tracking. GA4 is NOT loaded directly by this app: the GA4
 * config (measurement ID G-33HFQC8STP) lives INSIDE the GTM container
 * (GTM-M7DKTZKC). We therefore never call gtag('event', ...) — GTM does not
 * forward those to GA4. Instead we push plain objects with an `event` key onto
 * window.dataLayer, which GTM "Custom Event" triggers key off.
 *
 * For any event below to reach GA4 you MUST create, in the GTM container:
 *   1. a Custom Event trigger matching the event name, and
 *   2. a GA4 Event tag that fires on that trigger and maps the params to GA4
 *      event parameters.
 * qualify_lead and close_convert_lead must additionally be registered as GA4
 * Key Events. See ANALYTICS.md ("Assessment funnel events") for full setup.
 *
 * window.dataLayer and window.gtag are already defined in app/layout.tsx.
 */

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export type AssessmentTool =
  | "process"
  | "lead_magnet"
  | "localisation_cost"
  | "cms_implementation"
  | "content_ops_maturity";

/** Lead capture mechanism that produced a lead_submit event. */
export type LeadType = "email_gate" | "save_results" | "share_link" | "pdf";

function push(event: string, params: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}

/** Fire once per assessment session, at the first meaningful interaction. */
export function trackAssessmentStart(
  tool: AssessmentTool,
  sourcePage?: string,
): void {
  const source_page =
    sourcePage ??
    (typeof document !== "undefined" ? document.referrer || "direct" : "direct");
  push("assessment_start", { tool_name: tool, source_page });
}

/** Fire when the user advances past a step/section/question. */
export function trackAssessmentStepComplete(
  tool: AssessmentTool,
  stepNumber: number,
  totalSteps: number,
  extra?: Record<string, unknown>,
): void {
  push("assessment_step_complete", {
    tool_name: tool,
    step_number: stepNumber,
    total_steps: totalSteps,
    ...(extra ?? {}),
  });
}

/**
 * Fire once when the results/summary view is reached or submission succeeds.
 * Also emits qualify_lead (a GA4 Key Event) for the same tool.
 */
export function trackAssessmentComplete(
  tool: AssessmentTool,
  completionTimeSeconds?: number,
): void {
  const params: Record<string, unknown> = { tool_name: tool };
  if (completionTimeSeconds !== undefined) {
    params.completion_time_seconds = completionTimeSeconds;
  }
  push("assessment_complete", params);
  push("qualify_lead", { tool_name: tool });
}

/**
 * Fire on a successful lead capture (email gate, save results, share link, or
 * PDF download). Also emits close_convert_lead (a GA4 Key Event).
 */
export function trackLeadSubmit(tool: AssessmentTool, leadType: LeadType): void {
  push("lead_submit", { tool_name: tool, lead_type: leadType });
  push("close_convert_lead", { tool_name: tool });
}

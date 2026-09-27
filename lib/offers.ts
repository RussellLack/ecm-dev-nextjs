/**
 * Single source of truth for the commercial journey: every starting offer's
 * name, commitment and terms, plus the free self-check tools and how long
 * they take. The homepage, the three pillar pages, ContentAuditTiers,
 * problem/solution pages and the contact form all read from here, so a name,
 * duration, price or credit rule cannot say one thing on one page and
 * another on the next (the drift docs/COMMERCIAL-JOURNEY-2026-09-27.md
 * catalogues).
 *
 * Only terms that are already published and agreed live here. Anything still
 * open (managed-package pricing and credit window, standalone trial projects,
 * the free audit's depth) is listed as an open decision in that doc and is
 * deliberately absent, so it cannot leak into public copy by accident.
 * Pricing changes go through code review, not a CMS edit.
 */

export type Pillar = "technology" | "services" | "localization";

/* ─── Free self-check tools ─── */

export type ToolKey =
  | "maturity"
  | "cms-estimator"
  | "localisation-estimator"
  | "process";

export const TOOLS: Record<
  ToolKey,
  {
    name: string;
    href: string;
    /** Display label for completion time, e.g. "5 min". */
    duration: string;
    /** True only when the result is shown without registering an email.
     * Mirrors UNGATED_SLUGS in app/assessment/[slug]/page.tsx. */
    ungated: boolean;
    /** What the result actually is, stated plainly. */
    result: string;
  }
> = {
  maturity: {
    name: "Content Operations Maturity Assessment",
    href: "/assessment/content-operations-maturity",
    duration: "5 min",
    ungated: true,
    result: "A maturity score across six dimensions, based on your own answers.",
  },
  "cms-estimator": {
    name: "CMS Implementation Cost Estimator",
    href: "/assessment/cms-implementation",
    duration: "~5 min",
    ungated: false,
    result: "An indicative implementation cost range, based on the inputs you declare.",
  },
  "localisation-estimator": {
    name: "Localisation Cost Estimator",
    href: "/assessment/localisation-cost",
    duration: "3 to 5 min",
    ungated: false,
    result: "An indicative view of where multilingual spend goes, based on the inputs you declare.",
  },
  process: {
    name: "Process Assessment",
    href: "/assessment/process",
    duration: "10 to 15 min",
    ungated: false,
    result: "A map of one process with its blockers and ownership gaps.",
  },
};

/** The default free starting point everywhere a single one is needed. */
export const DEFAULT_TOOL = TOOLS.maturity;

/** Completion-time label for a tool URL, or null when the URL isn't a known
 * tool (so a page never shows a duration that belongs to a different tool). */
export function toolDurationFor(href: string | undefined | null): string | null {
  if (!href) return null;
  const tool = Object.values(TOOLS).find((t) => t.href === href);
  return tool ? tool.duration : null;
}

/* ─── Expert offers: the Content Audit ─── */

export const CONTENT_AUDIT = {
  name: "Content Audit",
  anchor: "content-audit",
  snapshot: {
    key: "snapshot",
    name: "Snapshot",
    price: "£2,000 to £3,000",
    duration: "5 to 7 business days",
    scope: "a real sample of your estate, up to 100 items or 10% of it",
    outputs: [
      "A 5 to 10 page report",
      "Your top five findings",
      "One or two findings shown actually failing in an AI answer",
      "A 45-minute recorded readout",
    ],
    credit: "100% credited toward a Full Estate Audit if you sign within 30 days.",
  },
  full: {
    key: "full-estate-audit",
    name: "Full Estate Audit",
    price: "£12,000 to £15,000",
    duration: "3 to 4 weeks",
    scope: "your whole content estate",
    outputs: [
      "A board-ready report of 20 to 30 pages",
      "A costed remediation roadmap",
      "A 90-minute stakeholder readout",
      "Two weeks of async Q&A",
    ],
  },
  vatNote: "All prices exclude VAT where applicable.",
} as const;

/* ─── Time-bound introductory offer ─── */

/** One wording for capacity, used everywhere the promotion is mentioned
 * (previously "five at a time" on the homepage, "the first five" on the
 * pillar pages). */
export const AUDIT_OFFER_COPY = {
  deadlineLabel: "31 October",
  capacity: "We take on five at a time.",
} as const;

/* ─── Contact-form context ─── */

/** Offers and routes a visitor can arrive at /contact from. The contact form
 * only ever displays a label from this list, never raw query text, so a URL
 * cannot inject arbitrary copy and no visitor input is placed in a URL. */
export const ENQUIRY_TOPICS = {
  snapshot: "Content Audit: Snapshot",
  "full-estate-audit": "Content Audit: Full Estate Audit",
  "first-project": "A first project",
  "ongoing-support": "Ongoing support after a diagnostic",
  "maturity-results": "My maturity assessment results",
} as const;

export type EnquiryTopic = keyof typeof ENQUIRY_TOPICS;

export const PILLAR_LABEL: Record<Pillar, string> = {
  technology: "Content Technology",
  services: "Content Operations",
  localization: "Content Localisation",
};

export function isEnquiryTopic(v: string | null): v is EnquiryTopic {
  return !!v && Object.prototype.hasOwnProperty.call(ENQUIRY_TOPICS, v);
}

export function isPillar(v: string | null): v is Pillar {
  return v === "technology" || v === "services" || v === "localization";
}

export function enquiryHref(topic: EnquiryTopic, pillar?: Pillar): string {
  const params = new URLSearchParams({ offer: topic });
  if (pillar) params.set("pillar", pillar);
  return `/contact?${params.toString()}#contact`;
}

/* ─── Per-pillar first step ─── */

/** What each pillar page recommends as its starting point: the free
 * self-check that fits that pillar's buyer question, then the shared expert
 * Content Audit. `question` frames the buyer's decision, not new scope. */
export const PILLAR_FIRST_STEP: Record<
  Pillar,
  { question: string; tool: ToolKey }
> = {
  services: {
    question: "Where are approvals, handoffs and ownership slowing publishing down?",
    tool: "maturity",
  },
  technology: {
    question: "Which problems come from the platform, and which from how it is set up?",
    tool: "cms-estimator",
  },
  localization: {
    question: "Which source and workflow issues are creating avoidable multilingual effort?",
    tool: "localisation-estimator",
  },
};

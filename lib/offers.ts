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
 * open (managed-package pricing and credit window, the free audit's depth)
 * is listed as an open decision in that doc and is deliberately absent, so
 * it cannot leak into public copy by accident.
 * Pricing changes go through code review, not a CMS edit.
 */

export type Pillar = "technology" | "services" | "localization";

/* ─── Free self-check tools ─── */

export type ToolKey =
  | "maturity"
  | "cms-estimator"
  | "localisation-estimator"
  | "expertise"
  | "lead-magnet";

/** Assessment slugs that show their result without an email registration.
 * Read by app/assessment/[slug]/page.tsx (which skips AssessmentGate for
 * these) and by the /assessments hub (which groups tools by commitment), so
 * a "no email needed" label can never drift from the actual gate. */
export const UNGATED_ASSESSMENT_SLUGS: ReadonlySet<string> = new Set([
  "content-operations-maturity",
  "expertise-to-sales",
]);

export const TOOLS: Record<
  ToolKey,
  {
    name: string;
    href: string;
    /** Display label for completion time, e.g. "5 min". */
    duration: string;
    /** True only when the result is shown without registering an email.
     * Must agree with UNGATED_ASSESSMENT_SLUGS above. */
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
  // Replaces the retired Process Assessment. Sanity-authored (slug
  // "expertise-to-sales"); /assessment/process redirects here.
  expertise: {
    name: "Expertise-to-Sales Check",
    href: "/assessment/expertise-to-sales",
    duration: "4 min",
    ungated: true,
    result: "A score across four areas showing how much of your experts' knowledge marketing and sales can use, based on your own answers.",
  },
  "lead-magnet": {
    name: "Lead Magnet Ideation Tool",
    href: "/assessment/lead-magnet",
    duration: "5 min",
    ungated: false,
    result: "Three ranked lead magnet formats with topic ideas and capability gaps.",
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
    scope: "a real sample of your estate: 10% of it, at least 50 items and at most 100",
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
  /** How estate size and the Snapshot sample are counted. Approved by
   * Russell, 27 September 2026. */
  itemDefinition: {
    summary:
      "An item is one published piece of content with its own address: a web page, an article, or a standalone document such as a PDF.",
    counted:
      "Product and service pages, articles and blog posts, support and help articles, landing pages, and standalone documents (PDFs, datasheets, whitepapers) published at their own link.",
    notCounted:
      "Navigation, search results, tag and listing pages, images and video, pages that redirect elsewhere, and duplicates of the same content at a second address.",
    languages:
      "Each language version is a separate item. A Snapshot covers one language, so only that language's items count.",
    sampleRule:
      "Your estate is the number of countable items in that language. A Snapshot samples 10% of it, at least 50 items and at most 100. If you have fewer than 50 items, we review all of them.",
  },
  /** Illustrative Snapshot report for a fictional company. */
  samplePath: "/content-audit/sample",
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

/** Buyer situations with a workflow-led solution page under /solutions.
 * The full page records live in lib/workflowSolutions.ts; only the short
 * labels sit here, so the client-side contact form can show "About: ..."
 * without bundling every page's copy. */
export const SOLUTION_CONTEXT = {
  "export-manufacturers": "Export manufacturers",
  "engineering-consultancies": "Engineering consultancies",
  "saas-industrial-tech": "SaaS and industrial tech",
  "maritime-suppliers": "Maritime suppliers",
  "pe-backed-companies": "PE-backed B2B companies",
  "professional-services": "Multi-market professional services",
  "multilingual-industrial-teams": "Multilingual industrial teams",
} as const;

export type SolutionSlug = keyof typeof SOLUTION_CONTEXT;

export function isSolutionSlug(v: string | null): v is SolutionSlug {
  return !!v && Object.prototype.hasOwnProperty.call(SOLUTION_CONTEXT, v);
}

export function enquiryHref(
  topic: EnquiryTopic,
  pillar?: Pillar,
  solution?: SolutionSlug
): string {
  const params = new URLSearchParams({ offer: topic });
  if (pillar) params.set("pillar", pillar);
  if (solution) params.set("solution", solution);
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

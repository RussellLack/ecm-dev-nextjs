/**
 * Workflow-led solution pages: one record per buyer situation, rendered at
 * /solutions/<slug> by components/WorkflowSolutionPage.tsx.
 *
 * These sit beside the five outcome-led solution pages, which live in Sanity
 * (`solutionPage`). They are kept in code, like lib/offers.ts, because each
 * page states the scope, inputs and client responsibilities of a first
 * project: commercial wording that should change through review, not a CMS
 * edit. Every record follows the same shape so the pages share one template
 * while their copy stays specific to the buyer.
 *
 * Rules the copy follows (from the implementation brief):
 *  - Frame pains as situations the visitor may recognise, not diagnoses.
 *  - No prices, turnaround promises, percentage improvements or guarantees:
 *    scope, fee, timing and client involvement are agreed before work starts.
 *  - Evidence is existing, published case studies only. Each card links to
 *    the case study, which carries the full attribution; the relevance is
 *    the workflow, never "same sector".
 *  - No internal ICP numbers, hypotheses or research terms on the page.
 */

import { TOOLS, type Pillar, type SolutionSlug } from "@/lib/offers";

/** How the hub groups the pages: an industry, a business situation that
 * crosses sectors (PE ownership), or an operating need (multilingual). */
export type SolutionKind = "sector" | "situation" | "operating-need";

export interface WorkflowStep {
  title: string;
  /** Who does this step. */
  who: string;
  /** The source information the step relies on. */
  source: string;
  /** What has to be true when the work passes to the next step. */
  handoff: string;
}

export interface Capability {
  label: string;
  pillar: Pillar;
}

export interface SolutionProof {
  /** Published case-study slug, verified against Sanity. */
  slug: string;
  title: string;
  /** Why this work is relevant here: the workflow, not the sector. */
  relevance: string;
}

export interface WorkflowSolution {
  slug: SolutionSlug;
  kind: SolutionKind;
  /** Shown first and larger on the hub. */
  priority: boolean;
  /** Who the page is written for. Used on the hub card. */
  audience: string;
  eyebrow: string;
  headline: string;
  heroSubhead: string;
  /** One line for the hub card and the header menu. */
  hubSummary: string;
  metaTitle: string;
  metaDescription: string;
  /** Secondary hero action: a matching assessment, or a worked example. */
  secondaryCta: { label: string; href: string; note?: string };
  pains: { title: string; body: string }[];
  workflow: {
    intro: string;
    steps: WorkflowStep[];
    exception: { title: string; body: string };
  };
  pilot: {
    name: string;
    summary: string;
    inputs: string[];
    outputs: string[];
    clientResponsibilities: string[];
    completion: string[];
  };
  measures: { name: string; description: string }[];
  capabilities: Capability[];
  proof: SolutionProof[];
  /** Optional page-specific sentence on the Russell card. */
  leadNote?: string;
}

export const SOLUTION_KIND_LABEL: Record<SolutionKind, string> = {
  sector: "Sector",
  situation: "Business situation",
  "operating-need": "Operating need",
};

export const WORKFLOW_SOLUTIONS: WorkflowSolution[] = [
  /* ─── Export manufacturers ─── */
  {
    slug: "export-manufacturers",
    kind: "sector",
    priority: true,
    audience: "Commercial and marketing directors at export manufacturers",
    eyebrow: "Export manufacturers",
    headline: "Make complex products easier to evaluate.",
    heroSubhead:
      "When a distributor asks whether a product suits their application, the answer should not depend on who happens to be free in engineering. We help you turn recurring application questions into approved answers that sales can send and engineering trusts.",
    hubSummary:
      "Recurring application questions answered once, approved by engineering and reused by sales.",
    metaTitle: "Technical Enquiry Answers for Export Manufacturers",
    metaDescription:
      "Turn recurring application questions into approved answers with stated limits, so sales responds faster and engineering stops rewriting the same reply. Start with one product family.",
    secondaryCta: {
      label: `Free self-check: ${TOOLS.expertise.name}`,
      href: TOOLS.expertise.href,
      note: TOOLS.expertise.duration,
    },
    pains: [
      {
        title: "The same question, answered again",
        body: "A distributor asks whether a product suits a particular temperature range or substrate. Sales forwards it to engineering, who answered something similar last quarter, in an email nobody else can find.",
      },
      {
        title: "Clarification by instalments",
        body: "The first reply asks for operating conditions. The second asks which standard applies. By the third round the buyer has waited a week and the opportunity has cooled.",
      },
      {
        title: "Answers that drift between markets",
        body: "The datasheet says one thing, the translated brochure another and the sales deck a third. Engineering ends up correcting material it did not write.",
      },
    ],
    workflow: {
      intro:
        "The work runs from a technical enquiry to a recorded next step. Most of the delay sits in the handoffs, not in the engineering judgement itself.",
      steps: [
        {
          title: "Technical enquiry",
          who: "Sales or distributor support",
          source: "The enquiry and the customer's application details",
          handoff: "Logged against a product family and application, not simply forwarded.",
        },
        {
          title: "Requirement clarification",
          who: "Sales, using an agreed checklist",
          source: "The approved question set for that product family",
          handoff: "Missing conditions requested once, in one message.",
        },
        {
          title: "Suitability review",
          who: "Application or product engineer",
          source: "Approved answers, test data and known limitations",
          handoff: "A standard answer confirmed, or the case flagged as non-standard.",
        },
        {
          title: "Approved response",
          who: "Sales sends it; engineering approved the content",
          source: "The answer library, with applicability and limits",
          handoff: "The reply carries its evidence and states where it does not apply.",
        },
        {
          title: "Recorded next step",
          who: "Sales",
          source: "Your CRM or the system you already use",
          handoff: "Outcome logged; any new question goes back into the library.",
        },
      ],
      exception: {
        title: "When the requirement is custom or unsupported",
        body: "If an application falls outside the approved answers, the enquiry goes to engineering with the context already gathered. Nobody sends a confident answer the evidence does not support.",
      },
    },
    pilot: {
      name: "One product family and its recurring questions",
      summary:
        "We take one product family and an agreed set of the application questions it attracts most often, then build the answers and the response workflow around them.",
      inputs: [
        "Datasheets, test reports and technical documentation for the product family",
        "A sample of recent enquiries and the replies that were sent",
        "Time with one application engineer for interviews and review",
        "Access to wherever enquiries are logged today",
      ],
      outputs: [
        "A source inventory: which documents hold which facts, and which are current",
        "Approved answers, each stating where it applies and its limitations",
        "Supporting evidence linked to each answer",
        "A response and review workflow with named owners",
      ],
      clientResponsibilities: [
        "Your engineers approve every statement of technical suitability",
        "You decide which questions are in scope",
        "You own the answers and decide where they are published",
      ],
      completion: [
        "Every in-scope question has an approved answer, or a recorded reason it needs case-by-case review",
        "The workflow has been used on live enquiries and adjusted",
        "Your team can maintain the library without us",
      ],
    },
    measures: [
      { name: "Response time", description: "From enquiry received to answer sent." },
      { name: "Engineering effort", description: "Engineer hours spent on repeat questions." },
      { name: "Clarification rounds", description: "Messages exchanged before the requirement is clear." },
      { name: "Corrections", description: "Answers or materials corrected after they were sent." },
    ],
    capabilities: [
      { label: "Content operations", pillar: "services" },
      { label: "Product content structure", pillar: "technology" },
      { label: "Technical localisation", pillar: "localization" },
    ],
    proof: [
      {
        slug: "digital-tools-for-product-selection-in-pim",
        title: "Product-Finding Tools for a Global Paints & Coatings Manufacturer's B2B Website",
        relevance:
          "A product-attribute model that let B2B buyers narrow a large range by their own application. Approved application answers rest on the same structured product facts.",
      },
      {
        slug: "digital-service-platform-building-materials-distributor",
        title: "Digital Service Platform for a Building Materials Distributor",
        relevance:
          "A service platform that put estimating, tendering and project documentation into professional buyers' everyday work, drawing on product data across CMS, PIM and ERP. Approved application answers depend on the same connected product information.",
      },
    ],
    leadNote:
      "For manufacturers, that usually means sitting between sales and engineering until the answers stop needing both.",
  },

  /* ─── Engineering consultancies ─── */
  {
    slug: "engineering-consultancies",
    kind: "sector",
    priority: true,
    audience: "Managing directors, commercial and practice leads at engineering consultancies",
    eyebrow: "Engineering consultancies",
    headline: "Build credible proposals without starting from scratch.",
    heroSubhead:
      "Each proposal pulls your most senior specialists away from paid work to find credentials, rewrite approaches and check evidence. We help you build a reusable evidence pack for one service, so specialists review a draft rather than write it.",
    hubSummary:
      "A reusable proposal evidence pack, so specialists review bids instead of writing them.",
    metaTitle: "Proposal Evidence Packs for Engineering Consultancies",
    metaDescription:
      "Reduce the specialist time each proposal takes: approved project credentials, reusable approach components and a clear review process for one service.",
    secondaryCta: {
      label: `Free self-check: ${TOOLS.expertise.name}`,
      href: TOOLS.expertise.href,
      note: TOOLS.expertise.duration,
    },
    pains: [
      {
        title: "Searching for the right credential",
        body: "A bid needs three relevant projects with dates, scope and outcomes. The facts exist, spread across old proposals, project folders and one director's memory.",
      },
      {
        title: "The approach, rewritten each time",
        body: "The method for the service has barely changed, but every bid team writes it again, with small differences nobody approved.",
      },
      {
        title: "Review that arrives too late",
        body: "The specialist sees the draft two days before submission and rewrites half of it. The bid goes in, and the next one starts the same way.",
      },
    ],
    workflow: {
      intro:
        "We follow the path from a qualified opportunity to an approved proposal, and look at where specialist time goes along it.",
      steps: [
        {
          title: "Qualified opportunity",
          who: "Bid or business development lead",
          source: "Tender documents and the client's brief",
          handoff: "Decision to bid recorded, with the service and the specialist named.",
        },
        {
          title: "Specialist brief",
          who: "Bid lead and specialist",
          source: "A structured briefing template",
          handoff: "A short, focused brief replaces an open-ended request to draft.",
        },
        {
          title: "Approach and evidence",
          who: "Bid writer",
          source: "Approved approach components and project credentials",
          handoff: "Draft assembled from approved material, with gaps clearly marked.",
        },
        {
          title: "Delivery review",
          who: "Specialist and delivery lead",
          source: "The draft and the proposed resourcing",
          handoff: "Reviewers check fit and feasibility, not wording from scratch.",
        },
        {
          title: "Approved proposal",
          who: "Bid owner",
          source: "Final draft and pricing",
          handoff: "Submitted; new credentials and lessons go back into the pack.",
        },
      ],
      exception: {
        title: "When the capability is unproven or the people are committed",
        body: "If a bid needs experience you cannot evidence, or specialists who are already booked, the workflow stops for a decision. It does not fill the gap with confident wording.",
      },
    },
    pilot: {
      name: "One specialist service and its evidence pack",
      summary:
        "We take one service you bid for regularly and build the reusable material and review process behind its proposals.",
      inputs: [
        "Recent proposals for the service, won and lost",
        "Project records and any client references you are permitted to use",
        "Interviews with two or three of the specialists involved",
        "Your current bid templates and approval steps",
      ],
      outputs: [
        "An evidence inventory for the service",
        "Approved project credentials, stating what may be said about each",
        "Reusable approach components",
        "A specialist briefing template",
        "A review process with named approvers",
      ],
      clientResponsibilities: [
        "You keep authority over pricing, resourcing and delivery commitments",
        "Specialists approve credentials and approach wording",
        "You confirm which client references may be used",
      ],
      completion: [
        "The pack has been used on a live proposal and revised after review",
        "Every credential states its source and where it may be used",
        "Your bid team can update the pack without us",
      ],
    },
    measures: [
      { name: "Specialist hours", description: "Senior time spent per proposal." },
      { name: "Preparation time", description: "From decision to bid to submission-ready draft." },
      { name: "Evidence retrieval time", description: "Time spent finding credentials and references." },
      { name: "Review rounds", description: "Drafts exchanged before approval." },
    ],
    capabilities: [
      { label: "Expert knowledge capture", pillar: "services" },
      { label: "Content operations", pillar: "services" },
      { label: "Knowledge organisation", pillar: "technology" },
    ],
    proof: [
      {
        slug: "growth-strategy-and-new-website",
        title: "Website Relaunch & Content Strategy for a Project Management Consultancy",
        relevance:
          "Moved a consultancy from unevenly written, single-language material to a bilingual site backed by a defined content system. Proposal material needs the same agreed source.",
      },
      {
        slug: "industrial-robots-website",
        title: "Core Website Copywriting for a Robotics & Automation Engineering Company",
        relevance:
          "Translated deep technical capability into language an industrial buyer could act on, working directly with the engineers who held it.",
      },
    ],
    leadNote:
      "In a consultancy, that means protecting specialist time: they decide, we assemble.",
  },

  /* ─── SaaS and industrial tech ─── */
  {
    slug: "saas-industrial-tech",
    kind: "sector",
    priority: false,
    audience: "CMOs, growth and RevOps leads at SaaS and industrial technology companies",
    eyebrow: "SaaS and industrial tech",
    headline: "Carry buyer context from first enquiry into sales.",
    heroSubhead:
      "When a qualified enquiry reaches sales without what the buyer has already said, the first call repeats discovery. We help you build one use-case path where claims, questions and routing carry that context forward.",
    hubSummary:
      "One use case where the buyer's context survives from enquiry to sales acceptance.",
    metaTitle: "Enquiry to Sales Handoff for SaaS and Industrial Tech",
    metaDescription:
      "Reviewed claims, qualification questions and routing rules for one use case, tested in your existing stack, so sales stops repeating discovery.",
    secondaryCta: {
      label: "See a related example",
      href: "/case-study/inbound-marketing-strategy-energy-consultancy",
    },
    pains: [
      {
        title: "Discovery, twice",
        body: "A prospect describes their use case on a form, then again to a development rep, then again to an account executive, each time a little less patiently.",
      },
      {
        title: "Claims sales cannot stand behind",
        body: "Marketing pages describe capabilities in broad terms. Sales spends the first call narrowing them, and occasionally retracting one.",
      },
      {
        title: "Rejections without reasons",
        body: "Sales declines enquiries as a poor fit, but the reason is rarely recorded, so marketing keeps attracting the same kind.",
      },
    ],
    workflow: {
      intro:
        "We follow one use case from enquiry to an accepted or rejected opportunity, with the reason recorded either way.",
      steps: [
        {
          title: "Use-case enquiry",
          who: "Prospect, through your site",
          source: "A use-case page with reviewed claims and stated limits",
          handoff: "The enquiry is tied to a named use case.",
        },
        {
          title: "Context capture",
          who: "Form or first conversation",
          source: "Agreed qualification questions",
          handoff: "Answers stored where sales will actually see them.",
        },
        {
          title: "Qualification",
          who: "Development rep or marketing operations",
          source: "Your written qualification rules",
          handoff: "Fit judged against criteria, not instinct.",
        },
        {
          title: "Routing",
          who: "Your CRM, by agreed rules",
          source: "Routing and acceptance rules",
          handoff: "The right owner receives it, with context attached.",
        },
        {
          title: "Acceptance or rejection",
          who: "Account executive",
          source: "The enquiry record",
          handoff: "Decision and reason recorded, and reported back to marketing.",
        },
      ],
      exception: {
        title: "Poor fit, or a feature that has not been released",
        body: "Enquiries outside the use case, or asking for something on the roadmap, follow an explicit route. Nobody is promised an unreleased feature to keep a conversation alive.",
      },
    },
    pilot: {
      name: "One use case, from enquiry to accepted opportunity",
      summary:
        "We work on one use-case path inside the tools you already run. We do not take over your RevOps function or replace your CRM.",
      inputs: [
        "Current pages and sales material for the use case",
        "A sample of recent enquiries and what happened to them",
        "Your qualification criteria, however informal",
        "Someone who can change forms and CRM fields, or access to do so",
      ],
      outputs: [
        "Reviewed claims and stated limitations for the use case",
        "Qualification questions",
        "Agreed routing and acceptance rules",
        "A tested handoff in your existing stack",
      ],
      clientResponsibilities: [
        "You set the commercial qualification rules",
        "Product confirms what is released and what is not",
        "Your CRM owner approves any field or routing change",
      ],
      completion: [
        "Test enquiries reach sales with the agreed context attached",
        "Rejections are recorded with a reason from an agreed list",
        "Sales and marketing have both signed off the rules",
      ],
    },
    measures: [
      { name: "Context completeness", description: "Share of enquiries reaching sales with the agreed fields filled." },
      { name: "Acceptance time", description: "From enquiry to an accept or reject decision." },
      { name: "Repeated discovery questions", description: "Questions sales asks that the buyer already answered." },
      { name: "Recorded rejection reasons", description: "Share of rejected enquiries with a reason recorded." },
    ],
    capabilities: [
      { label: "Content technology", pillar: "technology" },
      { label: "Buyer path design", pillar: "services" },
      { label: "Content operations", pillar: "services" },
    ],
    proof: [
      {
        slug: "inbound-marketing-strategy-energy-consultancy",
        title: "Demand Generation for a B2B Software Provider",
        relevance:
          "An inbound model connecting search, expert content and campaign paths to qualified sales leads, for a specialist software provider with technical buyers.",
      },
      {
        slug: "digital-demand-generation",
        title: "Digital Demand Generation for a Global Technology Manufacturer",
        relevance:
          "Lead scoring and attribution reporting designed across marketing automation, analytics and CRM, so a technology manufacturer could see which enquiries turned into revenue.",
      },
    ],
  },

  /* ─── Maritime suppliers ─── */
  {
    slug: "maritime-suppliers",
    kind: "sector",
    priority: false,
    audience: "Commercial directors and sales leaders at maritime suppliers",
    eyebrow: "Maritime suppliers",
    headline: "Give every buying stakeholder the evidence they need.",
    heroSubhead:
      "A superintendent, a fleet manager and a procurement lead can all be weighing the same solution, each with different questions. We help you build a decision pack for one solution area, organised by who is deciding.",
    hubSummary:
      "A reusable decision pack that answers technical, operational and procurement questions separately.",
    metaTitle: "Buyer Decision Packs for Maritime Suppliers",
    metaDescription:
      "Organise approved compatibility information, restrictions, support coverage and project evidence by buying role, for one solution area.",
    secondaryCta: {
      label: "See a related example",
      href: "/case-study/global-digital-platform-maritime-services-group",
    },
    pains: [
      {
        title: "One brochure, three audiences",
        body: "Technical staff want compatibility and installation detail. Operations wants downtime and support coverage. Procurement wants terms and references. One document serves none of them well.",
      },
      {
        title: "Questions answered one stakeholder at a time",
        body: "Each new person on the buyer's side asks for something the last one already received, in a slightly different form.",
      },
      {
        title: "Actions that drift after the meeting",
        body: "Open questions and next steps live in a salesperson's notes. When that person moves on, so does the deal's memory.",
      },
    ],
    workflow: {
      intro:
        "We follow the path from a vessel or fleet enquiry to a clear list of the decisions still to be made, and who owns each.",
      steps: [
        {
          title: "Vessel or fleet enquiry",
          who: "Sales or a regional office",
          source: "The enquiry, with vessel and fleet details",
          handoff: "Logged with vessel type and intended application.",
        },
        {
          title: "Application context",
          who: "Sales, with the customer's technical contact",
          source: "Agreed context questions",
          handoff: "Operating conditions recorded once, not asked for repeatedly.",
        },
        {
          title: "Suitability validation",
          who: "Your product or application specialist",
          source: "Approved compatibility information and restrictions",
          handoff: "Fit confirmed, or its limits stated plainly.",
        },
        {
          title: "Decision pack",
          who: "Sales",
          source: "Evidence organised by buying role",
          handoff: "Each stakeholder receives the section written for them.",
        },
        {
          title: "Outstanding decisions and actions",
          who: "Account owner",
          source: "A shared decision log",
          handoff: "Open questions tracked with owners until closed.",
        },
      ],
      exception: {
        title: "When the application is outside validated use",
        body: "If the vessel, retrofit or operating profile falls outside what has been validated, the case goes to your specialists. ECM.DEV does not certify products or regulatory compliance, and the pack never implies that it does.",
      },
    },
    pilot: {
      name: "One solution area and its decision pack",
      summary:
        "We take one solution area and build a reusable pack that each buying role can read on its own terms.",
      inputs: [
        "Compatibility data, installation guides and known restrictions",
        "Support coverage and service information",
        "Project references you are permitted to share",
        "Time with a product specialist and a sales lead",
      ],
      outputs: [
        "Approved compatibility information and application restrictions, in one place",
        "Implementation needs and support coverage, stated plainly",
        "Project evidence organised by buying role",
        "A decision log for open questions and actions",
      ],
      clientResponsibilities: [
        "Your specialists approve every statement of applicability",
        "You confirm which references and project details may be shared",
        "Certification and compliance claims remain yours",
      ],
      completion: [
        "Each buying role has a reviewed section of the pack",
        "The pack has been used with a live opportunity",
        "Open questions are being tracked in the decision log",
      ],
    },
    measures: [
      { name: "Preparation time", description: "Time to assemble material for a new opportunity." },
      { name: "Clarification rounds", description: "Follow-up requests from the buyer's side." },
      { name: "Unanswered questions", description: "Open buyer questions at each stage." },
      { name: "Overdue actions", description: "Agreed actions past their date." },
    ],
    capabilities: [
      { label: "Portfolio content", pillar: "services" },
      { label: "Evidence organisation", pillar: "technology" },
      { label: "Localisation", pillar: "localization" },
    ],
    proof: [
      {
        slug: "global-digital-platform-maritime-services-group",
        title: "Global Customer Services Portal",
        relevance:
          "Replaced a site structured around business divisions with one built around customer needs and solutions, for a global maritime services group. A decision pack applies the same principle to a single sale.",
      },
    ],
  },

  /* ─── PE-backed B2B companies ─── */
  {
    slug: "pe-backed-companies",
    kind: "situation",
    priority: false,
    audience: "Commercial leaders and operating partners in PE-backed B2B groups",
    eyebrow: "PE-backed B2B companies",
    headline: "Turn a combined portfolio into one usable cross-sell offer.",
    heroSubhead:
      "After an acquisition, two businesses can describe overlapping services in different words, with different evidence and no agreed way to pass an opportunity across. We help you make one cross-sell offer usable between two business units.",
    hubSummary:
      "One cross-sell offer two business units can describe, evidence and refer in the same way.",
    metaTitle: "Cross-Sell Offers for PE-Backed B2B Groups",
    metaDescription:
      "Reconcile one offer between two business units: one description, one evidence pack, shared qualification guidance and a referral process both sides accept.",
    secondaryCta: {
      label: "See a related example",
      href: "/case-study/esg-sustainability-content-strategy",
    },
    pains: [
      {
        title: "Two descriptions of the same capability",
        body: "Each business unit's website and decks describe the shared offer in their own terms. Customers notice before the sales teams do.",
      },
      {
        title: "Referrals that disappear",
        body: "A salesperson spots an opportunity for the sister business, sends an email, and never hears what happened to it.",
      },
      {
        title: "Ownership nobody has settled",
        body: "No one has decided who owns an account both businesses serve, so the referral stalls, politely.",
      },
    ],
    workflow: {
      intro:
        "We follow one cross-sell route, from a spotted opportunity to a referral the receiving business accepts.",
      steps: [
        {
          title: "Cross-sell opportunity",
          who: "Account owner in the referring business",
          source: "Shared qualification guidance",
          handoff: "The opportunity is checked against the agreed offer.",
        },
        {
          title: "Agreed capability boundaries",
          who: "Sponsor and business unit leads",
          source: "The reconciled offer description",
          handoff: "What each business delivers is written down.",
        },
        {
          title: "Consolidated evidence",
          who: "Marketing or bid support",
          source: "Evidence from both businesses",
          handoff: "One set of references and credentials, not two.",
        },
        {
          title: "Shared guidance",
          who: "Sales in both businesses",
          source: "Qualification guidance and offer description",
          handoff: "Both teams describe the offer the same way.",
        },
        {
          title: "Accepted referral",
          who: "The receiving business",
          source: "The referral ownership process",
          handoff: "Accepted or declined with a reason, within an agreed time.",
        },
      ],
      exception: {
        title: "When ownership or delivery authority is unresolved",
        body: "Some questions belong to leadership: who owns the account, and who may commit to delivery. The workflow surfaces them and waits for a decision. A combined offer is not marketed before both businesses can deliver it.",
      },
    },
    pilot: {
      name: "One offer between two business units",
      summary:
        "A bounded piece of work on one cross-sell offer, with a named sponsor. It is not acquisition integration as a whole.",
      inputs: [
        "Current offer descriptions, decks and pages from both businesses",
        "Case studies and references from both",
        "A named sponsor with authority over this offer in both businesses",
        "Interviews with a salesperson and a delivery lead from each side",
      ],
      outputs: [
        "A reconciled offer description",
        "A consolidated evidence pack",
        "Qualification guidance for both sales teams",
        "A referral ownership process",
      ],
      clientResponsibilities: [
        "Leadership resolves account ownership and delivery authority",
        "The sponsor approves the offer description",
        "Each business confirms it can deliver what is described",
      ],
      completion: [
        "Both businesses have approved the offer description",
        "Referrals follow the agreed process and are tracked",
        "Open leadership decisions are listed, each with an owner",
      ],
    },
    measures: [
      { name: "Unresolved decisions", description: "Ownership and delivery questions still open." },
      { name: "Referral acceptance time", description: "From referral sent to accept or decline." },
      { name: "Rejection reasons", description: "Why referrals are declined, recorded consistently." },
      { name: "Material usage", description: "How often the shared material is actually used." },
    ],
    capabilities: [
      { label: "Proposition and content consolidation", pillar: "services" },
      { label: "Knowledge structure", pillar: "technology" },
      { label: "Workflow design", pillar: "services" },
    ],
    proof: [
      {
        slug: "esg-sustainability-content-strategy",
        title: "Unified Positioning for a Sustainability Reporting Firm",
        relevance:
          "Unified the messaging across an advisory, an academy, a data platform and a recently combined specialist consultancy into one positioning. The closest match to a two-business offer.",
      },
      {
        slug: "marketing-technology-due-diligence",
        title: "Marketing Technology Due Diligence & Investment Strategy for a Private Equity Firm",
        relevance:
          "Independent due diligence for a growth equity investor evaluating an acquisition. It shows familiarity with the investor's view of a business; it was not integration work.",
      },
    ],
  },

  /* ─── Multi-market professional services ─── */
  {
    slug: "professional-services",
    kind: "sector",
    priority: false,
    audience: "Managing partners and marketing directors at multi-market professional services firms",
    eyebrow: "Multi-market professional services",
    headline: "Make expert answers useful beyond one conversation.",
    heroSubhead:
      "Your partners explain the same things to buyers every week, and the best explanations stay in their sent folders. We help you turn the recurring buyer questions for one service into approved answers and evidence the firm can reuse.",
    hubSummary:
      "Recurring buyer questions turned into approved answers the firm can reuse, with clear limits.",
    metaTitle: "Reusable Expert Answers for Professional Services Firms",
    metaDescription:
      "An interview-to-approval workflow and an answer and evidence library for one service, with owners, sources and reuse limits.",
    secondaryCta: {
      label: `Free self-check: ${TOOLS.maturity.name}`,
      href: TOOLS.maturity.href,
      note: TOOLS.maturity.duration,
    },
    pains: [
      {
        title: "The good answer is in someone's email",
        body: "A partner wrote a clear explanation of how the firm handles a cross-border issue. Three colleagues have since written their own.",
      },
      {
        title: "Evidence nobody can check",
        body: "A proposal cites a past matter, but nobody is sure what the client agreed may be said about it.",
      },
      {
        title: "Editorial that waits for partners",
        body: "Marketing drafts a piece from a partner's expertise, then waits weeks for approval, and the moment passes.",
      },
    ],
    workflow: {
      intro:
        "We follow how one buyer question becomes an answer the firm can reuse, and who approves it on the way.",
      steps: [
        {
          title: "Buyer question",
          who: "Partner or client team",
          source: "The question, from a meeting or an email",
          handoff: "Recurring questions are logged, not only answered.",
        },
        {
          title: "Expert response",
          who: "Partner or senior associate",
          source: "A short interview, or the reply they already wrote",
          handoff: "Captured once, in their own words.",
        },
        {
          title: "Evidence verification",
          who: "Knowledge or risk team",
          source: "Matter records and client permissions",
          handoff: "Evidence confirmed, with its permitted use recorded.",
        },
        {
          title: "Editorial adaptation",
          who: "Marketing or an editor",
          source: "The answer and its evidence",
          handoff: "Rewritten for reuse, with jurisdiction and date stated.",
        },
        {
          title: "Approved reuse",
          who: "The owning partner",
          source: "The answer and evidence library",
          handoff: "Approved for named uses, with a review date.",
        },
      ],
      exception: {
        title: "When an answer belongs to one client",
        body: "A response written for one buyer is not automatically material for wider reuse. Confidential or context-specific evidence stays restricted, and the library records who may use what.",
      },
    },
    pilot: {
      name: "One service and its recurring buyer questions",
      summary:
        "We take one service, collect the questions buyers ask most about it, and build the workflow that turns partner answers into approved, reusable material.",
      inputs: [
        "The questions buyers ask most about the service",
        "Existing replies, articles and proposals",
        "Interview time with two or three partners",
        "Your rules on client confidentiality and references",
      ],
      outputs: [
        "An interview-to-approval workflow",
        "An answer and evidence library with owners, sources and reuse limits",
        "A clear separation between individual buyer responses and material approved for wider reuse",
      ],
      clientResponsibilities: [
        "Partners approve every answer attributed to the firm",
        "Risk or knowledge teams confirm the permitted use of evidence",
        "You decide where approved answers are published",
      ],
      completion: [
        "Every in-scope question has an approved answer, or a recorded reason it cannot be reused",
        "Each answer names its owner, source and review date",
        "The workflow has run end to end on new questions",
      ],
    },
    measures: [
      { name: "Expert effort", description: "Partner time spent per approved answer." },
      { name: "Approval time", description: "From draft to partner approval." },
      { name: "Retrieval time", description: "Time to find an approved answer when it is needed." },
      { name: "Actual reuse", description: "How often approved answers are used again." },
    ],
    capabilities: [
      { label: "Editorial strategy", pillar: "services" },
      { label: "Expert knowledge capture", pillar: "services" },
      { label: "Content operations", pillar: "services" },
    ],
    proof: [
      {
        slug: "cms-migration-to-episerver-nordic-training-company",
        title: "Website Copy & Customer Case Studies for a Scandinavian EdTech Company",
        relevance:
          "Four interview-based case studies that gave a company evidence it could take into new partner markets. The same route runs from conversation to approved, reusable material.",
      },
      {
        slug: "ecm-governance-financial-services",
        title: "Content Strategy & Editorial Governance for a Nordic Pension & Insurance Group",
        relevance:
          "An editorial governance model to run a regulated organisation's content as one system, with clear owners and review.",
      },
    ],
  },

  /* ─── Multilingual industrial teams ─── */
  {
    slug: "multilingual-industrial-teams",
    kind: "operating-need",
    priority: false,
    audience: "Content and digital marketing leads in multilingual industrial teams",
    eyebrow: "Multilingual industrial teams",
    headline: "Keep market content aligned when the source changes.",
    heroSubhead:
      "A product specification changes, and somewhere a translated datasheet, a local landing page and a distributor's deck keep saying the old thing. We help you trace one real update through every language and channel it touches.",
    hubSummary:
      "One real source change traced through every language and channel, verified or held with a reason.",
    metaTitle: "Multilingual Content Updates for Industrial Teams",
    metaDescription:
      "Trace one approved source change through translations, websites, PDFs and sales material: a dependency map, terminology guidance and a release verification record.",
    secondaryCta: {
      label: `Free estimate: ${TOOLS["localisation-estimator"].name}`,
      href: TOOLS["localisation-estimator"].href,
      note: TOOLS["localisation-estimator"].duration,
    },
    pains: [
      {
        title: "Nobody knows what a change touches",
        body: "Engineering updates a value in the source document. Nobody holds a list of the pages, PDFs and decks in other languages that repeat it.",
      },
      {
        title: "Translation without the reason",
        body: "Translators receive changed sentences without knowing why they changed, and terminology drifts from one market to the next.",
      },
      {
        title: "Local versions that quietly diverge",
        body: "A market adapted its page for a good reason two years ago. Nobody wrote the reason down, so the next update either overwrites it or skips that market.",
      },
    ],
    workflow: {
      intro:
        "We follow one approved source change from release to verified publication in each market.",
      steps: [
        {
          title: "Approved source change",
          who: "Product or technical owner",
          source: "The change record",
          handoff: "The change is described once, with its reason.",
        },
        {
          title: "Affected assets",
          who: "Content operations",
          source: "A dependency map across languages and channels",
          handoff: "Every affected asset listed, each with an owner.",
        },
        {
          title: "Translation and adaptation",
          who: "Translators or your language service provider",
          source: "Terminology guidance and the reason for the change",
          handoff: "Translated with context, not as isolated sentences.",
        },
        {
          title: "Market review",
          who: "Local market owner",
          source: "Updated asset and documented local exceptions",
          handoff: "Approved, or held with a stated reason.",
        },
        {
          title: "Publication and verification",
          who: "Web and channel owners",
          source: "The release verification record",
          handoff: "Each version confirmed live, or explicitly held.",
        },
      ],
      exception: {
        title: "When a market has a documented reason to differ",
        body: "Agreed local exceptions are preserved, not overwritten. Every in-scope version ends the release verified, or held with a stated reason and a named owner.",
      },
    },
    pilot: {
      name: "One real update across two languages",
      summary:
        "We take one planned or recent source change and follow it across two languages and the channels you agree, building the process as we go.",
      inputs: [
        "One planned or recent source change",
        "The current assets in two languages: web pages, PDFs and sales material",
        "Any existing terminology lists or translation memories",
        "A reviewer in each market",
      ],
      outputs: [
        "A dependency map from the source to every in-scope asset",
        "Terminology guidance for the content involved",
        "Ownership and approval steps for each market",
        "A release verification record",
      ],
      clientResponsibilities: [
        "Market owners approve their local versions",
        "You decide which channels and languages are in scope",
        "Your translation supplier, if you have one, remains your supplier",
      ],
      completion: [
        "Every in-scope version is verified live, or held with a reason and an owner",
        "Documented local exceptions survived the update",
        "The process is written down, so the next change follows it",
      ],
    },
    measures: [
      { name: "Source-to-market delay", description: "From approved change to live in each market." },
      { name: "Rework", description: "Assets corrected after publication." },
      { name: "Overdue assets", description: "In-scope assets past their agreed date." },
      { name: "Update completeness", description: "Share of affected assets verified or explicitly held." },
    ],
    capabilities: [
      { label: "Localisation", pillar: "localization" },
      { label: "Content operations", pillar: "services" },
      { label: "Content technology", pillar: "technology" },
    ],
    proof: [
      {
        slug: "content-localization-15-countrieslanguages",
        title: "Multilingual Content Operations for a National Seafood Trade Body",
        relevance:
          "Original English content moved into more than a dozen languages and published in the CMS, including time-critical material where every market had to say the same thing.",
      },
      {
        slug: "content-operations-transformation",
        title: "Content Operations Transformation",
        relevance:
          "Multilingual publishing across 14 languages with editorial governance, for a national tourism platform over several years.",
      },
    ],
  },
];

export const WORKFLOW_SOLUTION_SLUGS = WORKFLOW_SOLUTIONS.map((s) => s.slug);

export function getWorkflowSolution(slug: string): WorkflowSolution | undefined {
  return WORKFLOW_SOLUTIONS.find((s) => s.slug === slug);
}

export const PILLAR_HREF: Record<Pillar, string> = {
  services: "/content-operations",
  technology: "/content-technology",
  localization: "/content-localization",
};

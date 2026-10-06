/**
 * Representative engagements: the future-facing proof library.
 *
 * Each record is an anonymised scenario synthesised from patterns, methods
 * and experience across previous engagements. It shows how that experience
 * applies to a problem buyers have now. It is NOT a client case study:
 *
 *  - `contentType` and `representative` make that programmatically explicit.
 *    Historical projects live in Sanity (`caseStudy`) and are untouched, so
 *    these never inflate the project count or appear in the Projects grid.
 *  - Every page carries PROVENANCE_STATEMENT, verbatim.
 *  - No invented metrics, client names, logos or performance claims.
 *  - `historical` links point to real, published case studies as evidence of
 *    component experience; they are never presented as the scenario itself.
 *
 * Source: docs/FUTURE-FACING-PROOF-PACK.md (the implementation pack);
 * decisions and verification in docs/FUTURE-FACING-PROOF-2026-10-05.md.
 * Kept in code, like lib/workflowSolutions.ts, so wording changes go through
 * review rather than a CMS edit.
 */

import { TOOLS, CONTENT_AUDIT, type Pillar, type SolutionSlug } from "@/lib/offers";

export const PROVENANCE_STATEMENT =
  "This anonymised scenario combines patterns, methods and experience from previous consulting engagements. Client details and implementation specifics have been generalised. It illustrates the type of problem ECM.DEV works on today rather than representing a single named client engagement.";

export const ENGAGEMENT_LABEL = "Representative engagement";

export type EngagementId =
  | "FP01" | "FP02" | "FP03" | "FP04" | "FP05"
  | "FP06" | "FP07" | "FP08" | "FP09" | "FP10";

export interface ApproachStep {
  title: string;
  body?: string;
  bullets?: string[];
}

export interface HistoricalLink {
  /** Published case-study slug, verified against Sanity. */
  slug: string;
  title: string;
  /** Which part of the scenario this project evidences. */
  relevance: string;
}

export interface RepresentativeEngagement {
  contentType: "representative-engagement";
  representative: true;
  id: EngagementId;
  slug: string;
  title: string;
  clientType: string;
  /** Solution-page proof card text. */
  cardSummary: string;
  metaTitle: string;
  metaDescription: string;
  services: Pillar[];
  capabilities: string[];
  /** The ICP Solution page this scenario leads; none for cross-ICP FP09. */
  primarySolution?: SolutionSlug;
  overview: string[];
  who: { text: string[]; listLead?: string; list?: string[] };
  situation: string[];
  breaks: { steps?: string[]; text?: string[]; note?: string };
  approach: ApproachStep[];
  before: string[];
  after: string[];
  ai: {
    lead?: string;
    can?: string[];
    humansLead?: string;
    humans?: string[];
    text?: string[];
    quote?: string;
  };
  changes: string[];
  /** Plain text; **double asterisks** mark emphasis. */
  demonstrates: string[];
  historical: HistoricalLink[];
  related: EngagementId[];
  /** One existing tool or offer, never a new product. */
  startingPoint: { label: string; href: string; note?: string };
  /** Homepage card copy (FP01, FP04, FP06 only). */
  homepage?: { theme: string; blurb: string };
}

const snapshotStart = {
  label: `${CONTENT_AUDIT.name}: ${CONTENT_AUDIT.snapshot.name}`,
  href: `/content-technology#${CONTENT_AUDIT.anchor}`,
  note: "Expert-led, fixed fee",
};
const tool = (k: keyof typeof TOOLS) => ({
  label: TOOLS[k].name,
  href: TOOLS[k].href,
  note: `Free · ${TOOLS[k].duration}`,
});

const base = { contentType: "representative-engagement" as const, representative: true as const };

export const REPRESENTATIVE_ENGAGEMENTS: RepresentativeEngagement[] = [
  /* ─── FP01 ─── */
  {
    ...base,
    id: "FP01",
    slug: "turning-technical-expertise-into-content-engine",
    title: "Turning Technical Expertise Into a Content Engine",
    clientType: "Engineering or specialist professional-services firm",
    cardSummary:
      "The firm's best knowledge lived in experts, proposals and project files. We redesigned the workflow so expertise could be captured once, validated by the right people and reused across web, sales and AI-assisted content production.",
    metaTitle: "Content Operations for Engineering and Expert Firms",
    metaDescription:
      "A representative engagement: capturing technical expertise once, validating it properly and reusing it across marketing, sales and AI-assisted content without repeatedly pulling experts back into production.",
    services: ["services", "technology"],
    capabilities: ["Knowledge capture", "SME workflow", "Structured content", "AI-assisted production", "Governance"],
    primarySolution: "engineering-consultancies",
    overview: [
      "A specialist B2B firm had no shortage of expertise. The problem was getting that expertise out of projects, presentations, proposals and people's heads and into a form marketing and sales could reuse.",
      "We redesigned the path from expert knowledge to commercial content so subject-matter experts could contribute once, marketing could reuse trusted material repeatedly, and AI could help with transformation without becoming the source of truth.",
    ],
    who: {
      text: [
        "Engineering consultancies, technical advisers and specialist professional-services firms where the strongest commercial asset is what experienced people know, but producing content repeatedly competes with billable work.",
      ],
      listLead: "Typical symptoms include:",
      list: [
        "marketing repeatedly chasing experts for input",
        "the same customer questions being answered from scratch",
        "strong material disappearing into proposals and project files",
        "thought leadership depending on a few willing individuals",
        "technical reviewers spending time correcting prose rather than validating facts",
        "sales teams unaware of useful content that already exists",
      ],
    },
    situation: [
      "The firm was rich in expertise but poor at turning that expertise into reusable organisational knowledge.",
      "A customer question might be answered brilliantly in a meeting. A similar explanation might appear in a proposal six weeks later. Marketing might then interview another expert for an article on essentially the same subject.",
      "Each output was treated as a new content job.",
      "The result was predictable: experts became a production bottleneck, marketing struggled to maintain momentum, and useful knowledge remained tied to the person or document that originally contained it.",
      "AI writing tools did not solve this. They made it easier to create more text, but they did not establish which technical claims were trusted, current or reusable.",
    ],
    breaks: {
      steps: [
        "Customer question", "Marketing identifies topic", "SME asked for input",
        "SME sends slides, email or notes", "Writer interprets material", "SME reviews prose",
        "Corrections and second review", "One asset published", "Sales may or may not see it",
        "Source knowledge remains unstructured", "Same question reappears",
      ],
      note: "The expensive part was not writing. It was repeatedly extracting and validating the same expertise.",
    },
    approach: [
      { title: "Map recurring knowledge demand",
        body: "Start with the questions customers, prospects and sales teams repeatedly ask. Cluster them around problems, decisions, risks, methods, applications and evidence rather than around a publishing calendar." },
      { title: "Capture knowledge as knowledge",
        body: "Create structured expert records containing:",
        bullets: ["core explanation", "important claims", "evidence", "examples", "caveats", "audience", "applicability", "expert owner", "review date", "related services and customer problems"] },
      { title: "Change the SME role",
        body: "Experts validate facts, reasoning and nuance. They should not need to line-edit every derivative asset." },
      { title: "Build a transformation workflow",
        body: "Approved knowledge can feed:",
        bullets: ["website pages", "articles", "sales enablement", "proposals", "FAQs", "webinar briefs", "social content", "email", "AI retrieval", "internal knowledge tools"] },
      { title: "Close the loop",
        body: "Search behaviour, CRM conversations, sales objections and content performance feed a knowledge backlog showing what needs to be created, improved or retired." },
    ],
    before: ["Expert", "Interview", "Draft", "Review", "Publish", "Forget"],
    after: [
      "Customer need", "Knowledge gap", "Expert capture", "Structured knowledge", "Validation",
      "Reusable source", "Channel adaptation", "Sales and marketing use",
      "Performance and question signals", "Knowledge refresh",
    ],
    ai: {
      lead: "AI can:",
      can: [
        "extract candidate knowledge from approved source material", "classify content",
        "identify duplication", "suggest related knowledge", "produce first-pass channel variants",
        "summarise approved material", "identify gaps from search and sales questions",
      ],
      humansLead: "Humans remain responsible for:",
      humans: ["technical truth", "commercial judgement", "evidence", "sensitive claims", "final authority", "exceptions"],
    },
    changes: [
      "a growing bank of reusable expert knowledge", "less repeated SME extraction",
      "clearer ownership of technical claims", "more consistent commercial content",
      "faster reuse across channels", "better support for sales",
      "a safer foundation for AI-assisted production",
    ],
    demonstrates: [
      "ECM.DEV is not simply adding an AI writer to an existing marketing process.",
      "The intervention changes the unit of work from **producing another asset** to **building reusable organisational knowledge**.",
    ],
    historical: [
      { slug: "industrial-robots-website",
        title: "Core Website Copywriting for a Robotics & Automation Engineering Company",
        relevance: "Turning deep engineering capability into language an industrial buyer could act on, working from the engineers' own knowledge." },
      { slug: "cms-migration-to-episerver-nordic-training-company",
        title: "Website Copy & Customer Case Studies for a Scandinavian EdTech Company",
        relevance: "Interview-based case studies: capturing what people said once and turning it into reusable evidence." },
      { slug: "corporate-website",
        title: "Website Content & Thought Leadership for an M2M/IoT Connectivity Provider",
        relevance: "Bilingual website copy and an eight-part thought-leadership series for a specialist technical provider." },
      { slug: "cms-migration",
        title: "Content Strategy & CMS Migration for a Professional Association",
        relevance: "Content strategy for a large association of engineers and technologists." },
    ],
    related: ["FP05", "FP06"],
    startingPoint: tool("expertise"),
    homepage: {
      theme: "Knowledge",
      blurb: "Capture specialist knowledge once. Validate it properly. Reuse it across marketing, sales and AI-assisted workflows without repeatedly dragging experts back into production.",
    },
  },

  /* ─── FP02 ─── */
  {
    ...base,
    id: "FP02",
    slug: "building-a-multilingual-content-system-that-scales",
    title: "Building a Multilingual Content System That Scales",
    clientType: "International industrial B2B organisation",
    cardSummary:
      "Instead of asking how to translate more cheaply, we redesigned what gets created centrally, what markets can adapt and how approved source knowledge moves across languages. AI then accelerates a controlled workflow rather than multiplying inconsistency.",
    metaTitle: "Multilingual Content Operations for Industrial B2B",
    metaDescription:
      "A representative engagement: redesigning localisation as a content operating model, with canonical source content, clear market decision rights and AI used inside a governed workflow.",
    services: ["localization", "services"],
    capabilities: ["Localisation", "Source-content design", "Governance", "Translation workflow", "AI-assisted localisation"],
    primarySolution: "multilingual-industrial-teams",
    overview: [
      "An international B2B organisation was creating similar content repeatedly across markets. Translation was treated as the localisation problem, but the larger cost sat upstream: inconsistent source content, duplicated assets, unclear market ownership and no reliable way to know what should be reused, adapted or created locally.",
      "We redesigned localisation as a content operating model rather than a translation queue.",
    ],
    who: {
      text: ["Export-oriented organisations publishing product, application, campaign and thought-leadership content across several countries or languages."],
      listLead: "Especially relevant when:",
      list: [
        "every market maintains its own versions",
        "headquarters cannot see what local teams have created",
        "translation starts from inconsistent source material",
        "product claims drift between languages",
        "updates require repeated manual coordination",
        "AI translation is being considered without a source-content model",
      ],
    },
    situation: [
      "Local teams wanted freedom because central content often did not reflect their market.",
      "Central marketing wanted consistency because duplicated production was expensive and difficult to govern.",
      "Both were right.",
      "The operating model gave them no useful middle ground between central control and local reinvention.",
    ],
    breaks: {
      steps: [
        "HQ creates asset", "Document sent to markets", "Each market decides whether to translate",
        "Local edits accumulate", "Terminology diverges", "Source changes",
        "Nobody knows which versions need updating", "Similar content gets recreated elsewhere",
      ],
    },
    approach: [
      { title: "Separate universal from local", body: "Define which content is:",
        bullets: ["globally canonical", "market-adaptable", "market-specific", "legally or technically controlled"] },
      { title: "Improve source content", body: "Design source material for reuse:",
        bullets: ["shorter modular units", "explicit terminology", "controlled claims", "fewer culturally embedded assumptions", "structured metadata", "ownership and review dates"] },
      { title: "Define localisation decision rights", body: "Make explicit:",
        bullets: ["what markets can change", "what requires technical approval", "when transcreation is justified", "when local creation is preferable", "who owns terminology"] },
      { title: "Build a reusable workflow",
        body: "Source approved, then a localisation package, machine or AI assistance where suitable, local adaptation, QA, publication, and feedback captured centrally." },
      { title: "Measure avoidable work",
        body: "Track repeated translation, duplicate creation, review cycles, outdated variants and content with low market value." },
    ],
    before: ["Create centrally", "Translate everywhere", "Edit locally", "Lose alignment"],
    after: [
      "Model content", "Classify reuse rules", "Create canonical source", "Localise selectively",
      "Validate", "Publish", "Capture local learning", "Improve source",
    ],
    ai: {
      lead: "AI can accelerate:",
      can: ["first-pass translation", "terminology checks", "variant comparison", "source simplification", "metadata generation", "identification of duplicated material"],
      text: ["But AI cannot decide the commercial importance of a market nuance or whether a regulated product claim is safe."],
    },
    changes: [
      "less unnecessary translation", "stronger terminology consistency",
      "clearer central and local responsibilities", "faster updates", "better reuse",
      "more visibility across markets", "AI localisation built on governed source material",
    ],
    demonstrates: [
      "Localisation performance is often determined **before translation begins**.",
      "ECM.DEV fixes the source-content and workflow problem first.",
    ],
    historical: [
      { slug: "content-operations-transformation", title: "Content Operations Transformation",
        relevance: "Multilingual publishing across 14 languages, with editorial governance, for a national tourism platform." },
      { slug: "content-localization-15-countrieslanguages",
        title: "Multilingual Content Operations for a National Seafood Trade Body",
        relevance: "Original English content moved into more than a dozen languages and published in the CMS, supported continuously since 2012." },
      { slug: "hospitality-tourism-multilingual-website", title: "Content Operations for a Nordic Hotel Group",
        relevance: "Ongoing multilingual production and SEO inside the client's CMS across Swedish, Norwegian and English." },
      { slug: "global-b2b-website-platform-migration",
        title: "Content Rebuild for a Paints & Coatings Manufacturer's Optimizely CMS Migration",
        relevance: "Rebuilding a global manufacturer's corporate site and full B2B product range for a new CMS." },
    ],
    related: ["FP03", "FP08"],
    startingPoint: tool("localisation-estimator"),
  },

  /* ─── FP03 ─── */
  {
    ...base,
    id: "FP03",
    slug: "making-product-knowledge-machine-readable",
    title: "Making Product Knowledge Machine-Readable",
    clientType: "Export-oriented industrial manufacturer",
    cardSummary:
      "Product truth was distributed across systems, documents and experts. We connected specifications, applications, buyer problems and evidence into a reusable knowledge model that could support web, sales, localisation and AI retrieval.",
    metaTitle: "Product Content and AI Readiness for Manufacturers",
    metaDescription:
      "A representative engagement: connecting product facts, applications, buyer problems and evidence into one knowledge model for web, sales, search, localisation and AI retrieval.",
    services: ["technology", "services"],
    capabilities: ["Taxonomy", "Product content", "Metadata", "CMS and PIM integration", "AI retrieval"],
    primarySolution: "export-manufacturers",
    overview: [
      "A manufacturer had deep product knowledge spread across product systems, technical documents, web pages, spreadsheets and experienced employees.",
      "Customers did not experience those systems. They had a problem, application or requirement and needed to find the right answer.",
      "We created a content and metadata model connecting product facts to applications, customer problems, markets and proof so the same knowledge could support websites, sales tools, search and AI retrieval.",
    ],
    who: {
      text: [],
      listLead: "Industrial manufacturers with:",
      list: [
        "complex product portfolios", "technical documentation", "multiple applications or industries",
        "distributor or direct sales channels", "international markets",
        "CMS, PIM, ERP or document repositories that describe the same products differently",
      ],
    },
    situation: [
      "The product database knew dimensions, codes and specifications.",
      "The website knew marketing descriptions.",
      "Engineers knew why one solution worked better in a particular environment.",
      "Sales knew the questions buyers actually asked.",
      "Those forms of knowledge were related but not connected.",
    ],
    breaks: {
      steps: [
        "Engineering data", "Product system", "Marketing manually interprets", "Web page created",
        "PDF created separately", "Local market adapts", "Sales creates its own presentation",
        "Customer asks application question", "Expert contacted",
      ],
    },
    approach: [
      { title: "Model the buyer's problem space", body: "Map relationships between:",
        bullets: ["product", "application", "industry", "problem", "environment", "specification", "benefit", "evidence", "certification", "geography", "service and support"] },
      { title: "Establish source authority",
        body: "Determine which system or role owns each fact. The CMS should not become an accidental product master." },
      { title: "Build controlled vocabulary and metadata",
        body: "Use a shared language connecting technical data to buyer intent." },
      { title: "Create reusable product knowledge", body: "Separate stable facts from:",
        bullets: ["market messaging", "channel presentation", "application guidance", "proof", "local variation"] },
      { title: "Expose the model to retrieval", body: "Make structured relationships useful to:",
        bullets: ["site search", "filtering", "product finding", "internal sales tools", "retrieval-augmented AI", "content recommendations"] },
    ],
    before: ["Product data + PDFs + web copy + expert memory = separate answers"],
    after: [
      "Authoritative facts + application knowledge + controlled relationships",
      "Reusable product knowledge layer",
      "Web, sales, search, AI and localisation",
    ],
    ai: {
      text: [
        "AI can interpret questions, retrieve candidate answers, create summaries and help generate channel variants.",
        "It should retrieve from authoritative knowledge rather than improvise product truth.",
      ],
    },
    changes: [
      "easier product discovery", "less contradictory content", "clearer source authority",
      "better reuse", "stronger sales enablement", "improved AI retrieval", "easier localisation",
      "less dependence on individual experts for routine questions",
    ],
    demonstrates: [
      "AI readiness for industrial companies starts with **product knowledge architecture**, not prompt engineering.",
    ],
    historical: [
      { slug: "digital-tools-for-product-selection-in-pim",
        title: "Product-Finding Tools for a Global Paints & Coatings Manufacturer's B2B Website",
        relevance: "A product-attribute model drawing structured data from several systems into B2B product finding." },
      { slug: "redesigning-content-taxonomy-for-a-regional-bank",
        title: "Redesigning Content Taxonomy for a Global Paints & Chemicals Manufacturer",
        relevance: "A controlled vocabulary, metadata schema and governance model across product, solution and market content." },
      { slug: "digital-service-platform-building-materials-distributor",
        title: "Digital Service Platform for a Building Materials Distributor",
        relevance: "Estimating, tendering and project documentation for professional buyers, integrated across CMS, PIM and ERP." },
      { slug: "technical-search-architecture-international-education-marketplace",
        title: "Technical Search Architecture for an International Education Marketplace",
        relevance: "A search architecture audit quantifying platform-level barriers to discovery across two global sites." },
    ],
    related: ["FP09", "FP07"],
    startingPoint: snapshotStart,
  },

  /* ─── FP04 ─── */
  {
    ...base,
    id: "FP04",
    slug: "connecting-content-operations-to-pipeline",
    title: "Connecting Content Operations to Pipeline",
    clientType: "B2B SaaS or industrial technology company",
    cardSummary:
      "Marketing activity stopped at the lead while sales learning stayed in the CRM and in people's heads. We connected content, qualification, CRM context and sales feedback into one measurable learning loop.",
    metaTitle: "Connecting Content Operations to Sales Pipeline",
    metaDescription:
      "A representative engagement: connecting content planning, conversion paths, qualification, CRM hand-off and sales feedback into one operating loop for a B2B technology company.",
    services: ["services", "technology"],
    capabilities: ["Demand generation", "CRM workflow", "Lead qualification", "Measurement", "Content operations"],
    primarySolution: "saas-industrial-tech",
    overview: [
      "A B2B company was producing content and running campaigns but could not reliably explain which activity created useful commercial conversations.",
      "We connected content planning, landing journeys, qualification, CRM hand-off and sales feedback into one operating loop.",
    ],
    who: {
      text: [],
      listLead: "B2B technology companies with:",
      list: [
        "regular content production", "paid and organic acquisition", "a CRM",
        "sales development or direct sales", "weak visibility between engagement and opportunity",
        "marketing and sales using different definitions of a good lead",
      ],
    },
    situation: [
      "Marketing measured traffic, downloads and campaign engagement.",
      "Sales measured conversations and opportunities.",
      "Between them sat an attribution gap and, more importantly, an operating gap.",
      "Marketing could not see which questions signalled genuine buying intent. Sales repeatedly encountered objections and information needs that never made it back into content planning.",
    ],
    breaks: {
      steps: [
        "Campaign idea", "Content", "Traffic", "Form fill", "CRM", "Sales follow-up",
        "Outcome disappears from marketing view", "Next campaign planned independently",
      ],
    },
    approach: [
      { title: "Start with buying questions", body: "Map content to:",
        bullets: ["problem recognition", "evaluation", "risk", "implementation", "proof", "commercial readiness"] },
      { title: "Design conversion paths", body: "Give useful content a logical next action:",
        bullets: ["assessment", "calculator", "diagnostic", "comparison", "workshop", "conversation"] },
      { title: "Improve qualification",
        body: "Capture enough context to distinguish curiosity from a problem worth discussing." },
      { title: "Connect the CRM hand-off",
        body: "Make source, topic, content journey, expressed problem and qualification signals visible to sales." },
      { title: "Return sales learning", body: "Capture these and feed them into the content backlog:",
        bullets: ["objections", "recurring questions", "lost reasons", "new use cases", "proof requirements"] },
    ],
    before: ["Content", "Traffic", "Lead", "Sales"],
    after: [
      "Buyer problem", "Useful content", "Diagnostic or action", "Qualification signal",
      "CRM context", "Sales conversation", "Objection or outcome",
      "Knowledge and content backlog", "Improved journey",
    ],
    ai: {
      lead: "AI can:",
      can: [
        "classify inbound questions", "summarise engagement context", "suggest relevant existing content",
        "identify recurring objections", "cluster CRM feedback", "propose backlog priorities",
      ],
      humansLead: "Humans decide:",
      humans: ["account value", "sales approach", "commercial qualification", "positioning", "what deserves investment"],
    },
    changes: [
      "clearer relationship between content and commercial activity",
      "stronger marketing-to-sales hand-off", "better-informed sales conversations",
      "content planning based on real buyer friction", "fewer vanity metrics",
      "a repeatable learning loop",
    ],
    demonstrates: [
      "Content operations should not end at **Publish**.",
      "For B2B organisations, the operating model should continue through buyer response, CRM, sales learning and the next content decision.",
    ],
    historical: [
      { slug: "digital-demand-generation",
        title: "Digital Demand Generation for a Global Technology Manufacturer",
        relevance: "Search, content and conversion journeys connected into one measurable model, with lead scoring and attribution across marketing automation, analytics and CRM." },
      { slug: "inbound-marketing-strategy-energy-consultancy",
        title: "Demand Generation for a B2B Software Provider",
        relevance: "An inbound model connecting expert content and campaign paths to qualified sales leads." },
      { slug: "digital-sales-journeys",
        title: "Sales Funnel & Digital Strategy for a Norwegian Energy Retailer",
        relevance: "Sales-funnel design for a business moving from a service portal to a sales-driven site." },
      { slug: "advertising-sales-platform", title: "Advertising Sales Platform",
        relevance: "A CRM-connected sales platform linking audience data, formats, pricing and sales contacts." },
    ],
    related: ["FP05", "FP08"],
    startingPoint: tool("expertise"),
    homepage: {
      theme: "Pipeline",
      blurb: "Connect content, qualification, CRM context and sales feedback so marketing learns from real commercial conversations rather than stopping at traffic and leads.",
    },
  },

  /* ─── FP05 ─── */
  {
    ...base,
    id: "FP05",
    slug: "turning-customer-questions-into-a-gtm-system",
    title: "Turning Customer Questions Into a GTM System",
    clientType: "Specialist professional-services firm",
    cardSummary:
      "Instead of inventing another editorial calendar, we used the questions prospects were already asking to build a structured knowledge backlog connecting expert answers, content, services and sales conversations.",
    metaTitle: "Knowledge-Driven GTM for Professional Services Firms",
    metaDescription:
      "A representative engagement: turning recurring client questions, objections and decision points into a structured knowledge system for content, sales enablement and service positioning.",
    services: ["services"],
    capabilities: ["Voice of customer", "Knowledge operations", "Content strategy", "Sales enablement"],
    primarySolution: "professional-services",
    overview: [
      "A specialist firm had a surprisingly valuable dataset that nobody treated as data: the questions prospects and clients asked its consultants every week.",
      "We turned recurring questions, objections and decision points into a structured GTM knowledge system feeding content, sales enablement and service positioning.",
    ],
    who: {
      text: [],
      listLead: "Consultancies, advisers, agencies and other expert businesses where:",
      list: [
        "buyers need education before they buy", "senior people carry much of the firm's credibility",
        "sales conversations are consultative", "expertise is difficult to productise",
        "marketing struggles to choose useful topics",
      ],
    },
    situation: [
      "The content calendar started with \"What should we publish?\"",
      "The better starting point was \"What are customers trying to understand?\"",
      "Consultants already knew the answer, but that knowledge was scattered across calls, inboxes, proposals and individual experience.",
    ],
    breaks: {
      steps: [
        "Prospect asks question", "Consultant answers", "Answer disappears",
        "Another prospect asks variation", "Another consultant answers",
        "Marketing separately brainstorms topics",
      ],
    },
    approach: [
      { title: "Capture question signals", body: "Collect recurring questions from:",
        bullets: ["discovery calls", "proposals", "workshops", "email", "search", "support and customer conversations", "lost opportunities"] },
      { title: "Build a question taxonomy", body: "Classify by:",
        bullets: ["buyer role", "stage", "problem", "risk", "objection", "service", "urgency", "commercial signal"] },
      { title: "Connect questions to trusted answers", body: "Link each important question to:",
        bullets: ["expert answer", "evidence", "example", "relevant service", "next question", "call to action"] },
      { title: "Publish selectively", body: "Not every answer needs an article. Some belong in:",
        bullets: ["service pages", "FAQs", "sales decks", "diagnostics", "proposals", "email", "internal playbooks"] },
      { title: "Use demand to prioritise",
        body: "Frequency, commercial importance and the current content gap together become the content backlog." },
    ],
    before: ["Content calendar", "Brainstorm topics", "Produce assets"],
    after: [
      "Customer question", "Classify", "Assess commercial value", "Capture trusted answer",
      "Deploy at the right touchpoint", "Observe response", "Refine",
    ],
    ai: {
      text: [
        "AI can cluster questions, detect repeated themes, retrieve approved answers and draft channel variants.",
        "The firm's experts remain the authority.",
      ],
    },
    changes: [
      "content based on real demand", "expert knowledge reused", "sales answers become more consistent",
      "stronger service-page content", "clearer buyer journeys",
      "a GTM system that learns from conversations",
    ],
    demonstrates: [
      "The most useful content strategy may already be hiding inside the firm's customer conversations.",
    ],
    historical: [
      { slug: "growth-strategy-and-new-website",
        title: "Website Relaunch & Content Strategy for a Project Management Consultancy",
        relevance: "A consultancy's content rebuilt around a defined content system and one tone of voice." },
      { slug: "cms-migration-to-episerver-nordic-training-company",
        title: "Website Copy & Customer Case Studies for a Scandinavian EdTech Company",
        relevance: "Interview-led case studies that turned customer conversations into evidence for new markets." },
      { slug: "data-operations-strategy",
        title: "Data-Driven Content & Membership Strategy for a Professional Association",
        relevance: "A data-driven content and channel strategy for a professional association." },
      { slug: "esg-sustainability-content-strategy",
        title: "Unified Positioning for a Sustainability Reporting Firm",
        relevance: "One service positioning across an advisory, an academy and a data platform." },
    ],
    related: ["FP01", "FP04"],
    startingPoint: tool("maturity"),
  },

  /* ─── FP06 ─── */
  {
    ...base,
    id: "FP06",
    slug: "building-an-ai-ready-content-operating-model",
    title: "Building an AI-Ready Content Operating Model",
    clientType: "Mid-market or PE-backed B2B organisation",
    cardSummary:
      "The organisation wanted more AI. The real blockers were unclear ownership, inconsistent sources and undocumented workflows. We made the process explicit first, then identified where AI could safely remove work or improve decisions.",
    metaTitle: "AI Content Workflow Governance and Operating Model",
    metaDescription:
      "A representative engagement: making ownership, sources, decision rights and workflows explicit so AI can take part in governed marketing processes.",
    services: ["services", "technology"],
    capabilities: ["Content governance", "Process architecture", "AI readiness", "Taxonomy", "Measurement"],
    primarySolution: "pe-backed-companies",
    overview: [
      "The organisation wanted to scale its use of generative AI across marketing.",
      "The first assessment showed that AI was not the main constraint.",
      "Ownership was unclear. Content existed in multiple versions. Approval rules depended on institutional memory. Metadata was inconsistent. Performance data rarely changed what was produced next.",
      "We redesigned the operating model so AI could participate in explicit, governed processes.",
    ],
    who: {
      text: [],
      listLead: "Leadership teams asking:",
      list: [
        "Where can we safely use AI in marketing?", "Why is AI output inconsistent?",
        "Which content can an assistant trust?", "How do we avoid accelerating low-value production?",
        "What should remain a human decision?", "How do we govern this without creating bureaucracy?",
      ],
    },
    situation: [
      "Different employees were already using AI.",
      "But there was no shared model defining approved source material, sensitive content, review requirements, decision authority, acceptable automation, escalation or lifecycle ownership.",
      "Adding more AI risked making an already inconsistent operation faster rather than better.",
    ],
    breaks: {
      steps: [
        "Request", "Informal brief", "Human or AI creates draft", "Uncertain sources",
        "Reviewer applies personal judgement", "Revisions", "Publish",
        "Limited lifecycle ownership", "Little systematic learning",
      ],
    },
    approach: [
      { title: "Map the real process",
        body: "Document stages, actors, inputs, outputs, decisions, exceptions and hand-offs." },
      { title: "Define content authority", body: "Identify:",
        bullets: ["canonical sources", "owners", "review requirements", "expiry and review dates", "evidence standards"] },
      { title: "Classify work by judgement", body: "Separate:",
        bullets: ["deterministic, repetitive tasks", "assistive tasks", "judgement-heavy decisions", "sensitive or high-risk decisions"] },
      { title: "Introduce AI at the right points",
        body: "Automate or assist where inputs and expected outputs are sufficiently explicit." },
      { title: "Build measurement into the loop",
        body: "Make performance, search demand, sales feedback and content health inputs to future decisions." },
    ],
    before: ["People + tools + undocumented judgement"],
    after: [
      "Explicit process", "Governed knowledge", "Defined decision rights",
      "Human and AI task allocation", "QA and escalation", "Measurement", "Continuous improvement",
    ],
    ai: {
      lead: "Potential roles include:",
      can: [
        "classification", "summarisation", "metadata", "duplication detection", "source retrieval",
        "first drafts", "transformation", "localisation assistance", "QA checks", "performance synthesis",
      ],
      text: ["AI should not silently assume authority it has not been given."],
    },
    changes: [
      "clearer AI use cases", "fewer uncontrolled experiments", "explicit human accountability",
      "better source reliability", "easier automation", "more consistent quality",
      "a roadmap based on process value rather than tool novelty",
    ],
    demonstrates: [
      "AI readiness is an **operating-model problem** as much as a technology problem.",
    ],
    historical: [
      { slug: "ecm-governance-financial-services",
        title: "Content Strategy & Editorial Governance for a Nordic Pension & Insurance Group",
        relevance: "An editorial governance model to run a group's digital content as one system." },
      { slug: "redesigning-content-taxonomy-for-a-regional-bank",
        title: "Redesigning Content Taxonomy for a Global Paints & Chemicals Manufacturer",
        relevance: "Taxonomy, metadata and a governance model for sustained classification quality." },
      { slug: "content-operations-transformation", title: "Content Operations Transformation",
        relevance: "Editorial governance, analytics and a major platform migration within one content operation." },
      { slug: "cms-migration",
        title: "Content Strategy & CMS Migration for a Professional Association",
        relevance: "Content strategy alongside a CMS migration for a large membership organisation." },
    ],
    related: ["FP08", "FP09"],
    startingPoint: tool("maturity"),
    homepage: {
      theme: "AI readiness",
      blurb: "Make ownership, sources, workflows and decisions explicit first. Then put AI where it can genuinely remove work or improve decisions.",
    },
  },

  /* ─── FP07 ─── */
  {
    ...base,
    id: "FP07",
    slug: "making-complex-maritime-expertise-easier-to-find-and-sell",
    title: "Making Complex Maritime Expertise Easier to Find and Sell",
    clientType: "Maritime technology or marine-services company",
    cardSummary:
      "The company's portfolio made sense internally but buyers arrived with vessel, application and operational problems. We connected technical capabilities to those customer contexts so the same knowledge could support discovery, sales and AI retrieval.",
    metaTitle: "Maritime Content Strategy and Technical Knowledge",
    metaDescription:
      "A representative engagement: reorganising a maritime technology portfolio around vessel types, operational problems and applications while keeping the technical detail buyers need.",
    services: ["technology", "services"],
    capabilities: ["Information architecture", "Technical content", "Product and service modelling", "Sales enablement"],
    primarySolution: "maritime-suppliers",
    overview: [
      "A maritime technology business had deep technical capability but presented it through internal product categories and organisational language.",
      "Buyers approached the company from a different direction: vessel type, operational problem, regulation, application, lifecycle stage or commercial risk.",
      "We reorganised the content model around those buyer contexts while preserving the technical detail experts and procurement teams needed.",
    ],
    who: {
      text: ["Maritime technology, marine equipment and specialist shipping-service firms selling complex solutions internationally."],
    },
    situation: [
      "The website reflected how the supplier was organised.",
      "Sales conversations reflected how customers operated.",
      "The gap made it difficult for prospects to understand which capabilities belonged together or why a technical feature mattered operationally.",
    ],
    breaks: {
      steps: [
        "Business unit", "Product category", "Technical page", "PDF", "Contact sales",
        "Salesperson reconstructs customer-specific story",
      ],
    },
    approach: [
      { title: "Map customer contexts", body: "Structure discovery around:",
        bullets: ["vessel type", "operational challenge", "lifecycle stage", "application", "geography", "regulation", "technical requirement"] },
      { title: "Connect products to outcomes",
        body: "Preserve specifications while linking them to the job the customer is trying to perform." },
      { title: "Structure proof", body: "Connect claims to:",
        bullets: ["installations", "use cases", "technical evidence", "certifications", "relevant expertise"] },
      { title: "Create reusable solution views",
        body: "Use the same underlying knowledge to create different paths for different buyer contexts." },
      { title: "Connect sales feedback",
        body: "Capture questions and combinations that repeatedly arise in commercial conversations." },
    ],
    before: ["Organisation", "Division", "Product", "Specification"],
    after: [
      "Customer context", "Operational problem", "Applicable solution", "Product or capability",
      "Evidence", "Commercial next step",
    ],
    ai: {
      text: [
        "AI can improve retrieval across a complex technical estate and help assemble relevant approved material for a particular vessel, application or problem.",
        "The knowledge relationships must exist first.",
      ],
    },
    changes: [
      "easier buyer navigation", "stronger cross-sell between capabilities",
      "less dependence on salespeople to explain the portfolio from scratch",
      "better reuse of technical evidence",
      "stronger foundations for international search and AI discovery",
    ],
    demonstrates: [
      "Complexity does not need to be removed.",
      "It needs to be **modelled around the customer's context**.",
    ],
    historical: [
      { slug: "global-digital-platform-maritime-services-group", title: "Global Customer Services Portal",
        relevance: "Replaced a site structured around business divisions with one built around customer journeys and solutions, for a global maritime services group." },
      { slug: "sharepoint-employee-portal",
        title: "Intranet Migration & Information Architecture for a Maritime Services Group",
        relevance: "Content migration and information architecture for a maritime group's move to Office 365." },
      { slug: "inbound-marketing-strategy-energy-consultancy",
        title: "Demand Generation for a B2B Software Provider",
        relevance: "Expert content and campaign paths for a software provider serving maritime and energy customers." },
    ],
    related: ["FP03", "FP09"],
    startingPoint: snapshotStart,
  },

  /* ─── FP08 ─── */
  {
    ...base,
    id: "FP08",
    slug: "redesigning-the-content-supply-chain-around-human-and-ai-work",
    title: "Redesigning the Content Supply Chain Around Human + AI Work",
    clientType: "Resource-constrained B2B marketing team",
    cardSummary:
      "People were already using AI, but every workflow was different. We defined the inputs, outputs, owners, AI tasks, human decisions and quality gates needed to turn individual experimentation into a repeatable operation.",
    metaTitle: "AI Content Workflow Design for B2B Marketing Teams",
    metaDescription:
      "A representative engagement: turning individual AI experiments into a shared content supply chain with explicit inputs, outputs, owners, human decisions and quality gates.",
    services: ["services"],
    capabilities: ["Workflow design", "AI operations", "Governance", "Production", "QA"],
    primarySolution: "saas-industrial-tech",
    overview: [
      "A marketing team was experimenting with AI across research, writing, localisation and repurposing, but each person had created a different personal workflow.",
      "We redesigned the content supply chain around explicit inputs, outputs, decision rights and quality gates so AI could remove repetitive work without creating an uncontrolled production machine.",
    ],
    who: {
      text: ["Marketing teams under pressure to produce more with limited headcount and already using multiple AI tools informally."],
    },
    situation: [
      "The apparent benefit of AI was speed.",
      "The hidden cost was inconsistency.",
      "Prompts, source material, review standards and final storage varied by person. Nobody could easily explain why one workflow produced good output and another did not.",
    ],
    breaks: {
      steps: [
        "Idea", "Individual prompt", "Generated draft", "Manual correction", "Stakeholder review",
        "More prompting", "Publish", "Process knowledge stays with operator",
      ],
    },
    approach: [
      { title: "Map the supply chain",
        body: "Plan, brief, source, create, review, approve, publish, distribute, measure, maintain." },
      { title: "Define stage contracts", body: "For every stage specify:",
        bullets: ["required input", "expected output", "owner", "quality criteria", "tool or agent role", "exception route"] },
      { title: "Allocate work deliberately",
        body: "Use automation for repeatable transformations. Use AI assistance where interpretation is useful but review remains important. Keep judgement-heavy decisions human." },
      { title: "Build quality gates",
        body: "Check facts, brand, legal and compliance, links, metadata, accessibility and source authority as appropriate." },
      { title: "Capture workflow performance",
        body: "Measure bottlenecks and rework, not just production volume." },
    ],
    before: ["Individual AI usage", "Faster individual tasks"],
    after: [
      "Shared process", "Governed sources", "Repeatable AI assistance", "Explicit human decisions",
      "QA", "Measurable throughput and quality",
    ],
    ai: {
      text: ["This scenario is explicitly about allocating AI roles. The principle is simple:"],
      quote: "Automate the predictable. Assist the interpretive. Keep accountable judgement human.",
    },
    changes: [
      "less workflow variation", "easier onboarding", "clearer quality control",
      "more reusable prompts and agents", "lower dependence on individual AI skill",
      "better visibility of where time is actually lost",
    ],
    demonstrates: [
      "The valuable asset is not the prompt.",
      "It is the **operating process around the prompt**.",
    ],
    historical: [
      { slug: "content-operations-transformation", title: "Content Operations Transformation",
        relevance: "A scalable content and measurement operation run over several years with a multidisciplinary team." },
      { slug: "sharepoint-migration-and-employee-communications",
        title: "Editorial Strategy & Global Intranet Content Migration for an Oil & Gas Company",
        relevance: "Editorial workflows, content lifecycle policy and a managed team of freelance contributors." },
      { slug: "hospitality-tourism-multilingual-website", title: "Content Operations for a Nordic Hotel Group",
        relevance: "Ongoing production in three languages, working inside the client's CMS alongside in-house staff." },
      { slug: "content-localization-15-countrieslanguages",
        title: "Multilingual Content Operations for a National Seafood Trade Body",
        relevance: "An outsourced content desk: writing, translating, publishing and turning round time-critical material." },
    ],
    related: ["FP06", "FP02"],
    startingPoint: tool("expertise"),
  },

  /* ─── FP09 ─── */
  {
    ...base,
    id: "FP09",
    slug: "creating-one-knowledge-layer-for-marketing-sales-and-ai",
    title: "Creating One Knowledge Layer for Marketing, Sales and AI",
    clientType: "Complex B2B organisation",
    cardSummary:
      "The organisation had plenty of systems but no shared view of which information was authoritative. We created the model connecting content, product knowledge, customer questions and proof without requiring everything to move into one new platform.",
    metaTitle: "Knowledge Architecture for Marketing, Sales and AI",
    metaDescription:
      "A representative engagement: a shared knowledge model and authority layer across CMS, CRM, documents and product systems, so humans and AI retrieve trusted answers without a platform replacement.",
    services: ["technology"],
    capabilities: ["Knowledge architecture", "Taxonomy", "Governance", "Retrieval", "CMS, CRM and document integration"],
    overview: [
      "Marketing, sales and subject-matter experts were all working with different fragments of the same organisational knowledge.",
      "Rather than attempting an immediate platform replacement, we defined a shared knowledge model and authority layer showing what information existed, where truth lived and how it should be reused.",
    ],
    who: {
      text: [],
      listLead: "Organisations where important commercial knowledge is distributed across:",
      list: [
        "CMS", "CRM", "SharePoint or document storage", "product systems", "proposal libraries",
        "presentations", "support material", "individual employees",
      ],
    },
    situation: [
      "The organisation did not necessarily need \"one system\".",
      "It needed one coherent way of understanding its knowledge.",
      "Without that, search returned too much, AI retrieved conflicting material, sales recreated assets and marketing could not confidently reuse technical information.",
    ],
    breaks: {
      text: [
        "CMS truth ≠ CRM truth ≠ document truth ≠ expert truth.",
        "Every new output requires manual reconciliation.",
      ],
    },
    approach: [
      { title: "Inventory knowledge domains",
        body: "Identify the important entities and information types." },
      { title: "Assign authority", body: "For each field or knowledge class, define:",
        bullets: ["source system", "owner", "confidence", "review cycle", "permitted reuse"] },
      { title: "Define shared relationships", body: "Connect:",
        bullets: ["customers and problems", "products and services", "industries", "evidence", "expertise", "questions", "assets", "opportunities"] },
      { title: "Keep systems in their proper roles",
        body: "Do not force every piece of information into a new monolith. Create interoperability through IDs, metadata, APIs, search and retrieval patterns where appropriate." },
      { title: "Design retrieval around use cases",
        body: "Different users need different views of the same knowledge." },
    ],
    before: ["Many repositories", "Human search", "Manual reconciliation", "New document"],
    after: [
      "Distributed systems", "Explicit authority + shared model", "Governed retrieval",
      "Role and use-case view", "Reusable answer or output",
    ],
    ai: {
      text: ["AI becomes the retrieval and transformation layer over governed knowledge rather than an alternative source of truth."],
    },
    changes: [
      "better findability", "less duplication", "clearer authority", "stronger cross-team reuse",
      "safer AI retrieval", "reduced pressure for unnecessary platform consolidation",
    ],
    demonstrates: [
      "A shared knowledge layer is a **logical architecture**, not necessarily another giant repository.",
    ],
    historical: [
      { slug: "sharepoint-migration-and-employee-portal-design-global-paints-and-coatings-manufacturer",
        title: "Content Strategy & Information Architecture for a Global Paints & Coatings Manufacturer's New Intranet",
        relevance: "Information architecture and editorial operations replacing a fragmented intranet across a complex matrix organisation." },
      { slug: "intranet-upgrade-for-national-parliament", title: "Intranet Redesign for a National Parliament",
        relevance: "Search, navigation and personalisation redesign for a large internal knowledge estate." },
      { slug: "digital-tools-for-product-selection-in-pim",
        title: "Product-Finding Tools for a Global Paints & Coatings Manufacturer's B2B Website",
        relevance: "Structured product data from several systems brought into one model for finding and reuse." },
      { slug: "sharepoint-employee-portal",
        title: "Intranet Migration & Information Architecture for a Maritime Services Group",
        relevance: "Content migration and information architecture for a move to a new Office 365 ecosystem." },
    ],
    related: ["FP03", "FP06"],
    startingPoint: snapshotStart,
  },

  /* ─── FP10 ─── */
  {
    ...base,
    id: "FP10",
    slug: "building-a-repeatable-gtm-engine-after-acquisition",
    title: "Building a Repeatable GTM Engine After Acquisition",
    clientType: "PE-backed B2B group or buy-and-build platform",
    cardSummary:
      "Each acquired company brought expertise and customers, but also another website, vocabulary and sales process. We created a repeatable way to map propositions, connect knowledge and establish shared GTM workflows without forcing every business into an immediate replatform or rebrand.",
    metaTitle: "Post-Acquisition Marketing and GTM Integration",
    metaDescription:
      "A representative engagement: a repeatable model for mapping propositions, connecting knowledge and establishing shared GTM workflows across acquired businesses, without an immediate rebrand.",
    services: ["services"],
    capabilities: ["GTM integration", "Knowledge architecture", "Proposition", "CRM and content workflow", "Measurement"],
    primarySolution: "pe-backed-companies",
    overview: [
      "A growing B2B group had acquired several specialist businesses.",
      "Each acquisition brought valuable expertise, customers and services, but also its own terminology, website, propositions, CRM habits and sales material.",
      "We designed a repeatable content and knowledge integration model that could strengthen the group proposition without erasing the specialist value of each business.",
    ],
    who: {
      text: [],
      listLead: "PE-backed businesses pursuing:",
      list: ["buy-and-build", "market consolidation", "international expansion", "cross-sell", "centralised marketing", "shared technology"],
    },
    situation: [
      "The financial acquisition had completed.",
      "The knowledge acquisition had not.",
      "The group could see cross-sell potential, but customers, sales teams and websites still experienced the businesses separately.",
      "A full rebrand or platform consolidation would take too long and might destroy useful local equity.",
    ],
    breaks: {
      steps: [
        "Acquire company", "Inherit website, CRM, decks and terminology",
        "Central marketing requests updates", "Local team continues existing practices",
        "Cross-sell relies on individual relationships", "Next acquisition adds another variation",
      ],
    },
    approach: [
      { title: "Run a commercial knowledge discovery", body: "Map:",
        bullets: ["propositions", "services", "customer problems", "sectors", "proof", "terminology", "buyer roles", "content assets", "sales questions"] },
      { title: "Build a group-level capability model", body: "Identify:",
        bullets: ["genuine overlaps", "complementary services", "cross-sell paths", "conflicting terminology", "missing proof"] },
      { title: "Establish minimum operating standards", body: "Define a lightweight common model for:",
        bullets: ["service descriptions", "proof", "metadata", "CRM hand-off", "content ownership", "measurement"] },
      { title: "Preserve useful autonomy",
        body: "Standardise the interfaces, not every local behaviour." },
      { title: "Create an acquisition playbook",
        body: "Repeat the discovery and integration process for each future acquisition." },
    ],
    before: ["Acquisition", "Separate GTM systems", "Manual coordination", "Weak cross-sell"],
    after: [
      "Acquisition", "Knowledge discovery", "Proposition mapping", "Shared commercial model",
      "Connected content and CRM workflows", "Cross-sell paths", "Measurement",
      "Repeatable integration playbook",
    ],
    ai: {
      lead: "AI can accelerate:",
      can: [
        "content inventory", "terminology comparison", "proposition clustering", "duplicate detection",
        "classification", "knowledge extraction", "cross-company retrieval",
      ],
      text: ["Strategic decisions about positioning, overlap and brand remain human."],
    },
    changes: [
      "faster commercial understanding after acquisition", "clearer cross-sell opportunities",
      "more consistent group proposition", "less duplicated content", "reusable integration process",
      "better foundations for shared AI and automation",
    ],
    demonstrates: [
      "Post-acquisition integration is not only a systems problem.",
      "It is also a **knowledge and GTM operating-model problem**.",
    ],
    historical: [
      { slug: "marketing-technology-due-diligence",
        title: "Marketing Technology Due Diligence & Investment Strategy for a Private Equity Firm",
        relevance: "Independent marketing technology due diligence for a growth equity investor evaluating an acquisition." },
      { slug: "website-content-production-norvestor-equity",
        title: "Website Content Production for a Leading Nordic Private Equity Firm",
        relevance: "A multi-writer rewrite of a private equity firm's website, including its portfolio company profiles." },
      { slug: "multitenant-retail-platform-strategy",
        title: "Competitive SEO Strategy Across a Multi-Brand Sports Retail Group",
        relevance: "Content analysis across a group's portfolio of brands, informing one shared strategy." },
      { slug: "esg-sustainability-content-strategy",
        title: "Unified Positioning for a Sustainability Reporting Firm",
        relevance: "One positioning across several offers, including a recently combined consultancy." },
    ],
    related: ["FP06", "FP09"],
    startingPoint: tool("maturity"),
  },
];

/* ─── Placement ─── */

/** Section 6 of the pack: which scenarios each ICP Solution page shows. */
export const SOLUTION_PROOF: Record<SolutionSlug, { primary: EngagementId; secondary: EngagementId }> = {
  "export-manufacturers": { primary: "FP03", secondary: "FP02" },
  "engineering-consultancies": { primary: "FP01", secondary: "FP05" },
  "saas-industrial-tech": { primary: "FP04", secondary: "FP08" },
  "maritime-suppliers": { primary: "FP07", secondary: "FP03" },
  "pe-backed-companies": { primary: "FP10", secondary: "FP06" },
  "professional-services": { primary: "FP05", secondary: "FP01" },
  "multilingual-industrial-teams": { primary: "FP02", secondary: "FP08" },
};

/** Homepage, in this order. */
export const HOMEPAGE_ENGAGEMENTS: EngagementId[] = ["FP01", "FP04", "FP06"];

export const ENGAGEMENTS_PATH = "/representative-engagements";

export function engagementHref(e: Pick<RepresentativeEngagement, "slug">): string {
  return `${ENGAGEMENTS_PATH}/${e.slug}`;
}

export function getEngagement(idOrSlug: string): RepresentativeEngagement | undefined {
  return REPRESENTATIVE_ENGAGEMENTS.find((e) => e.id === idOrSlug || e.slug === idOrSlug);
}

export function requireEngagement(id: EngagementId): RepresentativeEngagement {
  const e = getEngagement(id);
  if (!e) throw new Error(`Unknown representative engagement ${id}`);
  return e;
}

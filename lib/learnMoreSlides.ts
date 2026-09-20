// Slide content for the homepage "Learn More" carousel.
//
// Rewritten 2026-09-20 to replace the original ten decks, eight of which
// were generic "AI-driven marketing" thought-leadership content (sales
// enablement, personalization, gamification, recommendation engines) with
// unsourced or unverifiable statistics and invented-sounding case examples
// ("a Global SaaS Vendor," "a Healthcare Company"). That content matched the
// retired "pipeline infrastructure for B2B marketing teams" narrative, not
// the three-pillar content infrastructure model the site now runs on, and
// sat awkwardly next to case studies that name real clients. See
// docs/SERVICE-CLARITY-AUDIT-2026-09-20.md.
//
// This set goes deeper into Content Operations specifically (governance,
// lifecycle, workflow, measurement), keeps the two decks that were already
// genuinely on-topic (content efficiency, regulated-content governance) but
// strips their vendor name-drops and unsourced stats, and adds explicit
// bridges to Content Technology and AI readiness. Claims here are either
// qualitative or tied to a named, real source (the one verified market
// stat available is the CMI/Storyblok survey cited in
// docs/CONTENT-PILLARS-POSITIONING.md); nothing is presented as a stat
// without a name attached to it.
//
// IMPORTANT: if the Sanity `homePage` document has its own `learnMoreItems`
// array (overriding the fallback in app/page.tsx), its titles need updating
// to match the titles below — LearnMoreSection matches by exact title
// (case-insensitive), so a stale Sanity title won't open a modal.

export interface SlideContent {
  heading: string;
  points: { text: string; bold: boolean }[];
}

export interface TopicSlides {
  title: string;
  subtitle: string;
  slug: string;
  slides: SlideContent[];
}

export const topicSlides: TopicSlides[] = [
  {
    title: "Content Governance: Who Actually Owns What",
    subtitle: "Decision rights, not a style guide",
    slug: "content-governance-who-actually-owns-what",
    slides: [
      {
        heading: "It Looks Like a Tooling Problem. It Isn't.",
        points: [
          { text: "Content sprawls quietly for years before anyone notices, and when someone finally does, the instinct is to blame the CMS.", bold: false },
          { text: "Almost every time, the CMS was fine. Nobody owned the decisions about what went into it.", bold: true },
        ],
      },
      {
        heading: "What Governance Actually Means",
        points: [
          { text: "Not a brand style guide, and not a rulebook nobody reads.", bold: false },
          { text: "Governance is the answer to three questions, for every piece of content: who owns it, who approves changes to it, and what happens when it's wrong.", bold: true },
        ],
      },
      {
        heading: "Why It Breaks Down at Scale",
        points: [
          { text: "Reorgs move ownership without anyone updating who's actually accountable.", bold: false },
          { text: "People leave, and the content they owned quietly becomes nobody's.", bold: false },
          { text: "A new tool gets adopted for one team, and the old governance model doesn't cover it.", bold: false },
          { text: "None of this shows up as a single event. It shows up as drift.", bold: true },
        ],
      },
      {
        heading: "What a Governance Framework Actually Contains",
        points: [
          { text: "Roles: who approves, who authors, who's accountable for a page once it's live.", bold: true },
          { text: "Approval paths: which changes need sign-off, and from whom.", bold: true },
          { text: "Quality standards: what \"good\" means, written down, not assumed.", bold: true },
          { text: "Lifecycle rules: review cadence, expiry, retirement.", bold: true },
          { text: "Built to actually get used, not filed away.", bold: false },
        ],
      },
      {
        heading: "How We Diagnose It",
        points: [
          { text: "A scored look at ownership, workflow, and decision rights across your content estate.", bold: true },
          { text: "Where the bottlenecks actually are, not where you assume they are.", bold: false },
        ],
      },
      {
        heading: "What Changes Once It's Fixed",
        points: [
          { text: "Decisions get made faster, because it's clear whose decision it is.", bold: false },
          { text: "Quality gets consistent, because the standard is written down, not remembered.", bold: false },
          { text: "Nobody's guessing who to ask.", bold: true },
        ],
      },
    ],
  },
  {
    title: "Content Debt: What Accumulates When Nobody's Accountable",
    subtitle: "Like technical debt, but for content",
    slug: "content-debt-what-accumulates-when-nobodys-accountable",
    slides: [
      {
        heading: "Content Debt Is Real, and It Compounds",
        points: [
          { text: "Outdated pages that never got retired. Duplicate assets nobody merged. Claims nobody's checked since they were published.", bold: false },
          { text: "Each one is small. Together, they're an estate nobody fully trusts.", bold: true },
        ],
      },
      {
        heading: "Where It Comes From",
        points: [
          { text: "No expiry date on anything, so nothing ever comes up for review.", bold: false },
          { text: "Ownership doesn't get reassigned when someone leaves.", bold: false },
          { text: "A publish-and-forget culture, where the finish line is \"it's live,\" not \"it's still right.\"", bold: true },
        ],
      },
      {
        heading: "The Cost Used to Be Invisible. It Isn't Anymore.",
        points: [
          { text: "A person skimming a page notices when something looks old. An AI system retrieving from your estate doesn't skim, it just surfaces whatever's there, stale or not, with the same confidence either way.", bold: true },
        ],
      },
      {
        heading: "The Evidence, From the Wider Market",
        points: [
          { text: "A CMI/Storyblok survey of 1,015 B2B marketers found only 1 in 3 have a scalable content model, while AI tool spend is up 45% and human investment in content operations is flat.", bold: true },
          { text: "The tooling is accelerating. The operating model underneath it mostly isn't.", bold: false },
        ],
      },
      {
        heading: "Three Signs You're Carrying Content Debt",
        points: [
          { text: "Nobody can say, with confidence, how many pages actually exist.", bold: false },
          { text: "The same question gets answered three different ways in three different places.", bold: false },
          { text: "The CMS has become a place things go, not a system anyone actively manages.", bold: false },
        ],
      },
      {
        heading: "Paying It Down",
        points: [
          { text: "Audit what's actually there, not what the sitemap claims is there.", bold: false },
          { text: "Retire and consolidate, with an owner assigned to what's left.", bold: false },
          { text: "This only works as a standing discipline. A one-off clean-up just resets the clock.", bold: true },
        ],
      },
    ],
  },
  {
    title: "The Content Lifecycle, End to End",
    subtitle: "Publishing is the midpoint, not the finish line",
    slug: "the-content-lifecycle-end-to-end",
    slides: [
      {
        heading: "Most Workflows Stop Modelling the Content Too Early",
        points: [
          { text: "Plan, create, review, publish: most teams can describe this part precisely.", bold: false },
          { text: "Ask what happens after publish, and the answer gets vague fast.", bold: true },
        ],
      },
      {
        heading: "The Six Stages",
        points: [
          { text: "Plan → Create → Review → Publish → Maintain → Retire.", bold: true },
          { text: "Every stage needs an owner and a definition of done. Most estates only have that for the first four.", bold: false },
        ],
      },
      {
        heading: "The Stage Everyone Skips: Maintain",
        points: [
          { text: "A review cadence: how often does this get re-checked?", bold: false },
          { text: "A freshness check: is it still accurate, still relevant, still the right answer?", bold: false },
          { text: "An ownership handoff process: what happens to it when the owner moves on?", bold: false },
        ],
      },
      {
        heading: "The Stage Nobody Plans For: Retire",
        points: [
          { text: "An expiry date, set when the content is created, not discovered years later.", bold: false },
          { text: "A redirect strategy, so retiring a page doesn't just break a link.", bold: false },
          { text: "A real answer to: what happens to a page nobody's touched in three years?", bold: true },
        ],
      },
      {
        heading: "Why This Matters More Under AI",
        points: [
          { text: "AI systems retrieve and cite whatever's actually there. Lifecycle discipline isn't tidiness anymore, it's a trust signal.", bold: true },
        ],
      },
      {
        heading: "What a Managed Lifecycle Looks Like",
        points: [
          { text: "A documented operating model, a decision cadence, and someone accountable for keeping it current.", bold: true },
          { text: "Not a one-off report that goes stale in a month.", bold: false },
        ],
      },
      {
        heading: "Where to Start",
        points: [
          { text: "Map the lifecycle you actually run, not the one in the old process document.", bold: false },
          { text: "Most gaps live at the seams between stages, not inside any single one.", bold: true },
        ],
      },
    ],
  },
  {
    title: "Workflow Redesign: Where Content Actually Gets Stuck",
    subtitle: "It's rarely the writing that's slow",
    slug: "workflow-redesign-where-content-actually-gets-stuck",
    slides: [
      {
        heading: "The Bottleneck Is Almost Never Drafting",
        points: [
          { text: "Approval queues. Unclear reviewers. A handoff nobody's tracking.", bold: false },
          { text: "These eat more time than writing ever does, and they're invisible until someone maps them.", bold: true },
        ],
      },
      {
        heading: "The Workflow You Have vs. the Workflow You Think You Have",
        points: [
          { text: "Most teams have a documented process and a completely different actual practice.", bold: true },
          { text: "The gap between the two is where the time goes.", bold: false },
        ],
      },
      {
        heading: "Common Bottlenecks",
        points: [
          { text: "An approver who was never formally assigned, just became the default.", bold: false },
          { text: "No SLA on review turnaround, so \"in review\" can mean anything from a day to a month.", bold: false },
          { text: "Everything routed through one subject-matter expert, because nobody else was ever authorised to sign off.", bold: false },
        ],
      },
      {
        heading: "Fix the Handoffs, Not Just the Steps",
        points: [
          { text: "Most delay doesn't live inside a stage. It lives in the gap between stages, waiting for someone to notice it's their turn.", bold: true },
        ],
      },
      {
        heading: "What Good Looks Like",
        points: [
          { text: "A named owner per stage.", bold: false },
          { text: "A review SLA that's actually written down.", bold: false },
          { text: "One source of truth, not three versions circulating by email.", bold: false },
        ],
      },
      {
        heading: "How We Redesign It",
        points: [
          { text: "An end-to-end review of how content moves from idea to published, with bottlenecks named and ownership assigned.", bold: true },
        ],
      },
      {
        heading: "The Test",
        points: [
          { text: "Could someone new to the team follow the workflow without asking who to ask?", bold: true },
        ],
      },
    ],
  },
  {
    title: "Measurement That Connects to Outcomes",
    subtitle: "Not vanity metrics with a dashboard around them",
    slug: "measurement-that-connects-to-outcomes",
    slides: [
      {
        heading: "Most Content Reporting Answers the Wrong Question",
        points: [
          { text: "Traffic and publish volume measure activity.", bold: false },
          { text: "Neither one tells you whether the content is actually doing a job.", bold: true },
        ],
      },
      {
        heading: "Operating Metrics, Not Vanity Metrics",
        points: [
          { text: "Time-to-publish: how long does it actually take, end to end?", bold: false },
          { text: "Reuse rate: how much content gets used more than once versus written and forgotten?", bold: false },
          { text: "Retirement rate: is anything actually coming out of the estate, or only going in?", bold: false },
        ],
      },
      {
        heading: "The Question Behind the Metrics",
        points: [
          { text: "Is this content doing a job? Is it structured so it gets used? Is it costing more to maintain than it returns?", bold: true },
        ],
      },
      {
        heading: "Tying It to Business Outcomes",
        points: [
          { text: "Reporting that ties content activity to what the business actually cares about, so you know what to keep and what to cut.", bold: true },
        ],
      },
      {
        heading: "The AI Readiness Angle",
        points: [
          { text: "Traffic reporting won't show you that AI systems can't find or trust a page. Retrievability is a metric now, not an afterthought.", bold: true },
        ],
      },
      {
        heading: "Building a Measurement Model",
        points: [
          { text: "Start with the three or four questions the business actually wants answered.", bold: false },
          { text: "Work backwards to what needs tracking, rather than reporting on whatever the tool already counts.", bold: false },
        ],
      },
    ],
  },
  {
    title: "The Content Efficiency Playbook",
    subtitle: "Reduce production time without losing quality",
    slug: "the-content-efficiency-playbook",
    slides: [
      {
        heading: "Why Content Operations Breaks Down at Volume",
        points: [
          { text: "Every team can run an ad hoc process at low volume. Growth is what exposes the gaps.", bold: false },
          { text: "Without a system underneath it, more content just means more chaos, faster.", bold: true },
        ],
      },
      {
        heading: "The Five Common Blockers",
        points: [
          { text: "Unclear roles and responsibilities.", bold: false },
          { text: "No standardised workflow.", bold: false },
          { text: "Version confusion and outdated assets circulating alongside current ones.", bold: false },
          { text: "Approval cycles with no defined turnaround.", bold: false },
          { text: "Content and assets siloed across disconnected tools.", bold: false },
        ],
      },
      {
        heading: "Content Operations Is a System, Not a Style Guide",
        points: [
          { text: "Treating content as a product, not a one-off asset.", bold: true },
          { text: "Repeatable workflows, centralised systems, and performance measurement as the three legs it stands on.", bold: false },
        ],
      },
      {
        heading: "The Workflow, Mapped",
        points: [
          { text: "Idea → structured brief → draft → review → publish → measure.", bold: true },
          { text: "Every stage needs an owner and a deadline, or it becomes the stage everything gets stuck in.", bold: false },
        ],
      },
      {
        heading: "Lean Principles, Applied to Content",
        points: [
          { text: "Eliminate handoff delays before optimising any single stage.", bold: false },
          { text: "Visualise the workflow so bottlenecks are visible, not anecdotal.", bold: false },
          { text: "Feed performance data back into planning, rather than treating measurement as a report nobody acts on.", bold: false },
        ],
      },
      {
        heading: "What to Measure",
        points: [
          { text: "Time-to-publish, reuse rate, and production cost per asset, the same operating metrics that make the case for change in the first place.", bold: false },
        ],
      },
      {
        heading: "How We Run This With You",
        points: [
          { text: "Standing governance and workflow stewardship: a documented operating model, a decision cadence, and someone accountable for keeping it current.", bold: true },
        ],
      },
      {
        heading: "Where to Start",
        points: [
          { text: "A scored look at ownership, workflow, and decision rights across your content estate, before anything gets redesigned.", bold: false },
        ],
      },
    ],
  },
  {
    title: "Content Governance for Regulated Content",
    subtitle: "The same discipline, higher stakes",
    slug: "content-governance-for-regulated-content",
    slides: [
      {
        heading: "Why Regulated Content Is Different",
        points: [
          { text: "The governance discipline is the same: ownership, approval, review cadence.", bold: false },
          { text: "The stakes are higher, and the evidence trail matters more.", bold: true },
        ],
      },
      {
        heading: "The Regulations That Actually Apply",
        points: [
          { text: "UK GDPR and GDPR: consent, data minimisation, the right to be forgotten.", bold: true },
          { text: "The EU AI Act: risk-based governance of how AI is used, including in content production.", bold: true },
          { text: "Sector-specific rules on top, for financial services, healthcare, and public-sector content.", bold: true },
        ],
      },
      {
        heading: "Where Governance and Compliance Overlap",
        points: [
          { text: "Who approved this claim? Is it still accurate? Who's accountable if it's wrong?", bold: false },
          { text: "Those are governance questions and compliance questions at the same time. Most teams only have an answer for one.", bold: true },
        ],
      },
      {
        heading: "What Breaks Without It",
        points: [
          { text: "Outdated regulatory claims left live because nobody owned the review.", bold: false },
          { text: "No record of who approved a piece of regulated content, or when it was last checked.", bold: false },
          { text: "AI-assisted drafts published without the review step that used to exist for human-written ones.", bold: false },
        ],
      },
      {
        heading: "Building It Into the Operating Model",
        points: [
          { text: "Not a legal afterthought bolted onto the workflow: explicit approval steps, a review cadence, and named ownership inside the same governance framework as everything else.", bold: true },
        ],
      },
      {
        heading: "Why This Shows Up in Pricing",
        points: [
          { text: "Regulated-industry engagements carry a genuine scope premium: the finding set is larger, and the evidence required is more exacting.", bold: false },
        ],
      },
      {
        heading: "Where to Start",
        points: [
          { text: "The governance assessment covers this as part of ownership and decision rights, not as a separate bolt-on compliance audit.", bold: false },
        ],
      },
    ],
  },
  {
    title: "The Seam Between Content Operations and Content Technology",
    subtitle: "Two pillars, one failure mode",
    slug: "the-seam-between-content-operations-and-content-technology",
    slides: [
      {
        heading: "Neither Pillar Works Alone",
        points: [
          { text: "A CMS without governance is expensive chaos with better tooling.", bold: true },
          { text: "Governance without a fit-for-purpose platform is a policy nobody can actually follow.", bold: true },
        ],
      },
      {
        heading: "Where the Seam Usually Tears",
        points: [
          { text: "A platform migration that changes the technology but not the operating model around it.", bold: false },
          { text: "A governance framework written on paper that was never built into the CMS's actual permissions and workflow tools.", bold: false },
        ],
      },
      {
        heading: "Questions That Sit Across Both Pillars",
        points: [
          { text: "Who can publish, and does the CMS enforce that or just document it?", bold: false },
          { text: "Does the taxonomy configured in the platform match the ownership model described in the governance framework?", bold: false },
        ],
      },
      {
        heading: "Why This Gets Missed",
        points: [
          { text: "Platform specialists don't own governance. Governance consultants don't touch the CMS.", bold: false },
          { text: "The seam between them is nobody's job by default.", bold: true },
        ],
      },
      {
        heading: "How We Work Across Both",
        points: [
          { text: "A Content Audit surfaces the technology gaps. A governance assessment surfaces the operating gaps.", bold: false },
          { text: "The fix usually needs both in view at the same time, not sequenced as two separate projects.", bold: true },
        ],
      },
      {
        heading: "The Practical Test",
        points: [
          { text: "If you changed your CMS tomorrow, would your governance model still work?", bold: true },
          { text: "If the honest answer is no, it was never really a model. It was a habit that happened to fit the old platform.", bold: false },
        ],
      },
    ],
  },
  {
    title: "AI Readiness Starts With Governance, Not Tools",
    subtitle: "The instinct is to buy something. That's rarely the fix.",
    slug: "ai-readiness-starts-with-governance-not-tools",
    slides: [
      {
        heading: "The Instinct Is to Buy a Tool",
        points: [
          { text: "An AI readiness problem usually gets diagnosed as a tooling gap.", bold: false },
          { text: "It's almost never the actual cause.", bold: true },
        ],
      },
      {
        heading: "What AI Actually Needs From Your Content",
        points: [
          { text: "Structure, ownership, and consistency, not a bigger model on top of an ungoverned estate.", bold: true },
        ],
      },
      {
        heading: "AI Doesn't Fix Content",
        points: [
          { text: "It finds out how bad it already was.", bold: true },
          { text: "An AI system trained or retrieving from ungoverned content just surfaces the mess faster, and with more confidence.", bold: false },
        ],
      },
      {
        heading: "The Retrievability Test",
        points: [
          { text: "Can AI systems find the right passages?", bold: false },
          { text: "Does the content prove expertise, authority, and relevance when they do?", bold: false },
          { text: "Is it organised clearly enough for machines and people alike?", bold: false },
        ],
      },
      {
        heading: "Where This Sits in the Three Pillars",
        points: [
          { text: "Content Technology gets the structure right.", bold: false },
          { text: "Content Operations keeps it right over time.", bold: false },
          { text: "AI readiness is what both look like once they're actually working.", bold: true },
        ],
      },
      {
        heading: "Starting Point",
        points: [
          { text: "The Content Operations Maturity Assessment scores this directly, AI Readiness is one of its six dimensions, before anyone talks about which tool to buy.", bold: false },
        ],
      },
    ],
  },
  {
    title: "From Diagnostic to Managed Package",
    subtitle: "How a bounded finding becomes an ongoing service",
    slug: "from-diagnostic-to-managed-package",
    slides: [
      {
        heading: "Every Pillar Starts the Same Way",
        points: [
          { text: "A priced, bounded finding first, whichever pillar you start with.", bold: true },
          { text: "Not an open-ended engagement sold on a promise.", bold: false },
        ],
      },
      {
        heading: "Why We Don't Sell the Retainer First",
        points: [
          { text: "A managed package sold before there's evidence of the problem is a guess dressed up as a proposal.", bold: true },
        ],
      },
      {
        heading: "What the Diagnostic Actually Proves",
        points: [
          { text: "Real findings from your actual estate, not a self-assessment questionnaire.", bold: true },
        ],
      },
      {
        heading: "The Decision Point",
        points: [
          { text: "After the findings land, it's a genuine choice: fix it yourselves, run it as a one-off project, or hand it to us as an ongoing managed package.", bold: false },
        ],
      },
      {
        heading: "What Changes in a Managed Package",
        points: [
          { text: "A documented operating model, a decision cadence, and someone accountable for keeping it current.", bold: true },
          { text: "Not a one-off report that goes stale in a month.", bold: false },
        ],
      },
      {
        heading: "The Credit Mechanic",
        points: [
          { text: "Where it applies, the diagnostic's cost credits toward the first period of the managed package, if you sign within the window.", bold: false },
        ],
      },
      {
        heading: "Why This Protects You, Not Just Us",
        points: [
          { text: "You're not buying a standing engagement on faith. You've already seen the findings that justify it.", bold: true },
        ],
      },
    ],
  },
];

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import ContactForm from "@/components/ContactForm";
import AuditRequestForm from "@/components/AuditRequestForm";
import LearnMoreSection from "@/components/LearnMoreSection";
import LavaBlobs from "@/components/LavaBlobs";
import PostIllustration from "@/components/post/PostIllustration";
import FeaturedCaseStudies from "@/components/FeaturedCaseStudies";
import { getHomePage, getBlogPosts, getFeaturedCaseStudies } from "@/lib/queries";
import { urlFor } from "@/lib/sanity";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const home = await getHomePage().catch(() => null);
  const seo = home?.seo || {};

  // Title and description are literal, not Sanity-overridable: this copy
  // is specified in full by the outbound-stack repositioning brief and
  // must render as written, not be silently shadowed by a pre-rewrite
  // seo.metaTitle/metaDescription value still sitting in Sanity. Same
  // reasoning as offerLadder below — brief-specified copy goes through
  // code review, not a CMS edit.
  const title = "ECM.DEV: Pipeline Infrastructure for B2B Marketing Teams";
  const description =
    "ECM.DEV builds the lists, tools, and landing flows that turn leads into pipeline, for inbound and outbound marketing. Hands-on, fixed scope, fast.";

  const ogTitle = "ECM.DEV: We build what turns leads into pipeline.";
  const ogDescription =
    "Lists, tools, and landing flows for inbound and outbound marketing. Hands-on, fixed scope, fast. You own everything we build.";

  const ogImage = seo.ogImage
    ? urlFor(seo.ogImage).width(1200).height(630).fit("crop").crop("center").url()
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: "/" },
    ...(seo.noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      type: "website",
      title: ogTitle,
      description: ogDescription,
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

/* ─── Static fallback data (used when Sanity fields are empty) ─── */

const fallbackHero = {
  heading: "Pipeline infrastructure for B2B marketing teams.",
  body: "The gap between interest and a booked meeting is where most pipeline is lost. ECM.DEV builds the layer that closes it: clean prospect lists, qualification tools, landing flows, CRM workflows and the content structure underneath them.",
  supportingLine:
    "Outbound, inbound, campaigns and content, connected to the CRM that has to record the result.",
};

/* Merged "six symptoms" + "what we build" into one paired list: each row
   states the pipeline leak, then the specific thing ECM.DEV builds to close
   it. Five rows, not six, because the former opens-but-no-replies and
   landing-page symptoms are the same underlying gap (no structured path
   from click to meeting) and share one fix (landing flows). Replaces two
   separate card grids with one causal list, so the page states the problem
   and the fix as a single claim instead of asking the visitor to connect
   them across two sections. */
const pipelineFixes = [
  {
    problem: "Opens don't turn into replies, and clicks don't turn into meetings.",
    fix: "Landing flows",
    description:
      "Multi-step landing experiences that turn a campaign click into structured intent: message, questions, scoring logic, routing and CRM handoff.",
  },
  {
    problem: "Meetings get booked with people nothing qualified first.",
    fix: "Interactive qualification tools",
    description:
      "Assessments, calculators and scorecards that tell a buyer something useful about their own problem while telling you whether they fit.",
  },
  {
    problem: "Your list is leaking budget before any campaign runs.",
    fix: "Prospect list engines",
    description:
      "Clean, targeted account and contact lists, built with research logic, enrichment, verification and QA. Lists your team can work from without checking them first.",
  },
  {
    problem: "Campaign signal dies in an inbox instead of reaching the CRM.",
    fix: "CRM-connected workflows",
    description:
      "Campaign activity wired into HubSpot, Salesforce, Pipedrive and the tools you already run, so nothing waits in an inbox and no signal is lost.",
  },
  {
    problem: "Your content isn't doing a job in the pipeline.",
    fix: "Content and AI operations",
    description:
      "Messaging, proof, FAQs, case studies and metadata structured so people and AI systems can both use it. AI-ready content is work someone has done, not a property of the tool.",
  },
];

/* AI Content Readiness Audit strip. Copy is kept as literal constants for the
   same reason the offer ladder below is: this section carries a hard language
   guardrail (no certification, guarantee or attestation wording, and no implied
   promise that a client's AI is safe or compliant), and that is enforced in
   code review, not in a CMS edit. The audit itself is detailed on
   /content-services; this strip is the homepage door into it. */
/* Introductory offer cutoff: 00:00 UTC on 1 October 2026, so the whole of
   30 September is covered in Irish and UK time. Compared at render time; the
   page carries `revalidate = 3600`, so the switch to the paid framing lands
   within an hour of the cutoff rather than on the stroke of it. */
const AUDIT_OFFER_ENDS = Date.UTC(2026, 9, 1);

const auditStrip = {
  eyebrow: "AI Content Readiness Audit",
  headline: "Can AI systems find, trust and reuse your content?",
  /* Condensed to two lines for the homepage strip (the full four-line
     version lives in /content-services); keeps the buyer-behaviour framing
     and the payoff question without the extra stacked lines. */
  subhead: [
    "Your buyers are already asking AI tools about vendors, problems and options.",
    "This audit tests whether your content can be retrieved, cited and reused by AI answer engines.",
  ],
  /* Collapsed from three negations plus a payoff into one line: keeps the
     counter-claim (we test the content estate, not appearance or opinion)
     without the stacked list taking up homepage space. */
  differentiatorLine:
    "Not how the site looks or one SEO score. We test the content estate itself.",
  coverage: [
    {
      title: "Retrievability",
      description: "Can AI systems find the right passages?",
    },
    {
      title: "Trust signals",
      description: "Does the content prove expertise, authority and relevance?",
    },
    {
      title: "Structure",
      description: "Is the content organised clearly enough for machines and people?",
    },
    {
      title: "Commercial usefulness",
      description: "Does the content help buyers move closer to a decision?",
    },
    {
      title: "Workflow readiness",
      description: "Can your team reuse and maintain the content without creating more mess?",
    },
  ],
  trustLine:
    "The result: a clear view of what AI can see, what it misses and what needs fixing first.",
  ctaLabel: "Request the audit",
  /* Introductory offer, time-bound rather than count-bound so the claim can be
     enforced here instead of depending on someone remembering to edit it. The
     five-at-a-time line is a capacity condition, not the scarcity device: the
     deadline is what closes the offer. Once AUDIT_OFFER_ENDS passes, the strip
     renders `paidOffer` below and the badge disappears. */
  introOffer: {
    badge: "Free for audits requested before 30 September",
    heading: "Why this one is free",
    body: "This is a new service and it will normally be paid work. We are running it free of charge for audits requested before 30 September, in exchange for a recommendation if the analysis turns out to be something you can use.",
    caveat: "We take on five at a time, so if we are at capacity we will tell you when we can start rather than leave you waiting. If the findings are not useful, say so and we part on good terms: no recommendation, no invoice, no obligation either way.",
  },
  /* Shown automatically once the introductory offer closes. No price here by
     design; the homepage strip exists to start a conversation, and the tiers
     and figures live on /content-services. */
  paidOffer: {
    heading: "What this costs",
    body: "This is a paid engagement, scoped to the size of your content estate. Tell us what you are running and we will come back with a scope and a price before any work starts.",
    caveat: "Findings and recommended remediation, delivered as a professional opinion you can act on or argue with.",
    linkLabel: "See the full service range",
    linkUrl: "/content-services",
  },
  formIntro: "Tell us where to send it. We reply personally, not with an automated report.",
  confirmation: "Thanks, we'll be in touch within one business day.",
};

/* Three-step offer ladder. Kept as literal constants rather than
   Sanity-sourced: engagement pricing should go through code review, not a
   CMS edit. Replaces the former ecm-agent engagement tiers — see
   app/content-services/page.tsx's auditTiers for where that content lives now. */
const offerLadder = [
  {
    step: "01",
    title: "Free assessment",
    tagline: "Find where your pipeline is leaking.",
    subtitle: "Five minutes. No sales call, no email gate on the result.",
    body: "Score your outbound, content and conversion operation across six dimensions. You get a readout of what is slowing the journey from first touch to qualified opportunity, and what to fix first. Not a maturity model, a practical order of work.",
    ctaLabel: "Take the free assessment",
    ctaUrl: "/assessments",
  },
  {
    step: "02",
    title: "Fixed-scope build",
    tagline: "Build one useful piece of the system.",
    subtitle: "From EUR 1,500. Delivered in one to two weeks.",
    body: "Pick one problem and we build it: a clean prospect list for a single target segment, a scored assessment or calculator, a campaign landing flow, a CRM-connected follow-up workflow, or a content structure your AI tools can actually use. Fixed price, fixed scope, and you own everything we build.",
    ctaLabel: "Talk about a first build",
    ctaUrl: "/contact",
  },
  {
    step: "03",
    title: "Retained pipeline engineering",
    tagline: "Keep the system improving every month.",
    subtitle: "Monthly. Cancel anytime.",
    body: "For teams that want a hands-on build partner. We refresh lists, improve flows, build new campaign assets, maintain the CRM connections, review conversion data and keep the content layer usable. Hands-on work every month, not a report that describes progress instead of making it.",
    ctaLabel: "Talk about a retainer",
    ctaUrl: "/contact",
  },
];

/* Closing section, immediately above the contact form. Placed last, after
   the proof section, so it reads as the closing argument rather than an
   opener: by this point the visitor has seen the problem, the build, the
   offer, and the evidence. */
const whyEcmDev = {
  heading: "Why ecm.dev?",
  body: "We build the missing layer between marketing activity and sales pipeline. Modern B2B marketing is not just a content problem. And it is not only a CRM problem. It is a systems problem. Your data, content, tools, landing pages, workflows and AI experiments all need to work together. That is what we build.",
  closingLine:
    "ECM.DEV is the hands-on partner for B2B teams that want their marketing stack to produce cleaner leads, better conversations and stronger pipeline.",
};

const fallbackLearnMore = [
  { title: "Sales and Marketing Sync-Up", subtitle: "Streamlining Shared Content for Bigger Wins" },
  { title: "The Content Efficiency Playbook", subtitle: "Reduce Production Time, Increase Output" },
  { title: "Automated Content Creation", subtitle: "Scaling Creativity Through AI-Driven Tools" },
  { title: "Interactive Content Development", subtitle: "Engaging Audiences Through Innovation" },
  { title: "Enhanced Personalization Techniques", subtitle: "Enhanced Personalization" },
  { title: "Integration of AI Recommendations", subtitle: "Personalization and Engagement Strategies" },
  { title: "Future Trends in AI-Driven Marketing", subtitle: "Exploring Innovations & Opportunities" },
  { title: "Emphasis on Human Centric Content", subtitle: "Building Connections in a Digital Age" },
  { title: "Compliance & Data Privacy Management", subtitle: "Ensuring Trust and Transparency in AI-Driven Marketing" },
  { title: "Smarter AI Content Decisions", subtitle: "From content models to content pipelines" },
];

const fallbackBlogPosts = [
  { title: "Kentico CMS Cadence Cuts Migration Risk", date: "Sep 16, 2025", slug: "kentico-cadence-cuts-migration-risk" },
  { title: "Agentic CX: From Journeys to Agents", date: "Sep 15, 2025", slug: "agentic-cx-from-journeys-to-agents" },
  { title: "Sanity CMS Upgrades Speed CX Delivery", date: "Sep 12, 2025", slug: "sanity-cms-upgrades-speed-cx-delivery" },
  { title: "Unlocking Sitecore productivity", date: "Sep 12, 2025", slug: "sitecore-productivity-and-roi" },
  { title: "Ibexa v5: Europe’s B2B DXP", date: "Sep 9, 2025", slug: "ibexa-v5-europe-s-b2b-dxp" },
  { title: "Hyland Content Innovation Cloud", date: "Aug 28, 2025", slug: "hyland-content-innovation-cloud" },
  { title: "Contentful AI Workflows Boost Speed", date: "Aug 20, 2025", slug: "contentful-ai-workflows-boost-speed" },
  { title: "Optimizely AEO/GEO: AI Visibility", date: "Aug 15, 2025", slug: "optimizely-aeo-geo-ai-visibility" },
];

/* ─── Helpers ─── */

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

/* Fallback ticker phrases (used when Sanity tickerPhrases is empty). */
const fallbackTicker = [
  "A Calendly link is not a conversion layer.",
  "Your list is only as good as the data in it.",
  "Content that does not convert is overhead.",
  "The gap between the email and the meeting is where pipeline leaks.",
  "Build it once. Let it qualify for you.",
  "Stack-agnostic. Scope-fixed. Hands-on.",
  "More meetings from the same outbound volume.",
  "Your CRM is only as useful as what feeds it.",
  "Structured content converts. Unstructured content costs.",
  "The tool is not the problem. The layer around it is.",
  "List build is infrastructure, not admin.",
  "We built the assessments on this site. We can build yours.",
  "Cold outreach works. The landing page after it usually does not.",
  "Fixed scope. Fast delivery. You own everything.",
  "Content is infrastructure now.",
  "Faster pipeline starts upstream.",
  "Every market should not cost more than the last.",
  "Velocity without structure is just noise.",
];

/* ─── Page Component ─── */

export default async function HomePage() {
  // Is the introductory (free) audit offer still open? See AUDIT_OFFER_ENDS.
  const auditOfferOpen = Date.now() < AUDIT_OFFER_ENDS;
  const auditOffer = auditOfferOpen ? auditStrip.introOffer : auditStrip.paidOffer;

  // Fetch Sanity data in parallel
  const [homePage, liveBlogPosts, featuredCaseStudies] = await Promise.all([
    getHomePage().catch(() => null),
    getBlogPosts(8).catch(() => null),
    getFeaturedCaseStudies().catch(() => []),
  ]);

  // Hero and symptoms are literal, not Sanity-overridable: this
  // repositioning brief's copy must render as specified, not be
  // shadowed by pre-rewrite content still sitting in Sanity. Same reasoning
  // as the title/description literals in generateMetadata above.
  const heroHeading = fallbackHero.heading;
  const heroBody = fallbackHero.body;
  const heroSupportingLine = fallbackHero.supportingLine;

  const learnMoreItems =
    homePage?.learnMoreItems?.length ? homePage.learnMoreItems : fallbackLearnMore;

  // Hero buttons
  const heroCtaPrimaryLabel = homePage?.heroCta?.primaryLabel || "Start with the free assessment";
  const heroCtaPrimaryUrl = homePage?.heroCta?.primaryUrl || "/assessments";
  const heroCtaPrimaryNote = homePage?.heroCta?.primaryNote ?? "";
  const heroCtaSecondaryLabel = homePage?.heroCta?.secondaryLabel || "See the work";
  const heroCtaSecondaryUrl = homePage?.heroCta?.secondaryUrl || "/case-study";

  // Pipeline-fixes section headings (merged former "six symptoms" +
  // "what we build" sections into one problem/fix list; see pipelineFixes).
  const pipelineFixesHeading =
    homePage?.symptomsHeading || "Where pipeline leaks, and what we build to fix it.";
  const pipelineFixesSubhead =
    homePage?.symptomsSubhead ||
    "Any one of these is worth fixing. Here is exactly what closes each gap.";

  // Ticker
  const tickerPhrases = homePage?.tickerPhrases?.length ? homePage.tickerPhrases : fallbackTicker;

  // Blog posts: use Sanity data if available, map to display format
  const blogPosts =
    liveBlogPosts?.length
      ? liveBlogPosts.map((p: any) => ({
          title: p.title,
          slug: p.slug?.current || p.slug,
          date: p.publishedAt ? formatDate(p.publishedAt) : "",
          mainImage: p.mainImage,
        }))
      : fallbackBlogPosts;

  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative bg-ecm-green py-16 sm:py-24 lg:py-32 pb-24 sm:pb-32 lg:pb-40 overflow-hidden">
        <LavaBlobs variant="mixed" opacity={0.45} count={6} />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Single centered text panel: full width on mobile, max-w-3xl on desktop */}
          <div className="max-w-3xl mx-auto lg:mx-0">
            {/* Heading */}
            <div className="bg-ecm-green-dark/80 backdrop-blur-sm rounded-t-2xl px-6 sm:px-10 lg:px-12 py-6 sm:py-8 lg:py-10 border border-white/10">
              <h1 className="text-ecm-lime font-barlow font-bold text-2xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight">
                {heroHeading}
              </h1>
            </div>
            {/* Body */}
            <div className="bg-ecm-green-dark/70 backdrop-blur-sm rounded-b-2xl px-6 sm:px-10 lg:px-12 py-6 sm:py-8 lg:py-10 border border-white/5 border-t-0">
              {heroBody.split("\n\n").map((para: string, i: number) => (
                <p
                  key={i}
                  className="text-white/90 font-barlow font-light text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed mb-4 last:mb-0"
                >
                  {para}
                </p>
              ))}
              {heroSupportingLine && (
                <p className="text-ecm-lime/80 font-barlow font-semibold text-sm sm:text-base mb-0">
                  {heroSupportingLine}
                </p>
              )}
              {/* Hero calls to action */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href={heroCtaPrimaryUrl}
                  className="inline-flex items-center justify-center bg-ecm-lime text-ecm-green font-barlow font-bold text-base sm:text-lg px-8 py-4 rounded-full hover:bg-ecm-lime-hover transition-colors"
                >
                  {heroCtaPrimaryLabel}
                  {heroCtaPrimaryNote && (
                    <span className="ml-2 text-ecm-green/70 font-medium text-sm">{heroCtaPrimaryNote}</span>
                  )}
                </Link>
                {heroCtaSecondaryLabel && (
                  <Link
                    href={heroCtaSecondaryUrl}
                    className="inline-flex items-center justify-center border-2 border-ecm-lime text-ecm-lime font-barlow font-semibold text-base sm:text-lg px-8 py-4 rounded-full hover:bg-ecm-lime hover:text-ecm-green transition-colors"
                  >
                    {heroCtaSecondaryLabel}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Wave divider: green → white */}
        <div className="wave-divider wave-divider-bottom">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="var(--color-surface)" />
          </svg>
        </div>
      </section>

      {/* ─── CONVERSION LAYER DIAGNOSIS ─── */}
      <section className="py-20 bg-surface">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-heading font-barlow font-bold text-2xl sm:text-3xl leading-snug mb-6">
            Your campaigns are not broken. The layer between them is.
          </h2>
          <p className="text-ink text-base leading-relaxed mb-4">
            Most B2B teams already have the parts: a website, a CRM, a few campaigns, some outbound tooling, several years of content, and usually some AI running on top of it. What they do not have is a reliable handoff from one part to the next.
          </p>
          <p className="text-ink text-base leading-relaxed mb-4">
            So the right people click and then go quiet. Replies arrive and stall. Meetings get booked against opportunities nothing qualified first. The AI tools promise speed, then meet the content and the data as they actually are.
          </p>
          <p className="text-ink text-base leading-relaxed">
            We engineer that handoff: the conversion layer that carries a prospect from the first sign of interest to an opportunity sales can genuinely work.
          </p>
        </div>
      </section>

      {/* ─── PIPELINE FIXES (merged former "six symptoms" + "what we build") ─── */}
      <section className="py-20 bg-surface">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-heading font-barlow font-bold text-3xl lg:text-4xl text-center mb-4">
            {pipelineFixesHeading}
          </h2>
          {pipelineFixesSubhead && (
            <p className="text-ink text-center text-base mb-12 max-w-2xl mx-auto">
              {pipelineFixesSubhead}
            </p>
          )}
          <div className="flex flex-col gap-4">
            {pipelineFixes.map((item, i) => (
              <div
                key={i}
                className="bg-ecm-green rounded-xl p-6 sm:p-8 border border-ecm-lime/20 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8"
              >
                <div className="sm:w-2/5">
                  <span className="text-white/50 font-barlow font-semibold text-xs uppercase tracking-wide">
                    The leak
                  </span>
                  <p className="text-white/90 text-sm sm:text-base leading-relaxed mt-1">
                    {item.problem}
                  </p>
                </div>
                <div className="hidden sm:block text-ecm-lime text-xl shrink-0" aria-hidden="true">
                  &rarr;
                </div>
                <div className="sm:w-3/5">
                  <h3 className="text-ecm-lime font-barlow font-semibold text-base sm:text-lg mb-1">
                    {item.fix}
                  </h3>
                  <p className="text-white/85 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/problems/outbound-conversion"
              className="inline-flex items-center gap-1 text-heading font-barlow font-semibold text-sm hover:opacity-80 transition-opacity"
            >
              See how we fix it <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FEATURED CASE STUDIES ─── */}
      {featuredCaseStudies && featuredCaseStudies.length > 0 && (
        <section className="py-20 bg-surface">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-heading font-barlow font-bold text-3xl lg:text-4xl text-center mb-4">
              Featured work.
            </h2>
            <p className="text-ink text-center text-base mb-16 max-w-2xl mx-auto">
              A closer look at outcomes across content technology, services and localisation.
            </p>
            <div className="mb-12">
              <FeaturedCaseStudies caseStudies={featuredCaseStudies} />
            </div>
            <div className="text-center">
              <Link
                href="/case-study"
                className="inline-block bg-ecm-green text-white font-barlow font-semibold px-8 py-3 rounded-full hover:bg-ecm-green-dark transition-colors"
              >
                See all case studies
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── AI CONTENT READINESS AUDIT ─── */}
      {/* pb-24: the bottom wave divider is absolutely positioned and dips up
          to ~120px into the section at some points along its width; pb-16
          wasn't enough clearance and the wave clipped into the form card's
          bottom edge. Compacting the form (see AuditRequestForm) does most
          of the work; this is the safety margin on top of that.
          pt-32: same issue at the top, the eyebrow/badge row that opens
          this section has no padding of its own, so it needs full
          clearance (the wave-divider SVG is now capped at its viewBox's
          120px, see globals.css) rather than a partial safety margin. */}
      <section id="audit-request" className="relative pt-32 pb-24 bg-ecm-green">
        {/* Wave divider: white → green (top) */}
        <div className="wave-divider wave-divider-top">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C360,0 1080,120 1440,60 L1440,0 L0,0 Z" fill="var(--color-surface)" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
            <p className="text-ecm-lime/70 font-barlow font-semibold text-xs tracking-widest uppercase">
              {auditStrip.eyebrow}
            </p>
            {auditOfferOpen && (
              <p className="inline-flex items-center rounded-full border border-ecm-lime/50 px-3 py-1 text-ecm-lime font-barlow font-semibold text-xs">
                {auditStrip.introOffer.badge}
              </p>
            )}
          </div>
          <h2 className="text-ecm-lime font-barlow font-bold text-3xl lg:text-4xl mb-4 max-w-3xl">
            {auditStrip.headline}
          </h2>
          <div className="mb-4 max-w-3xl space-y-1">
            {auditStrip.subhead.map((line, i) => (
              <p key={i} className="text-white/85 text-base sm:text-lg leading-relaxed">
                {line}
              </p>
            ))}
          </div>
          {/* Single payoff line replacing the former three-negation stack:
              same counter-claim, a fraction of the vertical space. */}
          <p className="mb-8 max-w-3xl text-ecm-lime font-barlow font-semibold text-sm leading-relaxed border-l-2 border-ecm-lime/40 pl-4">
            {auditStrip.differentiatorLine}
          </p>

          <div className="grid lg:grid-cols-5 gap-10 lg:gap-14 items-start">
            {/* Left: what the audit covers, as a compact tag row rather than
                five full description cards, plus the signup form. Top-aligned
                rather than vertically centered: centering relied on the
                section's green background to make the balancing whitespace
                read as intentional, which broke under forced-colors mode
                (backgrounds get stripped, leaving an unexplained blank gap
                mid-section). Trailing space below the shorter column is a
                normal, unremarkable pattern in any color scheme. */}
            <div className="lg:col-span-3">
              <div className="flex flex-wrap gap-2">
                {auditStrip.coverage.map((item) => (
                  <span
                    key={item.title}
                    className="inline-flex items-center rounded-full bg-white/10 border border-white/15 px-4 py-2 text-white/90 font-barlow text-sm"
                  >
                    {item.title}
                  </span>
                ))}
              </div>
              <p className="text-white/70 text-sm leading-relaxed mt-5">
                {auditStrip.trustLine}
              </p>
            </div>

            {/* Right: signup. The submit button carries the section CTA label. */}
            <div className="lg:col-span-2 bg-ecm-green-dark/60 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="mb-4 pb-4 border-b border-white/15">
                <h3 className="text-ecm-lime font-barlow font-semibold text-base mb-2">
                  {auditOffer.heading}
                </h3>
                <p className="text-white/85 text-sm leading-relaxed mb-2">
                  {auditOffer.body}
                </p>
                <p className="text-white/70 text-xs leading-relaxed">
                  {auditOffer.caveat}
                </p>
                {!auditOfferOpen && (
                  <Link
                    href={auditStrip.paidOffer.linkUrl}
                    className="inline-block mt-3 text-ecm-lime text-sm underline hover:text-ecm-lime-hover"
                  >
                    {auditStrip.paidOffer.linkLabel}
                  </Link>
                )}
              </div>
              <AuditRequestForm
                intro={auditStrip.formIntro}
                submitLabel={auditStrip.ctaLabel}
                confirmation={auditStrip.confirmation}
              />
            </div>
          </div>
        </div>
        {/* Wave divider: green → white (bottom) */}
        <div className="wave-divider wave-divider-bottom">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="var(--color-surface)" />
          </svg>
        </div>
      </section>

      {/* ─── OFFER LADDER (was engagement tiers) ─── */}
      <section className="py-20 bg-surface">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-heading font-barlow font-bold text-3xl lg:text-4xl text-center mb-4">
            Three ways to start. One path.
          </h2>
          <p className="text-ink text-center text-base mb-16 max-w-2xl mx-auto">
            Diagnose the leak, build the missing part, keep the system improving.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {offerLadder.map((step) => (
              <div
                key={step.step}
                className="relative bg-ecm-green rounded-xl p-6 sm:p-8 border border-ecm-lime/20 flex flex-col"
              >
                <div className="w-10 h-10 bg-ecm-lime rounded-lg flex items-center justify-center mb-4">
                  <span className="text-ecm-green-dark font-barlow font-bold text-lg">{step.step}</span>
                </div>
                <h3 className="text-ecm-lime font-barlow font-bold text-xl mb-1">{step.title}</h3>
                <p className="text-ecm-lime/80 font-barlow font-semibold text-sm mb-1">{step.tagline}</p>
                <p className="text-white/60 text-xs mb-4">{step.subtitle}</p>
                <p className="text-white/85 text-sm leading-relaxed mb-4 flex-1">{step.body}</p>
                <Link
                  href={step.ctaUrl}
                  className="inline-flex items-center justify-center bg-ecm-lime text-ecm-green font-barlow font-semibold text-sm px-6 py-3 rounded-full hover:bg-ecm-lime-hover transition-colors mt-auto"
                >
                  {step.ctaLabel}
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-ink text-xs">
            Working at larger scale or need a full content infrastructure audit?{" "}
            <Link href="/content-services" className="underline hover:text-heading">
              Full service range
            </Link>
          </p>
        </div>
      </section>

      {/* ─── LATEST INSIGHTS (Blog) ─── */}
      <section className="relative py-20 bg-surface">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-heading font-barlow font-bold text-3xl lg:text-4xl text-center mb-16">
            LATEST INSIGHTS
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {blogPosts.map((post: any, i: number) => (
              <Link
                key={post._id || i}
                href={`/post/${post.slug?.current || post.slug}`}
                className="bg-surface rounded-xl overflow-hidden border border-surface-border hover:shadow-lg shadow-sm transition-shadow group flex flex-col"
              >
                <div className="h-36 overflow-hidden bg-ecm-green/5 flex items-center justify-center border-b border-surface-border">
                  <PostIllustration
                    slug={post.slug?.current || post.slug}
                    mainImage={post.mainImage}
                  />
                </div>
                <div className="p-4 flex flex-col flex-1 bg-surface-alt">
                  <h3 className="text-heading font-barlow font-semibold text-sm mb-2 group-hover:opacity-80 transition-opacity leading-snug">
                    {post.title}
                  </h3>
                  {post.publishedAt && (
                    <p className="text-ink-muted text-xs">
                      {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                        year: "numeric",
                        month: "long",
                      })}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center">
            <Link
              href="/blog"
              aria-label="Read more articles on the ECM.DEV blog"
              className="inline-block bg-ecm-green text-white font-barlow font-semibold px-8 py-3 rounded-full hover:bg-ecm-green-dark transition-colors"
            >
              READ MORE
            </Link>
          </div>
        </div>
      </section>

      {/* ─── LEARN MORE ─── */}
      <section className="relative py-20 bg-surface-alt">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-heading font-barlow font-bold text-3xl lg:text-4xl text-center mb-16">
            LEARN MORE
          </h2>
          <LearnMoreSection items={learnMoreItems} />
        </div>
      </section>

      {/* ─── TICKER TAPE ─── */}
      {(() => {
        const truths = tickerPhrases;
        return (
          <section style={{ background: "rgb(49,97,72)", padding: "12px 0", overflow: "hidden", width: "100%" }}>
            <style>{`.ecm-ticker-inner{display:inline-block;white-space:nowrap;animation:ecm-ticker 200s linear infinite}.ecm-ticker-item{font-family:"Courier New",Courier,monospace;font-weight:bold;font-size:1.2rem;color:#AAF870;display:inline-block;margin:0 120px}.ecm-ticker-sep{font-family:"Courier New",Courier,monospace;font-size:1.2rem;color:#AAF870;opacity:0.4}@keyframes ecm-ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
            <div className="ecm-ticker-inner">
              {[...truths, ...truths].map((t, i) => (
                <span key={i}><span className="ecm-ticker-item">{t}</span><span className="ecm-ticker-sep">✦</span></span>
              ))}
            </div>
          </section>
        );
      })()}

      {/* Wave divider (green → white) bridging the ticker tape into "Why
          ecm.dev" below, now that the outcome cards section which used to
          carry this transition has been removed. Rendered in normal flow
          (not the wave-divider absolute-positioning classes) since the
          ticker tape above is far too short to contain an absolutely
          positioned wave without it clipping against the ticker's own
          overflow:hidden. */}
      <div className="bg-ecm-green" style={{ lineHeight: 0 }}>
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "100%", height: "auto" }}>
          <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="var(--color-surface)" />
        </svg>
      </div>

      {/* ─── WHY ECM.DEV ─── */}
      <section className="py-20 bg-surface">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-heading font-barlow font-bold text-3xl lg:text-4xl mb-6">
            {whyEcmDev.heading}
          </h2>
          <p className="text-ink text-base leading-relaxed mb-6">
            {whyEcmDev.body}
          </p>
          <p className="text-heading font-barlow font-semibold text-base leading-relaxed">
            {whyEcmDev.closingLine}
          </p>
        </div>
      </section>

      {/* ─── CONTACT ─── */}
      <ContactForm />

      {/* ─── MOBILE STICKY CTA ─── */}
      <Link
        href="/assessment/content-operations-maturity"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-ecm-lime text-ecm-green font-barlow font-bold text-center py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.15)] hover:bg-ecm-lime-hover transition-colors"
      >
        Assess your content infrastructure · 10 min
      </Link>
    </>
  );
}

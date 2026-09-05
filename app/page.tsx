import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import ContactForm from "@/components/ContactForm";
import AuditRequestForm from "@/components/AuditRequestForm";
import LearnMoreSection from "@/components/LearnMoreSection";
import LavaBlobs from "@/components/LavaBlobs";
import PostIllustration from "@/components/post/PostIllustration";
import { getHomePage, getBlogPosts } from "@/lib/queries";
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

const fallbackSymptoms = [
  {
    title: "Outbound is generating opens but not replies",
    description:
      "Your subject lines are working. The email itself, or what it points to, is losing people who were already interested. This is a conversion layer problem, not a volume problem.",
  },
  {
    title: "Replies are not converting to booked meetings",
    description:
      "The gap between a reply and a meeting needs something to bridge it. An interactive tool, a scored assessment, a reason to take the next step that is not just \"get on a call with me.\"",
  },
  {
    title: "Meetings are not converting to pipeline",
    description:
      "You are booking calls with people who were never going to buy, because nothing in the outbound flow qualified them first. A scored assessment before the meeting fixes this without adding friction.",
  },
  {
    title: "Your landing page is not converting clicks",
    description:
      "A static page with a contact form is not a conversion layer. It is where momentum goes to stop. The companies converting cold outbound consistently have something interactive between the email click and the booked meeting.",
  },
  {
    title: "Your prospect list is leaking budget",
    description:
      "Bad data, wrong titles, unverified emails, no segmentation by signal or intent. A poorly built list means paying to reach people who will never buy. List build and QA is infrastructure, not admin.",
  },
  {
    title: "Your content is not doing a job in the pipeline",
    description:
      "Every asset you produce should be qualifying, educating, or building enough trust to lift reply rates. If it is not doing that, it is overhead. Structured content converts. Unstructured content costs.",
  },
];

/* Outcome cards. Non-clickable info cards, not links: the approved copy
   set doesn't give per-card destinations for these four (unlike the
   3-card version this replaced), so this is content, not navigation. */
const outcomeCards = [
  {
    title: "Better lists",
    description:
      "You reach companies that match your ICP and people who can actually act on it, segmented by market, trigger, role and buying context. Less budget spent chasing accounts that were never going to buy.",
    icon: 1,
  },
  {
    title: "Better journeys",
    description:
      "A click lands in a flow rather than on a static page. The prospect answers, scores, qualifies, and gets the next step that fits the answer. Sales arrives at the first conversation already holding context.",
    icon: 0,
  },
  {
    title: "Better CRM action",
    description:
      "Campaign responses stop living in inboxes and spreadsheets. They arrive in the CRM with the fields, owner, task and follow-up logic attached, so what happened and what comes next are recorded rather than remembered.",
    icon: 2,
  },
  {
    title: "Better AI readiness",
    description:
      "AI does not rescue messy content, it inherits it. We structure content, metadata, workflows and the knowledge underneath them so your AI tools can find the right material, trust it and reuse it. Structure is what makes the automation worth running.",
    icon: 1,
  },
];

/* The five things ECM.DEV builds. Non-clickable info cards, same reasoning
   as outcomeCards above: no per-item destinations given in the approved
   copy set. */
const whatWeBuild = [
  {
    title: "Prospect list engines",
    description:
      "Clean, targeted account and contact lists for a specific ICP, market and offer, built with research logic, enrichment, verification and QA. Not scraped exports and approximate job titles. Lists your team can work from without checking them first.",
  },
  {
    title: "Interactive qualification tools",
    description:
      "Assessments, calculators, scorecards and diagnostics that help a buyer understand their own problem while telling you whether they fit. They give the conversation a better reason to continue than an invitation to book a call.",
  },
  {
    title: "Landing flows",
    description:
      "Multi-step landing experiences that turn a campaign click into structured intent. We design the message, the questions, the scoring logic, the routing and the CRM handoff. The page does not only explain the offer. It moves the prospect somewhere.",
  },
  {
    title: "CRM-connected workflows",
    description:
      "We wire campaign activity into the systems your team already uses: HubSpot, Salesforce, Pipedrive, your email platform, your automation tools, your dashboards. Nothing waits in an inbox, no signal is lost, and the work does not turn manual at the moment the campaign starts working.",
  },
  {
    title: "Content and AI operations",
    description:
      "We structure the content underneath the campaigns so people and AI systems can both use it: messaging, proof, FAQs, case studies, sales assets, localised content, metadata and the knowledge you want to reuse. AI-ready content is not a property of the tool. It is work someone has done.",
  },
];

/* Outcome-led proof tiles. Lead with the result; the client is supporting
   evidence in the linked case study. */
const proofTiles = [
  {
    outcome: "Cut localisation cost across multiple markets",
    detail:
      "Cut multilingual content cost by fixing what went into translation before it reached the translators. The saving was not in the translation budget. It was upstream.",
    href: "/case-study/content-localization-15-countrieslanguages",
  },
  {
    outcome: "Rebuilt a CMS migration",
    detail:
      "Rebuilt a CMS migration around how a small marketing team actually works, so the platform earned its keep from the first week rather than the first quarter.",
    href: "/case-study/enterprise-cms-migration-sitecore-optimizely",
  },
  {
    outcome: "Prepared content for AI",
    detail:
      "Built a content taxonomy and metadata layer that made AI search and retrieval actually useful, for a team that had the tools but not the structure underneath them.",
    href: "/case-study/enterprise-content-taxonomy-metadata-architecture",
  },
  {
    outcome: "Turned a stalled intranet investment",
    detail:
      "Turned a stalled intranet investment into a portal employees used daily. No six-figure implementation programme. Fixed scope, fast delivery, measurable adoption from week one.",
    href: "/case-study/sharepoint-intranet-employee-portal-financial-services",
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
  headline: "Find out if AI systems can actually find, trust, and cite your content",
  subhead:
    "Buyers now research through AI answers before they ever reach your site. This audit tests whether your content estate is retrievable and trustworthy to that layer, not how it ranks on a results page.",
  differentiators: [
    "Not another free self-assessment: this is evidence-based, run directly against your actual content, not your team's perception of it.",
    "Not an SEO audit: SEO tools score how a ranking algorithm reads one page at a time. AI answer engines retrieve and weigh passages against everything else you have published, which is a different test entirely.",
  ],
  coverage: [
    {
      title: "Retrievability",
      description:
        "Whether an AI system can find, pull, and cite your content cleanly when it answers a real question a buyer asked about you.",
    },
    {
      title: "Grounding",
      description:
        "Verified by actually running realistic buyer questions through a retrieval test, so every finding is proven, not guessed at from a best-practice checklist.",
    },
    {
      title: "Localisation fidelity",
      description:
        "Whether your non-English content says the same thing as your English content: missing translations, drifted prices and dates, mismatched page structure. A gap no SEO tool or platform-native audit checks at all.",
    },
    {
      title: "Priority",
      description:
        "A ranked shortlist of what to fix first, scored by business impact against effort, not a dump of every issue found.",
    },
  ],
  trustLine:
    "Anything not yet reliably testable is flagged as untested. Never a false clean bill of health.",
  ctaLabel: "Request Your Audit",
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

/* Map an outcome-card icon (Sanity string, or legacy number) to a ServiceIcon index. */
function iconIndex(icon: any): number {
  if (typeof icon === "number") return icon;
  const map: Record<string, number> = { technology: 0, services: 1, localization: 2 };
  return map[icon] ?? 1;
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
  const [homePage, liveBlogPosts] = await Promise.all([
    getHomePage().catch(() => null),
    getBlogPosts(8).catch(() => null),
  ]);

  // Hero, symptoms, and servicesHeading are literal, not Sanity-overridable:
  // this repositioning brief's copy must render as specified, not be
  // shadowed by pre-rewrite content still sitting in Sanity. Same reasoning
  // as the title/description literals in generateMetadata above.
  const heroHeading = fallbackHero.heading;
  const heroBody = fallbackHero.body;
  const heroSupportingLine = fallbackHero.supportingLine;
  const symptoms = fallbackSymptoms;
  const servicesHeading = "What changes when the stack is engineered properly.";
  const servicesSubhead =
    homePage?.servicesSubhead ||
    "The same campaign effort produces more pipeline, because fewer prospects leak between touchpoints you have already paid for.";

  const learnMoreItems =
    homePage?.learnMoreItems?.length ? homePage.learnMoreItems : fallbackLearnMore;

  // Hero buttons
  const heroCtaPrimaryLabel = homePage?.heroCta?.primaryLabel || "Start with the free assessment";
  const heroCtaPrimaryUrl = homePage?.heroCta?.primaryUrl || "/assessments";
  const heroCtaPrimaryNote = homePage?.heroCta?.primaryNote ?? "";
  const heroCtaSecondaryLabel = homePage?.heroCta?.secondaryLabel || "See the work";
  const heroCtaSecondaryUrl = homePage?.heroCta?.secondaryUrl || "/case-study";

  // Symptoms section headings
  const symptomsHeading =
    homePage?.symptomsHeading || "Six signs your outbound stack needs engineering.";
  const symptomsSubhead =
    homePage?.symptomsSubhead ||
    "Any one of these is worth fixing. More than one means the whole stack needs a look.";

  // Outcome cards
  const cards = homePage?.outcomeCards?.length ? homePage.outcomeCards : outcomeCards;

  // Proof band
  const proofHeading = homePage?.proofHeading || "Built, shipped, and working.";
  const proofSubhead =
    homePage?.proofSubhead ||
    "Real outcomes from companies who fixed the operation underneath their pipeline, not just the campaigns on top of it.";
  const proof = homePage?.proofTiles?.length ? homePage.proofTiles : proofTiles;

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
            <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="#ffffff" />
          </svg>
        </div>
      </section>

      {/* ─── CONVERSION LAYER DIAGNOSIS ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-ecm-green font-barlow font-bold text-2xl sm:text-3xl leading-snug mb-6">
            Your campaigns are not broken. The layer between them is.
          </h2>
          <p className="text-ecm-gray-dark text-base leading-relaxed mb-4">
            Most B2B teams already have the parts: a website, a CRM, a few campaigns, some outbound tooling, several years of content, and usually some AI running on top of it. What they do not have is a reliable handoff from one part to the next.
          </p>
          <p className="text-ecm-gray-dark text-base leading-relaxed mb-4">
            So the right people click and then go quiet. Replies arrive and stall. Meetings get booked against opportunities nothing qualified first. The AI tools promise speed, then meet the content and the data as they actually are.
          </p>
          <p className="text-ecm-gray-dark text-base leading-relaxed">
            We engineer that handoff: the conversion layer that carries a prospect from the first sign of interest to an opportunity sales can genuinely work.
          </p>
        </div>
      </section>

      {/* ─── SIX SYMPTOMS ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-ecm-green font-barlow font-bold text-3xl lg:text-4xl text-center mb-4">
            {symptomsHeading}
          </h2>
          {symptomsSubhead && (
            <p className="text-ecm-gray-dark text-center text-base mb-16 max-w-2xl mx-auto">
              {symptomsSubhead}
            </p>
          )}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {symptoms.map((symptom: any, i: number) => (
              <Link
                key={i}
                href="/problems/outbound-conversion"
                className="block bg-ecm-green rounded-xl p-6 sm:p-8 border border-ecm-lime/20 hover:border-ecm-lime/50 transition-all hover:shadow-lg hover:shadow-ecm-lime/5 group"
              >
                <div className="w-10 h-10 bg-ecm-lime rounded-lg flex items-center justify-center mb-4">
                  <span className="text-ecm-green-dark font-barlow font-bold text-lg">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="text-ecm-lime font-barlow font-semibold text-lg mb-3">
                  {symptom.title}
                </h3>
                <p className="text-white/85 text-sm leading-relaxed">
                  {symptom.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-ecm-lime/70 font-barlow font-semibold text-xs group-hover:text-ecm-lime transition-colors">
                  See how we fix it <span aria-hidden="true">&rarr;</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── OUTCOMES (was Services) ─── */}
      <section className="relative pt-28 pb-28 bg-ecm-green">
        {/* Wave divider: white → green (top) */}
        <div className="wave-divider wave-divider-top">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C360,0 1080,120 1440,60 L1440,0 L0,0 Z" fill="#ffffff" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-ecm-lime font-barlow font-bold text-3xl lg:text-4xl text-center mb-4">
            {servicesHeading}
          </h2>
          {servicesSubhead && (
            <p className="text-white/85 text-center text-base mb-16 max-w-2xl mx-auto">
              {servicesSubhead}
            </p>
          )}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {cards.map((card: any, i: number) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur rounded-2xl p-8 text-center border border-white/10"
              >
                <div className="w-16 h-16 bg-ecm-lime/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ServiceIcon index={iconIndex(card.icon)} />
                </div>
                <h3 className="text-white font-barlow font-bold text-xl mb-4">
                  {card.title}
                </h3>
                <p className="text-white/85 text-sm leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link
              href="/assessments"
              className="inline-block bg-ecm-green-dark text-white font-barlow font-semibold px-10 py-4 rounded-full border-2 border-ecm-lime hover:bg-ecm-lime hover:text-ecm-green transition-colors"
            >
              Start with a free assessment
            </Link>
          </div>
        </div>
        {/* Wave divider: green → white (bottom) */}
        <div className="wave-divider wave-divider-bottom">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="#ffffff" />
          </svg>
        </div>
      </section>

      {/* ─── WHAT WE BUILD ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-ecm-green font-barlow font-bold text-3xl lg:text-4xl text-center mb-16">
            What we build.
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whatWeBuild.map((item, i) => (
              <div
                key={i}
                className="bg-ecm-green rounded-xl p-6 sm:p-8 border border-ecm-lime/20"
              >
                <h3 className="text-ecm-lime font-barlow font-semibold text-lg mb-3">
                  {item.title}
                </h3>
                <p className="text-white/85 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROOF (outcome-led case studies) ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-ecm-green font-barlow font-bold text-3xl lg:text-4xl text-center mb-4">
            {proofHeading}
          </h2>
          {proofSubhead && (
            <p className="text-ecm-gray-dark text-center text-base mb-16 max-w-2xl mx-auto">
              {proofSubhead}
            </p>
          )}
          <div className="grid sm:grid-cols-2 gap-6 mb-12">
            {proof.map((tile: any, i: number) => (
              <Link
                key={i}
                href={tile.url ?? tile.href ?? "/case-study"}
                className="block bg-ecm-green rounded-xl p-6 sm:p-8 border border-ecm-lime/20 hover:border-ecm-lime/50 transition-all hover:shadow-lg hover:shadow-ecm-lime/5 group"
              >
                <h3 className="text-ecm-lime font-barlow font-semibold text-lg mb-2 group-hover:text-white transition-colors">
                  {tile.outcome}
                </h3>
                <p className="text-white/85 text-sm leading-relaxed">
                  {tile.detail}
                </p>
              </Link>
            ))}
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

      {/* ─── OFFER LADDER (was engagement tiers) ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-ecm-green font-barlow font-bold text-3xl lg:text-4xl text-center mb-4">
            Three ways to start. One path.
          </h2>
          <p className="text-ecm-gray-dark text-center text-base mb-16 max-w-2xl mx-auto">
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
          <p className="text-center text-ecm-gray-dark text-xs">
            Working at larger scale or need a full content infrastructure audit?{" "}
            <Link href="/content-services" className="underline hover:text-ecm-green">
              Full service range
            </Link>
          </p>
        </div>
      </section>

      {/* ─── AI CONTENT READINESS AUDIT ─── */}
      <section id="audit-request" className="relative pt-28 pb-28 bg-ecm-green">
        {/* Wave divider: white → green (top) */}
        <div className="wave-divider wave-divider-top">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C360,0 1080,120 1440,60 L1440,0 L0,0 Z" fill="#ffffff" />
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
          <p className="text-white/85 text-base sm:text-lg leading-relaxed mb-6 max-w-3xl">
            {auditStrip.subhead}
          </p>
          {/* The two differentiations: versus our own free assessment, versus SEO
              tooling. Kept directly under the subhead so both are readable as
              soon as the section comes into view. */}
          <div className="space-y-2 mb-12 max-w-3xl border-l-2 border-ecm-lime/40 pl-5">
            {auditStrip.differentiators.map((line, i) => (
              <p key={i} className="text-white/75 text-sm leading-relaxed">
                {line}
              </p>
            ))}
          </div>

          <div className="grid lg:grid-cols-5 gap-10 lg:gap-14 items-start">
            {/* Left: what the audit covers */}
            <div className="lg:col-span-3">
              <div className="grid sm:grid-cols-2 gap-6">
                {auditStrip.coverage.map((item, i) => (
                  <div
                    key={item.title}
                    className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10 flex flex-col"
                  >
                    <div className="w-10 h-10 bg-ecm-lime rounded-lg flex items-center justify-center mb-4">
                      <span className="text-ecm-green-dark font-barlow font-bold text-lg">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="text-ecm-lime font-barlow font-semibold text-lg mb-3">
                      {item.title}
                    </h3>
                    <p className="text-white/85 text-sm leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
              <p className="text-white/70 text-sm leading-relaxed mt-6">
                {auditStrip.trustLine}
              </p>
            </div>

            {/* Right: signup. The submit button carries the section CTA label. */}
            <div className="lg:col-span-2 bg-ecm-green-dark/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
              <div className="mb-6 pb-6 border-b border-white/15">
                <h3 className="text-ecm-lime font-barlow font-semibold text-lg mb-3">
                  {auditOffer.heading}
                </h3>
                <p className="text-white/85 text-sm leading-relaxed mb-3">
                  {auditOffer.body}
                </p>
                <p className="text-white/70 text-sm leading-relaxed">
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
            <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="#ffffff" />
          </svg>
        </div>
      </section>

      {/* ─── LATEST INSIGHTS (Blog) ─── */}
      <section className="relative py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-ecm-green font-barlow font-bold text-3xl lg:text-4xl text-center mb-16">
            LATEST INSIGHTS
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {blogPosts.map((post: any, i: number) => (
              <Link
                key={post._id || i}
                href={`/post/${post.slug?.current || post.slug}`}
                className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg shadow-sm transition-shadow group flex flex-col"
              >
                <div className="h-36 overflow-hidden bg-ecm-green/5 flex items-center justify-center border-b border-gray-100">
                  <PostIllustration
                    slug={post.slug?.current || post.slug}
                    mainImage={post.mainImage}
                  />
                </div>
                <div className="p-4 flex flex-col flex-1 bg-gray-50">
                  <h3 className="text-ecm-green font-barlow font-semibold text-sm mb-2 group-hover:text-ecm-green-dark transition-colors leading-snug">
                    {post.title}
                  </h3>
                  {post.publishedAt && (
                    <p className="text-ecm-gray text-xs">
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
      <section className="relative py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-ecm-green font-barlow font-bold text-3xl lg:text-4xl text-center mb-16">
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

/* ─── Service Icons ─── */
function ServiceIcon({ index }: { index: number }) {
  const cls = "w-8 h-8 text-ecm-lime";
  // 0 = Technology (monitor + gear), 1 = Services (clipboard + check), 2 = Localization (globe)
  if (index === 0) {
    return (
      <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" />
      </svg>
    );
  }
  if (index === 1) {
    return (
      <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
      </svg>
    );
  }
  return (
    <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A8.966 8.966 0 013 12c0-1.264.26-2.466.733-3.559" />
    </svg>
  );
}

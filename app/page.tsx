import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import ContactForm from "@/components/ContactForm";
import AuditRequestForm from "@/components/AuditRequestForm";
import LavaBlobs from "@/components/LavaBlobs";
import PostIllustration from "@/components/post/PostIllustration";
import FeaturedCaseStudies from "@/components/FeaturedCaseStudies";
import { getHomePage, getBlogPosts, getFeaturedCaseStudies } from "@/lib/queries";
import { urlFor } from "@/lib/sanity";
import { isAuditOfferOpen } from "@/lib/auditOffer";
import MobileStickyCta from "@/components/MobileStickyCta";
import {
  AUDIT_OFFER_COPY,
  CONTENT_AUDIT,
  DEFAULT_TOOL,
  enquiryHref,
} from "@/lib/offers";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const home = await getHomePage().catch(() => null);
  const seo = home?.seo || {};

  // Title and description are literal, not Sanity-overridable: agreed
  // positioning copy goes through code review, not a CMS edit, so it
  // must render as written rather than be shadowed by a stale
  // seo.metaTitle/metaDescription value still sitting in Sanity.
  const title = "ECM.DEV: Fractional Content Operations and AI Readiness";
  const description =
    "ECM.DEV is a fractional content operations and AI-readiness service. Senior diagnosis, a working system, and ongoing ownership of it, without the salary or the ramp-up of an in-house hire.";

  const ogTitle = "ECM.DEV: Fractional Content Operations and AI Readiness";
  const ogDescription =
    "The alternative to building a content function in-house: senior diagnosis, a working system, and ongoing ownership of it, without the salary or the year it takes a new hire to get up to speed.";

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

/* Hero shortened so the primary action sits higher on a phone: the
   three-pillar explanation moved into the starting-points section below.
   The supporting line names the one tool it describes, because "no email
   gate" is only true of the maturity assessment (the other tools register
   an email first; see UNGATED_SLUGS in app/assessment/[slug]/page.tsx).
   See docs/COMMERCIAL-JOURNEY-2026-09-27.md. */
const fallbackHero = {
  heading: "Content operations and AI readiness, without the hire.",
  body: "A senior content partner for mid-market and owner-managed businesses that have outgrown ad hoc production. We diagnose the problem, build a working system and can take ongoing responsibility for it.",
  supportingLine: `Start with the free ${DEFAULT_TOOL.name}: about ${DEFAULT_TOOL.duration.replace(" min", " minutes")}, result on screen, no email needed. Then decide whether you need expert help.`,
};

/* Three pillars, same wording used in the nav (components/Header.tsx's
   `services` array) and on each pillar's own page, so a visitor reads one
   consistent description of each pillar wherever they meet it. See
   docs/CONTENT-PILLARS-POSITIONING.md and
   docs/SERVICE-CLARITY-AUDIT-2026-09-20.md. */
/* Cards lead with the buyer's problem; the pillar name stays visible as
   the eyebrow so the specialist discipline isn't lost. `entry` names only
   starting points that actually exist: the former "Starts with a
   governance assessment" pointed at no published offer. */
const pillars = [
  {
    title: "Publishing takes too long.",
    pillar: "Content Operations",
    href: "/content-operations",
    blurb:
      "Find where approvals, handoffs and ownership slow work down, then give content an owner and a workflow that holds.",
    entry: "Free maturity self-check, or a Content Audit.",
  },
  {
    title: "Your CMS is getting in the way.",
    pillar: "Content Technology",
    href: "/content-technology",
    blurb:
      "Understand which problems come from the platform and which come from how it is set up, before anyone mentions a migration.",
    entry: "Free cost estimator, or a Content Audit.",
  },
  {
    title: "Localisation costs keep growing.",
    pillar: "Content Localisation",
    href: "/content-localization",
    blurb:
      "Identify the source-content and workflow issues creating avoidable effort in every new language.",
    entry: "Free cost estimator, or a Content Audit.",
  },
];

/* Content Audit strip. Copy is kept as literal constants for the same
   reason firstProject below is: this section carries a hard language
   guardrail (no certification, guarantee or attestation wording, and no implied
   promise that a client's AI is safe or compliant), and that is enforced in
   code review, not in a CMS edit. This is the same Content Audit priced in
   ContentAuditTiers (shared across all three pillar pages) and belongs
   primarily to Content Technology; this strip is the homepage door into it.
   Previously labelled "AI Content Readiness Audit" here while every pillar
   page called the identical product "Content Audit" — one name now, see
   docs/SERVICE-CLARITY-AUDIT-2026-09-20.md. */
const auditStrip = {
  eyebrow: "Content Audit · expert-led",
  headline: "Can AI systems find, trust and reuse your content?",
  /* Condensed to two lines for the homepage strip (the full four-line
     version lives on /content-technology); keeps the buyer-behaviour framing
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
     deadline is what closes the offer. Once the offer window (lib/auditOffer.ts)
     closes, the strip renders `paidOffer` below and the badge disappears. */
  introOffer: {
    badge: `Free for audits requested before ${AUDIT_OFFER_COPY.deadlineLabel}`,
    heading: "Why this one is free",
    body: "This is a new service and it will normally be paid work. We are running it free of charge for audits requested before 30 September, in exchange for a recommendation if the analysis turns out to be something you can use.",
    caveat: `This is a person reviewing your content, not the automated self-check. ${AUDIT_OFFER_COPY.capacity} If we are at capacity we will tell you when we can start rather than leave you waiting. If the findings are not useful, say so and we part on good terms: no recommendation, no invoice, no obligation either way.`,
  },
  /* Shown automatically once the introductory offer closes. No price here by
     design; the homepage strip exists to start a conversation, and the tiers
     and figures live on /content-technology (Content Audit's home pillar;
     ContentAuditTiers is shared across all three pillar pages). */
  paidOffer: {
    heading: "What this costs",
    body: "This is a paid engagement, scoped to the size of your content estate. Tell us what you are working with and we will come back with a scope and a price before any work starts.",
    caveat: "Findings and recommended remediation, delivered as a professional opinion you can act on or argue with.",
    linkLabel: "See the Content Audit tiers",
    linkUrl: `/content-technology#${CONTENT_AUDIT.anchor}`,
  },
  formIntro: "Tell us where to send it. We reply personally, not with an automated report.",
  confirmation: "Thanks, we'll be in touch within one business day.",
};

/* Your first project: the three commitment levels side by side, so a
   visitor can see what each produces, what it costs them and where it
   stops. Replaces the former three-step "How it works" cards, which called
   the first step both "free" and "fixed price" and promised a diagnostic
   credit toward a managed package "within the window", a window that has
   never been defined (open decision in docs/CONTENT-PILLARS-POSITIONING.md).
   Only published terms from lib/offers.ts appear here. Literal, not
   Sanity-sourced: commercial terms go through code review. */
const firstProject = [
  {
    label: "Free self-check",
    title: DEFAULT_TOOL.name,
    rows: [
      ["You get", DEFAULT_TOOL.result],
      ["Commitment", `About ${DEFAULT_TOOL.duration.replace(" min", " minutes")}. No email needed for the result.`],
      ["Fee", "None."],
      ["Boundary", "Indicative, from your own answers. Not a review of your content."],
    ],
    ctaLabel: "Start the free assessment",
    ctaUrl: DEFAULT_TOOL.href,
    secondary: { label: "Or choose a different free tool", url: "/assessments" },
  },
  {
    label: "Expert-led first project",
    title: `${CONTENT_AUDIT.name}: ${CONTENT_AUDIT.snapshot.name}`,
    rows: [
      ["You get", "A review of a real sample of your content, a 5 to 10 page report, your top five findings and a recorded readout."],
      ["Commitment", `${CONTENT_AUDIT.snapshot.duration}. Access to a sample of your content.`],
      ["Fee", `${CONTENT_AUDIT.snapshot.price}, fixed scope. ${CONTENT_AUDIT.snapshot.credit}`],
      ["Boundary", "Diagnosis and priorities. Implementation is not included unless agreed separately."],
    ],
    ctaLabel: "Discuss a Snapshot",
    ctaUrl: enquiryHref("snapshot"),
    secondary: { label: "See both audit depths", url: `/content-technology#${CONTENT_AUDIT.anchor}` },
    featured: true,
  },
  {
    label: "Only if it is worth doing",
    title: "Fixing it, together",
    rows: [
      ["You get", "Ongoing work on your CMS, your operating model or your multilingual content, shaped by what the findings showed."],
      ["Commitment", "A separate agreement, scoped in writing before it starts."],
      ["Fee", "Quoted against the agreed scope."],
      ["Boundary", "Optional. Stopping after the diagnosis, or acting on it yourselves, is a legitimate outcome."],
    ],
    ctaLabel: "Discuss a first project",
    ctaUrl: enquiryHref("first-project"),
  },
];

const journeySteps = [
  { title: "Agree the question", body: "What is slowing you down, and what decision the work should support." },
  { title: "Assess", body: "A free self-check, or an expert review of real evidence." },
  { title: "Review findings together", body: "A written result you can act on, or argue with." },
  { title: "You choose", body: "Stop, act internally, or work with us on the fix." },
];

/* Closing section, immediately above the contact form. Placed last, after
   the proof section, so it reads as the closing argument rather than an
   opener: by this point the visitor has seen the pillars, the audit, the
   offer, and the evidence. */
const whyEcmDev = {
  heading: "Why ecm.dev?",
  body: "There are really only two ways most businesses solve this today: hire for it, or hand tasks to whoever's available and hope the pieces add up to something coherent. Both have a real cost. A hire means recruiting, management time, and months of ramp-up before you see the judgement you're paying for. Handing out tasks means no one owns the outcome, and whatever gets built has to be rebuilt the next time someone new picks it up.",
  closingLine:
    "ECM.DEV is neither: a system that runs without needing to staff for it, the same judgement retained month to month rather than re-hired each time, and an AI-readiness score you could defend to your own board.",
};

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
  "Content operations, without the headcount.",
  "Senior diagnosis. A working system. Ongoing ownership.",
  "Not a hire. Not a freelancer. A retained system.",
  "AI-readiness scored against evidence, not a search-visibility check in disguise.",
  "Provenance, not certification.",
  "The same judgement, retained month to month.",
  "No fixed term. Step away when the system no longer needs us.",
  "Start with a free self-check, or a fixed-scope Content Audit.",
  "The alternative to a year of ramp-up.",
  "A system that runs without needing to staff for it.",
  "An AI-readiness score you could defend to your own board.",
];

/* ─── Page Component ─── */

export default async function HomePage() {
  // Is the introductory (free) audit offer still open? See lib/auditOffer.ts.
  const auditOfferOpen = isAuditOfferOpen();
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

  // Hero buttons. Literal for the same reason as the hero copy: the
  // primary action must go straight to the one tool the supporting line
  // describes, not to a directory of mostly email-gated tools.
  const heroCtaPrimaryLabel = "Start the free assessment";
  const heroCtaPrimaryUrl = DEFAULT_TOOL.href;
  const heroCtaPrimaryNote = DEFAULT_TOOL.duration;
  const heroCtaSecondaryLabel = homePage?.heroCta?.secondaryLabel || "See the work";
  const heroCtaSecondaryUrl = homePage?.heroCta?.secondaryUrl || "/case-study";

  // Starting-points section headings.
  const pillarsHeading = "What is getting in your way?";
  const pillarsSubhead =
    "We work across three pillars: Content Operations, Content Technology and Content Localisation. Start with whichever problem you recognise.";

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
              <p className="mt-4 text-white/70 text-sm">
                <Link href="/assessments" className="underline hover:text-ecm-lime">
                  Choose a different free tool
                </Link>
                <span aria-hidden="true"> · </span>
                <Link href={enquiryHref("first-project")} className="underline hover:text-ecm-lime">
                  Ready to talk? Discuss a first project
                </Link>
              </p>
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

      {/* ─── STARTING POINTS (three pillars, problem-led) ─── */}
      <section className="py-20 bg-surface">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-heading font-barlow font-bold text-3xl lg:text-4xl text-center mb-4">
            {pillarsHeading}
          </h2>
          {pillarsSubhead && (
            <p className="text-ink text-center text-base mb-12 max-w-2xl mx-auto">
              {pillarsSubhead}
            </p>
          )}
          <div className="grid md:grid-cols-3 gap-6">
            {pillars.map((pillar) => (
              <Link
                key={pillar.href}
                href={pillar.href}
                className="group bg-ecm-green rounded-xl p-6 sm:p-8 border border-ecm-lime/20 flex flex-col hover:border-ecm-lime/50 transition-colors"
              >
                <p className="text-ecm-lime/70 font-barlow font-semibold text-xs uppercase tracking-wide mb-2">
                  {pillar.pillar}
                </p>
                <h3 className="text-ecm-lime font-barlow font-bold text-lg sm:text-xl mb-2">
                  {pillar.title}
                </h3>
                <p className="text-white/85 text-sm leading-relaxed mb-4 flex-1">
                  {pillar.blurb}
                </p>
                <p className="text-ecm-lime/70 font-barlow font-semibold text-xs uppercase tracking-wide">
                  {pillar.entry}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-ecm-lime font-barlow font-semibold text-sm group-hover:gap-2 transition-all">
                  See where to start <span aria-hidden="true">&rarr;</span>
                </span>
              </Link>
            ))}
          </div>
          {/* AI readiness is a route across all three pillars, not a fourth
              service: surfaced as one link rather than a fourth card. */}
          <div className="mt-6 rounded-xl border border-surface-border bg-surface-alt px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-ink text-sm leading-relaxed">
              <span className="text-heading font-barlow font-semibold">AI struggles to use your content?</span>{" "}
              That usually crosses all three: structure, ownership and platform.
            </p>
            <Link
              href="/problems/ai-isnt-delivering"
              className="inline-flex items-center gap-1 text-heading font-barlow font-semibold text-sm hover:opacity-80 transition-opacity whitespace-nowrap"
            >
              Explore AI content readiness <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
          <div className="text-center mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <Link
              href="/problems"
              className="inline-flex items-center gap-1 text-heading font-barlow font-semibold text-sm hover:opacity-80 transition-opacity"
            >
              See all the problems we solve <span aria-hidden="true">&rarr;</span>
            </Link>
            <Link
              href={enquiryHref("first-project")}
              className="inline-flex items-center gap-1 text-heading font-barlow font-semibold text-sm hover:opacity-80 transition-opacity"
            >
              Not sure? Discuss a first project <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── YOUR FIRST PROJECT ─── */}
      <section id="first-project" className="py-20 bg-surface scroll-mt-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-heading font-barlow font-bold text-3xl lg:text-4xl text-center mb-4">
            Your first project.
          </h2>
          <p className="text-ink text-center text-base mb-12 max-w-2xl mx-auto">
            Three levels of commitment, the same for every pillar. Each one is
            useful on its own, and none of them commits you to the next.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {firstProject.map((offer) => (
              <div
                key={offer.title}
                className={`rounded-xl p-6 sm:p-8 flex flex-col border ${
                  offer.featured
                    ? "bg-ecm-green border-ecm-lime/40"
                    : "bg-surface-alt border-surface-border"
                }`}
              >
                <p
                  className={`font-barlow font-semibold text-xs uppercase tracking-wide mb-1 ${
                    offer.featured ? "text-ecm-lime/70" : "text-heading/70"
                  }`}
                >
                  {offer.label}
                </p>
                <h3
                  className={`font-barlow font-bold text-xl mb-4 ${
                    offer.featured ? "text-ecm-lime" : "text-heading"
                  }`}
                >
                  {offer.title}
                </h3>
                <dl className="space-y-3 mb-6 flex-1">
                  {offer.rows.map(([term, detail]) => (
                    <div key={term}>
                      <dt
                        className={`font-barlow font-semibold text-xs uppercase tracking-wide ${
                          offer.featured ? "text-ecm-lime/80" : "text-heading"
                        }`}
                      >
                        {term}
                      </dt>
                      <dd
                        className={`text-sm leading-relaxed ${
                          offer.featured ? "text-white/85" : "text-ink"
                        }`}
                      >
                        {detail}
                      </dd>
                    </div>
                  ))}
                </dl>
                <Link
                  href={offer.ctaUrl}
                  className={`inline-flex items-center justify-center font-barlow font-semibold text-sm px-6 py-3 rounded-full transition-colors ${
                    offer.featured
                      ? "bg-ecm-lime text-ecm-green hover:bg-ecm-lime-hover"
                      : "border-2 border-heading text-heading hover:bg-ecm-green hover:text-white"
                  }`}
                >
                  {offer.ctaLabel}
                </Link>
                {offer.secondary && (
                  <Link
                    href={offer.secondary.url}
                    className={`mt-3 text-center text-xs underline ${
                      offer.featured ? "text-ecm-lime hover:text-ecm-lime-hover" : "text-ink hover:text-heading"
                    }`}
                  >
                    {offer.secondary.label}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* How it works: the shared journey, in four steps. */}
          <h3 className="text-heading font-barlow font-bold text-xl text-center mb-6">
            How it works
          </h3>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {journeySteps.map((step, i) => (
              <li
                key={step.title}
                className="rounded-xl border border-surface-border p-5"
              >
                <span className="inline-flex w-8 h-8 bg-ecm-lime rounded-lg items-center justify-center text-ecm-green-dark font-barlow font-bold text-sm mb-3">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-heading font-barlow font-semibold text-base mb-1">{step.title}</p>
                <p className="text-ink text-sm leading-relaxed">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ─── DIAGNOSIS ─── */}
      <section className="py-20 bg-surface">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-heading font-barlow font-bold text-2xl sm:text-3xl leading-snug mb-6">
            Your CMS is not broken. The system around it is.
          </h2>
          <p className="text-ink text-base leading-relaxed mb-4">
            Most organisations already have the parts: a CMS, a content team, a translation process, and usually some AI running on top of all three. What they do not have is an operating system connecting them, so the CMS never quite does what it was bought to do, content has no clear owner once it is published, and every new market costs as much as the last one.
          </p>
          <p className="text-ink text-base leading-relaxed">
            We find out which of the three areas is actually breaking. Then, if you want, we keep fixing it with you, rather than leaving a one-off report that goes out of date within a month.
          </p>
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
              A closer look at outcomes across content technology, operations and localisation.
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
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-14 items-start">
            {/* Left: eyebrow, headline, and what the audit covers, as a
                compact tag row rather than five full description cards.
                Lives inside the grid (rather than spanning full width above
                it) specifically so this column starts level with the form
                card on the right, not just with the tag row. Top-aligned
                rather than vertically centered: centering relied on the
                section's green background to make the balancing whitespace
                read as intentional, which broke under forced-colors mode
                (backgrounds get stripped, leaving an unexplained blank gap
                mid-section). Trailing space below the shorter column is a
                normal, unremarkable pattern in any color scheme. */}
            <div className="lg:col-span-3">
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
              <h2 className="text-ecm-lime font-barlow font-bold text-3xl lg:text-4xl mb-4">
                {auditStrip.headline}
              </h2>
              <div className="mb-4 space-y-1">
                {auditStrip.subhead.map((line, i) => (
                  <p key={i} className="text-white/85 text-base sm:text-lg leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
              {/* Single payoff line replacing the former three-negation stack:
                  same counter-claim, a fraction of the vertical space. */}
              <p className="mb-8 text-ecm-lime font-barlow font-semibold text-sm leading-relaxed border-l-2 border-ecm-lime/40 pl-4">
                {auditStrip.differentiatorLine}
              </p>
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
      <MobileStickyCta
        href={DEFAULT_TOOL.href}
        label={`Free maturity assessment · ${DEFAULT_TOOL.duration}`}
      />
    </>
  );
}

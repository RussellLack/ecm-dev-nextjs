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

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const home = await getHomePage().catch(() => null);
  const seo = home?.seo || {};

  // Title and description are literal, not Sanity-overridable: this is the
  // three-pillar content infrastructure positioning (see
  // docs/CONTENT-PILLARS-POSITIONING.md and
  // docs/SERVICE-CLARITY-AUDIT-2026-09-20.md), and must render as written,
  // not be silently shadowed by a pre-rewrite seo.metaTitle/metaDescription
  // value still sitting in Sanity. Same reasoning as howItWorks below —
  // agreed positioning copy goes through code review, not a CMS edit.
  const title = "ECM.DEV: Content Infrastructure for the AI Enterprise";
  const description =
    "ECM.DEV designs the CMS architecture, governance, and multilingual operations that make content something AI, and your own buyers, can find, trust and reuse. Fixed-scope engagements, clear pricing.";

  const ogTitle = "ECM.DEV: Content Infrastructure for the AI Enterprise";
  const ogDescription =
    "Content Technology, Content Operations, and Content Localisation, run as one system instead of three separate problems.";

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
  heading: "Content infrastructure for the AI enterprise.",
  body: "Most organisations already have a CMS, a content team, and years of content running through both. What's usually missing is the operating system underneath: the architecture, the governance, and the workflow that make it something AI, and your own buyers, can actually find, trust, and reuse.\n\nWe work across three pillars: Content Technology (your CMS and platforms), Content Operations (governance, ownership, workflow), and Content Localisation (multilingual content at AI speed).",
  supportingLine:
    "Content-heavy organisations get a structural audit, not a subscription tool.",
};

/* Three pillars, same wording used in the nav (components/Header.tsx's
   `services` array) and on each pillar's own page, so a visitor reads one
   consistent description of each pillar wherever they meet it. See
   docs/CONTENT-PILLARS-POSITIONING.md and
   docs/SERVICE-CLARITY-AUDIT-2026-09-20.md. */
const pillars = [
  {
    title: "Content Technology",
    href: "/content-technology",
    blurb:
      "Your CMS, your platforms, and the data connecting them, run as one system instead of three separate problems.",
    entry: "Starts with a Content Audit.",
  },
  {
    title: "Content Operations",
    href: "/content-operations",
    blurb:
      "Content that has an owner, a workflow, and someone accountable for keeping it that way.",
    entry: "Starts with a governance assessment.",
  },
  {
    title: "Content Localisation",
    href: "/content-localization",
    blurb:
      "Multilingual content that holds up under AI-assisted translation, checked continuously, not once a year.",
    entry: "Starts with the Localisation Cost Estimator.",
  },
];

/* Content Audit strip. Copy is kept as literal constants for the same
   reason howItWorks below is: this section carries a hard language
   guardrail (no certification, guarantee or attestation wording, and no implied
   promise that a client's AI is safe or compliant), and that is enforced in
   code review, not in a CMS edit. This is the same Content Audit priced in
   ContentAuditTiers (shared across all three pillar pages) and belongs
   primarily to Content Technology; this strip is the homepage door into it.
   Previously labelled "AI Content Readiness Audit" here while every pillar
   page called the identical product "Content Audit" — one name now, see
   docs/SERVICE-CLARITY-AUDIT-2026-09-20.md. */
const auditStrip = {
  eyebrow: "Content Audit",
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
    badge: "Free for audits requested before 30 September",
    heading: "Why this one is free",
    body: "This is a new service and it will normally be paid work. We are running it free of charge for audits requested before 30 September, in exchange for a recommendation if the analysis turns out to be something you can use.",
    caveat: "We take on five at a time, so if we are at capacity we will tell you when we can start rather than leave you waiting. If the findings are not useful, say so and we part on good terms: no recommendation, no invoice, no obligation either way.",
  },
  /* Shown automatically once the introductory offer closes. No price here by
     design; the homepage strip exists to start a conversation, and the tiers
     and figures live on /content-technology (Content Audit's home pillar;
     ContentAuditTiers is shared across all three pillar pages). */
  paidOffer: {
    heading: "What this costs",
    body: "This is a paid engagement, scoped to the size of your content estate. Tell us what you are running and we will come back with a scope and a price before any work starts.",
    caveat: "Findings and recommended remediation, delivered as a professional opinion you can act on or argue with.",
    linkLabel: "See the Content Audit tiers",
    linkUrl: "/content-technology",
  },
  formIntro: "Tell us where to send it. We reply personally, not with an automated report.",
  confirmation: "Thanks, we'll be in touch within one business day.",
};

/* How an engagement starts, for each of the three pillars. Kept as literal
   constants rather than Sanity-sourced: agreed positioning copy should go
   through code review, not a CMS edit. Mirrors the "priced, bounded
   onboarding deliverable first, managed package as the sales objective"
   mechanic in docs/CONTENT-PILLARS-POSITIONING.md, without inventing figures
   for the two managed packages that doc leaves open. */
const howItWorks = [
  {
    step: "01",
    title: "Start with a diagnostic",
    tagline: "A Content Audit, a governance assessment, or the Localisation Cost Estimator.",
    subtitle: "Whichever pillar you start with, fixed scope, fixed price.",
    body: "ecm-agent scans your actual content estate rather than relying on self-reporting. A written finding either way: something you can act on, or argue with.",
    ctaLabel: "Take the free assessment",
    ctaUrl: "/assessments",
  },
  {
    step: "02",
    title: "See the findings in writing",
    tagline: "A report you can act on, or argue with.",
    subtitle: "Real findings from your actual estate, not a self-assessment questionnaire.",
    body: "A live readout with the person who wrote it, not a generated PDF. If the findings aren't useful, say so, we part on good terms: no obligation either way.",
    ctaLabel: "Talk to us directly",
    ctaUrl: "/contact",
  },
  {
    step: "03",
    title: "Turn it into a managed package",
    tagline: "Or don't. Both are a legitimate outcome.",
    subtitle: "The diagnostic cost credits toward a managed package if you sign within the window.",
    body: "Ongoing work on your CMS, your operating model, or your multilingual content, depending on which pillar you started with. The diagnostic proves there is a problem worth fixing. The managed package is where the fix actually happens.",
    ctaLabel: "Talk about a managed package",
    ctaUrl: "/contact",
  },
];

/* Closing section, immediately above the contact form. Placed last, after
   the proof section, so it reads as the closing argument rather than an
   opener: by this point the visitor has seen the pillars, the audit, the
   offer, and the evidence. */
const whyEcmDev = {
  heading: "Why ecm.dev?",
  body: "Most agencies own the content. Most platform consultancies own the CMS. Few own both, which is exactly where content actually breaks: the technology, the operating model, and the language it has to work in, treated as one connected system instead of three separate vendors.",
  closingLine:
    "ECM.DEV is the practice for organisations that need their content to hold up under AI, not just look right to a person scrolling past it.",
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
  "Content infrastructure for the AI enterprise.",
  "A CMS is a system. Treat it like one.",
  "AI doesn't fix content. It finds out how bad it already was.",
  "Structured content converts. Unstructured content costs.",
  "Governance is not a document nobody reads.",
  "An audit is evidence, not an opinion.",
  "Findable, trustable, reusable, or none of it works.",
  "The technology, the operating model, the language. One system.",
  "Multilingual content that holds up, not just translates.",
  "Content is infrastructure now.",
  "Fixed scope. Fixed price. A written finding either way.",
  "Every market should not cost more than the last.",
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

  // Hero buttons
  const heroCtaPrimaryLabel = homePage?.heroCta?.primaryLabel || "Start with the free assessment";
  const heroCtaPrimaryUrl = homePage?.heroCta?.primaryUrl || "/assessments";
  const heroCtaPrimaryNote = homePage?.heroCta?.primaryNote ?? "";
  const heroCtaSecondaryLabel = homePage?.heroCta?.secondaryLabel || "See the work";
  const heroCtaSecondaryUrl = homePage?.heroCta?.secondaryUrl || "/case-study";

  // Three-pillars section headings.
  const pillarsHeading =
    homePage?.symptomsHeading || "Three pillars, one operating system.";
  const pillarsSubhead =
    homePage?.symptomsSubhead ||
    "Content Technology, Content Operations, and Content Localisation. Start with whichever one hurts most.";

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
            We find out which of the three areas is actually breaking. Then, if you want, we keep fixing it as a managed package, not a one-off report that goes out of date within a month.
          </p>
        </div>
      </section>

      {/* ─── THREE PILLARS ─── */}
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
                  See the service <span aria-hidden="true">&rarr;</span>
                </span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/problems"
              className="inline-flex items-center gap-1 text-heading font-barlow font-semibold text-sm hover:opacity-80 transition-opacity"
            >
              Not sure which one? See the problems we solve <span aria-hidden="true">&rarr;</span>
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

      {/* ─── OFFER LADDER (was engagement tiers) ─── */}
      <section className="py-20 bg-surface">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-heading font-barlow font-bold text-3xl lg:text-4xl text-center mb-4">
            How it works.
          </h2>
          <p className="text-ink text-center text-base mb-16 max-w-2xl mx-auto">
            The same pattern for all three services: a fixed-price diagnostic first, then ongoing support to fix it properly, if that is worth doing.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {howItWorks.map((step) => (
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
            Working at larger scale or need the full content infrastructure picture?{" "}
            <Link href="/content-operations" className="underline hover:text-heading">
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

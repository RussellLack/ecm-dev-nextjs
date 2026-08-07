import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import ContactForm from "@/components/ContactForm";
import LearnMoreSection from "@/components/LearnMoreSection";
import LavaBlobs from "@/components/LavaBlobs";
import PostIllustration from "@/components/post/PostIllustration";
import { getHomePage, getBlogPosts } from "@/lib/queries";
import { urlFor } from "@/lib/sanity";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const home = await getHomePage().catch(() => null);
  const seo = home?.seo || {};

  // Title precedence: editor seo override → derived from heroHeading →
  // root-layout default. We deliberately render the title as a literal
  // (not template) when an editor has set seo.metaTitle so they have
  // full control over the brand-name placement.
  const title =
    seo.metaTitle ||
    `${home?.heroHeading || "Content Infrastructure for Enterprise Marketing"} | ECM.DEV`;

  // Description: seo override → first 155 chars of heroBody → fallback.
  const heroBlurb = home?.heroBody
    ? String(home.heroBody).split(/\n+/)[0].slice(0, 155).trim()
    : null;
  const description =
    seo.metaDescription ||
    heroBlurb ||
    "ECM.DEV helps enterprise organisations build the content infrastructure behind modern marketing, so campaigns, localisation, personalisation, and AI keep up with the ambition.";

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
      title,
      description,
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

/* ─── Static fallback data (used when Sanity fields are empty) ─── */

const fallbackHero = {
  heading: "Marketing isn't slowing down. Your content infrastructure is.",
  body: "Campaigns, localisation, personalisation, AI: every one now depends on structured content operations underneath. When that layer is missing, marketing gets slower, costs climb, and the results never quite arrive.\n\nECM.DEV helps enterprise organisations build the content infrastructure behind modern marketing, so the systems keep up with the ambition.",
};

const fallbackSymptoms = [
  {
    title: "AI Initiatives Stall or Fail",
    description:
      "Fragmented, ungoverned content makes AI outputs unreliable, so enterprise adoption stalls and the investment underperforms.",
  },
  {
    title: "CMS Investment Fails to Deliver",
    description:
      "The platform is rarely the problem. Without operational design, an enterprise CMS becomes an expensive container for chaos.",
  },
  {
    title: "Localisation Costs Escalate",
    description:
      "Without structured source content, every new market adds disproportionate cost and delay.",
  },
  {
    title: "Personalisation Fails at Scale",
    description:
      "Without structured, tagged content, the right asset cannot reach the right context at the right time.",
  },
  {
    title: "Content Teams Absorb System Failure",
    description:
      "When the system does not do the work, people do. Teams compensate through effort until it breaks.",
  },
  {
    title: "Governance Gaps Create Exposure",
    description:
      "AI assistants surface whatever your content systems hold. Without governance, that includes what was never meant to be seen.",
  },
];

/* Outcome cards replace the old capability columns. Each names a business
   outcome and links down to the service page that delivers it. */
const outcomeCards = [
  {
    title: "Scale Marketing Operations",
    description:
      "Ship more, faster, with the team you already have. We find where your content operation leaks time and value, then rebuild that part of the system.",
    href: "/solutions/improve-campaign-velocity",
    icon: 1,
  },
  {
    title: "Accelerate Global Marketing",
    description:
      "Enter new markets without the cost spiral. We fix the system around translation, from source content to in-market findability.",
    href: "/solutions/scale-global-marketing",
    icon: 2,
  },
  {
    title: "Unlock AI & MarTech Value",
    description:
      "Make the platforms and AI you have already paid for finally perform. We fix the operational layer that decides whether they deliver.",
    href: "/solutions/increase-cms-roi",
    icon: 0,
  },
];

/* Outcome-led proof tiles. Lead with the result; the client is supporting
   evidence in the linked case study. */
const proofTiles = [
  {
    outcome: "Cut localisation cost across 15+ markets",
    detail: "by fixing source content before it reached translation.",
    href: "/case-study/content-localization-15-countrieslanguages",
  },
  {
    outcome: "Rebuilt an enterprise CMS migration",
    detail: "around how teams actually work, so the platform earned its keep.",
    href: "/case-study/enterprise-cms-migration-sitecore-optimizely",
  },
  {
    outcome: "Prepared enterprise content for AI",
    detail: "with a taxonomy and metadata layer AI and search could rely on.",
    href: "/case-study/enterprise-content-taxonomy-metadata-architecture",
  },
  {
    outcome: "Turned a stalled intranet investment",
    detail: "into an adopted employee portal across a multilingual workforce.",
    href: "/case-study/sharepoint-intranet-employee-portal-financial-services",
  },
];

/* Engagement tiers for ecm-agent, the ECM.DEV Content AI-Readiness Audit.
   Kept as literal constants rather than Sanity-sourced: engagement pricing
   should go through code review, not a CMS edit. The free assessment above
   this section is self-reported; every tier here scans the buyer's actual
   content, which is the distinction the section exists to make unmistakable. */
const engagementTiers = [
  {
    step: "1",
    kicker: "Start here — free",
    title: "Self-assessment",
    price: "Free",
    meta: "10 minutes · self-scored",
    description:
      "Score your own marketing operation across strategy, workflow, technology, governance, measurement, and AI readiness. An executive-ready readout, not a sales call.",
    ctaLabel: "Start free",
    ctaUrl: "/assessments",
  },
  {
    step: "2",
    kicker: "Paid front door",
    title: "Snapshot",
    price: "€2,000–€3,000",
    meta: "5–7 business days · a real sample of your estate",
    description:
      "ecm-agent scans a genuine sample of your content, up to 100 items or 10% of the estate. A 5–10 page report, your top five findings, and one or two shown actually failing in an AI answer. 45-minute recorded readout.",
    note: "100% credited toward a Full Estate Audit if you sign within 30 days.",
    ctaLabel: "Book a Snapshot",
    ctaUrl: "/contact",
  },
  {
    step: "3",
    kicker: "The product",
    title: "Full Estate Audit",
    price: "€12,000–€15,000",
    meta: "3–4 weeks · your whole estate",
    description:
      "Every finding family available, scored across your full content estate, and a 20–30 page board-ready report with a costed remediation roadmap. 90-minute stakeholder readout, plus two weeks of async Q&A.",
    ctaLabel: "Talk about a Full Audit",
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

/* Route each homepage symptom to the matching Problems We Solve page. */
function symptomHref(title: string): string {
  const t = (title || "").toLowerCase();
  if (t.includes("cms")) return "/problems/our-cms-isnt-creating-value";
  if (t.includes("localis")) return "/problems/localisation-costs-keep-growing";
  if (t.includes("team") || t.includes("governance")) return "/problems/our-teams-work-in-silos";
  if (t.includes("ai") || t.includes("personalis")) return "/problems/ai-isnt-delivering";
  return "/problems";
}

/* Map an outcome-card icon (Sanity string, or legacy number) to a ServiceIcon index. */
function iconIndex(icon: any): number {
  if (typeof icon === "number") return icon;
  const map: Record<string, number> = { technology: 0, services: 1, localization: 2 };
  return map[icon] ?? 1;
}

/* Fallback ticker phrases (used when Sanity tickerPhrases is empty). */
const fallbackTicker = [
  "Content is infrastructure now.",
  "You don't have a content problem.",
  "Transformation fails at the content layer.",
  "Content friction is customer friction.",
  "The bottleneck is the workflow.",
  "Broken inputs. Broken outputs. Always.",
  "Faster campaigns start upstream.",
  "Every market shouldn't cost more than the last.",
  "Your platform isn't the problem.",
  "AI without governance is chaos.",
  "Velocity without governance is liability.",
  "Structure today. Intelligence tomorrow.",
  "Localisation is system design.",
  "Knowledge is only as good as retrieval.",
  "Content that can't scale, won't.",
  "Good architecture is invisible.",
  "Information flows before AI wins.",
  "Unfindable information doesn't exist.",
];

/* ─── Page Component ─── */

export default async function HomePage() {
  // Fetch Sanity data in parallel
  const [homePage, liveBlogPosts] = await Promise.all([
    getHomePage().catch(() => null),
    getBlogPosts(8).catch(() => null),
  ]);

  // Merge Sanity data with fallbacks
  const heroHeading = homePage?.heroHeading || fallbackHero.heading;
  const heroBody = homePage?.heroBody || fallbackHero.body;
  const symptoms = homePage?.symptoms?.length ? homePage.symptoms : fallbackSymptoms;
  const servicesHeading =
    homePage?.servicesHeading || "What changes when the infrastructure is right";

  const learnMoreItems =
    homePage?.learnMoreItems?.length ? homePage.learnMoreItems : fallbackLearnMore;

  // Hero buttons
  const heroCtaPrimaryLabel = homePage?.heroCta?.primaryLabel || "Assess your content infrastructure";
  const heroCtaPrimaryUrl = homePage?.heroCta?.primaryUrl || "/assessments";
  const heroCtaPrimaryNote = homePage?.heroCta?.primaryNote ?? "10 min";
  const heroCtaSecondaryLabel = homePage?.heroCta?.secondaryLabel || "Explore the guides";
  const heroCtaSecondaryUrl = homePage?.heroCta?.secondaryUrl || "/guides";

  // Symptoms section headings
  const symptomsHeading =
    homePage?.symptomsHeading || "You probably recognise at least one of these.";
  const symptomsSubhead =
    homePage?.symptomsSubhead ||
    "Six symptoms. One underlying cause: content was never built as infrastructure.";

  // Outcome cards
  const cards = homePage?.outcomeCards?.length ? homePage.outcomeCards : outcomeCards;

  // Proof band
  const proofHeading = homePage?.proofHeading || "Fix the system, and the results follow.";
  const proofSubhead =
    homePage?.proofSubhead ||
    "Real outcomes from enterprise teams who fixed the operation underneath their content, not just the content itself.";
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
                href={symptomHref(symptom.title)}
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
          <h2 className="text-ecm-lime font-barlow font-bold text-3xl lg:text-4xl text-center mb-16">
            {servicesHeading}
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {cards.map((card: any, i: number) => (
              <Link
                key={i}
                href={card.url ?? card.href ?? "/solutions"}
                className="service-card bg-white/10 backdrop-blur rounded-2xl p-8 text-center group border border-white/10 hover:border-ecm-lime/30 transition-all hover:shadow-lg hover:shadow-ecm-lime/5"
              >
                <div className="w-16 h-16 bg-ecm-lime/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ServiceIcon index={iconIndex(card.icon)} />
                </div>
                <h3 className="text-white font-barlow font-bold text-xl mb-4 group-hover:text-ecm-lime transition-colors">
                  {card.title}
                </h3>
                <p className="text-white/85 text-sm leading-relaxed">
                  {card.description}
                </p>
              </Link>
            ))}
          </div>
          <div className="text-center">
            <Link
              href="/assessments"
              className="inline-block bg-ecm-green-dark text-white font-barlow font-semibold px-10 py-4 rounded-full border-2 border-ecm-lime hover:bg-ecm-lime hover:text-ecm-green transition-colors"
            >
              ASSESS YOUR INFRASTRUCTURE
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
              SEE THE CASE STUDIES
            </Link>
          </div>
        </div>
      </section>

      {/* ─── ENGAGEMENT TIERS (ecm-agent) ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-ecm-green/70 font-barlow font-semibold text-xs tracking-widest uppercase mb-3">
            Content AI-Readiness Audit
          </p>
          <h2 className="text-ecm-green font-barlow font-bold text-3xl lg:text-4xl text-center mb-4">
            One question. Three depths of proof.
          </h2>
          <p className="text-ecm-gray-dark text-center text-base mb-4 max-w-2xl mx-auto">
            Content used to be read. Now it gets reused by AI. Our assessments prove your content is safe to reuse: current, consistent, and trustworthy, not just present.
          </p>
          <p className="text-ecm-gray-dark text-center text-base mb-16 max-w-3xl mx-auto">
            Start with the ten-minute self-assessment to frame some of the current challenges. Our paid assessments check two basic things first: does your content actually cover what an AI needs to draw on, and is it current and consistent rather than contradicting itself. It then checks whether that content is written so an AI can pull a clean answer out of it, and on the full audit it separately flags when the real problem is the AI setup itself rather than the content, so you don't fix the wrong thing. It also checks consistency across languages.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {engagementTiers.map((tier) => (
              <div
                key={tier.step}
                className="relative bg-ecm-green rounded-xl p-6 sm:p-8 border border-ecm-lime/20 flex flex-col"
              >
                <div className="w-10 h-10 bg-ecm-lime rounded-lg flex items-center justify-center mb-4">
                  <span className="text-ecm-green-dark font-barlow font-bold text-lg">{tier.step}</span>
                </div>
                <p className="text-ecm-lime/70 font-barlow font-semibold text-xs uppercase tracking-wide mb-1">
                  {tier.kicker}
                </p>
                <h3 className="text-ecm-lime font-barlow font-bold text-xl mb-1">{tier.title}</h3>
                <p className="text-white font-barlow font-bold text-2xl mb-1">{tier.price}</p>
                <p className="text-white/60 text-xs mb-4">{tier.meta}</p>
                <p className="text-white/85 text-sm leading-relaxed mb-4 flex-1">{tier.description}</p>
                {tier.note && (
                  <p className="text-ecm-lime/80 text-xs italic mb-4">{tier.note}</p>
                )}
                <Link
                  href={tier.ctaUrl}
                  className="inline-flex items-center justify-center bg-ecm-lime text-ecm-green font-barlow font-semibold text-sm px-6 py-3 rounded-full hover:bg-ecm-lime-hover transition-colors mt-auto"
                >
                  {tier.ctaLabel}
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-ecm-gray-dark text-sm max-w-2xl mx-auto">
            After the audit: a fixed-price remediation sprint (&euro;6,000&ndash;&euro;10,000) turns the roadmap into reviewable diffs you accept or reject, or a re-audit (&euro;4,000&ndash;&euro;6,000) measures what changed. Nothing is auto-applied.
          </p>
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
        href="/assessments"
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

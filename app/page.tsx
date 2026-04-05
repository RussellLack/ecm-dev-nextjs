import Link from "next/link";
import Image from "next/image";
import ContactForm from "@/components/ContactForm";
import TestimonialsClient from "@/components/TestimonialsClient";
import LavaBlobs from "@/components/LavaBlobs";
import { getHomePage, getBlogPosts } from "@/lib/queries";
import { urlFor } from "@/lib/sanity";

export const revalidate = 60;

/* ─── Static fallback data (used when Sanity fields are empty) ─── */

const fallbackHero = {
  heading: "Content Infrastructure for the AI Enterprise",
  body: "Most organisations treat content as marketing output. They invest in platforms, headcount, and campaigns — then wonder why AI surfaces the wrong answers, personalisation fails at scale, and localisation costs continue to rise. The issue is not capability or technology. It is that content has never been treated as infrastructure.\n\nWe design the operating systems, governance frameworks, and structured workflows that turn content into a reliable, AI-ready asset.",
};

const fallbackSymptoms = [
  {
    title: "AI Initiatives Stall or Fail",
    description:
      "Fragmented, ungoverned content makes AI outputs unreliable — and enterprise adoption stalls.",
  },
  {
    title: "CMS Investment Fails to Deliver",
    description:
      "Platform selection is rarely the problem. Without operational design, enterprise CMS becomes an expensive container for chaos.",
  },
  {
    title: "Localisation Costs Escalate",
    description:
      "Without structured source content and governance, every new market adds disproportionate overhead.",
  },
  {
    title: "Personalisation Fails at Scale",
    description:
      "Without structured, tagged content, the right asset cannot reach the right context at the right time.",
  },
  {
    title: "Content Teams Absorb System Failure",
    description:
      "When automation is absent, teams compensate through effort — masking the real cost until it breaks.",
  },
  {
    title: "Governance Gaps Create Exposure",
    description:
      "In Microsoft environments, Copilot surfaces whatever SharePoint holds — including what was never meant to be seen.",
  },
];

const fallbackServices = [
  {
    title: "CONTENT TECHNOLOGY",
    description:
      "that is fit-for-purpose, consistently used and fully-integrated with digital marketing and sales objectives.",
    href: "/content-technology",
  },
  {
    title: "CONTENT SERVICES",
    description:
      "that turn business, marketing and sales strategies into continuously improving content workflows.",
    href: "/content-services",
  },
  {
    title: "CONTENT LOCALIZATION",
    description:
      "that ensures that whichever language and geography is your target, content is adapted to reflect the needs and preferences of local market audiences.",
    href: "/content-localization",
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

const fallbackTestimonials = [
  {
    name: "Satya Nadella",
    role: "Chairman & CEO, Microsoft",
    quote: "\u201CAI is only as good as the data and knowledge you put into it.\u201D",
    commentary:
      "In organisations, \u201Cknowledge\u201D lives in: documents, policies, product content, metadata. Enterprise AI runs on enterprise content.",
  },
  {
    name: "Fei-Fei Li",
    role: "Co-Director, Stanford Human-Centered AI Institute",
    quote:
      "\u201CThere is nothing artificial about intelligence that lacks human context, values, and understanding.\u201D",
    commentary:
      "Context, values, and intent come from how content is created, structured, and governed.",
  },
  {
    name: "Jeff Coyle",
    role: "Co-Founder & CPO, MarketMuse",
    quote:
      "\u201CBrands that use AI well don\u2019t just create more content \u2014 they create better-structured, more meaningful content.\u201D",
    commentary:
      "This is where theory meets operations. AI performance improves with content maturity.",
  },
  {
    name: "Yann LeCun",
    role: "Chief AI Scientist, Meta",
    quote:
      "\u201CThe real challenge for AI is not algorithms, but giving systems the right representations of the world.\u201D",
    commentary:
      "Representation = structure, semantics, relationships. This is content architecture.",
  },
];

const fallbackBlogPosts = [
  { title: "Kentico CMS Cadence Cuts Migration Risk", date: "Sep 16, 2025", slug: "kentico-cadence-cuts-migration-risk" },
  { title: "Agentic CX: From Journeys to Agents", date: "Sep 15, 2025", slug: "agentic-cx-from-journeys-to-agents" },
  { title: "Sanity CMS Upgrades Speed CX Delivery", date: "Sep 12, 2025", slug: "sanity-cms-upgrades-speed-cx-delivery" },
  { title: "Unlocking Sitecore productivity", date: "Sep 12, 2025", slug: "sitecore-productivity-and-roi" },
  { title: "Ibexa v5: Europe\u2019s B2B DXP", date: "Sep 9, 2025", slug: "ibexa-v5-europe-s-b2b-dxp" },
  { title: "Hyland Content Innovation Cloud", date: "Aug 28, 2025", slug: "hyland-content-innovation-cloud" },
  { title: "Contentful AI Workflows Boost Speed", date: "Aug 20, 2025", slug: "contentful-ai-workflows-boost-speed" },
  { title: "Optimizely AEO/GEO: AI Visibility", date: "Aug 15, 2025", slug: "optimizely-aeo-geo-ai-visibility" },
];

/* ─── Helpers ─── */

function categoryToHref(category: string): string {
  const map: Record<string, string> = {
    technology: "/content-technology",
    services: "/content-services",
    localization: "/content-localization",
  };
  return map[category] || "/content-technology";
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

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
  const servicesHeading = homePage?.servicesHeading || "SERVICES";

  const services =
    homePage?.services?.length
      ? homePage.services.map((s: any) => ({
          title: s.title,
          description: s.summary || "",
          href: categoryToHref(s.category),
        }))
      : fallbackServices;

  const learnMoreItems =
    homePage?.learnMoreItems?.length ? homePage.learnMoreItems : fallbackLearnMore;

  const testimonials =
    homePage?.testimonials?.length ? homePage.testimonials : fallbackTestimonials;

  const ctaHeading = homePage?.ctaHeading || "READY FOR YOUR";
  const ctaSubheading = homePage?.ctaSubheading || "BUSINESS TO GROW?";

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
          {/* Single centered text panel — full width on mobile, max-w-3xl on desktop */}
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
          <h2 className="text-ecm-green font-barlow font-bold text-3xl lg:text-4xl text-center mb-16">
            Six symptoms. One underlying cause.
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {symptoms.map((symptom: any, i: number) => (
              <div
                key={i}
                className="bg-ecm-green rounded-xl p-6 sm:p-8 border border-ecm-lime/20 hover:border-ecm-lime/50 transition-all hover:shadow-lg hover:shadow-ecm-lime/5 group"
              >
                <div className="w-10 h-10 bg-ecm-lime/15 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-ecm-lime font-barlow font-bold text-lg">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="text-ecm-lime font-barlow font-semibold text-lg mb-3">
                  {symptom.title}
                </h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  {symptom.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─── */}
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
            {services.map((service: any, i: number) => (
              <Link
                key={i}
                href={service.href}
                className="service-card bg-white/10 backdrop-blur rounded-2xl p-8 text-center group border border-white/10 hover:border-ecm-lime/30 transition-all hover:shadow-lg hover:shadow-ecm-lime/5"
              >
                <div className="w-16 h-16 bg-ecm-lime/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ServiceIcon index={i} />
                </div>
                <h3 className="text-white font-barlow font-bold text-xl mb-4 group-hover:text-ecm-lime transition-colors">
                  {service.title}
                </h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  {service.description}
                </p>
              </Link>
            ))}
          </div>
          <div className="text-center">
            <Link
              href="/content-technology"
              className="inline-block bg-ecm-green-dark text-white font-barlow font-semibold px-10 py-4 rounded-full border-2 border-ecm-lime hover:bg-ecm-lime hover:text-ecm-green transition-colors"
            >
              GET STARTED
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

      {/* ─── LEARN MORE ─── */}
      <section className="relative py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-ecm-green font-barlow font-bold text-3xl lg:text-4xl text-center mb-16">
            LEARN MORE
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {learnMoreItems.map((item: any, i: number) => (
              <Link
                key={i}
                href={`/contact?topic=${encodeURIComponent(item.title)}`}
                className="bg-ecm-green rounded-xl p-6 border border-ecm-lime/15 hover:border-ecm-lime/40 transition-all group hover:shadow-lg hover:shadow-ecm-lime/5 block"
              >
                <h3 className="text-ecm-lime font-barlow font-semibold text-base mb-2">
                  {item.title}
                </h3>
                <p className="text-white/60 text-sm mb-4">{item.subtitle}</p>
                <span className="inline-block bg-ecm-lime text-ecm-green text-xs font-barlow font-semibold px-4 py-2 rounded-full group-hover:bg-ecm-lime-hover transition-colors">
                  READ MORE
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LATEST INSIGHTS (Blog) ─── */}
      <section className="relative py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-ecm-green font-barlow font-bold text-3xl lg:text-4xl text-center mb-16">
            LATEST INSIGHTS
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {blogPosts.map((post: any, i: number) => (
              <Link
                key={i}
                href={`/post/${post.slug?.current || post.slug}`}
                className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-ecm-lime/30 shadow-sm hover:shadow-md transition-all group"
              >
                {post.mainImage ? (
                  <div className="relative h-32 sm:h-36 lg:h-40">
                    <Image
                      src={urlFor(post.mainImage).width(400).height(240).url()}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                ) : (
                  <div className="h-40 bg-ecm-green/10 flex items-center justify-center">
                    <div className="w-12 h-12 bg-ecm-green/20 rounded-lg" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-ecm-green font-barlow font-semibold text-sm mb-2 group-hover:text-ecm-lime transition-colors leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-ecm-gray text-xs">{post.date}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center">
            <Link
              href="/blog"
              className="inline-block bg-ecm-green text-white font-barlow font-semibold px-8 py-3 rounded-full hover:bg-ecm-green-dark transition-colors"
            >
              READ MORE
            </Link>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS MARQUEE ─── */}
      <section className="bg-ecm-green py-3 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap">
          <span className="text-ecm-lime font-bold text-xl lg:text-2xl mx-8" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
            AI runs on content.
          </span>
          <span className="text-ecm-lime font-bold text-xl lg:text-2xl mx-8" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
            AI runs on content.
          </span>
          <span className="text-ecm-lime font-bold text-xl lg:text-2xl mx-8" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
            AI runs on content.
          </span>
          <span className="text-ecm-lime font-bold text-xl lg:text-2xl mx-8" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
            AI runs on content.
          </span>
        </div>
      </section>

      {/* ─── TESTIMONIALS CAROUSEL ─── */}
      <TestimonialsClient testimonials={testimonials} />

      {/* ─── CTA ─── */}
      <section className="relative pt-28 pb-24 bg-ecm-green text-center overflow-hidden">
        {/* Wave divider: white → green (top) */}
        <div className="wave-divider wave-divider-top">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C360,0 1080,120 1440,60 L1440,0 L0,0 Z" fill="#ffffff" />
          </svg>
        </div>
        <LavaBlobs variant="lime" opacity={0.35} count={5} />
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <div className="bg-ecm-green-dark/60 backdrop-blur-sm rounded-2xl border border-ecm-lime/15 px-8 sm:px-12 py-12 sm:py-16">
            <h2 className="text-ecm-lime font-barlow font-bold text-3xl sm:text-4xl lg:text-5xl mb-2">
              {ctaHeading}
            </h2>
            <h2 className="text-ecm-lime font-barlow font-bold text-3xl sm:text-4xl lg:text-5xl mb-8">
              {ctaSubheading}
            </h2>
          <Link
            href="/contact"
            className="inline-block bg-ecm-lime text-ecm-green font-barlow font-bold text-xl px-12 py-4 rounded-full hover:bg-ecm-lime-hover transition-colors"
          >
            CONTACT US
          </Link>
          </div>
        </div>
      </section>

      {/* ─── CONTACT ─── */}
      <ContactForm />
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

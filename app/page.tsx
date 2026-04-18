import Link from "next/link";
import ContactForm from "@/components/ContactForm";

/* ─── Static fallback data (replace with Sanity queries once connected) ─── */

const heroData = {
  heading: "Content Infrastructure for the AI Enterprise",
  body: "Most organisations treat content as marketing output. They invest in platforms, headcount, and campaigns — then wonder why AI surfaces the wrong answers, personalisation fails at scale, and localisation costs continue to rise. The issue is not capability or technology. It is that content has never been treated as infrastructure.\n\nWe design the operating systems, governance frameworks, and structured workflows that turn content into a reliable, AI-ready asset.",
};

const symptoms = [
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

const services = [
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

const learnMoreItems = [
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

const testimonials = [
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

const blogPosts = [
  { title: "Kentico CMS Cadence Cuts Migration Risk", date: "Sep 16, 2025", slug: "kentico-cadence-cuts-migration-risk" },
  { title: "Agentic CX: From Journeys to Agents", date: "Sep 15, 2025", slug: "agentic-cx-from-journeys-to-agents" },
  { title: "Sanity CMS Upgrades Speed CX Delivery", date: "Sep 12, 2025", slug: "sanity-cms-upgrades-speed-cx-delivery" },
  { title: "Unlocking Sitecore productivity", date: "Sep 12, 2025", slug: "sitecore-productivity-and-roi" },
  { title: "Ibexa v5: Europe\u2019s B2B DXP", date: "Sep 9, 2025", slug: "ibexa-v5-europe-s-b2b-dxp" },
  { title: "Hyland Content Innovation Cloud", date: "Aug 28, 2025", slug: "hyland-content-innovation-cloud" },
  { title: "Contentful AI Workflows Boost Speed", date: "Aug 20, 2025", slug: "contentful-ai-workflows-boost-speed" },
  { title: "Optimizely AEO/GEO: AI Visibility", date: "Aug 15, 2025", slug: "optimizely-aeo-geo-ai-visibility" },
];

export default function HomePage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative bg-gradient-to-br from-gray-200 via-gray-100 to-white py-24 lg:py-32 overflow-hidden">
        {/* Decorative diagonal overlay */}
        <div className="absolute inset-0 bg-ecm-green diagonal-divider opacity-90" />
        <div className="relative max-w-5xl mx-auto px-6 text-center lg:text-left">
          <h1 className="text-ecm-lime font-barlow font-bold text-4xl lg:text-6xl mb-8 leading-tight">
            {heroData.heading}
          </h1>
          {heroData.body.split("\n\n").map((para, i) => (
            <p
              key={i}
              className="text-white/90 font-barlow font-light text-lg lg:text-xl leading-relaxed mb-4 max-w-3xl"
            >
              {para}
            </p>
          ))}
        </div>
      </section>

      {/* ─── SIX SYMPTOMS ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-ecm-green font-barlow font-bold text-3xl lg:text-4xl text-center mb-16">
            Six symptoms. One underlying cause.
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {symptoms.map((symptom, i) => (
              <div
                key={i}
                className="bg-gray-50 rounded-xl p-6 border-l-4 border-ecm-lime hover:shadow-lg transition-shadow"
              >
                <h3 className="text-ecm-green font-barlow font-semibold text-lg mb-3">
                  {symptom.title}
                </h3>
                <p className="text-ecm-gray-dark text-sm leading-relaxed">
                  {symptom.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─── */}
      <section className="py-20 bg-ecm-green">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-ecm-lime font-barlow font-bold text-3xl lg:text-4xl text-center mb-16">
            SERVICES
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {services.map((service, i) => (
              <Link
                key={i}
                href={service.href}
                className="service-card bg-white/10 backdrop-blur rounded-2xl p-8 text-center group"
              >
                <div className="w-16 h-16 bg-ecm-lime/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-8 h-8 bg-ecm-lime rounded-full" />
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
      </section>

      {/* ─── LEARN MORE ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-ecm-green font-barlow font-bold text-3xl lg:text-4xl text-center mb-16">
            LEARN MORE
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {learnMoreItems.map((item, i) => (
              <div
                key={i}
                className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow group cursor-pointer"
              >
                <h3 className="text-ecm-green font-barlow font-semibold text-base mb-2">
                  {item.title}
                </h3>
                <p className="text-ecm-gray text-sm mb-4">{item.subtitle}</p>
                <span className="inline-block bg-ecm-lime text-ecm-green text-xs font-barlow font-semibold px-4 py-2 rounded-full group-hover:bg-ecm-lime-hover transition-colors">
                  READ MORE
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LATEST INSIGHTS (Blog) ─── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-ecm-green font-barlow font-bold text-3xl lg:text-4xl text-center mb-16">
            LATEST INSIGHTS
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {blogPosts.map((post, i) => (
              <Link
                key={i}
                href={`/post/${post.slug}`}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="h-40 bg-ecm-green/10 flex items-center justify-center">
                  <div className="w-12 h-12 bg-ecm-green/20 rounded-lg" />
                </div>
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
      <section className="py-4 bg-ecm-green overflow-hidden">
        <div className="animate-marquee whitespace-nowrap">
          <span className="text-ecm-lime font-barlow font-bold text-2xl lg:text-4xl mx-8">
            AI RUNS ON CONTENT.
          </span>
          <span className="text-ecm-lime font-barlow font-bold text-2xl lg:text-4xl mx-8">
            AI RUNS ON CONTENT.
          </span>
          <span className="text-ecm-lime font-barlow font-bold text-2xl lg:text-4xl mx-8">
            AI RUNS ON CONTENT.
          </span>
          <span className="text-ecm-lime font-barlow font-bold text-2xl lg:text-4xl mx-8">
            AI RUNS ON CONTENT.
          </span>
        </div>
      </section>

      {/* ─── TESTIMONIALS CAROUSEL ─── */}
      <TestimonialsCarousel testimonials={testimonials} />

      {/* ─── CTA ─── */}
      <section className="py-24 bg-gray-100 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-ecm-green font-barlow font-bold text-4xl lg:text-5xl mb-2">
            READY FOR YOUR
          </h2>
          <h2 className="text-ecm-green font-barlow font-bold text-4xl lg:text-5xl mb-8">
            BUSINESS TO GROW?
          </h2>
          <Link
            href="/#contact"
            className="inline-block bg-ecm-lime text-ecm-green font-barlow font-bold text-xl px-12 py-4 rounded-full hover:bg-ecm-lime-hover transition-colors"
          >
            CONTACT US
          </Link>
        </div>
      </section>

      {/* ─── CONTACT ─── */}
      <ContactForm />
    </>
  );
}

/* ─── Testimonials Carousel (client component) ─── */
function TestimonialsCarousel({
  testimonials,
}: {
  testimonials: {quote: string; name: string; role: string; commentary?: string}[];
}) {
  return <TestimonialsClient testimonials={testimonials} />;
}

import TestimonialsClient from "@/components/TestimonialsClient";

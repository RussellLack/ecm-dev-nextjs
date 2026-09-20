import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 3600;

const hero = {
  heading: "What we do",
  body: "ECM.dev is a fractional content operations and AI-readiness service. We work with mid-market and owner-managed businesses, engineering consultancies, exporters, B2B SaaS teams, professional services, who have outgrown ad hoc content production and are weighing whether to build a content function in-house. We're built to be the alternative to that build: senior diagnosis, a working system, and ongoing ownership of it, without the salary, the management overhead, or the year it takes a new hire to get up to speed.",
};

const founder = {
  heading: "Behind the system",
  body: "Behind ECM.dev is Russell Lack, who has spent over thirteen years running enterprise cloud and data architecture programmes across the Nordics before turning the same discipline on content. That background is why the work reads like an audit, not a workshop deck.",
};

const sections = [
  {
    title: "Why this exists",
    body: "Most organisations still treat content as a finished product: a page, a document, a translated file, filed and forgotten. That assumption breaks down once content also has to feed search, feed AI answer engines, and feed decisions inside the business itself. Content that only looks right to a human reader is no longer enough on its own. This isn't a new idea. Content strategists have understood content as a system rather than a pile of assets for well over a decade. ECM.dev applies that discipline as a retained service, not a one-off report you're left to implement yourself.",
  },
  {
    title: "How we work",
    body: "Every engagement starts with the same person doing the diagnosis, the build, and the ongoing work, so judgement doesn't reset each time something changes. Most \"AI content audits\" on the market are shallow: a search-visibility check dressed up as a system review. We built ecm-agent, our own AI-readiness scoring engine, because that wasn't good enough. It scores governance, workflow, technology and AI-readiness together, against a versioned rubric, with every finding traceable back to its evidence. We call that provenance, not certification, because we won't claim more confidence than the evidence supports.",
  },
  {
    title: "What makes this different",
    body: "There are really only two ways most businesses solve this today: hire for it, or hand tasks to whoever's available and hope the pieces add up to something coherent. Both have a real cost. A hire means recruiting, management time, and months of ramp-up before you see the judgement you're paying for. Handing out tasks means no one owns the outcome, and whatever gets built has to be rebuilt the next time someone new picks it up. ECM.dev is neither. You get a system that runs without needing to staff for it, the same judgement retained month to month rather than re-hired each time, and an AI-readiness score you could defend to your own board.",
  },
  {
    title: "Start here",
    body: "Every engagement starts with a free assessment. It's a diagnosis, not a discount audit, no sales call, no email gate on the result. If it's worth fixing, we scope a fixed-price build, usually delivered in one to two weeks, moving into a monthly retained service after that: no fixed term, and you step away from it when the system no longer needs us running it.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const title = "About ECM.DEV";
  const description =
    "ECM.dev is a fractional content operations and AI-readiness service: senior diagnosis, a working system, and ongoing ownership of it, without the overhead of an in-house hire.";
  return {
    title,
    description,
    alternates: { canonical: "/about" },
    openGraph: { type: "website", title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function AboutPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative bg-ecm-green py-20 sm:py-28 lg:py-32 overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <h1 className="text-ecm-lime font-barlow font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight mb-6">
            {hero.heading}
          </h1>
          <p className="text-white/90 font-barlow font-light text-base sm:text-lg leading-relaxed">
            {hero.body}
          </p>
        </div>
        <div className="wave-divider wave-divider-bottom">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="var(--color-surface)" />
          </svg>
        </div>
      </section>

      {/* ─── FOUNDER ─── */}
      <section className="py-16 bg-surface-alt border-b border-surface-border">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-heading font-barlow font-bold text-xl sm:text-2xl leading-snug mb-3">
            {founder.heading}
          </h2>
          <p className="text-ink text-base leading-relaxed">
            {founder.body}
          </p>
        </div>
      </section>

      {/* ─── BODY SECTIONS ─── */}
      <section className="py-20 bg-surface">
        <div className="max-w-3xl mx-auto px-6 space-y-16">
          {sections.map((section, i) => (
            <div key={i}>
              <h2 className="text-heading font-barlow font-bold text-2xl sm:text-3xl leading-snug mb-4">
                {section.title}
              </h2>
              <p className="text-ink text-base leading-relaxed">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CLOSING CTA ─── */}
      <section className="bg-ecm-green py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-white font-barlow font-bold text-3xl lg:text-4xl mb-6">
            See where your own estate stands.
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/assessments"
              className="inline-flex items-center justify-center bg-ecm-lime text-ecm-green font-barlow font-bold text-base sm:text-lg px-8 py-4 rounded-full hover:bg-ecm-lime-hover transition-colors"
            >
              Start with a free assessment
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center border-2 border-ecm-lime text-ecm-lime font-barlow font-semibold text-base sm:text-lg px-8 py-4 rounded-full hover:bg-ecm-lime hover:text-ecm-green transition-colors"
            >
              Talk to us directly
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

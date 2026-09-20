import Link from "next/link";
import type { ServicePageData } from "@/lib/serviceTypes";

/* The closing CTA band used to be one hardcoded button ("Take the Content
   Operations Maturity Assessment") regardless of which pillar page it
   rendered on, and regardless of what the Sanity ctaUrl field for that
   pillar actually pointed to (the label text never read from data at
   all). Content Technology and Content Localisation each have their own
   dedicated self-serve tool that was losing every visibility contest to
   the flagship assessment on their own pages. Made code-owned per pillar,
   same reasoning as ContentAuditTiers and the homepage's howItWorks: this
   is a commercial routing decision, not CMS copy. See
   docs/SERVICE-CLARITY-AUDIT-2026-09-20.md. */
const PILLAR_CTA: Record<
  ServicePageData["category"],
  { text: string; label: string; url: string }
> = {
  technology: {
    text: "See exactly what a CMS or platform migration would cost, and what it would save.",
    label: "Open the CMS Implementation Cost Estimator",
    url: "/assessment/cms-implementation",
  },
  services: {
    text: "Score your content operation across six dimensions and see where it needs to go.",
    label: "Take the Content Operations Maturity Assessment",
    url: "/assessment/content-operations-maturity",
  },
  localization: {
    text: "See exactly where your multilingual content spend is going, and what an AI-native operating model could recover.",
    label: "Open the Localisation Cost Estimator",
    url: "/assessment/localisation-cost",
  },
};

export default function ServicePage({ data }: { data: ServicePageData }) {
  const pillarCta = PILLAR_CTA[data.category];
  const paragraphs = (data.problemIntro ?? "").split(/\n{2,}/).filter(Boolean);
  const [leadParagraph, ...restParagraphs] = paragraphs;

  return (
    <>
      {/* Hero band */}
      <section className="relative bg-ecm-green py-20 sm:py-24 lg:py-32 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-ecm-lime/80 font-barlow font-semibold text-xs tracking-[0.2em] uppercase mb-6">
            {data.title}
          </p>
          <h1 className="text-white font-barlow font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight max-w-4xl">
            {data.heroDescription}
          </h1>
        </div>
        {/* Wave divider: green → white */}
        <div className="wave-divider wave-divider-bottom">
          <svg
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z"
              fill="var(--color-surface)"
            />
          </svg>
        </div>
      </section>

      {/* Problem intro */}
      <section className="bg-surface pt-20 pb-10">
        <div className="max-w-3xl mx-auto px-6">
          {leadParagraph && (
            <p className="text-heading font-barlow font-bold text-2xl sm:text-3xl leading-snug mb-8">
              {leadParagraph}
            </p>
          )}
          {restParagraphs.map((p, i) => (
            <p
              key={i}
              className="text-ink text-base sm:text-lg leading-relaxed mb-5"
            >
              {p}
            </p>
          ))}
        </div>
      </section>

      {/* Diagnosis box */}
      <section className="bg-surface pb-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-surface-alt border-l-[5px] border-ecm-lime p-8 sm:p-10 rounded-r-2xl">
            <p className="text-heading font-barlow font-bold text-xs tracking-[0.2em] uppercase mb-6">
              You probably recognise this
            </p>
            <ul className="space-y-3">
              {(data.diagnosisItems ?? []).map((item, i) => (
                <li
                  key={i}
                  className="text-ink text-base leading-relaxed flex gap-3"
                >
                  <span className="text-heading flex-shrink-0 font-bold">
                    •
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Reframe panel */}
      <section className="relative bg-ecm-green-dark pt-28 pb-28 overflow-hidden">
        {/* Wave divider: white → green-dark (top) — same curve direction as bottom for parallel ribbon */}
        <div className="wave-divider wave-divider-top">
          <svg
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,60 C360,120 1080,0 1440,60 L1440,0 L0,0 Z"
              fill="var(--color-surface)"
            />
          </svg>
        </div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <p className="text-ecm-lime font-barlow font-bold text-2xl sm:text-3xl leading-snug">
            {data.reframeStatement}
          </p>
        </div>
        {/* Wave divider: green-dark → white (bottom) */}
        <div className="wave-divider wave-divider-bottom">
          <svg
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z"
              fill="var(--color-surface)"
            />
          </svg>
        </div>
      </section>

      {/* What we do */}
      <section className="bg-surface pt-20 pb-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="border-t-2 border-heading pt-10">
            <h2 className="text-heading font-barlow font-bold text-2xl sm:text-3xl">
              What we do
            </h2>
          </div>
        </div>
      </section>

      {/* Service cards */}
      <section className="bg-surface pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {(data.packages ?? []).map((pkg) => (
              <article
                key={pkg.order}
                className="border-t border-heading pt-6 flex flex-col"
              >
                <p className="text-heading/40 font-barlow font-bold text-sm mb-4 tracking-wider">
                  {String(pkg.order).padStart(2, "0")}
                </p>
                <h3 className="text-heading font-barlow font-bold text-xl mb-4 leading-tight">
                  {pkg.title}
                </h3>
                <p className="text-ink text-sm leading-relaxed mb-6">
                  {pkg.description}
                </p>
                {pkg.features && pkg.features.length > 0 && (
                  <div className="mb-6">
                    <p className="text-heading font-barlow font-bold text-xs tracking-[0.2em] uppercase mb-3">
                      What this delivers
                    </p>
                    <ul className="space-y-2">
                      {pkg.features.map((feature, i) => (
                        <li
                          key={i}
                          className="text-ink text-sm leading-relaxed flex gap-2"
                        >
                          <span className="text-heading flex-shrink-0 font-bold">
                            •
                          </span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <Link
                  href={pkg.href || `/contact?service=${encodeURIComponent(pkg.title)}`}
                  className="mt-auto inline-block bg-ecm-lime text-ecm-green font-barlow font-semibold text-sm px-6 py-2 rounded-full hover:bg-ecm-lime-hover transition-colors self-start"
                >
                  {pkg.href ? "Try it now →" : "Start a conversation →"}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Dark CTA band */}
      <section className="relative bg-ecm-green pt-28 pb-20 overflow-hidden">
        {/* Wave divider: white → green */}
        <div className="wave-divider wave-divider-top">
          <svg
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,60 C360,0 1080,120 1440,60 L1440,0 L0,0 Z"
              fill="var(--color-surface)"
            />
          </svg>
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-white/80 font-barlow text-base sm:text-lg leading-relaxed mb-8">
            {pillarCta.text}
          </p>
          <Link
            href={pillarCta.url}
            className="inline-block bg-ecm-lime text-ecm-green font-barlow font-bold text-base sm:text-lg px-8 py-4 rounded-full hover:bg-ecm-lime-hover transition-colors"
          >
            {pillarCta.label} →
          </Link>
        </div>
      </section>
    </>
  );
}

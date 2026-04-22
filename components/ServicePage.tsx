import Link from "next/link";
import type { ServicePageData } from "@/lib/serviceTypes";

export default function ServicePage({ data }: { data: ServicePageData }) {
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
              fill="#ffffff"
            />
          </svg>
        </div>
      </section>

      {/* Problem intro */}
      <section className="bg-white pt-20 pb-10">
        <div className="max-w-3xl mx-auto px-6">
          {leadParagraph && (
            <p className="text-ecm-green font-barlow font-bold text-2xl sm:text-3xl leading-snug mb-8">
              {leadParagraph}
            </p>
          )}
          {restParagraphs.map((p, i) => (
            <p
              key={i}
              className="text-ecm-gray-dark text-base sm:text-lg leading-relaxed mb-5"
            >
              {p}
            </p>
          ))}
        </div>
      </section>

      {/* Diagnosis box */}
      <section className="bg-white pb-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-ecm-gray-light border-l-[5px] border-ecm-lime p-8 sm:p-10 rounded-r-2xl">
            <p className="text-ecm-green font-barlow font-bold text-xs tracking-[0.2em] uppercase mb-6">
              You probably recognise this
            </p>
            <ul className="space-y-3">
              {(data.diagnosisItems ?? []).map((item, i) => (
                <li
                  key={i}
                  className="text-ecm-gray-dark text-base leading-relaxed flex gap-3"
                >
                  <span className="text-ecm-green flex-shrink-0 font-bold">
                    —
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
              fill="#ffffff"
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
              fill="#ffffff"
            />
          </svg>
        </div>
      </section>

      {/* What we do */}
      <section className="bg-white pt-20 pb-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="border-t-2 border-ecm-green pt-10">
            <h2 className="text-ecm-green font-barlow font-bold text-2xl sm:text-3xl">
              What we do
            </h2>
          </div>
        </div>
      </section>

      {/* Service cards */}
      <section className="bg-white pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {(data.packages ?? []).map((pkg) => (
              <article
                key={pkg.order}
                className="border-t border-ecm-green pt-6 flex flex-col"
              >
                <p className="text-ecm-green/40 font-barlow font-bold text-sm mb-4 tracking-wider">
                  {String(pkg.order).padStart(2, "0")}
                </p>
                <h3 className="text-ecm-green font-barlow font-bold text-xl mb-4 leading-tight">
                  {pkg.title}
                </h3>
                <p className="text-ecm-gray-dark text-sm leading-relaxed mb-6">
                  {pkg.description}
                </p>
                {pkg.features && pkg.features.length > 0 && (
                  <div className="mb-6">
                    <p className="text-ecm-green font-barlow font-bold text-xs tracking-[0.2em] uppercase mb-3">
                      What this delivers
                    </p>
                    <ul className="space-y-2">
                      {pkg.features.map((feature, i) => (
                        <li
                          key={i}
                          className="text-ecm-gray-dark text-sm leading-relaxed flex gap-2"
                        >
                          <span className="text-ecm-green flex-shrink-0 font-bold">
                            —
                          </span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <Link
                  href={`/contact?service=${encodeURIComponent(pkg.title)}`}
                  className="mt-auto inline-block bg-ecm-lime text-ecm-green font-barlow font-semibold text-sm px-6 py-2 rounded-full hover:bg-ecm-lime-hover transition-colors self-start"
                >
                  Start a conversation →
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
              fill="#ffffff"
            />
          </svg>
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center">
          {data.ctaText && (
            <p className="text-white/80 font-barlow text-base sm:text-lg leading-relaxed mb-8">
              {data.ctaText}
            </p>
          )}
          {data.ctaUrl && (
            <Link
              href={data.ctaUrl}
              className="inline-block bg-ecm-lime text-ecm-green font-barlow font-bold text-base sm:text-lg px-8 py-4 rounded-full hover:bg-ecm-lime-hover transition-colors"
            >
              Take the Content Operations Maturity Assessment →
            </Link>
          )}
        </div>
      </section>
    </>
  );
}

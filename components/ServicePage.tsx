import Link from "next/link";
import type { ServicePageData } from "@/lib/serviceTypes";

export default function ServicePage({ data }: { data: ServicePageData }) {
  const paragraphs = (data.problemIntro ?? "").split(/\n{2,}/).filter(Boolean);
  const [leadParagraph, ...restParagraphs] = paragraphs;

  return (
    <>
      {/* Hero band */}
      <section className="bg-[#111111] py-20 sm:py-24 lg:py-32">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-[#888888] text-xs tracking-[0.2em] uppercase mb-6">
            {data.title}
          </p>
          <h1 className="text-white font-barlow font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight max-w-4xl">
            {data.heroDescription}
          </h1>
        </div>
      </section>

      {/* Problem intro */}
      <section className="bg-white py-20">
        <div className="max-w-3xl mx-auto px-6">
          {leadParagraph && (
            <p className="text-[#1a1a1a] font-barlow font-bold text-2xl sm:text-3xl leading-snug mb-8">
              {leadParagraph}
            </p>
          )}
          {restParagraphs.map((p, i) => (
            <p
              key={i}
              className="text-[#444444] text-base sm:text-lg leading-relaxed mb-5"
            >
              {p}
            </p>
          ))}
        </div>
      </section>

      {/* Diagnosis box */}
      <section className="bg-white pb-20">
        <div className="max-w-3xl mx-auto px-6">
          <div
            className="bg-[#f6f6f6] p-8 sm:p-10"
            style={{ borderLeft: "5px solid #111111" }}
          >
            <p className="text-[#1a1a1a] text-xs tracking-[0.2em] uppercase font-bold mb-6">
              You probably recognise this
            </p>
            <ul className="space-y-3">
              {(data.diagnosisItems ?? []).map((item, i) => (
                <li
                  key={i}
                  className="text-[#444444] text-base leading-relaxed flex gap-3"
                >
                  <span className="text-[#111111] flex-shrink-0">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Reframe panel */}
      <section className="bg-[#efefef] py-20">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-[#1a1a1a] font-barlow font-bold text-2xl sm:text-3xl leading-snug">
            {data.reframeStatement}
          </p>
        </div>
      </section>

      {/* What we do */}
      <section className="bg-white pt-20 pb-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="border-t border-[#111111] pt-10">
            <h2 className="text-[#1a1a1a] font-barlow font-bold text-2xl sm:text-3xl">
              What we do
            </h2>
          </div>
        </div>
      </section>

      {/* Service cards */}
      <section className="bg-white pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {(data.packages ?? []).map((pkg) => (
              <article
                key={pkg.order}
                className="border-t border-[#111111] pt-6 flex flex-col"
              >
                <p className="text-[#888888] font-barlow font-bold text-sm mb-4 tracking-wider">
                  {String(pkg.order).padStart(2, "0")}
                </p>
                <h3 className="text-[#1a1a1a] font-barlow font-bold text-xl mb-4 leading-tight">
                  {pkg.title}
                </h3>
                <p className="text-[#444444] text-sm leading-relaxed mb-6">
                  {pkg.description}
                </p>
                {pkg.features && pkg.features.length > 0 && (
                  <div className="mb-6">
                    <p className="text-[#1a1a1a] text-xs tracking-[0.2em] uppercase font-bold mb-3">
                      What this delivers
                    </p>
                    <ul className="space-y-2">
                      {pkg.features.map((feature, i) => (
                        <li
                          key={i}
                          className="text-[#444444] text-sm leading-relaxed flex gap-2"
                        >
                          <span className="text-[#111111] flex-shrink-0">
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
                  className="mt-auto text-[#1a1a1a] font-barlow font-bold text-sm underline underline-offset-4 hover:text-[#444444] transition-colors"
                >
                  Start a conversation →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Dark CTA band */}
      <section className="bg-[#111111] py-20">
        <div className="max-w-3xl mx-auto px-6">
          {data.ctaText && (
            <p className="text-[#888888] text-sm leading-relaxed mb-6">
              {data.ctaText}
            </p>
          )}
          {data.ctaUrl && (
            <Link
              href={data.ctaUrl}
              className="text-white font-barlow font-bold text-xl sm:text-2xl underline underline-offset-4 hover:text-[#efefef] transition-colors"
            >
              Take the Content Operations Maturity Assessment →
            </Link>
          )}
        </div>
      </section>
    </>
  );
}

import Link from "next/link";

export interface SolutionPageData {
  title: string;
  slug?: { current?: string } | string;
  eyebrow?: string;
  heroHeading?: string;
  heroSubhead?: string;
  howItWorks?: string;
  includes?: { title?: string; description?: string }[];
  proof?: { outcome?: string; detail?: string; url?: string }[];
  diagnosticLabel?: string;
  diagnosticUrl?: string;
  depthLabel?: string;
  depthUrl?: string;
  ctaHeading?: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

const WAVE_TO_WHITE = (
  <div className="wave-divider wave-divider-bottom">
    <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="#ffffff" />
    </svg>
  </div>
);

const WAVE_FROM_WHITE = (
  <div className="wave-divider wave-divider-top">
    <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,60 C360,0 1080,120 1440,60 L1440,0 L0,0 Z" fill="#ffffff" />
    </svg>
  </div>
);

export default function SolutionPage({ data }: { data: SolutionPageData }) {
  const heading = data.heroHeading || data.title;
  const howParas = (data.howItWorks ?? "").split(/\n{2,}/).filter(Boolean);
  const diagnosticUrl = data.diagnosticUrl || "/assessments";
  const diagnosticLabel = data.diagnosticLabel || "Take the assessment";
  const ctaUrl = data.ctaUrl || "/assessments";
  const ctaLabel = data.ctaLabel || "Take the assessment";

  return (
    <>
      {/* Hero */}
      <section className="relative bg-ecm-green py-20 sm:py-24 lg:py-28 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6">
          {data.eyebrow && (
            <p className="text-ecm-lime/80 font-barlow font-semibold text-xs tracking-[0.2em] uppercase mb-6">
              {data.eyebrow}
            </p>
          )}
          <h1 className="text-ecm-lime font-barlow font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight max-w-4xl">
            {heading}
          </h1>
          {data.heroSubhead && (
            <p className="text-white/85 font-barlow font-light text-lg sm:text-xl leading-relaxed mt-6 max-w-3xl">
              {data.heroSubhead}
            </p>
          )}
        </div>
        {WAVE_TO_WHITE}
      </section>

      {/* How it works */}
      {howParas.length > 0 && (
        <section className="bg-white pt-20 pb-10">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-ecm-green font-barlow font-bold text-2xl sm:text-3xl mb-8">
              How it works
            </h2>
            {howParas.map((p, i) => (
              <p key={i} className="text-ecm-gray-dark text-base sm:text-lg leading-relaxed mb-5">
                {p}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* What's included */}
      {data.includes && data.includes.length > 0 && (
        <section className="bg-white pt-8 pb-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="border-t-2 border-ecm-green pt-10 mb-10">
              <h2 className="text-ecm-green font-barlow font-bold text-2xl sm:text-3xl">
                What's included
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-10">
              {data.includes.map((step, i) => (
                <article key={i} className="border-t border-ecm-green pt-6 flex flex-col">
                  <p className="text-ecm-green/40 font-barlow font-bold text-sm mb-4 tracking-wider">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="text-ecm-green font-barlow font-bold text-xl mb-3 leading-tight">
                    {step.title}
                  </h3>
                  {step.description && (
                    <p className="text-ecm-gray-dark text-sm leading-relaxed">{step.description}</p>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Proof */}
      {data.proof && data.proof.length > 0 && (
        <section className="bg-gray-50 py-20">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-ecm-green font-barlow font-bold text-2xl sm:text-3xl mb-10">
              Proof it works.
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {data.proof.map((tile, i) => (
                <Link
                  key={i}
                  href={tile.url || "/case-study"}
                  className="block bg-ecm-green rounded-xl p-6 sm:p-8 border border-ecm-lime/20 hover:border-ecm-lime/50 transition-all hover:shadow-lg hover:shadow-ecm-lime/5 group"
                >
                  <h3 className="text-ecm-lime font-barlow font-semibold text-lg mb-2 group-hover:text-white transition-colors">
                    {tile.outcome}
                  </h3>
                  {tile.detail && (
                    <p className="text-white/85 text-sm leading-relaxed">{tile.detail}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Where to start */}
      <section className="bg-white pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-ecm-green font-barlow font-bold text-2xl sm:text-3xl mb-4">
            Where to start
          </h2>
          <p className="text-ecm-gray-dark text-base sm:text-lg leading-relaxed mb-8 max-w-2xl">
            Find out where you stand in about ten minutes, then we scope the highest-leverage fix first.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={diagnosticUrl}
              className="inline-flex items-center justify-center bg-ecm-lime text-ecm-green font-barlow font-bold text-base px-8 py-4 rounded-full hover:bg-ecm-lime-hover transition-colors"
            >
              {diagnosticLabel}
              <span className="ml-2 text-ecm-green/70 font-medium text-sm">10 min</span>
            </Link>
            {data.depthUrl && data.depthLabel && (
              <Link
                href={data.depthUrl}
                className="inline-flex items-center justify-center border-2 border-ecm-green text-ecm-green font-barlow font-semibold text-base px-8 py-4 rounded-full hover:bg-ecm-green hover:text-white transition-colors"
              >
                {data.depthLabel}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative bg-ecm-green pt-28 pb-20 overflow-hidden text-center">
        {WAVE_FROM_WHITE}
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <h2 className="text-ecm-lime font-barlow font-bold text-3xl sm:text-4xl mb-8">
            {data.ctaHeading || "See where you stand."}
          </h2>
          <Link
            href={ctaUrl}
            className="inline-block bg-ecm-lime text-ecm-green font-barlow font-bold text-lg px-10 py-4 rounded-full hover:bg-ecm-lime-hover transition-colors"
          >
            {ctaLabel}
          </Link>
          <p className="mt-6">
            <Link
              href="/contact"
              className="text-white/80 font-barlow text-sm underline underline-offset-4 hover:text-ecm-lime transition-colors"
            >
              or book a strategy session
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}

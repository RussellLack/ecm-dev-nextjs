import Link from "next/link";

interface ServicePackage {
  title: string;
  description: string;
}

interface ServicePageProps {
  title: string;
  heroDescription: string;
  packages: ServicePackage[];
}

export default function ServicePageLayout({
  title,
  heroDescription,
  packages,
}: ServicePageProps) {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-ecm-green py-14 sm:py-20 lg:py-28 pb-24 sm:pb-28 lg:pb-36 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-ecm-lime font-barlow font-bold text-3xl sm:text-4xl lg:text-5xl mb-6 sm:mb-8">
            {title}
          </h1>
          <p className="text-white/90 font-barlow font-light text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed">
            {heroDescription}
          </p>
        </div>
        {/* Wave divider: green → white */}
        <div className="wave-divider wave-divider-bottom">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="#ffffff" />
          </svg>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg, i) => (
              <Link
                key={i}
                href={`/contact?service=${encodeURIComponent(pkg.title)}`}
                className="bg-ecm-green rounded-2xl p-8 border border-ecm-lime/15 hover:border-ecm-lime/40 hover:shadow-lg hover:shadow-ecm-lime/5 transition-all group block"
              >
                <h3 className="text-ecm-lime font-barlow font-bold text-lg mb-4 uppercase">
                  {pkg.title}
                </h3>
                <p className="text-white/70 text-sm leading-relaxed mb-6">
                  {pkg.description}
                </p>
                <span className="inline-block bg-ecm-lime text-ecm-green text-sm font-barlow font-semibold px-6 py-2 rounded-full group-hover:bg-ecm-lime-hover transition-colors">
                  LEARN MORE
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative pt-28 pb-16 bg-ecm-green text-center overflow-hidden">
        {/* Wave divider: white → green */}
        <div className="wave-divider wave-divider-top">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C360,0 1080,120 1440,60 L1440,0 L0,0 Z" fill="#ffffff" />
          </svg>
        </div>
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-ecm-lime font-barlow font-bold text-3xl mb-6">
            Ready to get started?
          </h2>
          <Link
            href="/contact"
            className="inline-block bg-ecm-lime text-ecm-green font-barlow font-bold px-10 py-4 rounded-full hover:bg-ecm-lime-hover transition-colors"
          >
            CONTACT US
          </Link>
        </div>
      </section>
    </>
  );
}

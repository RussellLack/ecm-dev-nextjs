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
      <section className="bg-ecm-green py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-ecm-lime font-barlow font-bold text-4xl lg:text-5xl mb-8">
            {title}
          </h1>
          <p className="text-white/90 font-barlow font-light text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed">
            {heroDescription}
          </p>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg, i) => (
              <div
                key={i}
                className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow group"
              >
                <h3 className="text-ecm-green font-barlow font-bold text-lg mb-4 uppercase">
                  {pkg.title}
                </h3>
                <p className="text-ecm-gray-dark text-sm leading-relaxed mb-6">
                  {pkg.description}
                </p>
                <span className="inline-block bg-ecm-lime text-ecm-green text-sm font-barlow font-semibold px-6 py-2 rounded-full group-hover:bg-ecm-lime-hover transition-colors cursor-pointer">
                  LEARN MORE
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-ecm-green text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-ecm-lime font-barlow font-bold text-3xl mb-6">
            Ready to get started?
          </h2>
          <Link
            href="/#contact"
            className="inline-block bg-ecm-lime text-ecm-green font-barlow font-bold px-10 py-4 rounded-full hover:bg-ecm-lime-hover transition-colors"
          >
            CONTACT US
          </Link>
        </div>
      </section>
    </>
  );
}

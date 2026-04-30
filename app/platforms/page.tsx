import type { Metadata } from "next";
import Link from "next/link";
import { getPlatforms } from "@/lib/queries";
import { urlFor } from "@/lib/sanity";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Platforms — CMS, DAM, DXP, AI | ECM.DEV",
  description:
    "Editorial points of view on the content technology platforms ECM.DEV works with most often: CMS, DAM, DXP, AI tooling, and analytics.",
  alternates: { canonical: "/platforms" },
};

type Platform = {
  _id: string;
  name: string;
  slug?: { current?: string };
  category?: string;
  summary?: string;
  logo?: any;
};

export default async function PlatformsIndexPage() {
  const platforms = ((await getPlatforms().catch(() => [])) as Platform[]) ?? [];

  // Group by category for an organised index.
  const grouped = new Map<string, Platform[]>();
  for (const p of platforms) {
    const cat = p.category || "Other";
    const list = grouped.get(cat) ?? [];
    list.push(p);
    grouped.set(cat, list);
  }
  const groups = Array.from(grouped.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  return (
    <>
      <section className="relative bg-ecm-green py-14 sm:py-20 lg:py-24 pb-24 sm:pb-28 lg:pb-32 overflow-hidden">
        <nav aria-label="Breadcrumb" className="max-w-5xl mx-auto px-6 pt-2">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs font-barlow text-white/60">
            <li>
              <Link href="/" className="hover:text-ecm-lime transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-white/30">/</li>
            <li aria-current="page" className="text-ecm-lime/90">Platforms</li>
          </ol>
        </nav>
        <div className="max-w-5xl mx-auto px-6 text-center mt-6">
          <h1 className="text-ecm-lime font-barlow font-bold text-3xl sm:text-4xl lg:text-5xl mb-3">
            PLATFORMS
          </h1>
          <p className="text-white/70 font-barlow text-base max-w-2xl mx-auto">
            Editorial points of view on the platforms we work with most often.
            Pick a platform to see ECM.DEV's perspective and the related
            guides, case studies, and intel.
          </p>
        </div>
        <div className="wave-divider wave-divider-bottom">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="#ffffff" />
          </svg>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6 space-y-12">
          {platforms.length === 0 ? (
            <p className="text-ecm-gray text-center py-16 font-barlow">
              Platform pages coming soon.
            </p>
          ) : (
            groups.map(([category, items]) => (
              <div key={category}>
                <h2 className="text-ecm-green font-barlow font-bold text-xl mb-5 uppercase tracking-wider">
                  {category}
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {items.map((p) => (
                    <Link
                      key={p._id}
                      href={`/platforms/${p.slug?.current}`}
                      className="group bg-gray-50 rounded-xl border border-gray-100 hover:border-ecm-green/20 hover:shadow-lg transition-all p-6 flex flex-col"
                    >
                      <div className="flex items-center gap-4 mb-3">
                        {p.logo && (
                          <div className="flex-shrink-0 w-12 h-12">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={urlFor(p.logo).width(120).height(120).fit("crop").url()}
                              alt=""
                              className="w-full h-full object-contain"
                              loading="lazy"
                            />
                          </div>
                        )}
                        <h3 className="text-ecm-green font-barlow font-bold text-lg leading-snug group-hover:text-ecm-green-dark transition-colors">
                          {p.name}
                        </h3>
                      </div>
                      {p.summary && (
                        <p className="text-ecm-gray text-sm leading-relaxed line-clamp-3">
                          {p.summary}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}

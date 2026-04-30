import type { Metadata } from "next";
import Link from "next/link";
import { sanityFetch } from "@/lib/sanity.server";
import { INDUSTRY_OPTIONS } from "@/sanity/schemas/taxonomyOptions";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Industries — Case studies by sector | ECM.DEV",
  description:
    "Content infrastructure work organised by industry. See how ECM.DEV approaches financial services, healthcare, manufacturing, retail, technology, public sector, energy, and professional services.",
  alternates: { canonical: "/industries" },
};

const INDUSTRY_LABEL: Record<string, string> = Object.fromEntries(
  INDUSTRY_OPTIONS.map((o) => [o.value, o.title])
);

export default async function IndustriesIndexPage() {
  // Two-step: list distinct industries, then count case studies per industry.
  // Counting in a single GROQ expression with parent-scope refs gets messy
  // across api versions, and the fan-out is small (one row per industry).
  const distinct = await sanityFetch<string[]>(
    `array::unique(*[_type == "caseStudy" && defined(industry)].industry)`
  ).catch(() => [] as string[]);

  const counts = await Promise.all(
    (distinct ?? []).filter(Boolean).map(async (industry) => {
      const n = await sanityFetch<number>(
        `count(*[_type == "caseStudy" && industry == $industry])`,
        { industry }
      ).catch(() => 0);
      return { industry, count: n };
    })
  );

  const items = counts
    .map((row) => ({
      slug: row.industry,
      title: INDUSTRY_LABEL[row.industry] ?? row.industry,
      count: row.count,
    }))
    .sort((a, b) => a.title.localeCompare(b.title));

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
            <li aria-current="page" className="text-ecm-lime/90">
              Industries
            </li>
          </ol>
        </nav>
        <div className="max-w-5xl mx-auto px-6 text-center mt-6">
          <h1 className="text-ecm-lime font-barlow font-bold text-3xl sm:text-4xl lg:text-5xl mb-3">
            INDUSTRIES
          </h1>
          <p className="text-white/70 font-barlow text-base max-w-2xl mx-auto">
            Content infrastructure work organised by sector. Pick an industry
            to see the projects and approaches we've taken there.
          </p>
        </div>
        <div className="wave-divider wave-divider-bottom">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="#ffffff" />
          </svg>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          {items.length === 0 ? (
            <p className="text-ecm-gray text-center py-16 font-barlow">
              Industry data coming soon.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((item) => (
                <Link
                  key={item.slug}
                  href={`/industries/${item.slug}`}
                  className="group bg-gray-50 rounded-xl border border-gray-100 hover:border-ecm-green/20 hover:shadow-lg transition-all p-6 flex flex-col"
                >
                  <h2 className="text-ecm-green font-barlow font-bold text-lg leading-snug mb-2 group-hover:text-ecm-green-dark transition-colors">
                    {item.title}
                  </h2>
                  <p className="text-ecm-gray text-sm">
                    {item.count} {item.count === 1 ? "project" : "projects"}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

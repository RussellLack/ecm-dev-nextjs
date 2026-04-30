import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllUsedIndustries,
  getCaseStudiesByIndustry,
} from "@/lib/queries";
import { urlFor } from "@/lib/sanity";
import { INDUSTRY_OPTIONS } from "@/sanity/schemas/taxonomyOptions";

export const revalidate = 60;

const INDUSTRY_LABEL: Record<string, string> = Object.fromEntries(
  INDUSTRY_OPTIONS.map((o) => [o.value, o.title])
);

export async function generateStaticParams() {
  const industries = await getAllUsedIndustries().catch(() => [] as string[]);
  return industries.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const industries = await getAllUsedIndustries().catch(() => [] as string[]);
  if (!industries.includes(slug)) return { title: "Industry not found" };

  const title = INDUSTRY_LABEL[slug] ?? slug;
  return {
    title: `${title} — Industries | ECM.DEV`,
    description: `Content infrastructure case studies in ${title}. How ECM.DEV approaches CMS, content operations, and localisation for ${title} organisations.`,
    alternates: { canonical: `/industries/${slug}` },
  };
}

type CaseStudy = {
  _id: string;
  title: string;
  slug?: { current?: string };
  client?: string;
  description?: string;
  image?: any;
  tags?: string[];
};

export default async function IndustryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const industries = await getAllUsedIndustries().catch(() => [] as string[]);
  if (!industries.includes(slug)) notFound();

  const title = INDUSTRY_LABEL[slug] ?? slug;
  const caseStudies = (await getCaseStudiesByIndustry(slug).catch(
    () => []
  )) as CaseStudy[];

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
            <li>
              <Link href="/industries" className="hover:text-ecm-lime transition-colors">
                Industries
              </Link>
            </li>
            <li aria-hidden="true" className="text-white/30">/</li>
            <li aria-current="page" className="text-ecm-lime/90">{title}</li>
          </ol>
        </nav>
        <div className="max-w-5xl mx-auto px-6 text-center mt-6">
          <p className="text-ecm-lime/70 font-barlow font-semibold text-xs uppercase tracking-widest mb-2">
            Industry
          </p>
          <h1 className="text-ecm-lime font-barlow font-bold text-3xl sm:text-4xl lg:text-5xl mb-3">
            {title}
          </h1>
          <p className="text-white/70 font-barlow text-base">
            {caseStudies.length} {caseStudies.length === 1 ? "project" : "projects"} in {title}
          </p>
        </div>
        <div className="wave-divider wave-divider-bottom">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="#ffffff" />
          </svg>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          {caseStudies.length === 0 ? (
            <p className="text-ecm-gray text-center py-16 font-barlow">
              No projects to show for this industry yet.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {caseStudies.map((cs) => (
                <Link
                  key={cs._id}
                  href={`/case-study/${cs.slug?.current}`}
                  className="group bg-gray-50 rounded-xl border border-gray-100 hover:border-ecm-green/20 hover:shadow-lg transition-all overflow-hidden flex flex-col"
                >
                  <div className="h-32 overflow-hidden bg-ecm-green/5 flex items-center justify-center">
                    {cs.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={urlFor(cs.image).width(360).height(200).fit("crop").url()}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-ecm-green/30 text-xs font-barlow font-semibold tracking-widest">
                        ECM
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h2 className="text-ecm-green font-barlow font-semibold text-sm leading-snug mb-2 group-hover:text-ecm-green-dark transition-colors line-clamp-2">
                      {cs.title}
                    </h2>
                    {cs.client && (
                      <p className="text-ecm-gray text-xs mb-2">{cs.client}</p>
                    )}
                    {cs.description && (
                      <p className="text-ecm-gray text-xs leading-relaxed line-clamp-3">
                        {cs.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/industries"
              className="inline-block bg-ecm-green text-white font-barlow font-semibold px-8 py-3 rounded-full hover:bg-ecm-green-dark transition-colors"
            >
              ← All industries
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

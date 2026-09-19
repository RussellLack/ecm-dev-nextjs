import Link from "next/link";
import Image from "next/image";
import CaseStudyIllustration from "@/components/case-study/CaseStudyIllustration";
import { urlFor } from "@/lib/sanity";
import { INDUSTRY_OPTIONS } from "@/sanity/schemas/taxonomyOptions";

const INDUSTRY_LABEL: Record<string, string> = Object.fromEntries(
  INDUSTRY_OPTIONS.map((o) => [o.value, o.title])
);

interface FeaturedCaseStudy {
  _id?: string;
  title: string;
  slug: { current: string } | string;
  client?: string;
  industry?: string;
  description?: string;
  image?: any;
  featuredTagline?: string;
}

export default function FeaturedCaseStudies({
  caseStudies,
}: {
  caseStudies: FeaturedCaseStudy[];
}) {
  if (!caseStudies?.length) return null;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {caseStudies.map((cs, i) => {
        const slug = typeof cs.slug === "string" ? cs.slug : cs.slug?.current;
        if (!slug) return null;
        return (
          <Link
            key={cs._id || i}
            href={`/case-study/${slug}`}
            aria-label={`View case study: ${cs.title}`}
            className="block bg-ecm-green rounded-2xl overflow-hidden border border-ecm-lime/15 hover:border-ecm-lime/40 hover:shadow-lg hover:shadow-ecm-lime/5 transition-all group"
          >
            <div className="aspect-[280/144] bg-white/5 overflow-hidden">
              {cs.image ? (
                <Image
                  src={urlFor(cs.image).width(560).height(288).fit("crop").url()}
                  alt=""
                  width={560}
                  height={288}
                  className="w-full h-full object-cover"
                />
              ) : (
                <CaseStudyIllustration slug={slug} />
              )}
            </div>
            <div className="p-6 sm:p-8">
              {cs.industry && (
                <span className="inline-block bg-white/10 text-ecm-lime/80 text-xs font-barlow font-medium px-3 py-1 rounded-full mb-3">
                  {INDUSTRY_LABEL[cs.industry] ?? cs.industry}
                </span>
              )}
              <h3 className="text-ecm-lime font-barlow font-bold text-xl mb-2 group-hover:text-white transition-colors">
                {cs.title}
              </h3>
              {cs.client && (
                <p className="text-white/60 text-sm font-medium mb-2">{cs.client}</p>
              )}
              {cs.featuredTagline && (
                <p className="text-ecm-lime/70 text-xs font-barlow font-semibold uppercase tracking-wide mb-3">
                  {cs.featuredTagline}
                </p>
              )}
              {cs.description && (
                <p className="text-white/70 text-sm leading-relaxed line-clamp-3">
                  {cs.description}
                </p>
              )}
              <span className="inline-block mt-4 text-ecm-lime font-barlow font-semibold text-sm group-hover:underline">
                View case study &rarr;
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

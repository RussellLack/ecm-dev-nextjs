import Link from "next/link";
import { urlFor } from "@/lib/sanity";
import {
  getOneRelatedGuide,
  getOneRelatedCaseStudy,
  getOneRelatedPost,
  getOneRelatedAssessment,
} from "@/lib/queries";
import { findOneIntelTopicForTags } from "@/lib/intel/queries";

type Doctype = "post" | "guide" | "caseStudy" | "assessment" | "intelTopic";

type Item = {
  doctype: Doctype;
  href: string;
  eyebrow: string;
  title: string;
  blurb?: string | null;
  image?: any;
};

const EYEBROW: Record<Doctype, string> = {
  post: "Article",
  guide: "Guide",
  caseStudy: "Project",
  assessment: "Assessment",
  intelTopic: "Intel topic",
};

/**
 * Mixed-type cross-link block for the foot of every body-content detail
 * page (post / guide / case-study). Surfaces 1-of-each across the four
 * content surfaces — a guide, a case study, a blog post, an intel topic,
 * and an assessment — picked by tag overlap then pillar match.
 *
 * Excludes the current document type (`excludeType`) so the page never
 * recommends itself, and the same-type slot is left to the curated
 * RelatedContent / relatedGuides blocks above this one.
 *
 * Returns null when nothing resolves so the section never renders empty.
 */
export default async function MixedRelated({
  pillars = [],
  tags = [],
  excludeType,
  excludeSlug,
}: {
  pillars?: string[];
  tags?: string[];
  excludeType: Doctype;
  excludeSlug?: string;
}) {
  if (!pillars.length && !tags.length) return null;

  const [guide, caseStudy, post, assessment, intelTopic] = await Promise.all([
    excludeType === "guide"
      ? null
      : getOneRelatedGuide({ excludeSlug, pillars, tags }).catch(() => null),
    excludeType === "caseStudy"
      ? null
      : getOneRelatedCaseStudy({ excludeSlug, pillars, tags }).catch(() => null),
    excludeType === "post"
      ? null
      : getOneRelatedPost({ excludeSlug, pillars, tags }).catch(() => null),
    excludeType === "assessment"
      ? null
      : getOneRelatedAssessment({ pillars }).catch(() => null),
    findOneIntelTopicForTags(tags).catch(() => null),
  ]);

  const items: Item[] = [];
  if (guide?.slug?.current) {
    items.push({
      doctype: "guide",
      href: `/guide/${guide.slug.current}`,
      eyebrow: guide.series ? `${EYEBROW.guide} · ${guide.series}` : EYEBROW.guide,
      title: guide.title,
      blurb: guide.subtitle || guide.excerpt,
      image: guide.mainImage,
    });
  }
  if (caseStudy?.slug?.current) {
    items.push({
      doctype: "caseStudy",
      href: `/case-study/${caseStudy.slug.current}`,
      eyebrow: EYEBROW.caseStudy,
      title: caseStudy.title,
      blurb: caseStudy.client || caseStudy.description,
      image: caseStudy.image,
    });
  }
  if (post?.slug?.current) {
    items.push({
      doctype: "post",
      href: `/post/${post.slug.current}`,
      eyebrow: EYEBROW.post,
      title: post.title,
      blurb: post.excerpt,
      image: post.mainImage,
    });
  }
  if (intelTopic?.slug) {
    items.push({
      doctype: "intelTopic",
      href: `/intel/topic/${intelTopic.slug}`,
      eyebrow: EYEBROW.intelTopic,
      title: intelTopic.title,
      blurb: "Curated industry signal on this topic.",
    });
  }
  if (assessment?.slug?.current) {
    items.push({
      doctype: "assessment",
      href: `/assessment/${assessment.slug.current}`,
      eyebrow: EYEBROW.assessment,
      title: assessment.title,
      blurb: assessment.subtitle || assessment.introText,
    });
  }

  if (!items.length) return null;

  return (
    <section className="pb-16">
      <div className="max-w-5xl mx-auto px-6">
        <div className="border-t border-gray-100 pt-10">
          <p className="text-ecm-gray text-xs font-barlow font-semibold uppercase tracking-widest mb-5">
            Continue exploring
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group bg-white rounded-xl border border-gray-100 hover:border-ecm-green/20 hover:shadow-md transition-all overflow-hidden flex flex-col"
              >
                {item.image ? (
                  <div className="h-28 overflow-hidden bg-ecm-green/5 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={urlFor(item.image).width(320).height(180).fit("crop").url()}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="h-28 bg-ecm-green/5 flex items-center justify-center">
                    <span className="text-ecm-green/30 text-[10px] font-barlow font-semibold tracking-widest uppercase">
                      {EYEBROW[item.doctype]}
                    </span>
                  </div>
                )}
                <div className="p-4 flex flex-col flex-1">
                  <p className="text-[10px] font-barlow font-semibold uppercase tracking-widest text-ecm-lime-hover mb-1">
                    {item.eyebrow}
                  </p>
                  <h3 className="text-ecm-green font-barlow font-semibold text-sm leading-snug mb-2 group-hover:text-ecm-green-dark line-clamp-2">
                    {item.title}
                  </h3>
                  {item.blurb && (
                    <p className="text-ecm-gray text-xs leading-relaxed line-clamp-3">
                      {item.blurb}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { urlFor } from "@/lib/sanity";
import { getAllGuideTags, getGuidesByTag } from "@/lib/queries";
import { tagFromSlug, tagToSlug } from "@/lib/tags";
import GuideIllustration from "@/components/guides/GuideIllustration";

export const revalidate = 60;

export async function generateStaticParams() {
  const tags = await getAllGuideTags().catch(() => []);
  return tags.map((tag) => ({ tag: tagToSlug(tag) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag: tagSlug } = await params;
  const tags = await getAllGuideTags().catch(() => []);
  const tag = tagFromSlug(tagSlug, tags);
  if (!tag) return { title: "Tag not found" };

  const title = `${tag} — Guides`;
  const description = `ECM.DEV guides on ${tag} — practical frameworks for content infrastructure, governance, and AI-ready operations.`;
  return {
    title,
    description,
    alternates: { canonical: `/guides/tag/${tagSlug}` },
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

type Guide = {
  _id: string;
  title: string;
  subtitle?: string;
  slug: { current: string };
  series?: string;
  guideNumber?: number;
  excerpt?: string;
  tags?: string[];
  mainImage?: any;
};

export default async function GuidesTagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag: tagSlug } = await params;
  const allTags = await getAllGuideTags().catch(() => []);
  const tag = tagFromSlug(tagSlug, allTags);
  if (!tag) notFound();

  const guides = (await getGuidesByTag(tag).catch(() => [])) as Guide[];

  return (
    <>
      <section className="relative bg-ecm-green py-14 sm:py-20 lg:py-24 pb-24 sm:pb-28 lg:pb-32 overflow-hidden">
        <nav
          aria-label="Breadcrumb"
          className="max-w-5xl mx-auto px-6 pt-2"
        >
          <ol className="flex flex-wrap items-center gap-1.5 text-xs font-barlow text-white/60">
            <li>
              <Link href="/" className="hover:text-ecm-lime transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-white/30">/</li>
            <li>
              <Link href="/guides" className="hover:text-ecm-lime transition-colors">
                Guides
              </Link>
            </li>
            <li aria-hidden="true" className="text-white/30">/</li>
            <li aria-current="page" className="text-ecm-lime/90">
              {tag}
            </li>
          </ol>
        </nav>
        <div className="max-w-5xl mx-auto px-6 text-center mt-6">
          <p className="text-ecm-lime/70 font-barlow font-semibold text-xs uppercase tracking-widest mb-2">
            Tag
          </p>
          <h1 className="text-ecm-lime font-barlow font-bold text-3xl sm:text-4xl lg:text-5xl mb-3">
            {tag}
          </h1>
          <p className="text-white/70 font-barlow text-base">
            {guides.length} guide{guides.length === 1 ? "" : "s"} on {tag}
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
          {guides.length === 0 ? (
            <p className="text-ecm-gray text-center py-16 font-barlow">
              No guides found for this tag.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {guides.map((guide) => (
                <Link
                  key={guide._id}
                  href={`/guide/${guide.slug?.current}`}
                  className="group bg-white rounded-xl border border-gray-100 hover:border-ecm-green/20 hover:shadow-lg transition-all overflow-hidden flex flex-col"
                >
                  <div className="h-36 overflow-hidden bg-ecm-green/5 flex items-center justify-center relative">
                    {guide.mainImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={urlFor(guide.mainImage).width(400).height(225).fit("crop").url()}
                        alt={guide.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <GuideIllustration
                        slug={guide.slug?.current}
                        guideNumber={guide.guideNumber ?? 0}
                      />
                    )}
                    {guide.guideNumber !== undefined && (
                      <span className="absolute top-3 left-3 bg-ecm-green text-ecm-lime text-[10px] font-barlow font-bold px-2 py-0.5 rounded-full">
                        Guide {guide.guideNumber}
                      </span>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    {guide.series && (
                      <p className="text-[10px] font-barlow font-semibold uppercase tracking-widest text-ecm-lime-hover mb-1">
                        {guide.series}
                      </p>
                    )}
                    <h2 className="text-ecm-green font-barlow font-bold text-base leading-snug mb-1 group-hover:text-ecm-green-dark transition-colors">
                      {guide.title}
                    </h2>
                    {guide.subtitle && (
                      <p className="text-ecm-gray text-xs font-barlow italic mb-3">
                        {guide.subtitle}
                      </p>
                    )}
                    {guide.excerpt && (
                      <p className="text-ecm-gray-dark text-sm leading-relaxed line-clamp-3 mb-4">
                        {guide.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/guides"
              className="inline-block bg-ecm-green text-white font-barlow font-semibold px-8 py-3 rounded-full hover:bg-ecm-green-dark transition-colors"
            >
              ← All guides
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

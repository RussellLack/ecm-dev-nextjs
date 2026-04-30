import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { PortableText } from "@portabletext/react";
import { getGuide, getAllGuideSlugs } from "@/lib/queries";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { articleSchema } from "@/lib/structuredData";
import { urlFor } from "@/lib/sanity";
import { tagToSlug } from "@/lib/tags";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const slugs = await getAllGuideSlugs();
  return (slugs ?? []).map((s: any) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuide(slug);
  if (!guide) return {};

  const seo = guide.seo || {};
  const title = seo.metaTitle || guide.title;
  const description =
    seo.metaDescription || guide.excerpt || `Read ${guide.title} on ECM.DEV.`;

  const ogImage = seo.ogImage
    ? urlFor(seo.ogImage).width(1200).height(630).fit("crop").crop("center").url()
    : guide.mainImage
      ? urlFor(guide.mainImage).width(1200).height(630).fit("crop").crop("top").url()
      : undefined;

  return {
    title,
    description,
    ...(seo.noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title,
      description,
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

const ptComponents = {
  block: {
    h2: ({ children }: any) => (
      <h2 className="text-ecm-green font-barlow font-bold text-2xl mt-10 mb-4">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-ecm-green font-barlow font-semibold text-xl mt-8 mb-3">{children}</h3>
    ),
    normal: ({ children }: any) => (
      <p className="text-ecm-gray-dark leading-relaxed mb-4">{children}</p>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-ecm-lime pl-6 my-6 italic text-ecm-gray">
        {children}
      </blockquote>
    ),
  },
  marks: {
    link: ({ children, value }: any) => (
      <a href={value?.href} target="_blank" rel="noopener noreferrer"
        className="text-ecm-green underline hover:text-ecm-lime transition-colors">
        {children}
      </a>
    ),
    strong: ({ children }: any) => (
      <strong className="font-semibold text-ecm-green-dark">{children}</strong>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="list-disc pl-6 mb-4 space-y-2 text-ecm-gray-dark">{children}</ul>
    ),
    number: ({ children }: any) => (
      <ol className="list-decimal pl-6 mb-4 space-y-2 text-ecm-gray-dark">{children}</ol>
    ),
  },
};

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = await getGuide(slug);
  if (!guide) notFound();

  return (
    <>
      <JsonLd data={articleSchema(guide, slug, "guide")} />
      {/* Hero */}
      <section className="bg-ecm-green pt-2 pb-16 lg:pb-24">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Guides", path: "/guides" },
            ...(guide.series
              ? [{ name: guide.series, path: "/guides" as const }]
              : []),
            { name: guide.title, path: null },
          ]}
        />
        <div className="max-w-3xl mx-auto px-6 text-center pt-10 lg:pt-14">
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="bg-ecm-lime/20 text-ecm-lime text-xs font-barlow font-bold px-3 py-1 rounded-full">
              {guide.series}
            </span>
            <span className="text-white/40 text-xs font-barlow">Guide {guide.guideNumber}</span>
          </div>
          {guide.tags?.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-5">
              {guide.tags.map((tag: string) => (
                <Link
                  key={tag}
                  href={`/guides/tag/${tagToSlug(tag)}`}
                  className="bg-ecm-lime/20 text-ecm-lime text-xs font-barlow font-semibold px-3 py-1 rounded-full hover:bg-ecm-lime/30 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}
          <h1 className="text-white font-barlow font-bold text-3xl lg:text-5xl leading-tight mb-3">
            {guide.title}
          </h1>
          {guide.subtitle && (
            <p className="text-white/60 font-barlow text-lg italic">{guide.subtitle}</p>
          )}
        </div>
      </section>

      {/* Featured image */}
      {guide.mainImage && (
        <div className="max-w-3xl mx-auto px-6 -mt-8">
          <Image
            src={urlFor(guide.mainImage).width(800).height(450).url()}
            alt={guide.title || ""}
            width={800}
            height={450}
            className="rounded-2xl w-full shadow-lg"
            priority
          />
        </div>
      )}

      {/* Body */}
      <article className="py-16">
        <div className="max-w-3xl mx-auto px-6">
          {guide.body ? (
            <PortableText value={guide.body} components={ptComponents} />
          ) : (
            <p className="text-ecm-gray text-center italic">Full guide content coming soon.</p>
          )}
        </div>
      </article>

      {/* Filed under */}
      {guide.tags?.length > 0 && (
        <section className="pb-10">
          <div className="max-w-3xl mx-auto px-6">
            <div className="border-t border-gray-100 pt-8">
              <p className="text-ecm-gray text-xs font-barlow font-semibold uppercase tracking-widest mb-3">
                Filed under
              </p>
              <div className="flex flex-wrap gap-2">
                {guide.tags.map((tag: string) => (
                  <Link
                    key={tag}
                    href={`/guides/tag/${tagToSlug(tag)}`}
                    className="inline-block border border-ecm-green/30 text-ecm-green text-xs font-barlow font-semibold px-4 py-1.5 rounded-full hover:bg-ecm-green hover:text-white transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}


      {/* Related Guides */}
      {guide.relatedGuides?.length > 0 && (
        <section className="pb-10">
          <div className="max-w-3xl mx-auto px-6">
            <div className="border-t border-gray-100 pt-8">
              <p className="text-ecm-gray text-xs font-barlow font-semibold uppercase tracking-widest mb-5">
                Related Guides
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {guide.relatedGuides.map((related: any) => (
                  <Link
                    key={related._id}
                    href={`/guide/${related.slug?.current}`}
                    className="group flex gap-4 p-4 rounded-xl border border-gray-100 hover:border-ecm-green/20 hover:shadow-md transition-all bg-white"
                  >
                    {/* Guide number badge */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-ecm-green/8 flex items-center justify-center">
                      <span className="text-ecm-green font-barlow font-bold text-xs">
                        {String(related.guideNumber ?? "").padStart(2, "0")}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-barlow font-semibold uppercase tracking-widest text-ecm-lime-hover mb-0.5">
                        {related.series}
                      </p>
                      <p className="text-ecm-green font-barlow font-semibold text-sm leading-snug group-hover:text-ecm-green-dark transition-colors line-clamp-2">
                        {related.title}
                      </p>
                      {related.subtitle && (
                        <p className="text-ecm-gray text-xs italic mt-0.5 line-clamp-1">
                          {related.subtitle}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
      {/* Back */}
      <section className="pb-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <Link href="/guides"
            className="inline-block bg-ecm-green text-white font-barlow font-semibold px-8 py-3 rounded-full hover:bg-ecm-green-dark transition-colors">
            â Back to Guides
          </Link>
        </div>
      </section>
    </>
  );
}

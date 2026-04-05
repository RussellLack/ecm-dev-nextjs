import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { PortableText } from "@portabletext/react";
import { getGuide, getAllGuideSlugs } from "@/lib/queries";
import { urlFor } from "@/lib/sanity";
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
  return {
    title: guide.title,
    description: guide.excerpt || `Read ${guide.title} on ECM.DEV.`,
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
      {/* Hero */}
      <section className="bg-ecm-green py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="bg-ecm-lime/20 text-ecm-lime text-xs font-barlow font-bold px-3 py-1 rounded-full">
              {guide.series}
            </span>
            <span className="text-white/40 text-xs font-barlow">Guide {guide.guideNumber}</span>
          </div>
          {guide.tags?.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-5">
              {guide.tags.map((tag: string, i: number) => (
                <span key={i}
                  className="bg-ecm-lime/20 text-ecm-lime text-xs font-barlow font-semibold px-3 py-1 rounded-full">
                  {tag}
                </span>
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
                {guide.tags.map((tag: string, i: number) => (
                  <span key={i}
                    className="inline-block border border-ecm-green/30 text-ecm-green text-xs font-barlow font-semibold px-4 py-1.5 rounded-full hover:bg-ecm-green hover:text-white transition-colors cursor-default">
                    {tag}
                  </span>
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
            ← Back to Guides
          </Link>
        </div>
      </section>
    </>
  );
}

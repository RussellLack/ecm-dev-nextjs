import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { getAllGuideSeries, getGuideSeriesBySlug } from "@/lib/queries";
import Breadcrumbs from "@/components/Breadcrumbs";
import GuideIllustration from "@/components/guides/GuideIllustration";
import { urlFor } from "@/lib/sanity";

export const revalidate = 3600;

const siteUrl = "https://ecm.dev";

export async function generateStaticParams() {
  const series = await getAllGuideSeries();
  return (series ?? []).slice(0, 50).map((s) => ({ seriesSlug: s.slug?.current }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ seriesSlug: string }>;
}): Promise<Metadata> {
  const { seriesSlug } = await params;
  const series = await getGuideSeriesBySlug(seriesSlug);
  if (!series) return { title: "Series not found" };

  const title = series.seoTitle || `${series.title} — Guides`;
  const description =
    series.seoDescription ||
    series.tagline ||
    `${series.title} — a series of practical guides from ECM.DEV on content infrastructure, governance, and AI-ready operations.`;

  return {
    title,
    description,
    alternates: { canonical: `/guides/${seriesSlug}` },
    openGraph: {
      title,
      description,
      type: "website",
      url: `${siteUrl}/guides/${seriesSlug}`,
    },
    twitter: { card: "summary", title, description },
  };
}

const introComponents = {
  block: {
    normal: ({ children }: any) => (
      <p className="text-ecm-gray-dark leading-relaxed mb-4 last:mb-0">{children}</p>
    ),
  },
  marks: {
    strong: ({ children }: any) => (
      <strong className="font-semibold text-ecm-green-dark">{children}</strong>
    ),
  },
};

type SeriesGuide = {
  _id: string;
  title: string;
  subtitle?: string;
  slug: { current: string };
  guideNumber?: number;
  excerpt?: string;
  tags?: string[];
  mainImage?: any;
};

export default async function GuideSeriesPage({
  params,
}: {
  params: Promise<{ seriesSlug: string }>;
}) {
  const { seriesSlug } = await params;
  const series = await getGuideSeriesBySlug(seriesSlug);
  if (!series) notFound();

  const guides: SeriesGuide[] = series.guides ?? [];
  const allSeries = await getAllGuideSeries();
  const otherSeries = (allSeries ?? []).filter(
    (s) => s.slug?.current !== seriesSlug
  );

  return (
    <>
      {/* Hero */}
      <section className="relative bg-ecm-green py-14 sm:py-20 lg:py-24 pb-24 sm:pb-28 lg:pb-32 overflow-hidden">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Guides", path: "/guides" },
            { name: series.title, path: null },
          ]}
        />
        <div className="max-w-3xl mx-auto px-6 text-center mt-6">
          <p className="text-ecm-lime/70 font-barlow font-semibold text-xs uppercase tracking-widest mb-2">
            Guide series
          </p>
          <h1 className="text-ecm-lime font-barlow font-bold text-3xl sm:text-4xl lg:text-5xl mb-3">
            {series.title}
          </h1>
          {series.tagline && (
            <p className="text-white/75 font-barlow text-base sm:text-lg">
              {series.tagline}
            </p>
          )}
          <p className="text-white/50 font-barlow text-sm mt-3">
            {guides.length} guide{guides.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="wave-divider wave-divider-bottom">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="#ffffff" />
          </svg>
        </div>
      </section>

      {/* Intro */}
      {series.intro && (
        <section className="bg-white pt-12 pb-4">
          <div className="max-w-3xl mx-auto px-6 font-barlow text-base">
            <PortableText value={series.intro} components={introComponents} />
          </div>
        </section>
      )}

      {/* Guides in this series */}
      <section className="bg-white py-12">
        <div className="max-w-5xl mx-auto px-6">
          {guides.length === 0 ? (
            <p className="text-ecm-gray text-center py-16 font-barlow">
              No guides in this series yet.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {guides.map((guide) => (
                <Link
                  key={guide._id}
                  href={`/guide/${guide.slug?.current}`}
                  className="group bg-white rounded-xl border border-gray-100 hover:border-ecm-green/20 hover:shadow-lg transition-all overflow-hidden flex flex-col"
                >
                  <div className="h-40 overflow-hidden bg-ecm-green/5 flex items-center justify-center relative border-b border-gray-100">
                    {guide.mainImage ? (
                      <img
                        src={urlFor(guide.mainImage).width(480).height(270).fit("crop").url()}
                        alt={guide.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <GuideIllustration
                        slug={guide.slug?.current}
                        guideNumber={guide.guideNumber}
                      />
                    )}
                    <span className="absolute top-3 left-3 bg-ecm-green text-ecm-lime text-[10px] font-barlow font-bold px-2 py-0.5 rounded-full">
                      Guide {guide.guideNumber}
                    </span>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <h2 className="text-ecm-green font-barlow font-bold text-lg leading-snug mb-1 group-hover:text-ecm-green-dark transition-colors">
                      {guide.title}
                    </h2>
                    {guide.subtitle && (
                      <p className="text-ecm-gray text-sm font-barlow italic mb-3">
                        {guide.subtitle}
                      </p>
                    )}
                    {guide.excerpt && (
                      <p className="text-ecm-gray-dark text-sm leading-relaxed line-clamp-5 mb-4">
                        {guide.excerpt}
                      </p>
                    )}
                    {guide.tags && guide.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-auto pt-3 border-t border-gray-100">
                        {guide.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-block border border-ecm-green/20 text-ecm-green text-[10px] font-barlow font-semibold px-2 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Other series */}
      {otherSeries.length > 0 && (
        <section className="bg-gray-50 py-14 border-t border-gray-100">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-ecm-green font-barlow font-bold text-xl sm:text-2xl mb-6">
              Other series
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherSeries.map((s) => (
                <Link
                  key={s._id}
                  href={`/guides/${s.slug?.current}`}
                  className="group bg-white rounded-xl border border-gray-100 hover:border-ecm-green/20 hover:shadow-md transition-all p-5"
                >
                  <h3 className="text-ecm-green font-barlow font-semibold text-base leading-snug group-hover:text-ecm-green-dark transition-colors mb-1">
                    {s.title}
                  </h3>
                  {s.tagline && (
                    <p className="text-ecm-gray text-xs font-barlow leading-relaxed mb-2 line-clamp-2">
                      {s.tagline}
                    </p>
                  )}
                  <span className="text-ecm-gray text-xs font-barlow">
                    {s.guideCount} guide{s.guideCount !== 1 ? "s" : ""}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back to all guides */}
      <section className="bg-gray-50 pb-16 text-center">
        <Link
          href="/guides"
          className="inline-block bg-ecm-green text-white font-barlow font-semibold px-8 py-3 rounded-full hover:bg-ecm-green-dark transition-colors"
        >
          ← All guides
        </Link>
      </section>
    </>
  );
}

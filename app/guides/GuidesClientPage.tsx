"use client";

import { useMemo } from "react";
import Link from "next/link";
import { urlFor } from "@/lib/sanity";

type Guide = {
  _id: string;
  title: string;
  subtitle: string;
  slug: { current: string };
  series: string;
  seriesNumber: number;
  guideNumber: number;
  excerpt: string;
  tags: string[];
  mainImage: any;
};

// Alternating band colours: odd = white, even = light gray
const bandBg = (idx: number) =>
  idx % 2 === 0 ? "bg-white" : "bg-gray-50";

export default function GuidesClientPage({ guides }: { guides: Guide[] }) {
  // Group guides by series, preserving seriesNumber order
  const seriesBands = useMemo(() => {
    const map = new Map<string, { seriesNumber: number; guides: Guide[] }>();
    for (const guide of guides) {
      if (!map.has(guide.series)) {
        map.set(guide.series, { seriesNumber: guide.seriesNumber ?? 99, guides: [] });
      }
      map.get(guide.series)!.guides.push(guide);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[1].seriesNumber - b[1].seriesNumber)
      .map(([series, { guides }]) => ({ series, guides }));
  }, [guides]);

  return (
    <>
      {/* Hero */}
      <section className="relative bg-ecm-green py-14 sm:py-20 lg:py-28 pb-24 sm:pb-28 lg:pb-36 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-ecm-lime/70 font-barlow font-semibold text-sm uppercase tracking-widest mb-3">
            ECM.DEV Guide Library
          </p>
          <h1 className="text-ecm-lime font-barlow font-bold text-3xl sm:text-4xl lg:text-5xl mb-4">
            GUIDES
          </h1>
          <p className="text-white/70 font-barlow text-lg max-w-2xl mx-auto">
            Practical frameworks for content infrastructure, governance, and AI-ready operations.
          </p>
        </div>
        {/* Wave divider */}
        <div className="wave-divider wave-divider-bottom">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="#ffffff" />
          </svg>
        </div>
      </section>

      {/* Series bands */}
      {seriesBands.map(({ series, guides }, bandIdx) => (
        <section
          key={series}
          className={`${bandBg(bandIdx)} py-16 border-b border-gray-100`}
        >
          <div className="max-w-5xl mx-auto px-6">
            {/* Series header */}
            <div className="flex items-baseline gap-4 mb-8">
              <div className="flex-shrink-0">
                <p className="text-ecm-lime/60 font-barlow font-semibold text-xs uppercase tracking-widest mb-1">
                  Series
                </p>
                <h2 className="text-ecm-green font-barlow font-bold text-2xl sm:text-3xl">
                  {series}
                </h2>
              </div>
              <div className="flex-1 h-px bg-ecm-green/10 mb-1" />
              <span className="text-ecm-gray text-xs font-barlow flex-shrink-0">
                {guides.length} guide{guides.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Guide cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {guides.map((guide) => (
                <Link
                  key={guide._id}
                  href={`/guide/${guide.slug?.current}`}
                  className="group bg-white rounded-xl border border-gray-100 hover:border-ecm-green/20 hover:shadow-lg transition-all overflow-hidden flex flex-col"
                >
                  {/* Image or number badge */}
                  <div className="h-36 overflow-hidden bg-ecm-green/5 flex items-center justify-center relative">
                    {guide.mainImage ? (
                      <img
                        src={urlFor(guide.mainImage).width(400).height(225).fit("crop").url()}
                        alt={guide.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-1">
                        <span className="text-ecm-green/20 font-barlow font-bold text-5xl leading-none">
                          {String(guide.guideNumber ?? "").padStart(2, "0")}
                        </span>
                        <span className="text-ecm-green/30 font-barlow text-xs uppercase tracking-widest">
                          {guide.series}
                        </span>
                      </div>
                    )}
                    {/* Guide number badge */}
                    <span className="absolute top-3 left-3 bg-ecm-green text-ecm-lime text-[10px] font-barlow font-bold px-2 py-0.5 rounded-full">
                      Guide {guide.guideNumber}
                    </span>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-ecm-green font-barlow font-bold text-base leading-snug mb-1 group-hover:text-ecm-green-dark transition-colors">
                      {guide.title}
                    </h3>
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
                    {guide.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-auto pt-3 border-t border-gray-100">
                        {guide.tags.slice(0, 3).map((tag, j) => (
                          <span
                            key={j}
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
          </div>
        </section>
      ))}

      {/* Empty state */}
      {seriesBands.length === 0 && (
        <section className="py-32 bg-white text-center">
          <p className="text-ecm-gray font-barlow text-lg">Guides coming soon.</p>
        </section>
      )}
    </>
  );
}

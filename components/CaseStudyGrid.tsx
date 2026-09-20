"use client";

import { useState } from "react";
import Link from "next/link";
import { PillarTags, PILLAR_TAG_COLORS } from "@/components/TagChip";
import { INDUSTRY_OPTIONS } from "@/sanity/schemas/taxonomyOptions";

// Cards never show the real client name (anonymised by design), the
// subtitle uses the industry taxonomy instead.
const INDUSTRY_LABEL: Record<string, string> = Object.fromEntries(
  INDUSTRY_OPTIONS.map((o) => [o.value, o.title])
);

// The filter bar shows only the 3 pillars, not the much larger set of
// free-text industry/technique tags stored on each case study (those still
// render as descriptive chips on the cards below). Matching is done against
// the `pillars` slug field, not `tags`, since most case studies carry a
// pillars value without the matching literal string in tags.
const PILLARS: { slug: string; title: string }[] = [
  { slug: "technology", title: "Content Technology" },
  { slug: "services", title: "Content Operations" },
  { slug: "localization", title: "Content Localization" },
];

interface CaseStudy {
  _id?: string;
  title: string;
  slug: { current: string };
  client: string;
  industry?: string;
  tags?: string[];
  pillars?: string[];
  description: string;
}

export default function CaseStudyGrid({
  caseStudies,
}: {
  caseStudies: CaseStudy[];
}) {
  const [activePillar, setActivePillar] = useState<string | null>(null);

  const pillarsWithCounts = PILLARS.map((p) => ({
    ...p,
    count: caseStudies.filter((cs) => cs.pillars?.includes(p.slug)).length,
  })).filter((p) => p.count > 0);

  const filtered = activePillar
    ? caseStudies.filter((cs) => cs.pillars?.includes(activePillar))
    : caseStudies;

  return (
    <>
      {/* Pillar filter bar */}
      <div className="flex flex-wrap gap-3 mb-12 justify-center">
        <button
          onClick={() => setActivePillar(null)}
          className={`text-sm font-barlow font-medium px-4 py-2 rounded-full transition-all ${
            activePillar === null
              ? "bg-ecm-green text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All ({caseStudies.length})
        </button>
        {pillarsWithCounts.map((p) => {
          const isActive = activePillar === p.slug;
          const colorClass = PILLAR_TAG_COLORS[p.title] || "bg-gray-200 text-gray-700";

          return (
            <button
              key={p.slug}
              onClick={() => setActivePillar(isActive ? null : p.slug)}
              className={`text-sm font-barlow font-medium px-4 py-2 rounded-full transition-all ${
                isActive
                  ? `${colorClass} shadow-md ring-2 ring-offset-1 ring-current`
                  : `${colorClass} hover:opacity-80`
              }`}
            >
              {p.title} ({p.count})
            </button>
          );
        })}
      </div>

      {/* Case study cards */}
      <div className="grid md:grid-cols-2 gap-8">
        {filtered.map((cs, i) => (
          <Link
            key={cs._id || i}
            href={`/case-study/${cs.slug?.current || ""}`}
            aria-label={`View case study: ${cs.title}`}
            className="block bg-ecm-green rounded-2xl p-8 hover:shadow-lg hover:shadow-ecm-lime/5 transition-all border border-ecm-lime/15 hover:border-ecm-lime/40 group"
          >
            <div className="flex flex-wrap gap-2 mb-4">
              <PillarTags pillars={cs.pillars} />
            </div>
            <h3 className="text-ecm-lime font-barlow font-bold text-xl mb-2 group-hover:text-white transition-colors">
              {cs.title}
            </h3>
            {cs.industry && (
              <p className="text-white/60 text-sm font-medium mb-3">
                {INDUSTRY_LABEL[cs.industry] ?? cs.industry}
              </p>
            )}
            <p className="text-white/70 text-sm leading-relaxed line-clamp-3">
              {cs.description}
            </p>
            <span className="inline-block mt-4 text-ecm-lime font-barlow font-semibold text-sm group-hover:underline">
              View project →
            </span>
          </Link>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <p className="text-center text-ecm-gray font-barlow text-lg py-12">
          No projects found for this filter.
        </p>
      )}
    </>
  );
}

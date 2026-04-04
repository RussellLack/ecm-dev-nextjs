"use client";

import { useState } from "react";
import Link from "next/link";

const tagColors: Record<string, string> = {
  "Content Localization": "bg-blue-100 text-blue-800",
  "Content Technology": "bg-purple-100 text-purple-800",
  "Content Services": "bg-green-100 text-green-800",
};

interface CaseStudy {
  _id?: string;
  title: string;
  slug: { current: string };
  client: string;
  tags?: string[];
  description: string;
}

export default function CaseStudyGrid({
  caseStudies,
}: {
  caseStudies: CaseStudy[];
}) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Collect all unique tags from the data
  const allTags = Array.from(
    new Set(caseStudies.flatMap((cs) => cs.tags || []))
  ).sort();

  const filtered = activeTag
    ? caseStudies.filter((cs) => cs.tags?.includes(activeTag))
    : caseStudies;

  return (
    <>
      {/* Tag filter bar */}
      <div className="flex flex-wrap gap-3 mb-12 justify-center">
        <button
          onClick={() => setActiveTag(null)}
          className={`text-sm font-barlow font-medium px-4 py-2 rounded-full transition-all ${
            activeTag === null
              ? "bg-ecm-green text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All ({caseStudies.length})
        </button>
        {allTags.map((tag) => {
          const count = caseStudies.filter((cs) =>
            cs.tags?.includes(tag)
          ).length;
          const isActive = activeTag === tag;
          const colorClass = tagColors[tag] || "bg-gray-200 text-gray-700";

          return (
            <button
              key={tag}
              onClick={() => setActiveTag(isActive ? null : tag)}
              className={`text-sm font-barlow font-medium px-4 py-2 rounded-full transition-all ${
                isActive
                  ? `${colorClass} shadow-md ring-2 ring-offset-1 ring-current`
                  : `${colorClass} hover:opacity-80`
              }`}
            >
              {tag} ({count})
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
            className="block bg-ecm-green rounded-2xl p-8 hover:shadow-lg hover:shadow-ecm-lime/5 transition-all border border-ecm-lime/15 hover:border-ecm-lime/40 group"
          >
            <div className="flex flex-wrap gap-2 mb-4">
              {cs.tags?.map((tag: string) => (
                <span
                  key={tag}
                  className={`${
                    tagColors[tag] || "bg-gray-200 text-gray-700"
                  } text-xs font-barlow font-medium px-3 py-1 rounded-full`}
                >
                  {tag}
                </span>
              ))}
            </div>
            <h3 className="text-ecm-lime font-barlow font-bold text-xl mb-2 group-hover:text-white transition-colors">
              {cs.title}
            </h3>
            <p className="text-white/60 text-sm font-medium mb-3">
              {cs.client}
            </p>
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

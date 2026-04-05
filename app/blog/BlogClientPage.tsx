"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { urlFor } from "@/lib/sanity";

type Post = {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  mainImage: any;
  tags: string[];
};

/* ── Tag group definitions ────────────────────────────────────────────────── */

const TAG_GROUPS: { label: string; match: (tag: string) => boolean }[] = [
  {
    label: "CMS & Platforms",
    match: (t) =>
      /kentico|sitecore|sanity|contentful|optimizely|ibexa|hyland|headless|dxp|cms(?!\s+workflow)|b2b.*(?:commerce|digital|platform)|european dxp|content.*repository|content.*federation/i.test(t) &&
      !/migration|upgrade|modernisation|replace|legacy|performance|implement|selection/i.test(t),
  },
  {
    label: "AI & Automation",
    match: (t) =>
      /\bai\b|agentic|automation|generative|content.*agent|llm/i.test(t),
  },
  {
    label: "Content Operations",
    match: (t) =>
      /content.*(?:operations|ops|strategy|management|scaling|marketing|publishing)|cms.*(?:workflow|roi|publishing)|brand.*community|b2b.*(?:content|buyer)/i.test(t),
  },
  {
    label: "Localisation & Search",
    match: (t) =>
      /locali[sz]ation|multilingual|internationalisation|geo.*seo|search.*visib|answer.*engine|generative.*engine|regional|social.*media.*local|website.*locali/i.test(t),
  },
  {
    label: "Migration & Modernisation",
    match: (t) =>
      /migrat|upgrade|modernis|legacy|end.*of.*life|replace.*cms|performance.*issue|implement|selection.*criteria/i.test(t),
  },
];

function groupTags(allTags: string[]): { label: string; tags: string[] }[] {
  const assigned = new Set<string>();
  const groups: { label: string; tags: string[] }[] = [];

  for (const group of TAG_GROUPS) {
    const matched = allTags.filter((t) => !assigned.has(t) && group.match(t));
    matched.forEach((t) => assigned.add(t));
    if (matched.length > 0) {
      groups.push({ label: group.label, tags: matched });
    }
  }

  // Anything unmatched goes into "Other"
  const remaining = allTags.filter((t) => !assigned.has(t));
  if (remaining.length > 0) {
    groups.push({ label: "Other", tags: remaining });
  }

  return groups;
}

/* ── Component ────────────────────────────────────────────────────────────── */

export default function BlogClientPage({ posts }: { posts: Post[] }) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const seen = new Set<string>();
    const tags: string[] = [];
    for (const post of posts) {
      for (const tag of post.tags ?? []) {
        if (!seen.has(tag)) {
          seen.add(tag);
          tags.push(tag);
        }
      }
    }
    return tags;
  }, [posts]);

  const tagGroups = useMemo(() => groupTags(allTags), [allTags]);

  const filteredPosts = useMemo(
    () =>
      activeTag
        ? posts.filter((p) => p.tags?.includes(activeTag))
        : posts,
    [posts, activeTag]
  );

  const toggleGroup = (label: string) => {
    setOpenGroup(openGroup === label ? null : label);
  };

  return (
    <>
      {/* Hero */}
      <section className="relative bg-ecm-green py-14 sm:py-20 lg:py-28 pb-24 sm:pb-28 lg:pb-36 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-ecm-lime font-barlow font-bold text-3xl sm:text-4xl lg:text-5xl">
            BLOG
          </h1>
        </div>
        <div className="wave-divider wave-divider-bottom">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="#ffffff" />
          </svg>
        </div>
      </section>

      {/* Tag filter — grouped accordion */}
      <section className="bg-white pt-10 pb-2">
        <div className="max-w-5xl mx-auto px-6">
          {/* All button + active filter status */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => { setActiveTag(null); setOpenGroup(null); }}
              className={`font-barlow font-semibold text-xs px-4 py-1.5 rounded-full border transition-colors ${
                activeTag === null
                  ? "bg-ecm-green text-white border-ecm-green"
                  : "border-ecm-green/30 text-ecm-green hover:bg-ecm-green hover:text-white"
              }`}
            >
              All
            </button>
            {activeTag && (
              <p className="text-ecm-gray text-xs font-barlow">
                Showing {filteredPosts.length} article{filteredPosts.length !== 1 ? "s" : ""} tagged{" "}
                <span className="font-semibold text-ecm-green">{activeTag}</span>
                {" — "}
                <button
                  onClick={() => setActiveTag(null)}
                  className="underline hover:text-ecm-green transition-colors"
                >
                  clear filter
                </button>
              </p>
            )}
          </div>

          {/* Accordion groups */}
          <div className="flex flex-wrap gap-2">
            {tagGroups.map((group) => {
              const isOpen = openGroup === group.label;
              const hasActive = group.tags.includes(activeTag ?? "");
              return (
                <div key={group.label} className="relative">
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className={`inline-flex items-center gap-1.5 font-barlow font-semibold text-xs px-4 py-1.5 rounded-full border transition-colors ${
                      hasActive
                        ? "bg-ecm-green text-white border-ecm-green"
                        : isOpen
                        ? "bg-ecm-green/10 text-ecm-green border-ecm-green/40"
                        : "border-ecm-green/30 text-ecm-green hover:bg-ecm-green/10"
                    }`}
                  >
                    {group.label}
                    <span className="text-[10px] opacity-60">({group.tags.length})</span>
                    <svg
                      className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Expanded tag list for the open group */}
          {openGroup && (
            <div className="mt-3 flex flex-wrap gap-1.5 pb-2 animate-[fadeIn_150ms_ease-out]">
              {tagGroups
                .find((g) => g.label === openGroup)
                ?.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                    className={`font-barlow font-semibold text-xs px-3 py-1 rounded-full border transition-colors ${
                      activeTag === tag
                        ? "bg-ecm-green text-white border-ecm-green"
                        : "border-ecm-green/20 text-ecm-green/80 hover:bg-ecm-green hover:text-white"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
            </div>
          )}
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-8 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          {filteredPosts.length === 0 ? (
            <p className="text-ecm-gray text-center py-16 font-barlow">
              No articles found for this tag.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredPosts.map((post, i) => (
                <Link
                  key={post._id || i}
                  href={`/post/${post.slug?.current}`}
                  className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group border border-gray-100 flex flex-col"
                >
                  <div className="h-36 overflow-hidden bg-gray-50 flex items-center justify-center">
                    {post.mainImage ? (
                      <img
                        src={urlFor(post.mainImage).width(400).height(225).fit("crop").url()}
                        alt={post.title || "Blog post image"}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-ecm-green/20 rounded-lg" />
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h2 className="text-ecm-green font-barlow font-semibold text-sm mb-2 group-hover:text-ecm-green-dark transition-colors leading-snug">
                      {post.title}
                    </h2>
                    <p className="text-ecm-gray text-xs mb-3">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString("en-GB", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : ""}
                    </p>
                    {post.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-auto pt-3 border-t border-gray-100">
                        {post.tags.slice(0, 3).map((tag, j) => (
                          <span
                            key={j}
                            onClick={(e) => {
                              e.preventDefault();
                              setActiveTag(activeTag === tag ? null : tag);
                            }}
                            className={`inline-block border text-[10px] font-barlow font-semibold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                              activeTag === tag
                                ? "bg-ecm-green text-white border-ecm-green"
                                : "border-ecm-green/25 text-ecm-green hover:bg-ecm-green hover:text-white"
                            }`}
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
    </>
  );
}

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { urlFor } from "@/lib/sanity";
import PostIllustration from "@/components/post/PostIllustration";

type Post = {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  mainImage: any;
  tags: string[];
};

/* ── Tag group definitions ────────────────────────────────────────────────── */

// Explicit allowlists — retired the previous regex heuristic that was
// dropping half the vendor names (Umbraco, WordPress, Drupal, Palmata,
// Claude Code, n8n…) into "Other" because they weren't spelled out in
// the regex. The lists below name every vendor / product / topic that
// currently appears in Sanity; edit here when new ones are added. Any
// tag that appears in Sanity but isn't in either list still falls to
// "Other", making an unclassified new entry loud instead of silent.
//
// CMS_PLATFORMS = real content platforms (CMSes, DXPs, discovery/AI-
// discovery products tied to a CMS).
// AI_TOOLS      = AI assistants, agent frameworks, automation tools —
// anything mentioned in a post as a build/agent/automation building
// block rather than a content platform.
const CMS_PLATFORMS = new Set<string>([
  "Kentico",
  "Sitecore",
  "Sanity",
  "Contentful",
  "Optimizely",
  "Ibexa",
  "Hyland",
  "Umbraco",
  "WordPress",
  "Drupal",
  "Acquia",
  "Palmata",
]);

const AI_TOOLS = new Set<string>([
  "Claude Code",
  "Cursor",
  "Salesforce Agentforce",
  "n8n",
  "Activepieces",
  "ECA",
  "FlowDrop",
  "Maestro",
]);

// Canonical topic enum (sanity/schemas/taxonomyOptions.ts) →
// which filter group each topic belongs under. Data-driven, no regex.
const TOPIC_GROUP: Record<string, string> = {
  CMS: "CMS & Platforms",
  DXP: "CMS & Platforms",
  DAM: "CMS & Platforms",
  PIM: "CMS & Platforms",
  Search: "CMS & Platforms",
  Personalization: "CMS & Platforms",
  Analytics: "CMS & Platforms",
  AI: "AI & Automation",
  ContentOps: "Content Operations",
  Workflow: "Content Operations",
  Governance: "Content Operations",
  Compliance: "Content Operations",
};

// Preserve display order: groups appear in the filter bar in this order
// no matter what order they get populated.
const GROUP_ORDER = [
  "CMS & Platforms",
  "AI & Automation",
  "Content Operations",
  "Other",
] as const;

function tagGroup(tag: string): string {
  if (CMS_PLATFORMS.has(tag)) return "CMS & Platforms";
  if (AI_TOOLS.has(tag)) return "AI & Automation";
  if (tag in TOPIC_GROUP) return TOPIC_GROUP[tag];
  return "Other";
}

function groupTags(allTags: string[]): { label: string; tags: string[] }[] {
  const buckets = new Map<string, string[]>();
  for (const tag of allTags) {
    const label = tagGroup(tag);
    const list = buckets.get(label);
    if (list) list.push(tag);
    else buckets.set(label, [tag]);
  }
  return GROUP_ORDER
    .filter((label) => buckets.has(label))
    .map((label) => ({ label, tags: buckets.get(label)! }));
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
                  className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow group border border-gray-100 flex flex-col"
                >
                  <div className="h-36 overflow-hidden bg-ecm-green/5 flex items-center justify-center border-b border-gray-100">
                    <PostIllustration
                      slug={post.slug?.current}
                      mainImage={post.mainImage}
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-1 bg-gray-50">
                    <h2 className="text-ecm-green font-barlow font-semibold text-sm mb-2 group-hover:text-ecm-green-dark transition-colors leading-snug">
                      {post.title}
                    </h2>
                    <p className="text-ecm-gray text-xs mb-3">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString("en-GB", {
                            year: "numeric",
                            month: "long",
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

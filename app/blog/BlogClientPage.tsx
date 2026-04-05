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

export default function BlogClientPage({ posts }: { posts: Post[] }) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Collect all unique tags across all posts, preserving first-seen order
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

  const filteredPosts = useMemo(
    () =>
      activeTag
        ? posts.filter((p) => p.tags?.includes(activeTag))
        : posts,
    [posts, activeTag]
  );

  return (
    <>
      {/* Hero */}
      <section className="relative bg-ecm-green py-14 sm:py-20 lg:py-28 pb-24 sm:pb-28 lg:pb-36 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-ecm-lime font-barlow font-bold text-3xl sm:text-4xl lg:text-5xl">
            BLOG
          </h1>
        </div>
        {/* Wave divider */}
        <div className="wave-divider wave-divider-bottom">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="#ffffff" />
          </svg>
        </div>
      </section>

      {/* Tag filter bar */}
      <section className="bg-white pt-10 pb-2">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={() => setActiveTag(null)}
              className={`font-barlow font-semibold text-xs px-4 py-1.5 rounded-full border transition-colors ${
                activeTag === null
                  ? "bg-ecm-green text-white border-ecm-green"
                  : "border-ecm-green/30 text-ecm-green hover:bg-ecm-green hover:text-white"
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`font-barlow font-semibold text-xs px-4 py-1.5 rounded-full border transition-colors ${
                  activeTag === tag
                    ? "bg-ecm-green text-white border-ecm-green"
                    : "border-ecm-green/30 text-ecm-green hover:bg-ecm-green hover:text-white"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          {activeTag && (
            <p className="text-ecm-gray text-xs font-barlow mt-3">
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

"use client";

import { useMemo, useState } from "react";

export type IntelTopic = { title: string; slug: string };

export type IntelArticle = {
  id: string;
  title: string;
  url: string;
  source: { title: string; url: string | null } | null;
  publishedDate: string | null;
  summary: string | null;
  keyInsight: string | null;
  topics: IntelTopic[];
  vendors: string[];
  contentAngle: string | null;
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function IntelBoard({
  articles,
  topics,
}: {
  articles: IntelArticle[];
  topics: IntelTopic[];
}) {
  const [activeTopic, setActiveTopic] = useState<string | null>(null);

  // Only offer topic chips that actually tag at least one article.
  const availableTopics = useMemo(() => {
    const slugsInUse = new Set<string>();
    for (const a of articles) {
      for (const t of a.topics) slugsInUse.add(t.slug);
    }
    return topics.filter((t) => slugsInUse.has(t.slug));
  }, [topics, articles]);

  const filtered = useMemo(() => {
    if (!activeTopic) return articles;
    return articles.filter((a) =>
      a.topics.some((t) => t.slug === activeTopic)
    );
  }, [articles, activeTopic]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="mb-10">
        <h1 className="text-4xl font-semibold tracking-tight">Intel</h1>
        <p className="mt-3 max-w-2xl text-neutral-600">
          AI-enriched briefings on Enterprise Content Management, CMS,
          ContentOps, and AI-for-content. Pulled from industry feeds and
          filtered for decision-useful signal.
        </p>
      </header>

      {availableTopics.length > 0 && (
        <nav
          aria-label="Filter by topic"
          className="mb-10 flex flex-wrap gap-2"
        >
          <button
            type="button"
            onClick={() => setActiveTopic(null)}
            className={`rounded-full border px-3 py-1 text-sm transition ${
              activeTopic === null
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-500"
            }`}
          >
            All
          </button>
          {availableTopics.map((t) => {
            const active = activeTopic === t.slug;
            return (
              <button
                key={t.slug}
                type="button"
                onClick={() => setActiveTopic(active ? null : t.slug)}
                className={`rounded-full border px-3 py-1 text-sm transition ${
                  active
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-500"
                }`}
              >
                {t.title}
              </button>
            );
          })}
        </nav>
      )}

      {filtered.length === 0 ? (
        <p className="text-neutral-500">
          No articles match that filter yet. Check back soon.
        </p>
      ) : (
        <ul className="space-y-8">
          {filtered.map((article) => (
            <li
              key={article.id}
              className="border-b border-neutral-200 pb-8 last:border-0"
            >
              <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-wide text-neutral-500">
                {article.source?.title && (
                  <span className="font-medium text-neutral-700">
                    {article.source.title}
                  </span>
                )}
                <span>·</span>
                <time dateTime={article.publishedDate ?? undefined}>
                  {formatDate(article.publishedDate)}
                </time>
                {article.topics.length > 0 && (
                  <>
                    <span>·</span>
                    <span>
                      {article.topics.map((t) => t.title).join(" · ")}
                    </span>
                  </>
                )}
              </div>

              <h2 className="text-xl font-semibold text-neutral-900">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {article.title}
                </a>
              </h2>

              {article.keyInsight && (
                <p className="mt-3 text-neutral-800">
                  <span className="font-medium text-neutral-900">
                    Key insight ·{" "}
                  </span>
                  {article.keyInsight}
                </p>
              )}

              {article.summary && (
                <p className="mt-2 text-neutral-700">{article.summary}</p>
              )}

              {article.contentAngle && (
                <p className="mt-3 rounded-md border-l-2 border-neutral-900 bg-neutral-50 px-4 py-2 text-sm text-neutral-700">
                  <span className="font-medium text-neutral-900">
                    ECM.DEV angle ·{" "}
                  </span>
                  {article.contentAngle}
                </p>
              )}

              {article.vendors.length > 0 && (
                <p className="mt-3 text-xs text-neutral-500">
                  Vendors mentioned: {article.vendors.join(", ")}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

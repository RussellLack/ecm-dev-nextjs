import Link from "next/link";
import type { IntelHubArticle } from "@/lib/intel/queries";

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

/**
 * Server-rendered article list shared by /intel/topic/[slug] and
 * /intel/vendor/[slug] hub pages. The interactive filter UI on /intel
 * itself lives in IntelBoard (a client component) — this list intentionally
 * stays static so the hub pages render fully on the server and benefit
 * from the same crawlable cross-links between topics and vendors.
 */
export default function IntelArticleList({
  articles,
}: {
  articles: IntelHubArticle[];
}) {
  if (!articles.length) {
    return (
      <p className="text-neutral-500">
        No published articles for this filter yet. Check back soon.
      </p>
    );
  }

  return (
    <ul className="space-y-8">
      {articles.map((article) => (
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

          {(article.topics.length > 0 || article.vendors.length > 0) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {article.topics.map((t) => (
                <Link
                  key={`topic-${t.slug}`}
                  href={`/intel/topic/${t.slug}`}
                  className="text-xs rounded-full border border-neutral-300 bg-white px-3 py-1 text-neutral-700 hover:border-neutral-500 transition-colors"
                >
                  {t.title}
                </Link>
              ))}
              {article.vendors
                .filter((v) => v.slug)
                .map((v) => (
                  <Link
                    key={`vendor-${v.slug}`}
                    href={`/intel/vendor/${v.slug}`}
                    className="text-xs rounded-full border border-neutral-900/10 bg-neutral-900 text-white px-3 py-1 hover:bg-neutral-800 transition-colors"
                  >
                    {v.name}
                  </Link>
                ))}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

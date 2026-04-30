import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getActiveIntelTopics,
  getIntelArticlesByTopic,
  getIntelTopicBySlug,
} from "@/lib/intel/queries";
import IntelArticleList from "../../IntelArticleList";

export const revalidate = 300;

export async function generateStaticParams() {
  const topics = await getActiveIntelTopics().catch(() => []);
  return (topics ?? []).map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const topic = await getIntelTopicBySlug(slug).catch(() => null);
  if (!topic) return { title: "Topic not found" };

  const title = `${topic.title} — Intel`;
  const description = `Curated industry signal on ${topic.title}: AI-enriched briefings on Enterprise Content Management, CMS, ContentOps, and AI-for-content.`;
  return {
    title,
    description,
    alternates: { canonical: `/intel/topic/${slug}` },
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function IntelTopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [topic, articles] = await Promise.all([
    getIntelTopicBySlug(slug).catch(() => null),
    getIntelArticlesByTopic(slug).catch(() => []),
  ]);
  if (!topic) notFound();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-500">
          <li>
            <Link href="/" className="hover:text-neutral-900 transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href="/intel"
              className="hover:text-neutral-900 transition-colors"
            >
              Intel
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>Topic</li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-neutral-900">
            {topic.title}
          </li>
        </ol>
      </nav>

      <header className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-2">
          Topic
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">{topic.title}</h1>
        <p className="mt-3 max-w-2xl text-neutral-600">
          {articles.length} curated{" "}
          {articles.length === 1 ? "briefing" : "briefings"} on {topic.title}.
          Updated as new signal lands in the feed.
        </p>
      </header>

      <IntelArticleList articles={articles} />

      <div className="mt-12">
        <Link
          href="/intel"
          className="text-sm text-neutral-700 hover:text-neutral-900 transition-colors"
        >
          ← All intel
        </Link>
      </div>
    </main>
  );
}

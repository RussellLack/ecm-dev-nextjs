import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { urlFor } from "@/lib/sanity";
import { getAllPostTags, getPostsByTag } from "@/lib/queries";
import { tagFromSlug, tagToSlug } from "@/lib/tags";

export const revalidate = 60;

export async function generateStaticParams() {
  const tags = await getAllPostTags().catch(() => []);
  return tags.map((tag) => ({ tag: tagToSlug(tag) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag: tagSlug } = await params;
  const tags = await getAllPostTags().catch(() => []);
  const tag = tagFromSlug(tagSlug, tags);
  if (!tag) return { title: "Tag not found" };

  const title = `${tag} — Blog`;
  const description = `Articles tagged ${tag} from ECM.DEV — insights on content infrastructure, AI-ready operations, and enterprise content strategy.`;
  return {
    title,
    description,
    alternates: { canonical: `/blog/tag/${tagSlug}` },
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

type Post = {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  publishedAt?: string;
  mainImage?: any;
  tags?: string[];
};

export default async function BlogTagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag: tagSlug } = await params;
  const allTags = await getAllPostTags().catch(() => []);
  const tag = tagFromSlug(tagSlug, allTags);
  if (!tag) notFound();

  const posts = (await getPostsByTag(tag).catch(() => [])) as Post[];

  return (
    <>
      <section className="relative bg-ecm-green py-14 sm:py-20 lg:py-24 pb-24 sm:pb-28 lg:pb-32 overflow-hidden">
        <nav
          aria-label="Breadcrumb"
          className="max-w-5xl mx-auto px-6 pt-2"
        >
          <ol className="flex flex-wrap items-center gap-1.5 text-xs font-barlow text-white/60">
            <li>
              <Link href="/" className="hover:text-ecm-lime transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-white/30">/</li>
            <li>
              <Link href="/blog" className="hover:text-ecm-lime transition-colors">
                Blog
              </Link>
            </li>
            <li aria-hidden="true" className="text-white/30">/</li>
            <li aria-current="page" className="text-ecm-lime/90">
              {tag}
            </li>
          </ol>
        </nav>
        <div className="max-w-5xl mx-auto px-6 text-center mt-6">
          <p className="text-ecm-lime/70 font-barlow font-semibold text-xs uppercase tracking-widest mb-2">
            Tag
          </p>
          <h1 className="text-ecm-lime font-barlow font-bold text-3xl sm:text-4xl lg:text-5xl mb-3">
            {tag}
          </h1>
          <p className="text-white/70 font-barlow text-base">
            {posts.length} article{posts.length === 1 ? "" : "s"} on {tag}
          </p>
        </div>
        <div className="wave-divider wave-divider-bottom">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="#ffffff" />
          </svg>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          {posts.length === 0 ? (
            <p className="text-ecm-gray text-center py-16 font-barlow">
              No articles found for this tag.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {posts.map((post) => (
                <Link
                  key={post._id}
                  href={`/post/${post.slug?.current}`}
                  className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group border border-gray-100 flex flex-col"
                >
                  <div className="h-36 overflow-hidden bg-gray-50 flex items-center justify-center">
                    {post.mainImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
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
                    {post.publishedAt && (
                      <p className="text-ecm-gray text-xs mb-3">
                        {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    )}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-auto pt-3 border-t border-gray-100">
                        {post.tags.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className={`inline-block border text-[10px] font-barlow font-semibold px-2 py-0.5 rounded-full ${
                              t === tag
                                ? "bg-ecm-green text-white border-ecm-green"
                                : "border-ecm-green/25 text-ecm-green"
                            }`}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/blog"
              className="inline-block bg-ecm-green text-white font-barlow font-semibold px-8 py-3 rounded-full hover:bg-ecm-green-dark transition-colors"
            >
              ← All articles
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

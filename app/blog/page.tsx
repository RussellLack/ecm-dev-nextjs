import Link from "next/link";
import type { Metadata } from "next";
import { getBlogPosts } from "@/lib/queries";
import { urlFor } from "@/lib/sanity";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Insights on content operations, CMS architecture, AI-driven workflows, and enterprise content strategy from ECM.DEV.",
};

export default async function BlogPage() {
  const blogPosts = await getBlogPosts();

  return (
    <>
      {/* Hero */}
      <section className="relative bg-ecm-green py-14 sm:py-20 lg:py-28 pb-24 sm:pb-28 lg:pb-36 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-ecm-lime font-barlow font-bold text-3xl sm:text-4xl lg:text-5xl">
            BLOG
          </h1>
        </div>
        {/* Wave divider: green → white */}
        <div className="wave-divider wave-divider-bottom">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="#ffffff" />
          </svg>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {blogPosts?.map((post: any, i: number) => (
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
                      {post.tags.slice(0, 3).map((tag: string, j: number) => (
                        <span
                          key={j}
                          className="inline-block border border-ecm-green/25 text-ecm-green text-[10px] font-barlow font-semibold px-2 py-0.5 rounded-full group-hover:border-ecm-green/50 transition-colors"
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
    </>
  );
}

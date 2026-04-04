import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { PortableText } from "@portabletext/react";
import { getPost } from "@/lib/queries";
import { urlFor } from "@/lib/sanity";
import { notFound } from "next/navigation";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  const ogImage = post.mainImage
    ? urlFor(post.mainImage).width(1200).height(630).fit("crop").crop("top").url()
    : undefined;

  return {
    title: post.title,
    description:
      post.excerpt ||
      `Read ${post.title} on ECM.DEV — insights on content infrastructure and AI-ready operations.`,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      type: "article",
      publishedTime: post.publishedAt || undefined,
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt || undefined,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

/* ─── Portable Text components for rich body content ─── */
const ptComponents = {
  types: {
    image: ({ value }: any) => {
      if (!value?.asset) return null;
      return (
        <figure className="my-8">
          <Image
            src={urlFor(value).width(800).url()}
            alt={value.alt || ""}
            width={800}
            height={450}
            className="rounded-lg w-full"
          />
        </figure>
      );
    },
  },
  block: {
    h2: ({ children }: any) => (
      <h2 className="text-ecm-green font-barlow font-bold text-2xl mt-10 mb-4">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-ecm-green font-barlow font-semibold text-xl mt-8 mb-3">
        {children}
      </h3>
    ),
    normal: ({ children }: any) => (
      <p className="text-ecm-gray-dark leading-relaxed mb-4">{children}</p>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-ecm-lime pl-6 my-6 italic text-ecm-gray">
        {children}
      </blockquote>
    ),
  },
  marks: {
    link: ({ children, value }: any) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-ecm-green underline hover:text-ecm-lime transition-colors"
      >
        {children}
      </a>
    ),
    strong: ({ children }: any) => (
      <strong className="font-semibold text-ecm-green-dark">{children}</strong>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="list-disc pl-6 mb-4 space-y-2 text-ecm-gray-dark">
        {children}
      </ul>
    ),
    number: ({ children }: any) => (
      <ol className="list-decimal pl-6 mb-4 space-y-2 text-ecm-gray-dark">
        {children}
      </ol>
    ),
  },
};

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <>
      {/* Hero with image */}
      <section className="bg-ecm-green py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {post.tags.map((tag: string, i: number) => (
                <span
                  key={i}
                  className="bg-ecm-lime/20 text-ecm-lime text-xs font-barlow font-semibold px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h1 className="text-white font-barlow font-bold text-3xl lg:text-5xl leading-tight mb-4">
            {post.title}
          </h1>
          {formattedDate && (
            <p className="text-white/60 font-barlow text-sm">{formattedDate}</p>
          )}
        </div>
      </section>

      {/* Featured image */}
      {post.mainImage && (
        <div className="max-w-3xl mx-auto px-6 -mt-8">
          <Image
            src={urlFor(post.mainImage).width(800).height(450).url()}
            alt={post.title || ""}
            width={800}
            height={450}
            className="rounded-2xl w-full shadow-lg"
            priority
          />
        </div>
      )}

      {/* Body content */}
      <article className="py-16">
        <div className="max-w-3xl mx-auto px-6">
          {post.body ? (
            <PortableText value={post.body} components={ptComponents} />
          ) : (
            <p className="text-ecm-gray text-center italic">
              Full article content coming soon.
            </p>
          )}
        </div>
      </article>

      {/* Back to blog */}
      <section className="pb-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <Link
            href="/blog"
            className="inline-block bg-ecm-green text-white font-barlow font-semibold px-8 py-3 rounded-full hover:bg-ecm-green-dark transition-colors"
          >
            ← Back to Blog
          </Link>
        </div>
      </section>
    </>
  );
}

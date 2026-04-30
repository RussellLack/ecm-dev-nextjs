import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import {
  getPlatform,
  getAllPlatformSlugs,
  getContentForPlatform,
} from "@/lib/queries";
import { urlFor } from "@/lib/sanity";
import { internalLinkHref } from "@/lib/internalLink";

export const revalidate = 60;

const PILLAR_HREF: Record<string, string> = {
  technology: "/content-technology",
  services: "/content-services",
  localization: "/content-localization",
};

const PILLAR_TITLE: Record<string, string> = {
  technology: "Content Technology",
  services: "Content Services",
  localization: "Content Localization",
};

const ptComponents = {
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
    internalLink: ({ children, value }: any) => {
      const href = internalLinkHref(value?.reference);
      if (!href) return <>{children}</>;
      return (
        <Link
          href={href}
          className="text-ecm-green underline hover:text-ecm-lime transition-colors"
        >
          {children}
        </Link>
      );
    },
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

export async function generateStaticParams() {
  const slugs = await getAllPlatformSlugs().catch(() => []);
  return (slugs ?? []).map((s: any) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const platform = await getPlatform(slug).catch(() => null);
  if (!platform) return { title: "Platform not found" };

  const seo = platform.seo || {};
  const title = seo.metaTitle || `${platform.name} — ECM.DEV`;
  const description =
    seo.metaDescription ||
    platform.summary ||
    `ECM.DEV's perspective on ${platform.name}: implementation, governance, and content operations.`;
  return {
    title,
    description,
    alternates: { canonical: `/platforms/${slug}` },
    ...(seo.noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function PlatformDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const platform = await getPlatform(slug);
  if (!platform) notFound();

  const { posts, guides, caseStudies } = await getContentForPlatform(
    platform.tagAliases ?? []
  );

  return (
    <>
      <section className="relative bg-ecm-green py-14 sm:py-20 lg:py-24 pb-24 sm:pb-28 lg:pb-32 overflow-hidden">
        <nav aria-label="Breadcrumb" className="max-w-5xl mx-auto px-6 pt-2">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs font-barlow text-white/60">
            <li>
              <Link href="/" className="hover:text-ecm-lime transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-white/30">/</li>
            <li>
              <Link href="/platforms" className="hover:text-ecm-lime transition-colors">
                Platforms
              </Link>
            </li>
            <li aria-hidden="true" className="text-white/30">/</li>
            <li aria-current="page" className="text-ecm-lime/90">{platform.name}</li>
          </ol>
        </nav>
        <div className="max-w-3xl mx-auto px-6 mt-8">
          <div className="flex items-center gap-4 mb-5">
            {platform.logo && (
              <div className="flex-shrink-0 w-16 h-16 bg-white/10 rounded-lg p-2">
                <Image
                  src={urlFor(platform.logo).width(160).height(160).url()}
                  alt={platform.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div>
              <p className="text-ecm-lime/70 font-barlow font-semibold text-xs uppercase tracking-widest mb-1">
                Platform{platform.category ? ` · ${platform.category}` : ""}
              </p>
              <h1 className="text-ecm-lime font-barlow font-bold text-3xl sm:text-4xl lg:text-5xl">
                {platform.name}
              </h1>
            </div>
          </div>
          {platform.summary && (
            <p className="text-white/80 font-barlow text-lg leading-relaxed">
              {platform.summary}
            </p>
          )}
        </div>
        <div className="wave-divider wave-divider-bottom">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="#ffffff" />
          </svg>
        </div>
      </section>

      <article className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          {platform.heroDescription && (
            <p className="text-ecm-gray-dark font-barlow text-lg leading-relaxed mb-8">
              {platform.heroDescription}
            </p>
          )}
          {platform.body ? (
            <PortableText value={platform.body} components={ptComponents} />
          ) : (
            <p className="text-ecm-gray italic">
              Detailed perspective coming soon. In the meantime, see the
              related guides, case studies, and intel below.
            </p>
          )}

          {/* Pillar + intel cross-links */}
          <div className="mt-10 pt-8 border-t border-gray-100 flex flex-wrap gap-4">
            {(platform.pillars ?? []).map((p: string) => {
              const href = PILLAR_HREF[p];
              if (!href) return null;
              return (
                <Link
                  key={p}
                  href={href}
                  className="inline-flex items-center gap-2 bg-ecm-green text-white font-barlow font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-ecm-green-dark transition-colors"
                >
                  Explore {PILLAR_TITLE[p]} →
                </Link>
              );
            })}
            {platform.intelVendorSlug && (
              <Link
                href={`/intel/vendor/${platform.intelVendorSlug}`}
                className="inline-flex items-center gap-2 bg-white border border-ecm-green/30 text-ecm-green font-barlow font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-ecm-green hover:text-white transition-colors"
              >
                Latest {platform.name} intel →
              </Link>
            )}
            {platform.website && (
              <a
                href={platform.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-ecm-gray font-barlow text-sm hover:text-ecm-green transition-colors self-center"
              >
                {platform.name} website ↗
              </a>
            )}
          </div>
        </div>
      </article>

      {/* Auto-collected related content */}
      {(guides.length > 0 || caseStudies.length > 0 || posts.length > 0) && (
        <section className="py-16 bg-gray-50 border-t border-gray-100">
          <div className="max-w-5xl mx-auto px-6 space-y-12">
            {guides.length > 0 && (
              <Cluster heading={`Guides on ${platform.name}`} indexHref="/guides" indexLabel="All guides">
                {guides.map((g: any) => (
                  <Card
                    key={g._id}
                    href={`/guide/${g.slug?.current}`}
                    title={g.title}
                    subtitle={g.subtitle || g.excerpt}
                    image={g.mainImage}
                    eyebrow={g.series}
                  />
                ))}
              </Cluster>
            )}
            {caseStudies.length > 0 && (
              <Cluster heading={`${platform.name} in practice`} indexHref="/case-study" indexLabel="All projects">
                {caseStudies.map((cs: any) => (
                  <Card
                    key={cs._id}
                    href={`/case-study/${cs.slug?.current}`}
                    title={cs.title}
                    subtitle={cs.client || cs.description}
                    image={cs.image}
                  />
                ))}
              </Cluster>
            )}
            {posts.length > 0 && (
              <Cluster heading={`Recent thinking on ${platform.name}`} indexHref="/blog" indexLabel="All articles">
                {posts.map((p: any) => (
                  <Card
                    key={p._id}
                    href={`/post/${p.slug?.current}`}
                    title={p.title}
                    subtitle={p.excerpt}
                    image={p.mainImage}
                  />
                ))}
              </Cluster>
            )}
          </div>
        </section>
      )}
    </>
  );
}

function Cluster({
  heading,
  indexHref,
  indexLabel,
  children,
}: {
  heading: string;
  indexHref: string;
  indexLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-5 gap-4">
        <h2 className="text-ecm-green font-barlow font-bold text-xl lg:text-2xl">
          {heading}
        </h2>
        <Link
          href={indexHref}
          className="text-ecm-green text-sm font-barlow font-semibold hover:text-ecm-green-dark whitespace-nowrap"
        >
          {indexLabel} →
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{children}</div>
    </div>
  );
}

function Card({
  href,
  title,
  subtitle,
  image,
  eyebrow,
}: {
  href: string;
  title: string;
  subtitle?: string;
  image?: any;
  eyebrow?: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-white rounded-xl border border-gray-100 hover:border-ecm-green/20 hover:shadow-lg transition-all overflow-hidden flex flex-col"
    >
      {image && (
        <div className="h-32 overflow-hidden bg-ecm-green/5 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={urlFor(image).width(360).height(200).fit("crop").url()}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-4 flex flex-col flex-1">
        {eyebrow && (
          <p className="text-[10px] font-barlow font-semibold uppercase tracking-widest text-ecm-lime-hover mb-1">
            {eyebrow}
          </p>
        )}
        <h3 className="text-ecm-green font-barlow font-semibold text-sm leading-snug mb-2 group-hover:text-ecm-green-dark line-clamp-2">
          {title}
        </h3>
        {subtitle && (
          <p className="text-ecm-gray text-xs leading-relaxed line-clamp-3">
            {subtitle}
          </p>
        )}
      </div>
    </Link>
  );
}

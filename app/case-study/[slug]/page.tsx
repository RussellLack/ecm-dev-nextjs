import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { getCaseStudy, getAllCaseStudySlugs, getRelatedCaseStudies } from "@/lib/queries";
import { urlFor } from "@/lib/sanity";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedContent from "@/components/RelatedContent";
import { INDUSTRY_OPTIONS } from "@/sanity/schemas/taxonomyOptions";

const INDUSTRY_LABEL: Record<string, string> = Object.fromEntries(
  INDUSTRY_OPTIONS.map((o) => [o.value, o.title])
);

const portableTextComponents: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null;
      return (
        <Image
          src={urlFor(value).width(1200).url()}
          alt={value.alt || ""}
          width={1200}
          height={675}
          className="rounded-lg my-6 w-full h-auto"
        />
      );
    },
  },
  block: {
    h2: ({ children }) => (
      <h2 className="text-ecm-green font-barlow font-bold text-2xl mt-8 mb-3">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-ecm-green font-barlow font-bold text-xl mt-6 mb-2">
        {children}
      </h3>
    ),
    normal: ({ children }) => (
      <p className="text-ecm-gray-dark leading-relaxed text-base lg:text-lg mb-4">
        {children}
      </p>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc pl-6 mb-4 text-ecm-gray-dark space-y-2">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal pl-6 mb-4 text-ecm-gray-dark space-y-2">
        {children}
      </ol>
    ),
  },
  marks: {
    link: ({ children, value }) => (
      <a
        href={value?.href}
        className="text-ecm-green underline hover:text-ecm-green/80"
      >
        {children}
      </a>
    ),
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  },
};

export const revalidate = 60;

const tagColors: Record<string, string> = {
  "Content Localization": "bg-blue-100 text-blue-800",
  "Content Technology": "bg-purple-100 text-purple-800",
  "Content Services": "bg-green-100 text-green-800",
};

export async function generateStaticParams() {
  const slugs = await getAllCaseStudySlugs().catch(() => []);
  return slugs.map((s: { slug: string }) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cs = await getCaseStudy(slug).catch(() => null);
  if (!cs) return { title: "Case Study | ECM.DEV" };
  return {
    title: `${cs.title} | ECM.DEV`,
    description: cs.description?.slice(0, 160),
  };
}

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cs = await getCaseStudy(slug);

  if (!cs) notFound();

  // Curated relatedCaseStudies override fallback selection by shared
  // pillar/industry/tags. Top up to three when curated is short.
  const curatedRelated = (cs.relatedCaseStudies ?? []).filter(Boolean);
  const need = Math.max(0, 3 - curatedRelated.length);
  const fallbackRelated =
    need > 0
      ? await getRelatedCaseStudies(
          slug,
          cs.pillars ?? [],
          cs.industry ?? null,
          cs.tags ?? [],
          need + curatedRelated.length
        ).catch(() => [])
      : [];
  const curatedSlugs = new Set(
    curatedRelated.map((c: any) => c.slug?.current ?? c.slug)
  );
  const relatedItems = [
    ...curatedRelated,
    ...fallbackRelated.filter(
      (c: any) => !curatedSlugs.has(c.slug?.current ?? c.slug)
    ),
  ].slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative bg-ecm-green pt-2 pb-24 sm:pb-28 lg:pb-32 overflow-hidden">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Projects", path: "/case-study" },
            { name: cs.title, path: null },
          ]}
        />
        <div className="max-w-4xl mx-auto px-6 pt-8 sm:pt-12 lg:pt-16">
          {/* Back link */}
          <Link
            href="/case-study"
            className="inline-flex items-center gap-2 text-ecm-lime/70 hover:text-ecm-lime font-barlow text-sm mb-8 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
            All Projects
          </Link>

          {/* Tags */}
          {cs.tags && cs.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {cs.tags.map((tag: string) => (
                <span
                  key={tag}
                  className={`${
                    tagColors[tag] || "bg-white/15 text-white"
                  } text-xs font-barlow font-medium px-3 py-1 rounded-full`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-ecm-lime font-barlow font-bold text-2xl sm:text-3xl lg:text-5xl mb-4">
            {cs.title}
          </h1>

          {/* Client */}
          {cs.client && (
            <p className="text-white/70 font-barlow text-lg lg:text-xl">
              {cs.client}
            </p>
          )}
        </div>
        {/* Wave divider: green → white */}
        <div className="wave-divider wave-divider-bottom">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="#ffffff" />
          </svg>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Main content */}
            <div className="lg:col-span-2">
              <div className="prose prose-lg max-w-none">
                <div className="flex gap-5">
                  {cs.image && (
                    <div className="flex-shrink-0 w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] mt-1">
                      <Image
                        src={urlFor(cs.image).width(90).height(90).url()}
                        alt={cs.title}
                        width={90}
                        height={90}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div>
                    <h2 className="text-ecm-green font-barlow font-bold text-2xl mb-3">
                      Overview
                    </h2>
                    <p className="text-ecm-gray-dark leading-relaxed text-base lg:text-lg">
                      {cs.description}
                    </p>
                  </div>
                </div>

                {cs.whoThisIsFor && (
                  <div className="mt-10">
                    <h2 className="text-ecm-green font-barlow font-bold text-2xl mb-3">
                      Who This Is For
                    </h2>
                    <p className="text-ecm-gray-dark leading-relaxed text-base lg:text-lg whitespace-pre-line">
                      {cs.whoThisIsFor}
                    </p>
                  </div>
                )}

                {cs.theChallenge && (
                  <div className="mt-10">
                    <h2 className="text-ecm-green font-barlow font-bold text-2xl mb-3">
                      The Challenge
                    </h2>
                    <p className="text-ecm-gray-dark leading-relaxed text-base lg:text-lg whitespace-pre-line">
                      {cs.theChallenge}
                    </p>
                  </div>
                )}

                {cs.whatWePropose && (
                  <div className="mt-10">
                    <h2 className="text-ecm-green font-barlow font-bold text-2xl mb-3">
                      What We Propose
                    </h2>
                    <p className="text-ecm-gray-dark leading-relaxed text-base lg:text-lg whitespace-pre-line">
                      {cs.whatWePropose}
                    </p>
                  </div>
                )}

                {cs.whyItMatters && (
                  <div className="mt-10">
                    <h2 className="text-ecm-green font-barlow font-bold text-2xl mb-3">
                      Why It Matters
                    </h2>
                    <p className="text-ecm-gray-dark leading-relaxed text-base lg:text-lg whitespace-pre-line">
                      {cs.whyItMatters}
                    </p>
                  </div>
                )}

                {cs.body && Array.isArray(cs.body) && cs.body.length > 0 && (
                  <div className="mt-10">
                    <PortableText
                      value={cs.body}
                      components={portableTextComponents}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-xl p-6 lg:sticky lg:top-20">
                <h3 className="text-ecm-green font-barlow font-bold text-sm uppercase tracking-wider mb-4">
                  Project Details
                </h3>

                {cs.client && (
                  <div className="mb-4">
                    <p className="text-ecm-gray text-xs uppercase tracking-wider mb-1">
                      Client
                    </p>
                    <p className="text-ecm-green font-barlow font-semibold text-sm">
                      {cs.client}
                    </p>
                  </div>
                )}

                {cs.industry && (
                  <div className="mb-4">
                    <p className="text-ecm-gray text-xs uppercase tracking-wider mb-1">
                      Industry
                    </p>
                    <Link
                      href={`/industries/${cs.industry}`}
                      className="inline-block bg-ecm-green/10 text-ecm-green text-xs font-barlow font-semibold px-3 py-1 rounded-full hover:bg-ecm-green hover:text-white transition-colors"
                    >
                      {INDUSTRY_LABEL[cs.industry] ?? cs.industry}
                    </Link>
                  </div>
                )}

                {cs.tags && cs.tags.length > 0 && (
                  <div className="mb-6">
                    <p className="text-ecm-gray text-xs uppercase tracking-wider mb-2">
                      Services
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {cs.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="bg-ecm-green/10 text-ecm-green text-xs font-barlow font-medium px-2.5 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <Link
                  href="/contact"
                  className="block text-center bg-ecm-lime text-ecm-green font-barlow font-semibold px-6 py-3 rounded-full hover:bg-ecm-lime-hover transition-colors text-sm"
                >
                  Start a Conversation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related case studies — curated first, then pillar/industry/tag fallback */}
      <RelatedContent
        heading="Related projects"
        items={relatedItems}
        hrefPrefix="/case-study"
      />

      {/* CTA */}
      <section className="relative pt-28 pb-16 bg-ecm-green overflow-hidden">
        {/* Wave divider: white → green */}
        <div className="wave-divider wave-divider-top">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C360,0 1080,120 1440,60 L1440,0 L0,0 Z" fill="#ffffff" />
          </svg>
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-ecm-lime font-barlow font-bold text-2xl lg:text-3xl mb-4">
            Ready to build your next project?
          </h2>
          <p className="text-white/70 font-barlow text-lg mb-8">
            Let&apos;s turn content into infrastructure.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-ecm-lime text-ecm-green font-barlow font-semibold px-10 py-3 rounded-full hover:bg-ecm-lime-hover transition-colors"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </>
  );
}

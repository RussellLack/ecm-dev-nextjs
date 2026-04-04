import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getCaseStudy, getAllCaseStudySlugs } from "@/lib/queries";
import { urlFor } from "@/lib/sanity";

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

  return (
    <>
      {/* Hero */}
      <section className="relative bg-ecm-green pt-12 sm:pt-16 lg:pt-24 pb-24 sm:pb-28 lg:pb-32 overflow-hidden">
        <div className="max-w-4xl mx-auto px-6">
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

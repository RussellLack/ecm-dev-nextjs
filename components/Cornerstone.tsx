import Link from "next/link";
import { PortableText, type PortableTextComponents } from "@portabletext/react";

export interface CornerstoneData {
  title: string;
  slug?: { current?: string } | string;
  eyebrow?: string;
  heroHeading?: string;
  standfirst?: string;
  keyTakeaways?: string[];
  body?: any[];
  diagnosticLabel?: string;
  diagnosticUrl?: string;
  relatedLinks?: { title?: string; url?: string }[];
  ctaHeading?: string;
}

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="text-ecm-green font-barlow font-bold text-2xl sm:text-3xl mt-12 mb-4">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-ecm-green font-barlow font-bold text-xl mt-8 mb-3">{children}</h3>
    ),
    normal: ({ children }) => (
      <p className="text-ecm-gray-dark leading-relaxed text-base lg:text-lg mb-5">{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-[5px] border-ecm-lime bg-ecm-gray-light rounded-r-2xl px-8 py-6 my-8 text-ecm-green font-barlow font-semibold text-xl leading-snug">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc pl-6 mb-5 text-ecm-gray-dark space-y-2 text-base lg:text-lg">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal pl-6 mb-5 text-ecm-gray-dark space-y-2 text-base lg:text-lg">
        {children}
      </ol>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-ecm-green">{children}</strong>,
    link: ({ children, value }) => (
      <Link
        href={value?.href || "#"}
        className="text-ecm-green underline underline-offset-2 hover:text-ecm-green-dark"
      >
        {children}
      </Link>
    ),
  },
};

export default function Cornerstone({ data }: { data: CornerstoneData }) {
  const heading = data.heroHeading || data.title;
  const diagnosticUrl = data.diagnosticUrl || "/assessments";
  const diagnosticLabel = data.diagnosticLabel || "Take the assessment";

  return (
    <>
      {/* Hero */}
      <section className="relative bg-ecm-green py-20 sm:py-24 overflow-hidden">
        <div className="max-w-3xl mx-auto px-6">
          {data.eyebrow && (
            <p className="text-ecm-lime/80 font-barlow font-semibold text-xs tracking-[0.2em] uppercase mb-6">
              {data.eyebrow}
            </p>
          )}
          <h1 className="text-ecm-lime font-barlow font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight">
            {heading}
          </h1>
          {data.standfirst && (
            <p className="text-white/85 font-barlow font-light text-lg sm:text-xl leading-relaxed mt-6">
              {data.standfirst}
            </p>
          )}
        </div>
        <div className="wave-divider wave-divider-bottom">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="#ffffff" />
          </svg>
        </div>
      </section>

      {/* Body */}
      <section className="bg-white pt-16 pb-8">
        <div className="max-w-3xl mx-auto px-6">
          {/* In short */}
          {data.keyTakeaways && data.keyTakeaways.length > 0 && (
            <div className="bg-ecm-gray-light border-l-[5px] border-ecm-lime p-8 rounded-r-2xl mb-12">
              <p className="text-ecm-green font-barlow font-bold text-xs tracking-[0.2em] uppercase mb-4">
                In short
              </p>
              <ul className="space-y-3">
                {data.keyTakeaways.map((t, i) => (
                  <li key={i} className="text-ecm-gray-dark text-base leading-relaxed flex gap-3">
                    <span className="mt-2 flex-shrink-0 w-2 h-2 rounded-full bg-ecm-lime" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.body && data.body.length > 0 && (
            <PortableText value={data.body} components={components} />
          )}
        </div>
      </section>

      {/* Related reading */}
      {data.relatedLinks && data.relatedLinks.length > 0 && (
        <section className="bg-white pb-8">
          <div className="max-w-3xl mx-auto px-6">
            <div className="border-t-2 border-ecm-green pt-10">
              <p className="text-ecm-green font-barlow font-bold text-xs tracking-[0.2em] uppercase mb-6">
                Go deeper
              </p>
              <ul className="space-y-4">
                {data.relatedLinks.map((item, i) => (
                  <li key={i}>
                    <Link
                      href={item.url || "/guides"}
                      className="text-ecm-green font-barlow font-semibold text-lg hover:text-ecm-green-dark transition-colors inline-flex items-center gap-2"
                    >
                      {item.title}
                      <span aria-hidden="true">&rarr;</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Closing CTA */}
      <section className="relative bg-ecm-green pt-28 pb-20 mt-12 overflow-hidden text-center">
        <div className="wave-divider wave-divider-top">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C360,0 1080,120 1440,60 L1440,0 L0,0 Z" fill="#ffffff" />
          </svg>
        </div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <h2 className="text-ecm-lime font-barlow font-bold text-3xl sm:text-4xl mb-8">
            {data.ctaHeading || "See where you stand."}
          </h2>
          <Link
            href={diagnosticUrl}
            className="inline-block bg-ecm-lime text-ecm-green font-barlow font-bold text-lg px-10 py-4 rounded-full hover:bg-ecm-lime-hover transition-colors"
          >
            {diagnosticLabel}
          </Link>
          <p className="mt-6">
            <Link
              href="/contact"
              className="text-white/80 font-barlow text-sm underline underline-offset-4 hover:text-ecm-lime transition-colors"
            >
              or book a strategy session
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}

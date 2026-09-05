import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 3600;

/* Hero and the four body sections below. The hero paragraph is the one
   given verbatim in the placement review (the user's own words, moved
   here per their own suggestion: "That should be the top of the About
   page, not buried"). The four body sections are drafted copy, not
   pre-approved — the review only outlined the four topics to cover
   (background, build approach, differentiation, ownership), not the
   actual sentences. */
const hero = {
  heading: "We build the missing layer between marketing activity and sales pipeline.",
  body: "Modern B2B marketing is not just a content problem. And it is not only a CRM problem. It is a systems problem. Your data, content, tools, landing pages, workflows and AI experiments all need to work together. That is what we build.",
};

const sections = [
  {
    title: "Content, systems, and commercial execution",
    body: "ECM.DEV was built by people who have run content operations, integrated CRM and marketing systems, and been accountable for the commercial number those systems were supposed to produce. That combination is unusual. Most agencies own the content. Most RevOps consultants own the systems. Few people have had to answer for both at once, which is exactly where B2B pipeline actually breaks.",
  },
  {
    title: "A build, not a retainer for advice",
    body: "We do not hand over a strategy deck and leave the building to you. Every engagement produces something you can point at: a prospect list, a scored assessment, a landing flow, a CRM workflow, a piece of content structure. Fixed scope, fixed price, a defined delivery window. You know what you are getting before you start, and you own it once it ships.",
  },
  {
    title: "Not an agency. Not a RevOps consultancy. Not a content shop.",
    body: "Digital agencies sell campaigns and creative, then move on to the next brief. RevOps consultants sell process and platform configuration, and rarely touch the content running through it. Content shops sell production volume. ECM.DEV builds the specific piece of infrastructure sitting between whichever two of those categories your team has already bought, and the pipeline number you are actually trying to hit.",
  },
  {
    title: "What you own when we are done",
    body: "Everything. The prospect list, the tool, the landing flow, the workflow, the content structure: built in your stack, under your control, with documentation, not locked behind our subscription. If you never call us again, it keeps working. Most clients call us again anyway, for the next piece.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const title = "About ECM.DEV";
  const description =
    "ECM.DEV builds the missing layer between marketing activity and sales pipeline, hands-on, fixed scope, and you own everything we build.";
  return {
    title,
    description,
    alternates: { canonical: "/about" },
    openGraph: { type: "website", title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function AboutPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative bg-ecm-green py-20 sm:py-28 lg:py-32 overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <h1 className="text-ecm-lime font-barlow font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight mb-6">
            {hero.heading}
          </h1>
          <p className="text-white/90 font-barlow font-light text-base sm:text-lg leading-relaxed">
            {hero.body}
          </p>
        </div>
        <div className="wave-divider wave-divider-bottom">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="#ffffff" />
          </svg>
        </div>
      </section>

      {/* ─── BODY SECTIONS ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6 space-y-16">
          {sections.map((section, i) => (
            <div key={i}>
              <h2 className="text-ecm-green font-barlow font-bold text-2xl sm:text-3xl leading-snug mb-4">
                {section.title}
              </h2>
              <p className="text-ecm-gray-dark text-base leading-relaxed">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CLOSING CTA ─── */}
      <section className="bg-ecm-green py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-white font-barlow font-bold text-3xl lg:text-4xl mb-6">
            See where your own stack stands.
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/assessments"
              className="inline-flex items-center justify-center bg-ecm-lime text-ecm-green font-barlow font-bold text-base sm:text-lg px-8 py-4 rounded-full hover:bg-ecm-lime-hover transition-colors"
            >
              Start with a free assessment
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center border-2 border-ecm-lime text-ecm-lime font-barlow font-semibold text-base sm:text-lg px-8 py-4 rounded-full hover:bg-ecm-lime hover:text-ecm-green transition-colors"
            >
              Talk to us directly
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

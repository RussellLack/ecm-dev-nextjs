import type { Metadata } from "next";
import Link from "next/link";
import { getCornerstones } from "@/lib/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Executive Briefings | ECM.DEV",
  description:
    "Board-level briefings on the content infrastructure behind modern marketing: what it is, why AI projects fail, and the hidden cost of content chaos.",
  alternates: { canonical: "/briefings" },
};

type CornerstoneCard = {
  title: string;
  slug: string;
  standfirst?: string;
  order?: number;
};

const fallback: CornerstoneCard[] = [
  { title: "Content Infrastructure Explained", slug: "content-infrastructure-explained", standfirst: "What content infrastructure is, why it is now a marketing issue rather than an IT one, and how to tell if yours is holding you back." },
  { title: "Why AI Projects Fail", slug: "why-ai-projects-fail", standfirst: "AI initiatives rarely fail on the model. They fail on the content underneath. Here is the pattern, and what makes them deliver." },
  { title: "The Hidden Cost of Content Chaos", slug: "the-hidden-cost-of-content-chaos", standfirst: "What fragmented content actually costs, in time, money, and risk, and why fixing the system makes every downstream investment perform." },
];

export default async function BriefingsIndexPage() {
  const live = (await getCornerstones().catch(() => null)) as CornerstoneCard[] | null;
  const cornerstones = live && live.length ? live : fallback;

  return (
    <>
      {/* Hero */}
      <section className="relative bg-ecm-green py-20 sm:py-24 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-ecm-lime/80 font-barlow font-semibold text-xs tracking-[0.2em] uppercase mb-6">
            Executive briefings
          </p>
          <h1 className="text-ecm-lime font-barlow font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight max-w-4xl">
            The thinking behind the work.
          </h1>
          <p className="text-white/85 font-barlow font-light text-lg sm:text-xl leading-relaxed mt-6 max-w-3xl">
            Board-level briefings on the content infrastructure behind modern marketing. Start here, then explore the full guide library.
          </p>
        </div>
        <div className="wave-divider wave-divider-bottom">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="#ffffff" />
          </svg>
        </div>
      </section>

      {/* Cornerstone cards */}
      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-ecm-green font-barlow font-bold text-xs tracking-[0.2em] uppercase mb-8">
            Start here
          </p>
          <div className="space-y-6">
            {cornerstones.map((c) => (
              <Link
                key={c.slug}
                href={`/briefings/${c.slug}`}
                className="block bg-ecm-gray-light border-l-[5px] border-ecm-lime p-8 rounded-r-2xl hover:shadow-lg transition-all group"
              >
                <h2 className="text-ecm-green font-barlow font-bold text-xl sm:text-2xl mb-3 group-hover:text-ecm-green-dark transition-colors">
                  {c.title}
                </h2>
                {c.standfirst && (
                  <p className="text-ecm-gray-dark text-base leading-relaxed">{c.standfirst}</p>
                )}
                <span className="mt-5 inline-flex items-center gap-2 text-ecm-green font-barlow font-semibold text-sm">
                  Read the briefing <span aria-hidden="true">&rarr;</span>
                </span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-14">
            <Link
              href="/guides"
              className="inline-block bg-ecm-green text-white font-barlow font-semibold px-8 py-3 rounded-full hover:bg-ecm-green-dark transition-colors"
            >
              Explore the full guide library
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

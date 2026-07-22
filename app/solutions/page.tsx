import type { Metadata } from "next";
import Link from "next/link";
import { getSolutionPages } from "@/lib/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Solutions | ECM.DEV",
  description:
    "Outcome-led solutions for enterprise marketing: improve campaign velocity, scale global marketing, increase CMS ROI, prepare content for AI, and build a marketing operating system.",
  alternates: { canonical: "/solutions" },
};

type SolutionCard = {
  title: string;
  slug: string;
  heroSubhead?: string;
  order?: number;
};

const fallback: SolutionCard[] = [
  { title: "Improve Campaign Velocity", slug: "improve-campaign-velocity", heroSubhead: "Ship more, faster, with the team you already have." },
  { title: "Scale Global Marketing", slug: "scale-global-marketing", heroSubhead: "Enter new markets without the cost spiral." },
  { title: "Increase CMS ROI", slug: "increase-cms-roi", heroSubhead: "Make the platform you have already paid for finally perform." },
  { title: "Prepare Content for AI", slug: "prepare-content-for-ai", heroSubhead: "Make AI initiatives deliver instead of stall." },
  { title: "Build a Marketing Operating System", slug: "build-a-marketing-operating-system", heroSubhead: "Bring campaigns, localisation, personalisation, and AI onto one operating system for content." },
];

export default async function SolutionsIndexPage() {
  const live = (await getSolutionPages().catch(() => null)) as SolutionCard[] | null;
  const solutions = live && live.length ? live : fallback;

  return (
    <>
      {/* Hero */}
      <section className="relative bg-ecm-green py-20 sm:py-24 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-ecm-lime/80 font-barlow font-semibold text-xs tracking-[0.2em] uppercase mb-6">
            Solutions
          </p>
          <h1 className="text-ecm-lime font-barlow font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight max-w-4xl">
            What changes when the infrastructure is right.
          </h1>
          <p className="text-white/85 font-barlow font-light text-lg sm:text-xl leading-relaxed mt-6 max-w-3xl">
            Every solution starts by finding where your content operation actually leaks time, cost, and quality, then rebuilding that part of the system.
          </p>
        </div>
        <div className="wave-divider wave-divider-bottom">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="#ffffff" />
          </svg>
        </div>
      </section>

      {/* Solution cards */}
      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 gap-6">
            {solutions.map((s) => (
              <Link
                key={s.slug}
                href={`/solutions/${s.slug}`}
                className="block bg-ecm-green rounded-xl p-8 border border-ecm-lime/20 hover:border-ecm-lime/50 hover:shadow-lg transition-all group"
              >
                <h2 className="text-ecm-lime font-barlow font-bold text-xl sm:text-2xl mb-3 group-hover:text-white transition-colors">
                  {s.title}
                </h2>
                {s.heroSubhead && (
                  <p className="text-white/85 text-sm leading-relaxed">{s.heroSubhead}</p>
                )}
                <span className="mt-5 inline-flex items-center gap-2 text-ecm-lime font-barlow font-semibold text-sm">
                  Explore <span aria-hidden="true">&rarr;</span>
                </span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-14">
            <Link
              href="/assessments"
              className="inline-block bg-ecm-green text-white font-barlow font-semibold px-8 py-3 rounded-full hover:bg-ecm-green-dark transition-colors"
            >
              Not sure where to start? Take the assessment
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

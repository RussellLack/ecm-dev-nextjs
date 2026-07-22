import type { Metadata } from "next";
import Link from "next/link";
import { getProblemPages } from "@/lib/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Problems We Solve | ECM.DEV",
  description:
    "The problems enterprise marketing teams bring us: marketing that takes too long, AI that isn't delivering, localisation costs that keep growing, a CMS that isn't creating value, and teams working in silos.",
  alternates: { canonical: "/problems" },
};

type ProblemCard = {
  title: string;
  slug: string;
  heroSubhead?: string;
  order?: number;
};

// Static fallback so the index renders even before the Sanity documents exist.
const fallback: ProblemCard[] = [
  { title: "Marketing takes too long", slug: "marketing-takes-too-long", heroSubhead: "Every campaign waits on content that is briefed, chased, reworked, and approved by hand. The bottleneck is the workflow, not the team." },
  { title: "AI isn't delivering", slug: "ai-isnt-delivering", heroSubhead: "Pilots impressed but never scaled, and AI outputs are inconsistent. The cause is fragmented, ungoverned content." },
  { title: "Localisation costs keep growing", slug: "localisation-costs-keep-growing", heroSubhead: "Every new market costs more than the last, because source content was never built to be localised." },
  { title: "Our CMS isn't creating value", slug: "our-cms-isnt-creating-value", heroSubhead: "The platform is rarely the problem. Without operational design, an enterprise CMS becomes an expensive container for chaos." },
  { title: "Our teams work in silos", slug: "our-teams-work-in-silos", heroSubhead: "Marketing, Product, Legal, and Comms duplicate work and recreate content nobody can find. That is a structural problem, not a communication one." },
];

export default async function ProblemsIndexPage() {
  const live = (await getProblemPages().catch(() => null)) as ProblemCard[] | null;
  const problems = live && live.length ? live : fallback;

  return (
    <>
      {/* Hero */}
      <section className="relative bg-ecm-green py-20 sm:py-24 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-ecm-lime/80 font-barlow font-semibold text-xs tracking-[0.2em] uppercase mb-6">
            Problems we solve
          </p>
          <h1 className="text-ecm-lime font-barlow font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight max-w-4xl">
            You probably recognise at least one of these.
          </h1>
          <p className="text-white/85 font-barlow font-light text-lg sm:text-xl leading-relaxed mt-6 max-w-3xl">
            Six symptoms, one underlying cause: content was never built as infrastructure. Start with the problem you feel most.
          </p>
        </div>
        <div className="wave-divider wave-divider-bottom">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="#ffffff" />
          </svg>
        </div>
      </section>

      {/* Problem cards */}
      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 gap-6">
            {problems.map((p) => (
              <Link
                key={p.slug}
                href={`/problems/${p.slug}`}
                className="block bg-ecm-gray-light border-l-[5px] border-ecm-lime p-8 rounded-r-2xl hover:shadow-lg transition-all group"
              >
                <h2 className="text-ecm-green font-barlow font-bold text-xl sm:text-2xl mb-3 group-hover:text-ecm-green-dark transition-colors">
                  {p.title}
                </h2>
                {p.heroSubhead && (
                  <p className="text-ecm-gray-dark text-sm leading-relaxed">{p.heroSubhead}</p>
                )}
                <span className="mt-5 inline-flex items-center gap-2 text-ecm-green font-barlow font-semibold text-sm">
                  See how we fix it <span aria-hidden="true">&rarr;</span>
                </span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-14">
            <Link
              href="/assessments"
              className="inline-block bg-ecm-green text-white font-barlow font-semibold px-8 py-3 rounded-full hover:bg-ecm-green-dark transition-colors"
            >
              Not sure which one? Take the assessment
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { getSolutionPages } from "@/lib/queries";
import {
  WORKFLOW_SOLUTIONS,
  SOLUTION_KIND_LABEL,
  type WorkflowSolution,
} from "@/lib/workflowSolutions";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "Start from your situation: export manufacturers, engineering consultancies, SaaS and industrial tech, maritime suppliers, PE-backed groups, professional services and multilingual teams. Or explore by outcome.",
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
            Start from the situation you are in, or the outcome you want. Either way, the work begins by finding where time, cost and quality leak, then fixing that part of the system first.
          </p>
        </div>
        <div className="wave-divider wave-divider-bottom">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="var(--color-surface)" />
          </svg>
        </div>
      </section>

      {/* Framing: why the work starts with diagnosis. Moved from the
          homepage (5 October 2026) so the hub opens with the argument
          its two routes below then act on. */}
      <section aria-labelledby="system-around-it" className="bg-surface pt-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-3xl">
            <h2 id="system-around-it" className="text-heading font-barlow font-bold text-2xl sm:text-3xl leading-snug mb-6">
              Your CMS is not broken. The system around it is.
            </h2>
            <p className="text-ink text-base leading-relaxed mb-4">
              Most organisations already have the parts: a CMS, a content team, a translation process, and usually some AI running on top of all three. What they do not have is an operating system connecting them, so the CMS never quite does what it was bought to do, content has no clear owner once it is published, and every new market costs as much as the last one.
            </p>
            <p className="text-ink text-base leading-relaxed">
              We find out which of the three areas is actually breaking. Then, if you want, we keep fixing it with you, rather than leaving a one-off report that goes out of date within a month.
            </p>
          </div>
        </div>
      </section>

      {/* By situation: the workflow-led pages (lib/workflowSolutions.ts).
          Manufacturers and engineering consultancies lead, larger; each
          card says whether it is a sector, a business situation or an
          operating need, rather than presenting all seven as industries. */}
      <section aria-labelledby="by-situation" className="bg-surface pt-20 pb-6">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-heading/70 font-barlow font-semibold text-xs tracking-[0.2em] uppercase mb-3">
            Start from your situation
          </p>
          <h2 id="by-situation" className="scroll-mt-28 text-heading font-barlow font-bold text-2xl sm:text-3xl leading-snug mb-3">
            One recognisable problem, one first project.
          </h2>
          <p className="text-ink text-base leading-relaxed mb-10 max-w-3xl">
            Each page follows one workflow from the moment work arrives to an
            accepted result, and sets out a bounded first project around it.
          </p>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {WORKFLOW_SOLUTIONS.filter((s) => s.priority).map((s) => (
              <SituationCard key={s.slug} s={s} featured />
            ))}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {WORKFLOW_SOLUTIONS.filter((s) => !s.priority).map((s) => (
              <SituationCard key={s.slug} s={s} />
            ))}
          </div>
        </div>
      </section>

      {/* By outcome: the Sanity-managed solution pages */}
      <section aria-labelledby="by-outcome" className="bg-surface pt-14 pb-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="border-t-2 border-heading pt-10 mb-10">
            <p className="text-heading/70 font-barlow font-semibold text-xs tracking-[0.2em] uppercase mb-3">
              Or explore by outcome
            </p>
            <h2 id="by-outcome" className="text-heading font-barlow font-bold text-2xl sm:text-3xl leading-snug">
              What you want to change.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {solutions.map((s) => (
              <Link
                key={s.slug}
                href={`/solutions/${s.slug}`}
                className="block bg-ecm-green rounded-xl p-8 border border-ecm-lime/20 hover:border-ecm-lime/50 hover:shadow-lg transition-all group"
              >
                <h3 className="text-ecm-lime font-barlow font-bold text-xl sm:text-2xl mb-3 group-hover:text-white transition-colors">
                  {s.title}
                </h3>
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

function SituationCard({ s, featured = false }: { s: WorkflowSolution; featured?: boolean }) {
  return (
    <Link
      href={`/solutions/${s.slug}`}
      className={`group flex flex-col rounded-xl border transition-all hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-heading ${
        featured
          ? "bg-ecm-green border-ecm-lime/20 hover:border-ecm-lime/50 p-8"
          : "bg-surface-alt border-surface-border hover:border-heading/40 p-6"
      }`}
    >
      <p
        className={`font-barlow font-semibold text-xs uppercase tracking-wide mb-2 ${
          featured ? "text-ecm-lime/70" : "text-heading/70"
        }`}
      >
        {SOLUTION_KIND_LABEL[s.kind]} · {s.eyebrow}
      </p>
      <h3
        className={`font-barlow font-bold leading-snug mb-3 ${
          featured
            ? "text-ecm-lime text-xl sm:text-2xl group-hover:text-white transition-colors"
            : "text-heading text-lg"
        }`}
      >
        {s.headline}
      </h3>
      <p className={`text-sm leading-relaxed flex-1 ${featured ? "text-white/85" : "text-ink"}`}>
        {s.hubSummary}
      </p>
      <span
        className={`mt-5 inline-flex items-center gap-2 font-barlow font-semibold text-sm ${
          featured ? "text-ecm-lime" : "text-heading"
        }`}
      >
        See the workflow <span aria-hidden="true">&rarr;</span>
      </span>
    </Link>
  );
}

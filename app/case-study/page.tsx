import { getCaseStudies } from "@/lib/queries";
import Link from "next/link";
import CaseStudyGrid from "@/components/CaseStudyGrid";
import { ENGAGEMENTS_PATH } from "@/lib/representativeEngagements";

export const revalidate = 3600;

export const metadata = {
  title: "Projects | ECM.DEV",
  description:
    "Case studies in content technology, content services, and content localization.",
};

export default async function CaseStudyPage() {
  const caseStudies = await getCaseStudies();

  return (
    <>
      {/* Hero */}
      <section className="relative bg-ecm-green py-14 sm:py-20 lg:py-28 pb-24 sm:pb-28 lg:pb-36 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-ecm-lime font-barlow font-bold text-3xl sm:text-4xl lg:text-5xl mb-4">
            PROJECTS
          </h1>
          <p className="text-white/90 font-barlow font-light text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">
            These are the systems and programmes that shaped how ECM.DEV thinks, some delivered as ECM.DEV, some in earlier roles at other organisations.
          </p>
        </div>
        {/* Wave divider: green → white */}
        <div className="wave-divider wave-divider-bottom">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="var(--color-surface)" />
          </svg>
        </div>
      </section>

      {/* Filter + Grid */}
      <section className="py-20 bg-surface">
        <div className="max-w-6xl mx-auto px-6">
          <CaseStudyGrid caseStudies={caseStudies || []} />

          {/* Representative engagements live on their own index so they
              never join this grid or its count of delivered work. */}
          <aside
            aria-labelledby="representative-strip"
            className="mt-16 rounded-2xl border border-surface-border bg-surface-alt px-6 py-6 sm:flex sm:items-center sm:justify-between gap-6"
          >
            <div>
              <h2 id="representative-strip" className="text-heading font-barlow font-bold text-lg mb-1">
                Representative engagements
              </h2>
              <p className="text-ink text-sm leading-relaxed">
                Current problems, reconstructed from patterns across our experience.
              </p>
            </div>
            <Link
              href={ENGAGEMENTS_PATH}
              className="mt-4 sm:mt-0 inline-flex shrink-0 items-center gap-1 text-heading font-barlow font-semibold text-sm hover:opacity-80"
            >
              See what this looks like in practice <span aria-hidden="true">&rarr;</span>
            </Link>
          </aside>
        </div>
      </section>
    </>
  );
}

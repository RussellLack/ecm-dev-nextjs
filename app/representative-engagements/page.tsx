import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProofCard from "@/components/proof/ProofCard";
import {
  REPRESENTATIVE_ENGAGEMENTS,
  ENGAGEMENTS_PATH,
  PROVENANCE_STATEMENT,
} from "@/lib/representativeEngagements";

/* Index of the representative engagements. Kept apart from the Projects
   archive (/case-study) so scenarios never inflate the count of named,
   delivered work; each surface links to the other. */

export const metadata: Metadata = {
  title: "Representative Engagements",
  description:
    "What ECM.DEV's work looks like in practice today: anonymised scenarios on content operations, knowledge-driven GTM and AI readiness, each linked to named projects that evidence the experience behind it.",
  alternates: { canonical: ENGAGEMENTS_PATH },
};

export default function RepresentativeEngagementsIndex() {
  return (
    <>
      <section className="relative bg-ecm-green pt-2 pb-24 sm:pb-28 lg:pb-32 overflow-hidden">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Representative engagements", path: null },
          ]}
        />
        <div className="max-w-5xl mx-auto px-6 pt-10 sm:pt-14">
          <p className="text-ecm-lime/80 font-barlow font-semibold text-xs tracking-[0.2em] uppercase mb-6">
            Representative engagements
          </p>
          <h1 className="text-ecm-lime font-barlow font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight max-w-4xl">
            What this looks like in practice.
          </h1>
          <p className="text-white/85 font-barlow font-light text-lg sm:text-xl leading-relaxed mt-6 max-w-3xl">
            The problems are different. The pattern is similar: valuable
            knowledge gets trapped between people, systems and workflows.
            These scenarios show how we turn it into something the business
            can use.
          </p>
        </div>
        <div className="wave-divider wave-divider-bottom">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="var(--color-surface)" />
          </svg>
        </div>
      </section>

      <section className="bg-surface py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-6">
          <aside aria-labelledby="about-scenarios" className="rounded-2xl border border-surface-border bg-surface-alt px-6 py-5 mb-10 max-w-3xl">
            <h2 id="about-scenarios" className="text-heading font-barlow font-bold text-base mb-2">About these scenarios</h2>
            <p className="text-ink text-sm leading-relaxed">{PROVENANCE_STATEMENT}</p>
          </aside>
          <ul className="grid md:grid-cols-2 gap-6">
            {REPRESENTATIVE_ENGAGEMENTS.map((e) => (
              <li key={e.id}>
                <ProofCard engagement={e} size="compact" />
              </li>
            ))}
          </ul>
          <p className="mt-12 text-center text-ink text-base">
            Looking for evidence of previous delivery?{" "}
            <Link href="/case-study" className="text-heading font-barlow font-semibold underline underline-offset-4 hover:opacity-80">
              See named and anonymised projects <span aria-hidden="true">&rarr;</span>
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}

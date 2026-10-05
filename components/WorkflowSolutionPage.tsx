import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import FractionalLeadCard from "@/components/FractionalLeadCard";
import OfferViewTracker from "@/components/analytics/OfferViewTracker";
import { JOURNEY_OFFER } from "@/lib/analytics";
import { PILLAR_LABEL, enquiryHref } from "@/lib/offers";
import { serviceSchema } from "@/lib/structuredData";
import { PILLAR_HREF, type WorkflowSolution } from "@/lib/workflowSolutions";

/* One template for the seven buyer-situation pages (lib/workflowSolutions.ts).
   Section order follows the brief: hero, recognisable friction, the
   workflow, a bounded first project, how improvement is measured, evidence,
   the Russell card, next step. The workflow is a plain ordered list, so it
   reads in order on a phone and to a screen reader; no canvas or diagram
   carries meaning on its own. */

const WAVE_TO_WHITE = (
  <div className="wave-divider wave-divider-bottom">
    <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="var(--color-surface)" />
    </svg>
  </div>
);

const WAVE_FROM_WHITE = (
  <div className="wave-divider wave-divider-top">
    <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M0,60 C360,0 1080,120 1440,60 L1440,0 L0,0 Z" fill="var(--color-surface)" />
    </svg>
  </div>
);

/** Visible focus on green backgrounds and on light surfaces. */
const FOCUS_ON_GREEN =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ecm-lime";
const FOCUS_ON_LIGHT =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-heading";

const EYEBROW = "text-heading/70 font-barlow font-semibold text-xs tracking-[0.2em] uppercase mb-3";
const H2 = "text-heading font-barlow font-bold text-2xl sm:text-3xl leading-snug";

function PilotList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="border-t border-heading/20 pt-5">
      <h4 className="text-heading font-barlow font-bold text-base mb-3">{title}</h4>
      <ul className="space-y-2 text-ink text-sm leading-relaxed list-disc pl-5 marker:text-heading/40">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function WorkflowSolutionPage({ data }: { data: WorkflowSolution }) {
  const path = `/solutions/${data.slug}`;
  const contactHref = enquiryHref("first-project", undefined, data.slug);
  const id = (s: string) => `${data.slug}-${s}`;

  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: data.headline.replace(/\.$/, ""),
          description: data.metaDescription,
          path,
          serviceType: data.capabilities.map((c) => c.label).join(", "),
        })}
      />

      {/* ─── HERO ─── */}
      <section className="relative bg-ecm-green pb-24 sm:pb-28 lg:pb-32 overflow-hidden">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Solutions", path: "/solutions" },
            { name: data.eyebrow, path: null },
          ]}
        />
        <div className="max-w-5xl mx-auto px-6 pt-10 sm:pt-14">
          <p className="text-ecm-lime/80 font-barlow font-semibold text-xs tracking-[0.2em] uppercase mb-6">
            {data.eyebrow}
          </p>
          <h1 className="text-ecm-lime font-barlow font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight max-w-4xl">
            {data.headline}
          </h1>
          <p className="text-white/85 font-barlow font-light text-lg sm:text-xl leading-relaxed mt-6 max-w-3xl">
            {data.heroSubhead}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-4">
            <Link
              href={contactHref}
              className={`inline-flex items-center justify-center bg-ecm-lime text-ecm-green font-barlow font-bold text-base px-8 py-4 rounded-full hover:bg-ecm-lime-hover transition-colors ${FOCUS_ON_GREEN}`}
            >
              Discuss a first project
            </Link>
            <Link
              href={data.secondaryCta.href}
              className={`inline-flex items-center justify-center text-center border-2 border-ecm-lime/70 text-white font-barlow font-semibold text-sm sm:text-base px-6 py-3.5 rounded-full hover:border-ecm-lime hover:text-ecm-lime transition-colors ${FOCUS_ON_GREEN}`}
            >
              {data.secondaryCta.label}
              {data.secondaryCta.note && (
                <span className="ml-2 text-white/70 font-medium text-sm">{data.secondaryCta.note}</span>
              )}
            </Link>
          </div>
        </div>
        {WAVE_TO_WHITE}
      </section>

      {/* ─── RECOGNISABLE FRICTION ─── */}
      <section aria-labelledby={id("friction")} className="bg-surface pt-16 sm:pt-20 pb-16">
        <div className="max-w-5xl mx-auto px-6">
          <p className={EYEBROW}>Where the time goes</p>
          <h2 id={id("friction")} className={`${H2} mb-3`}>
            You may recognise some of this.
          </h2>
          <p className="text-ink text-base leading-relaxed mb-10 max-w-3xl">
            Not every team has every one of these. They are the situations
            that usually prompt the conversation.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {data.pains.map((pain) => (
              <article
                key={pain.title}
                className="bg-surface-alt border border-surface-border rounded-2xl p-6 flex flex-col"
              >
                <h3 className="text-heading font-barlow font-bold text-lg leading-snug mb-3">
                  {pain.title}
                </h3>
                <p className="text-ink text-sm leading-relaxed">{pain.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── THE WORKFLOW ─── */}
      <section aria-labelledby={id("workflow")} className="bg-surface pt-4 pb-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="border-t-2 border-heading pt-10">
            <p className={EYEBROW}>The workflow</p>
            <h2 id={id("workflow")} className={`${H2} mb-3`}>
              From trigger to accepted result.
            </h2>
            <p className="text-ink text-base leading-relaxed mb-10 max-w-3xl">
              {data.workflow.intro}
            </p>
          </div>
          <ol className="relative space-y-6 before:absolute before:left-[1.1rem] before:top-2 before:bottom-2 before:w-px before:bg-heading/20">
            {data.workflow.steps.map((step, i) => (
              <li key={step.title} className="relative pl-14">
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 w-9 h-9 rounded-full bg-ecm-green text-ecm-lime font-barlow font-bold text-sm flex items-center justify-center"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-heading font-barlow font-bold text-lg leading-snug pt-1.5 mb-3">
                  <span className="sr-only">Step {i + 1}: </span>
                  {step.title}
                </h3>
                <dl className="grid sm:grid-cols-3 gap-x-6 gap-y-2 text-sm leading-relaxed">
                  <div>
                    <dt className="text-heading/70 font-barlow font-semibold text-xs uppercase tracking-wide">Who</dt>
                    <dd className="text-ink">{step.who}</dd>
                  </div>
                  <div>
                    <dt className="text-heading/70 font-barlow font-semibold text-xs uppercase tracking-wide">Works from</dt>
                    <dd className="text-ink">{step.source}</dd>
                  </div>
                  <div>
                    <dt className="text-heading/70 font-barlow font-semibold text-xs uppercase tracking-wide">Hands over</dt>
                    <dd className="text-ink">{step.handoff}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ol>
          <aside
            aria-labelledby={id("exception")}
            className="mt-10 rounded-2xl border-l-4 border-ecm-lime bg-surface-alt px-6 py-5"
          >
            <p className="text-heading/70 font-barlow font-semibold text-xs uppercase tracking-wide mb-1">
              Where human judgement stays
            </p>
            <h3 id={id("exception")} className="text-heading font-barlow font-bold text-lg mb-2">
              {data.workflow.exception.title}
            </h3>
            <p className="text-ink text-sm sm:text-base leading-relaxed">
              {data.workflow.exception.body}
            </p>
          </aside>
        </div>
      </section>

      {/* ─── A BOUNDED FIRST PROJECT ─── */}
      <section aria-labelledby={id("first-project")} className="bg-surface-alt py-20">
        <div className="max-w-5xl mx-auto px-6">
          <p className={EYEBROW}>A bounded first project</p>
          <h2 id={id("first-project")} className={`${H2} mb-3`}>
            {data.pilot.name}
          </h2>
          <OfferViewTracker offer={JOURNEY_OFFER.firstProject} solution={data.slug} />
          <p className="text-ink text-base leading-relaxed mb-10 max-w-3xl">
            {data.pilot.summary}
          </p>
          <div className="grid md:grid-cols-2 gap-x-10 gap-y-8">
            <PilotList title="What you supply" items={data.pilot.inputs} />
            <PilotList title="What you receive" items={data.pilot.outputs} />
            <PilotList title="What stays with you" items={data.pilot.clientResponsibilities} />
            <PilotList title="When it is complete" items={data.pilot.completion} />
          </div>
          <p className="mt-10 text-ink text-sm leading-relaxed max-w-3xl">
            Scope, fee, timing and how much of your team&apos;s time it needs
            are agreed in writing before any work starts.
          </p>
        </div>
      </section>

      {/* ─── HOW WE MEASURE IMPROVEMENT ─── */}
      <section aria-labelledby={id("measures")} className="bg-surface py-20">
        <div className="max-w-5xl mx-auto px-6">
          <p className={EYEBROW}>How we measure improvement</p>
          <h2 id={id("measures")} className={`${H2} mb-3`}>
            Measured against your own starting point.
          </h2>
          <p className="text-ink text-base leading-relaxed mb-10 max-w-3xl">
            During scoping we agree a baseline for each measure from your own
            records, then compare at the end. We do not promise a percentage
            before we have seen the work.
          </p>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.measures.map((m) => (
              <li key={m.name} className="border-t-2 border-ecm-lime pt-4">
                <p className="text-heading font-barlow font-bold text-base mb-1">{m.name}</p>
                <p className="text-ink text-sm leading-relaxed">{m.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── RELEVANT EVIDENCE ─── */}
      <section aria-labelledby={id("evidence")} className="bg-surface-alt py-20">
        <div className="max-w-5xl mx-auto px-6">
          <p className={EYEBROW}>Relevant evidence</p>
          <h2 id={id("evidence")} className={`${H2} mb-3`}>
            Similar work, and why it is relevant.
          </h2>
          <p className="text-ink text-sm sm:text-base leading-relaxed mb-10 max-w-3xl">
            Work by the people behind ECM.DEV, chosen because the workflow is
            similar, not because the sector is identical. Each case study
            says how it was delivered, and client names do not imply
            endorsement.
          </p>
          <div className={`grid gap-6 ${data.proof.length > 1 ? "md:grid-cols-2" : "max-w-2xl"}`}>
            {data.proof.map((p) => (
              <article
                key={p.slug}
                className="bg-surface border border-surface-border rounded-2xl p-6 sm:p-8 flex flex-col"
              >
                <h3 className="text-heading font-barlow font-bold text-lg leading-snug mb-3">
                  <Link
                    href={`/case-study/${p.slug}`}
                    className={`hover:underline underline-offset-4 ${FOCUS_ON_LIGHT}`}
                  >
                    {p.title}
                  </Link>
                </h3>
                <p className="text-ink text-sm leading-relaxed mb-5 flex-1">{p.relevance}</p>
                <Link
                  href={`/case-study/${p.slug}`}
                  className={`inline-flex items-center gap-1 text-heading font-barlow font-semibold text-sm hover:opacity-80 ${FOCUS_ON_LIGHT}`}
                  aria-label={`Read the case study: ${p.title}`}
                >
                  Read the case study <span aria-hidden="true">&rarr;</span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── RUSSELL CARD ─── */}
      <FractionalLeadCard
        note={data.leadNote}
        solution={data.slug}
        headingId={id("lead")}
      />

      {/* ─── NEXT STEP ─── */}
      <section
        aria-labelledby={id("next-step")}
        className="relative bg-ecm-green pt-28 pb-20 overflow-hidden"
      >
        {WAVE_FROM_WHITE}
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <h2
            id={id("next-step")}
            className="text-ecm-lime font-barlow font-bold text-3xl sm:text-4xl mb-5 text-center"
          >
            Start with one conversation.
          </h2>
          <p className="text-white/85 text-base sm:text-lg leading-relaxed text-center max-w-2xl mx-auto mb-10">
            A scoping conversation is about the work in front of you: which
            workflow, which material, who needs to be involved. If a first
            project makes sense, you receive a written scope and fee. If it
            does not, we say so.
          </p>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-12">
            {[
              "Understand the problem",
              "Agree one project",
              "Deliver and review",
              "Decide whether more is useful",
            ].map((label, i) => (
              <li
                key={label}
                className="rounded-xl border border-ecm-lime/25 px-4 py-4 text-white/90 text-sm"
              >
                <span className="block text-ecm-lime font-barlow font-bold text-xs mb-1" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {label}
              </li>
            ))}
          </ol>
          <p className="text-white/75 text-sm leading-relaxed text-center max-w-2xl mx-auto mb-10">
            A completed project with nothing further is a good outcome. Ongoing
            support is there if you want it, not a condition of starting.
          </p>
          <div className="text-center">
            <Link
              href={contactHref}
              className={`inline-block bg-ecm-lime text-ecm-green font-barlow font-bold text-lg px-10 py-4 rounded-full hover:bg-ecm-lime-hover transition-colors ${FOCUS_ON_GREEN}`}
            >
              Discuss a first project
            </Link>
          </div>
          <div className="mt-14 border-t border-white/15 pt-8 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-x-6 gap-y-3 justify-center text-sm">
            <span className="text-white/70">Capabilities this draws on:</span>
            {data.capabilities.map((c) => (
              <Link
                key={c.label}
                href={PILLAR_HREF[c.pillar]}
                className={`text-white underline underline-offset-4 hover:text-ecm-lime ${FOCUS_ON_GREEN}`}
              >
                {c.label}
                <span className="sr-only"> ({PILLAR_LABEL[c.pillar]})</span>
              </Link>
            ))}
            <Link
              href="/solutions"
              className={`text-white/80 underline underline-offset-4 hover:text-ecm-lime ${FOCUS_ON_GREEN}`}
            >
              All solutions
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

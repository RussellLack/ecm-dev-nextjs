import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { PillarTags } from "@/components/TagChip";
import FlowSteps from "@/components/proof/FlowSteps";
import Emph from "@/components/proof/Emph";
import ProofCard from "@/components/proof/ProofCard";
import { PILLAR_LABEL, SOLUTION_CONTEXT, enquiryHref } from "@/lib/offers";
import { PILLAR_HREF } from "@/lib/workflowSolutions";
import {
  ENGAGEMENTS_PATH,
  ENGAGEMENT_LABEL,
  PROVENANCE_STATEMENT,
  requireEngagement,
  type RepresentativeEngagement,
} from "@/lib/representativeEngagements";

/* Full page for one representative engagement. Inherits the case-study
   page's visual language (green hero with breadcrumbs, two-column body,
   sidebar, green closing CTA) so it sits naturally in the site, while the
   badge, the client TYPE instead of a client name, the provenance
   statement and the absence of imagery keep it distinct from a named
   case study. Section order follows section 5 of the implementation pack. */

const H2 = "text-heading font-barlow font-bold text-2xl mb-3";
const P = "text-ink leading-relaxed text-base lg:text-lg mb-4";
const FOCUS_LIGHT =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-heading";
const FOCUS_GREEN =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ecm-lime";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-6 mb-4 text-ink space-y-1.5 text-base marker:text-heading/40">
      {items.map((i) => (
        <li key={i}>{cap(i)}</li>
      ))}
    </ul>
  );
}

export default function RepresentativeEngagementPage({ data: e }: { data: RepresentativeEngagement }) {
  const contactHref = enquiryHref("first-project", undefined, e.primarySolution);
  const solutionHref = e.primarySolution ? `/solutions/${e.primarySolution}` : "/solutions";
  const solutionLabel = e.primarySolution ? SOLUTION_CONTEXT[e.primarySolution] : "All solutions";
  const related = e.related.map(requireEngagement);

  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative bg-ecm-green pt-2 pb-24 sm:pb-28 lg:pb-32 overflow-hidden">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Representative engagements", path: ENGAGEMENTS_PATH },
            { name: e.title, path: null },
          ]}
        />
        <div className="max-w-4xl mx-auto px-6 pt-8 sm:pt-12 lg:pt-16">
          <Link
            href={ENGAGEMENTS_PATH}
            className={`inline-flex items-center gap-2 text-ecm-lime/70 hover:text-ecm-lime font-barlow text-sm mb-8 transition-colors ${FOCUS_GREEN}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            All representative engagements
          </Link>
          <p className="mb-5">
            <span className="inline-flex items-center rounded-full border border-ecm-lime/60 px-3 py-1 text-ecm-lime font-barlow font-semibold text-xs uppercase tracking-[0.18em]">
              {ENGAGEMENT_LABEL}
            </span>
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            <PillarTags pillars={e.services} />
          </div>
          <h1 className="text-ecm-lime font-barlow font-bold text-2xl sm:text-3xl lg:text-5xl mb-4">{e.title}</h1>
          <p className="text-white/75 font-barlow text-lg lg:text-xl">{e.clientType}</p>
        </div>
        <div className="wave-divider wave-divider-bottom">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="var(--color-surface)" />
          </svg>
        </div>
      </section>

      {/* ─── BODY ─── */}
      <section className="py-12 sm:py-16 lg:py-20 bg-surface">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
            <div className="lg:col-span-2 min-w-0">
              <h2 className={H2}>Overview</h2>
              {e.overview.map((p) => <p key={p} className={P}>{p}</p>)}

              <div className="mt-10">
                <h2 className={H2}>Who This Is For</h2>
                {e.who.text.map((p) => <p key={p} className={P}>{p}</p>)}
                {e.who.listLead && <p className={P}>{e.who.listLead}</p>}
                {e.who.list && <Bullets items={e.who.list} />}
              </div>

              <div className="mt-10">
                <h2 className={H2}>The Situation</h2>
                {e.situation.map((p) => <p key={p} className={P}>{p}</p>)}
              </div>

              <div className="mt-10">
                <h2 className={H2}>Where the Workflow Breaks</h2>
                {e.breaks.steps && (
                  <div className="rounded-xl bg-surface-alt border border-surface-border p-4 sm:p-5 mb-4">
                    <FlowSteps steps={e.breaks.steps} tone="before" label="How the work moves today" />
                  </div>
                )}
                {e.breaks.text?.map((p) => <p key={p} className={P}>{p}</p>)}
                {e.breaks.note && <p className={P}>{e.breaks.note}</p>}
              </div>

              <div className="mt-10">
                <h2 className={H2}>Our Approach</h2>
                <ol className="space-y-6">
                  {e.approach.map((s, i) => (
                    <li key={s.title} className="relative pl-12">
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-0 w-8 h-8 rounded-full bg-ecm-green text-ecm-lime font-barlow font-bold text-xs flex items-center justify-center"
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-heading font-barlow font-bold text-lg leading-snug pt-1 mb-2">{s.title}</h3>
                      {s.body && <p className="text-ink leading-relaxed text-base mb-2">{s.body}</p>}
                      {s.bullets && <Bullets items={s.bullets} />}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-10">
                <h2 className={H2}>Before → After</h2>
                <div className="space-y-5">
                  <div>
                    <p className="text-ink-muted font-barlow font-semibold text-xs uppercase tracking-wider mb-2">Before</p>
                    <FlowSteps steps={e.before} tone="before" label="Before" />
                  </div>
                  <div>
                    <p className="text-heading font-barlow font-semibold text-xs uppercase tracking-wider mb-2">After</p>
                    <FlowSteps steps={e.after} tone="after" label="After" />
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <h2 className={H2}>Where AI Helps</h2>
                {e.ai.lead && <p className={P}>{e.ai.lead}</p>}
                {e.ai.can && <Bullets items={e.ai.can} />}
                {e.ai.humansLead && <p className={P}>{e.ai.humansLead}</p>}
                {e.ai.humans && <Bullets items={e.ai.humans} />}
                {e.ai.text?.map((p) => <p key={p} className={P}>{p}</p>)}
                {e.ai.quote && (
                  <blockquote className="border-l-4 border-ecm-lime bg-surface-alt rounded-r-xl px-5 py-4 text-heading font-barlow font-semibold text-lg">
                    {e.ai.quote}
                  </blockquote>
                )}
              </div>

              <div className="mt-10">
                <h2 className={H2}>What Changes</h2>
                <Bullets items={e.changes} />
                <p className="text-ink-muted text-sm">
                  These are the operational changes the work aims for. Any
                  measures are agreed against your own baseline during scoping.
                </p>
              </div>

              <div className="mt-10 rounded-2xl bg-surface-alt border-l-4 border-ecm-lime px-6 py-5">
                <h2 className="text-heading font-barlow font-bold text-xl mb-2">What This Demonstrates</h2>
                {e.demonstrates.map((p) => (
                  <p key={p} className="text-ink leading-relaxed text-base lg:text-lg mb-2 last:mb-0">
                    <Emph text={p} />
                  </p>
                ))}
              </div>

              <div className="mt-12">
                <h2 className={H2}>Relevant experience</h2>
                <p className="text-ink leading-relaxed text-base mb-5">
                  Named projects that show parts of this approach in practice.
                  They evidence the underlying experience; none of them is the
                  scenario above, and each case study says how it was delivered.
                </p>
                <ul className="space-y-3">
                  {e.historical.map((h) => (
                    <li key={h.slug} className="rounded-xl border border-surface-border p-4">
                      <Link
                        href={`/case-study/${h.slug}`}
                        className={`text-heading font-barlow font-semibold leading-snug hover:underline underline-offset-4 ${FOCUS_LIGHT}`}
                      >
                        {h.title}
                      </Link>
                      <p className="text-ink text-sm leading-relaxed mt-1">{h.relevance}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <aside aria-labelledby="provenance" className="mt-12 rounded-2xl border border-surface-border bg-surface-alt px-6 py-5">
                <h2 id="provenance" className="text-heading font-barlow font-bold text-base mb-2">About this scenario</h2>
                <p className="text-ink text-sm leading-relaxed">{PROVENANCE_STATEMENT}</p>
              </aside>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-surface-alt rounded-xl p-6 lg:sticky lg:top-20">
                <h2 className="text-heading font-barlow font-bold text-sm uppercase tracking-wider mb-4">At a glance</h2>
                <div className="mb-4">
                  <p className="text-ink-muted text-xs uppercase tracking-wider mb-1">Client type</p>
                  <p className="text-heading font-barlow font-semibold text-sm">{e.clientType}</p>
                </div>
                <div className="mb-4">
                  <p className="text-ink-muted text-xs uppercase tracking-wider mb-2">Services</p>
                  <div className="flex flex-wrap gap-1.5"><PillarTags pillars={e.services} /></div>
                  <ul className="mt-2 space-y-1 text-sm">
                    {e.services.map((p) => (
                      <li key={p}>
                        <Link href={PILLAR_HREF[p]} className={`text-heading underline underline-offset-4 hover:opacity-80 ${FOCUS_LIGHT}`}>
                          {PILLAR_LABEL[p]}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mb-4">
                  <p className="text-ink-muted text-xs uppercase tracking-wider mb-2">Capabilities</p>
                  <ul className="flex flex-wrap gap-1.5">
                    {e.capabilities.map((c) => (
                      <li key={c} className="inline-flex rounded-full text-xs px-2.5 py-1 bg-surface text-ink-muted border border-surface-border">{c}</li>
                    ))}
                  </ul>
                </div>
                <div className="mb-4">
                  <p className="text-ink-muted text-xs uppercase tracking-wider mb-1">Most relevant to</p>
                  <Link href={solutionHref} className={`text-heading font-barlow font-semibold text-sm underline underline-offset-4 hover:opacity-80 ${FOCUS_LIGHT}`}>
                    {solutionLabel}
                  </Link>
                </div>
                <div className="mb-6">
                  <p className="text-ink-muted text-xs uppercase tracking-wider mb-1">A low-risk starting point</p>
                  <Link href={e.startingPoint.href} className={`text-heading font-barlow font-semibold text-sm underline underline-offset-4 hover:opacity-80 ${FOCUS_LIGHT}`}>
                    {e.startingPoint.label}
                  </Link>
                  {e.startingPoint.note && <p className="text-ink-muted text-xs mt-1">{e.startingPoint.note}</p>}
                </div>
                <Link
                  href={contactHref}
                  className={`block text-center bg-ecm-lime text-ecm-green font-barlow font-semibold px-6 py-3 rounded-full hover:bg-ecm-lime-hover transition-colors text-sm ${FOCUS_LIGHT}`}
                >
                  Discuss a first project
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── RELATED SCENARIOS ─── */}
      {related.length > 0 && (
        <section aria-labelledby="related-engagements" className="bg-surface-alt py-16">
          <div className="max-w-5xl mx-auto px-6">
            <h2 id="related-engagements" className="text-heading font-barlow font-bold text-2xl mb-6">Related patterns</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {related.map((r) => <ProofCard key={r.id} engagement={r} size="compact" />)}
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA ─── */}
      <section className="relative pt-28 pb-20 bg-ecm-green overflow-hidden">
        <div className="wave-divider wave-divider-top">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M0,60 C360,0 1080,120 1440,60 L1440,0 L0,0 Z" fill={related.length > 0 ? "var(--color-surface-alt)" : "var(--color-surface)"} />
          </svg>
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-ecm-lime font-barlow font-bold text-2xl sm:text-3xl mb-4">Recognise this problem?</h2>
          <p className="text-white/85 text-base sm:text-lg leading-relaxed mb-8">
            We can start by mapping the workflow, finding the bottleneck and
            defining a contained first improvement.
          </p>
          <Link
            href={contactHref}
            className={`inline-block bg-ecm-lime text-ecm-green font-barlow font-bold text-lg px-10 py-4 rounded-full hover:bg-ecm-lime-hover transition-colors ${FOCUS_GREEN}`}
          >
            Discuss a first project <span aria-hidden="true">&rarr;</span>
          </Link>
          <p className="mt-6 text-sm">
            <Link href={solutionHref} className={`text-white/80 underline underline-offset-4 hover:text-ecm-lime ${FOCUS_GREEN}`}>
              {e.primarySolution ? `See the solution: ${solutionLabel}` : "See all solutions"}
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { CONTENT_AUDIT, enquiryHref } from "@/lib/offers";
import OfferViewTracker from "@/components/analytics/OfferViewTracker";
import { JOURNEY_OFFER } from "@/lib/analytics";

/* Sample Content Audit Snapshot.

   An illustrative report for a FICTIONAL company, so a buyer can judge the
   quality of the decision a Snapshot supports before paying for one. Every
   company detail, count and finding below is synthetic and the page says so
   at the top, on the report itself and at the close. It must never be
   edited to resemble a real client.

   Scope mirrors the published Snapshot exactly (lib/offers.ts and the
   audit-service definition): 10% of the estate, at least 50 and at most
   100 items (CONTENT_AUDIT.itemDefinition); one language; structural and coverage
   findings; top five findings; one or two shown failing in an AI answer;
   a recorded readout. Finding categories are the five the homepage audit
   strip already publishes. Language guardrail applies: no certification,
   guarantee, warranty or attestation wording, and no claim that a client's
   AI is safe, compliant or will work. Literal, not Sanity-sourced, for the
   same reason as the offer data: it describes what the paid product
   delivers, so it goes through code review. See
   docs/COMMERCIAL-JOURNEY-2026-09-27.md (O8). */

export const metadata: Metadata = {
  title: "Sample Content Audit Snapshot | ECM.DEV",
  description:
    "An illustrative Content Audit Snapshot for a fictional company: the question, the evidence, the top five findings, two AI-answer failures and what to fix first.",
  alternates: { canonical: "/content-audit/sample" },
};

const snap = CONTENT_AUDIT.snapshot;

const cover = {
  client: "Calder & Finch Instruments Ltd",
  descriptor: "A fictional UK manufacturer of industrial measurement equipment",
  estate: "About 1,400 published pages on one English-language site",
  sample: "100 items (10% of the estate is 140, capped at 100)",
  language: "English only",
};

const scope = {
  question:
    "Calder & Finch plans to put an AI assistant on its support site next quarter. Before funding that, it wants to know whether its existing content can be found, trusted and reused by AI systems, and what to fix first.",
  decision:
    "Whether to fund content remediation before the assistant launches, and which content to start with.",
  reviewed: [
    "40 product and specification pages",
    "30 support and how-to articles",
    "20 blog and insight posts",
    "10 company, contact and policy pages",
  ],
  assumptions: [
    "The public site is the content the assistant will draw on.",
    "Items were sampled across sections in proportion to their size, not chosen for problems.",
  ],
  limitations: [
    "A sample, not the whole estate: counts describe the 100 items reviewed, not all 1,400.",
    "Structural and coverage findings only. We did not check technical claims against your products; we flag where your own pages contradict each other.",
    "English only. Translated versions were not reviewed.",
    "Not legal or regulatory advice. Anything with a regulatory angle is flagged for your own counsel.",
  ],
};

const atAGlance = [
  { value: "100", label: "items reviewed" },
  { value: "64", label: "with at least one finding" },
  { value: "5", label: "priority findings" },
  { value: "2", label: "shown failing in an AI answer" },
];

type Finding = {
  n: number;
  category: string;
  title: string;
  found: string;
  example: string;
  matters: string;
  recommendation: string;
  effort: "Small" | "Medium" | "Large";
  owner: string;
};

const findings: Finding[] = [
  {
    n: 1,
    category: "Retrievability",
    title: "Key specifications live only inside PDF datasheets",
    found:
      "On 26 of the 40 product pages, operating range, accuracy and approval ratings appear only in a downloadable PDF, not in the page text.",
    example:
      "The product page for the (fictional) TX-400 pressure sensor describes the product in two paragraphs and links to a datasheet. The operating temperature range is on page 3 of the PDF.",
    matters:
      "AI systems retrieve passages of text. When the answer sits inside a PDF, it is found less reliably, and the answer engine falls back on older or third-party sources.",
    recommendation:
      "Publish the six most-asked specification fields as structured text on each product page, starting with the 15 highest-traffic products. Keep the PDF as the downloadable copy.",
    effort: "Medium",
    owner: "Product marketing, with a CMS template change",
  },
  {
    n: 2,
    category: "Trust signals",
    title: "Support articles carry no review date or owner",
    found:
      "28 of the 30 support articles show no last-reviewed date and no named owner. Four give a menu path that differs from the one in your current release notes.",
    example:
      "“Calibrating the TX series” still refers to a “Setup > Calibrate” menu. The release notes for firmware 3.2 rename it “Service > Calibration”.",
    matters:
      "An answer engine has no way to tell current guidance from retired guidance. Neither does a customer. An assistant built on these articles would repeat the old instructions with confidence.",
    recommendation:
      "Add a last-reviewed date and an owning team to every support article. Review the four affected articles first. Set a review interval for articles that mention firmware.",
    effort: "Small",
    owner: "Support team lead",
  },
  {
    n: 3,
    category: "Structure",
    title: "Headings are used for styling, and answers are hidden in tabs",
    found:
      "41 items skip heading levels or use headings as visual labels. On 19 product pages, the answers to common questions sit in collapsed tabs with generic labels such as “More”.",
    example:
      "A product page moves from its title straight to a fourth-level heading reading “Why choose us”. Installation guidance sits under a tab labelled “Details”.",
    matters:
      "Headings tell people and machines what a passage is about. When they describe styling rather than content, retrieval systems split and label the page badly, and the right passage is not returned.",
    recommendation:
      "Fix the heading order in the product-page template, not page by page. Rename tabs after the question they answer, for example “Installation” or “Compatibility”.",
    effort: "Small",
    owner: "Web team (template change)",
  },
  {
    n: 4,
    category: "Commercial usefulness",
    title: "No page helps a buyer choose between product series",
    found:
      "None of the 100 items compares the TX, TR and TM series, although all three are sold for overlapping applications.",
    example:
      "A buyer asking which series suits a high-humidity environment has to open three product pages and two datasheets and compare them unaided.",
    matters:
      "Comparison questions are where buyers go to AI tools first. With nothing on your site to draw on, the answer comes from a distributor or a competitor.",
    recommendation:
      "Publish one selection guide covering the three series against the five criteria buyers ask about most. Link it from each product page.",
    effort: "Medium",
    owner: "Product marketing, reviewed by applications engineering",
  },
  {
    n: 5,
    category: "Workflow readiness",
    title: "The same guidance is published twice and has drifted apart",
    found:
      "7 support topics also appear as blog posts. In 5 of those pairs the steps differ, and neither version says which one is authoritative.",
    example:
      "The support article on cleaning the TR sensor head recommends isopropyl alcohol. The 2023 blog post on the same task recommends a mild detergent solution only.",
    matters:
      "Every duplicate doubles the maintenance work and gives an AI system two conflicting sources. The problem grows each time a new team publishes on a topic that already has an owner.",
    recommendation:
      "Make the support article the single source for any procedure. Point the blog posts to it, or retire them. Agree which team owns procedural content.",
    effort: "Small",
    owner: "Support and marketing jointly, one decision needed",
  },
];

const aiFailures = [
  {
    question: "What is the operating temperature range of the Calder & Finch TX-400?",
    returned:
      "The answer gave a range from a 2019 distributor listing, which differs from the current datasheet. It did not cite the Calder & Finch site.",
    why:
      "The current range exists only inside the PDF datasheet (finding 1), so the distributor page was the most retrievable text source.",
  },
  {
    question: "How do I calibrate a Calder & Finch TX sensor?",
    returned:
      "The answer quoted the “Setup > Calibrate” steps from the support article, a menu path that no longer exists on current firmware.",
    why:
      "The support article is undated and unowned (finding 2), and nothing on the page signals that newer guidance exists.",
  },
];

const priorities = [
  {
    order: "First",
    items: "Findings 2 and 5: date, own and de-duplicate support content",
    why: "Small effort, and it removes the most likely wrong answers before the assistant launches.",
  },
  {
    order: "Next",
    items: "Finding 3: fix the product-page template",
    why: "One template change improves every product page at once.",
  },
  {
    order: "Then",
    items: "Findings 1 and 4: specifications as text, plus a selection guide",
    why: "More effort, but this is where buyers' questions are going unanswered today.",
  },
];

const notCovered = [
  "The other 1,300 pages, translated content, and content behind a login.",
  "Whether technical claims are accurate against your products.",
  "Choice of AI vendor or model, or how the assistant should be built.",
  "Rewriting content. We recommend what to change; your teams or a separately agreed scope make the change.",
];

const decisionOptions = [
  {
    title: "Stop here",
    body: "Use the findings as they stand. The report and the readout recording are yours to keep.",
  },
  {
    title: "Act on it yourselves",
    body: "The priorities above are written so your own teams can run them.",
  },
  {
    title: "Go deeper",
    body: `A ${CONTENT_AUDIT.full.name} covers the whole estate, with a costed remediation roadmap. ${snap.credit}`,
  },
];

/* Amber "synthetic content" notice colours, from CSS variables so the
   banner and badge are not a bright block in dark mode. */
const NOTICE_STYLE = {
  backgroundColor: "var(--notice-bg)",
  borderColor: "var(--notice-border)",
  color: "var(--notice-ink)",
} as const;

function SampleLabel() {
  return (
    <span
      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-barlow font-semibold uppercase tracking-wide"
      style={NOTICE_STYLE}
    >
      Illustrative sample
    </span>
  );
}

function ReportSection({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-surface-border pt-10 mt-10" aria-labelledby={`s${n}`}>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="text-heading/50 font-barlow font-bold text-sm tracking-wider">
          {String(n).padStart(2, "0")}
        </span>
        <h2 id={`s${n}`} className="text-heading font-barlow font-bold text-2xl sm:text-3xl">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

export default function SampleSnapshotPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <section className="bg-ecm-green pt-12 sm:pt-16 lg:pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-ecm-lime/80 font-barlow font-semibold text-xs tracking-[0.2em] uppercase mb-4">
            {CONTENT_AUDIT.name} · {snap.name} · sample report
          </p>
          <h1 className="text-white font-barlow font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight mb-6">
            What a Snapshot gives you, before you commission one.
          </h1>
          <OfferViewTracker offer={JOURNEY_OFFER.sampleReport} />
          <p className="text-white/85 text-base sm:text-lg leading-relaxed max-w-3xl">
            This is the shape of a real {snap.name} report, written for a
            fictional company. Read it for the quality of the decision it
            supports, not for the numbers.
          </p>
        </div>
      </section>

      {/* ─── SYNTHETIC NOTICE ─── */}
      <div className="border-y" style={NOTICE_STYLE}>
        <div className="max-w-4xl mx-auto px-6 py-4 text-sm leading-relaxed">
          <strong className="font-semibold">Illustrative sample.</strong>{" "}
          Calder &amp; Finch Instruments is a fictional company. Every product,
          count, finding and AI answer on this page is synthetic, written to
          show the format and depth of a {snap.name}. It is not a client
          report and not a statement about any real organisation.
        </div>
      </div>

      <article className="bg-surface py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-6">
          {/* ─── COVER ─── */}
          <div className="rounded-2xl border border-surface-border bg-surface-alt p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <p className="text-heading/70 font-barlow font-semibold text-xs uppercase tracking-wide">
                {CONTENT_AUDIT.name}: {snap.name}
              </p>
              <SampleLabel />
            </div>
            <p className="text-heading font-barlow font-bold text-2xl mb-1">{cover.client}</p>
            <p className="text-ink text-sm mb-6">{cover.descriptor}</p>
            <dl className="grid sm:grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="text-heading font-semibold">Estate</dt>
                <dd className="text-ink">{cover.estate}</dd>
              </div>
              <div>
                <dt className="text-heading font-semibold">Sample</dt>
                <dd className="text-ink">{cover.sample}</dd>
              </div>
              <div>
                <dt className="text-heading font-semibold">Language</dt>
                <dd className="text-ink">{cover.language}</dd>
              </div>
            </dl>
            <p className="text-ink-muted text-xs mt-6 leading-relaxed">
              A professional opinion you can act on or argue with. Every finding traces
              back to the item and the check that produced it.
            </p>
          </div>

          {/* ─── 1. QUESTION AND DECISION ─── */}
          <ReportSection n={1} title="The question and the decision">
            <p className="text-ink text-base leading-relaxed mb-4">{scope.question}</p>
            <div className="border-l-[5px] border-ecm-lime bg-surface-alt rounded-r-xl p-5">
              <p className="text-heading font-barlow font-bold text-xs uppercase tracking-wide mb-1">
                Decision this report supports
              </p>
              <p className="text-heading font-barlow font-semibold text-lg">{scope.decision}</p>
            </div>
          </ReportSection>

          {/* ─── 2. EVIDENCE ─── */}
          <ReportSection n={2} title="What we reviewed, and what we did not">
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div>
                <h3 className="text-heading font-barlow font-bold mb-2">Sampled items</h3>
                <ul className="space-y-1 text-ink list-disc list-inside">
                  {scope.reviewed.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-heading font-barlow font-bold mb-2">Assumptions</h3>
                <ul className="space-y-1 text-ink list-disc list-inside">
                  {scope.assumptions.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-heading font-barlow font-bold mb-2">Limitations</h3>
                <ul className="space-y-1 text-ink list-disc list-inside">
                  {scope.limitations.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          </ReportSection>

          {/* ─── 3. AT A GLANCE ─── */}
          <ReportSection n={3} title="At a glance">
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {atAGlance.map((s) => (
                <div key={s.label} className="rounded-xl border border-surface-border p-4 flex flex-col-reverse">
                  <dt className="text-ink text-sm">{s.label}</dt>
                  <dd className="text-heading font-barlow font-bold text-3xl">{s.value}</dd>
                </div>
              ))}
            </dl>
            <p className="text-ink text-base leading-relaxed mt-6">
              <strong className="text-heading">In one sentence:</strong> the
              content an assistant would rely on most, support and product
              detail, is the content least able to show it is current, so fix
              ownership and dating before launch, then make specifications
              readable as text.
            </p>
          </ReportSection>

          {/* ─── 4. TOP FIVE FINDINGS ─── */}
          <ReportSection n={4} title="Top five findings">
            <ol className="space-y-8">
              {findings.map((f) => (
                <li key={f.n} className="rounded-2xl border border-surface-border p-6">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="inline-flex w-8 h-8 bg-ecm-lime rounded-lg items-center justify-center text-ecm-green-dark font-barlow font-bold text-sm">
                      {f.n}
                    </span>
                    <span className="text-heading/70 font-barlow font-semibold text-xs uppercase tracking-wide">
                      {f.category}
                    </span>
                    <span className="text-ink-muted text-xs">
                      Effort: {f.effort} · Owner: {f.owner}
                    </span>
                  </div>
                  <h3 className="text-heading font-barlow font-bold text-xl mb-4">{f.title}</h3>
                  <dl className="grid md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                    <div>
                      <dt className="text-heading font-semibold mb-1">What we found</dt>
                      <dd className="text-ink leading-relaxed">{f.found}</dd>
                    </div>
                    <div>
                      <dt className="text-heading font-semibold mb-1">Example from the sample</dt>
                      <dd className="text-ink leading-relaxed">{f.example}</dd>
                    </div>
                    <div>
                      <dt className="text-heading font-semibold mb-1">Why it matters</dt>
                      <dd className="text-ink leading-relaxed">{f.matters}</dd>
                    </div>
                    <div>
                      <dt className="text-heading font-semibold mb-1">What we recommend</dt>
                      <dd className="text-ink leading-relaxed">{f.recommendation}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ol>
          </ReportSection>

          {/* ─── 5. AI ANSWER FAILURES ─── */}
          <ReportSection n={5} title="Shown failing in an AI answer">
            <p className="text-ink text-base leading-relaxed mb-6">
              We put buyer and customer questions to a general-purpose AI
              answer engine and recorded what came back. Two examples, each
              traced to a finding above.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {aiFailures.map((a) => (
                <div key={a.question} className="rounded-2xl bg-ecm-green p-6 text-sm">
                  <p className="text-ecm-lime/80 font-barlow font-semibold text-xs uppercase tracking-wide mb-2">
                    Question asked
                  </p>
                  <p className="text-white font-barlow font-semibold text-base mb-4">“{a.question}”</p>
                  <p className="text-ecm-lime/80 font-barlow font-semibold text-xs uppercase tracking-wide mb-1">
                    What came back
                  </p>
                  <p className="text-white/85 leading-relaxed mb-4">{a.returned}</p>
                  <p className="text-ecm-lime/80 font-barlow font-semibold text-xs uppercase tracking-wide mb-1">
                    Why
                  </p>
                  <p className="text-white/85 leading-relaxed">{a.why}</p>
                </div>
              ))}
            </div>
            <p className="text-ink-muted text-xs mt-4">
              AI answers vary between runs and over time. We record the date,
              the question and the answer so the result can be checked again
              after changes.
            </p>
          </ReportSection>

          {/* ─── 6. PRIORITIES ─── */}
          <ReportSection n={6} title="What to fix first">
            <ol className="space-y-4">
              {priorities.map((p) => (
                <li key={p.order} className="grid sm:grid-cols-[6rem_1fr] gap-2 sm:gap-6">
                  <span className="text-heading font-barlow font-bold">{p.order}</span>
                  <div>
                    <p className="text-heading font-semibold">{p.items}</p>
                    <p className="text-ink text-sm">{p.why}</p>
                  </div>
                </li>
              ))}
            </ol>
          </ReportSection>

          {/* ─── 7. NOT COVERED ─── */}
          <ReportSection n={7} title="What this Snapshot did not cover">
            <ul className="space-y-2 text-ink text-sm list-disc list-inside">
              {notCovered.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </ReportSection>

          {/* ─── 8. HANDOVER AND DECISION ─── */}
          <ReportSection n={8} title="Readout, handover and your next decision">
            <p className="text-ink text-base leading-relaxed mb-6">
              The report comes with a 45-minute recorded readout with the
              person who wrote it. After that, the decision is yours.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {decisionOptions.map((d) => (
                <div key={d.title} className="rounded-xl border border-surface-border p-5">
                  <p className="text-heading font-barlow font-bold mb-1">{d.title}</p>
                  <p className="text-ink text-sm leading-relaxed">{d.body}</p>
                </div>
              ))}
            </div>
          </ReportSection>

          <p className="mt-12 text-ink-muted text-xs leading-relaxed">
            Illustrative sample: a fictional company and synthetic findings.
            A real {snap.name} reviews your own content and reports only what
            that review found.
          </p>
        </div>
      </article>

      {/* ─── CTA ─── */}
      <section className="bg-ecm-green py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-ecm-lime font-barlow font-bold text-2xl sm:text-3xl mb-4">
            Want this for your own content?
          </h2>
          <p className="text-white/85 text-base leading-relaxed mb-8">
            {snap.name}: {snap.price}, {snap.duration}, fixed scope. Tell us
            the decision you are facing and we will say whether a {snap.name}{" "}
            is the right first step.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={enquiryHref("snapshot")}
              className="inline-flex items-center justify-center bg-ecm-lime text-ecm-green font-barlow font-bold text-base px-8 py-4 rounded-full hover:bg-ecm-lime-hover transition-colors"
            >
              Discuss a {snap.name}
            </Link>
            <Link
              href={`/content-technology#${CONTENT_AUDIT.anchor}`}
              className="inline-flex items-center justify-center border-2 border-ecm-lime text-ecm-lime font-barlow font-semibold text-base px-8 py-4 rounded-full hover:bg-ecm-lime hover:text-ecm-green transition-colors"
            >
              Compare both audit depths
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

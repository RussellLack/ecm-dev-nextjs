import Link from "next/link";
import {
  CONTENT_AUDIT,
  PILLAR_FIRST_STEP,
  TOOLS,
  enquiryHref,
  type Pillar,
} from "@/lib/offers";

/* The pillar pages used to reach their only priced offer (ContentAuditTiers)
   after the full capability catalogue, and on Content Operations after ten
   explainers as well. This panel sits straight after the "you probably
   recognise this" symptoms, so a visitor sees the starting point, what it
   produces and what it commits them to before the detail. Everything it
   states is read from lib/offers.ts; it introduces no new terms. See
   docs/COMMERCIAL-JOURNEY-2026-09-27.md. */
export default function FirstStepPanel({ pillar }: { pillar: Pillar }) {
  const step = PILLAR_FIRST_STEP[pillar];
  const tool = TOOLS[step.tool];
  const snap = CONTENT_AUDIT.snapshot;

  return (
    <section
      aria-labelledby={`first-step-${pillar}`}
      className="bg-surface pb-20"
    >
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-heading/70 font-barlow font-semibold text-xs tracking-[0.2em] uppercase mb-3">
          Where to start
        </p>
        <h2
          id={`first-step-${pillar}`}
          className="text-heading font-barlow font-bold text-2xl sm:text-3xl leading-snug mb-3"
        >
          {step.question}
        </h2>
        <p className="text-ink text-base leading-relaxed mb-8 max-w-3xl">
          Two ways in. Check your own position for free, or have us review
          the evidence. Neither commits you to anything after it.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Free self-check */}
          <div className="bg-surface-alt border border-surface-border rounded-2xl p-6 sm:p-8 flex flex-col">
            <p className="text-heading/70 font-barlow font-semibold text-xs uppercase tracking-wide mb-1">
              Free self-check · {tool.duration}
            </p>
            <h3 className="text-heading font-barlow font-bold text-xl mb-3">{tool.name}</h3>
            <dl className="text-sm text-ink space-y-2 mb-6 flex-1">
              <div>
                <dt className="inline font-semibold text-heading">You get: </dt>
                <dd className="inline">{tool.result}</dd>
              </div>
              <div>
                <dt className="inline font-semibold text-heading">Commitment: </dt>
                <dd className="inline">
                  {tool.ungated
                    ? "None. The result is shown on screen, no email needed."
                    : "Your email address to open the tool. No fee."}
                </dd>
              </div>
              <div>
                <dt className="inline font-semibold text-heading">It is not: </dt>
                <dd className="inline">a review of your actual content, a quotation or a promise of savings.</dd>
              </div>
            </dl>
            <Link
              href={tool.href}
              className="self-start inline-flex items-center justify-center border-2 border-heading text-heading font-barlow font-semibold text-sm px-6 py-3 rounded-full hover:bg-ecm-green hover:text-white transition-colors"
            >
              Start the free self-check
            </Link>
          </div>

          {/* Expert Content Audit, Snapshot depth */}
          <div className="bg-ecm-green border border-ecm-lime/20 rounded-2xl p-6 sm:p-8 flex flex-col">
            <p className="text-ecm-lime/70 font-barlow font-semibold text-xs uppercase tracking-wide mb-1">
              Expert-led first project · {snap.duration}
            </p>
            <h3 className="text-ecm-lime font-barlow font-bold text-xl mb-3">
              {CONTENT_AUDIT.name}: {snap.name}
            </h3>
            <dl className="text-sm text-white/85 space-y-2 mb-6 flex-1">
              <div>
                <dt className="inline font-semibold text-ecm-lime">Scope: </dt>
                <dd className="inline">{snap.scope}.</dd>
              </div>
              <div>
                <dt className="inline font-semibold text-ecm-lime">You get: </dt>
                <dd className="inline">{snap.outputs.map((o) => o.charAt(0).toLowerCase() + o.slice(1)).join(", ")}.</dd>
              </div>
              <div>
                <dt className="inline font-semibold text-ecm-lime">Fee: </dt>
                <dd className="inline">
                  {snap.price}, fixed scope. {snap.credit}
                </dd>
              </div>
              <div>
                <dt className="inline font-semibold text-ecm-lime">Afterwards: </dt>
                <dd className="inline">stop, act on it yourselves, or talk to us about the fix. Your choice.</dd>
              </div>
            </dl>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={enquiryHref("snapshot", pillar)}
                className="inline-flex items-center justify-center bg-ecm-lime text-ecm-green font-barlow font-semibold text-sm px-6 py-3 rounded-full hover:bg-ecm-lime-hover transition-colors"
              >
                Discuss a {snap.name}
              </Link>
              <Link
                href={CONTENT_AUDIT.samplePath}
                className="text-ecm-lime text-sm underline hover:text-ecm-lime-hover"
              >
                See a sample report
              </Link>
              <a
                href={`#${CONTENT_AUDIT.anchor}`}
                className="text-ecm-lime text-sm underline hover:text-ecm-lime-hover"
              >
                Compare both audit depths
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

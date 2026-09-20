import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 3600;

/* Hero, the founder line, the four body sections, and the ICP block below.
   Rewritten off the three-pillar content infrastructure positioning (see
   docs/CONTENT-PILLARS-POSITIONING.md and
   docs/SERVICE-CLARITY-AUDIT-2026-09-20.md), replacing the earlier
   "pipeline infrastructure for B2B marketing teams" narrative, which had
   no presence anywhere else on the site (nav, the three pillar pages, case
   studies and llms.txt all already spoke the pillar model). Kept as literal
   constants for the same reason the homepage copy is: positioning goes
   through code review, not a CMS edit. */
const hero = {
  heading: "Content infrastructure for the AI era.",
  body: "Most organisations already have a CMS, a content team, and content running in more than one language. What's usually missing is the operating system underneath: the architecture, the governance, and the workflow that make it something AI, and your own buyers, can actually find, trust, and reuse.",
};

const founder = {
  heading: "One person's judgment, not an anonymous team.",
  body: "ECM.DEV is Russell Lack's independent practice. Engagements aren't sub-contracted: the audit findings, the report, and the live readout come from the person who did the work, which is the point, not a staffing gap to be filled later.",
};

const sections = [
  {
    title: "Three pillars, one operating system",
    body: "Content Technology (your CMS, your platforms, and the data connecting them), Content Operations (governance, ownership, workflow, lifecycle), and Content Localisation (multilingual content at AI speed). Most consultancies specialise in one of these and treat the other two as someone else's problem. Content breaks at the seams between them, so we work across all three.",
  },
  {
    title: "A diagnostic first, in writing",
    body: "Every engagement starts with a priced, bounded finding: a Content Audit, a governance assessment, or the Localisation Cost Estimator, depending on which pillar you start with. ecm-agent scans your actual estate rather than relying on self-reporting. Fixed scope, fixed price, a written finding either way, something you can act on or argue with.",
  },
  {
    title: "Not a certification. Not a subscription tool.",
    body: "This is advisory work: a professional opinion, delivered as a report and a live readout, not an automated score or a guarantee that your content is AI-safe or compliant. Where it makes sense to turn the fix into a managed package, the diagnostic's cost is credited toward it. Where it does not, the diagnostic still stands on its own.",
  },
  {
    title: "What you own when we are done",
    body: "Everything: findings, roadmap, and any remediation work, documented and in your stack, not locked behind an ongoing subscription. Most clients keep the relationship going anyway, for the next audit cycle or the next pillar.",
  },
];

const whoThisIsFor = {
  heading: "Who this is for.",
  body: "Content-heavy organisations, publishing, professional services, healthcare, financial services, higher education, running a mixed or non-Microsoft AI stack. Roughly the size where one person can approve a five-figure engagement without a procurement committee, and large enough that the problem is actually expensive. Based in the UK, working with UK and Ireland teams.",
  notFor: "Probably not a fit: a Copilot-first stack already running Purview, an estate too small to produce a defensible finding, or a search for a certification or guarantee. Worth saying plainly rather than finding out on a call.",
};

export async function generateMetadata(): Promise<Metadata> {
  const title = "About ECM.DEV";
  const description =
    "ECM.DEV is Russell Lack's independent practice for content infrastructure: Content Technology, Content Operations, and Content Localisation, run as one system.";
  return {
    title,
    description,
    alternates: { canonical: "/about" },
    openGraph: { type: "website", title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function AboutPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative bg-ecm-green py-20 sm:py-28 lg:py-32 overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <h1 className="text-ecm-lime font-barlow font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight mb-6">
            {hero.heading}
          </h1>
          <p className="text-white/90 font-barlow font-light text-base sm:text-lg leading-relaxed">
            {hero.body}
          </p>
        </div>
        <div className="wave-divider wave-divider-bottom">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="var(--color-surface)" />
          </svg>
        </div>
      </section>

      {/* ─── FOUNDER ─── */}
      <section className="py-16 bg-surface-alt border-b border-surface-border">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-heading font-barlow font-bold text-xl sm:text-2xl leading-snug mb-3">
            {founder.heading}
          </h2>
          <p className="text-ink text-base leading-relaxed">
            {founder.body}
          </p>
        </div>
      </section>

      {/* ─── BODY SECTIONS ─── */}
      <section className="py-20 bg-surface">
        <div className="max-w-3xl mx-auto px-6 space-y-16">
          {sections.map((section, i) => (
            <div key={i}>
              <h2 className="text-heading font-barlow font-bold text-2xl sm:text-3xl leading-snug mb-4">
                {section.title}
              </h2>
              <p className="text-ink text-base leading-relaxed">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── WHO THIS IS FOR ─── */}
      <section className="py-16 bg-surface-alt border-t border-surface-border">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-heading font-barlow font-bold text-2xl sm:text-3xl leading-snug mb-4">
            {whoThisIsFor.heading}
          </h2>
          <p className="text-ink text-base leading-relaxed mb-4">
            {whoThisIsFor.body}
          </p>
          <p className="text-ink-muted text-sm leading-relaxed">
            {whoThisIsFor.notFor}
          </p>
        </div>
      </section>

      {/* ─── CLOSING CTA ─── */}
      <section className="bg-ecm-green py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-white font-barlow font-bold text-3xl lg:text-4xl mb-6">
            See where your own estate stands.
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/assessments"
              className="inline-flex items-center justify-center bg-ecm-lime text-ecm-green font-barlow font-bold text-base sm:text-lg px-8 py-4 rounded-full hover:bg-ecm-lime-hover transition-colors"
            >
              Start with a free assessment
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center border-2 border-ecm-lime text-ecm-lime font-barlow font-semibold text-base sm:text-lg px-8 py-4 rounded-full hover:bg-ecm-lime hover:text-ecm-green transition-colors"
            >
              Talk to us directly
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

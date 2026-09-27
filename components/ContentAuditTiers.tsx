import Link from "next/link";
import OfferViewTracker from "@/components/analytics/OfferViewTracker";
import { JOURNEY_OFFER } from "@/lib/analytics";
import { isAuditOfferOpen } from "@/lib/auditOffer";
import {
  AUDIT_OFFER_COPY,
  CONTENT_AUDIT,
  enquiryHref,
  type Pillar,
} from "@/lib/offers";

/* Content Audit tiers. Static (not Sanity-sourced), same reasoning as the
   homepage's former engagement-tiers section: pricing goes through code
   review, not a CMS edit. Shared across all three pillar pages, Content
   Audit is a cross-pillar entry point, not owned by a single pillar (see
   docs/CONTENT-PILLARS-POSITIONING.md), so this lives as one component
   rather than three copy-pasted sections that could drift out of sync.

   Currency: GBP, matching the UK-primary ICP. Every figure, duration and
   credit rule is read from lib/offers.ts, the same source the homepage and
   the pillar pages' first-step panel use, so none of them can drift apart.
   `pillar` only tags the enquiry link so /contact knows where the visitor
   came from. */
const tiers = [
  {
    kicker: "First real proof",
    tier: CONTENT_AUDIT.snapshot,
    description:
      "ecm-agent scans a genuine sample of your content: 10% of the estate, at least 50 items and at most 100. A report of 5 to 10 pages, your top five findings, and one or two shown actually failing in an AI answer. 45-minute recorded readout.",
    note: CONTENT_AUDIT.snapshot.credit,
  },
  {
    kicker: "Full proof, board-ready",
    tier: CONTENT_AUDIT.full,
    description:
      "Every finding family available, scored across your full content estate, and a board-ready report of 20 to 30 pages with a costed remediation roadmap. 90-minute stakeholder readout, plus two weeks of async Q&A.",
    note: undefined as string | undefined,
  },
];

export default function ContentAuditTiers({ pillar }: { pillar?: Pillar }) {
  const offerOpen = isAuditOfferOpen();

  return (
    <section
      id={CONTENT_AUDIT.anchor}
      className="py-20 bg-surface border-t border-surface-border scroll-mt-24"
    >
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-center text-heading/70 font-barlow font-semibold text-xs tracking-widest uppercase mb-3">
          {CONTENT_AUDIT.name}
        </p>
        <h2 className="text-heading font-barlow font-bold text-3xl lg:text-4xl text-center mb-4">
          Deeper proof, when you need it in writing.
        </h2>
        <OfferViewTracker offer={JOURNEY_OFFER.auditTiers} pillar={pillar} />
        <p className="text-ink text-center text-base mb-6 max-w-2xl mx-auto">
          ecm-agent scans your actual content estate rather than relying on
          self-reporting. Two depths, both fixed scope. Diagnosis only:
          implementation is not included unless we agree it separately.
        </p>
        {offerOpen && (
          <p className="text-center text-sm mb-10 max-w-2xl mx-auto bg-ecm-lime/10 border border-ecm-lime/30 rounded-2xl px-5 py-2.5 text-heading">
            Audits requested by {AUDIT_OFFER_COPY.deadlineLabel} are
            free, in exchange for a recommendation if the findings are
            useful. {AUDIT_OFFER_COPY.capacity} The prices below are what
            this becomes afterwards.
          </p>
        )}
        <div className="grid md:grid-cols-2 gap-6">
          {tiers.map(({ kicker, tier, description, note }) => (
            <div
              key={tier.name}
              className="relative bg-ecm-green rounded-xl p-6 sm:p-8 border border-ecm-lime/20 flex flex-col"
            >
              <p className="text-ecm-lime/70 font-barlow font-semibold text-xs uppercase tracking-wide mb-1">
                {kicker}
              </p>
              <h3 className="text-ecm-lime font-barlow font-bold text-xl mb-1">{tier.name}</h3>
              <p className="text-white font-barlow font-bold text-2xl mb-1">{tier.price}</p>
              <p className="text-white/60 text-xs mb-4">
                {tier.duration} · {tier.scope}
              </p>
              <p className="text-white/85 text-sm leading-relaxed mb-4 flex-1">{description}</p>
              {note && (
                <p className="text-ecm-lime/80 text-xs italic mb-4">{note}</p>
              )}
              <Link
                href={enquiryHref(tier.key, pillar)}
                className="inline-flex items-center justify-center bg-ecm-lime text-ecm-green font-barlow font-semibold text-sm px-6 py-3 rounded-full hover:bg-ecm-lime-hover transition-colors mt-auto"
              >
                Discuss a {tier.name}
              </Link>
            </div>
          ))}
        </div>
        <details className="mt-8 max-w-2xl mx-auto rounded-xl border border-surface-border px-5 py-3 text-sm text-ink">
          <summary className="cursor-pointer text-heading font-barlow font-semibold">
            What counts as an item?
          </summary>
          <div className="mt-3 space-y-2 leading-relaxed">
            <p>{CONTENT_AUDIT.itemDefinition.summary}</p>
            <p><strong className="text-heading">Counted:</strong> {CONTENT_AUDIT.itemDefinition.counted}</p>
            <p><strong className="text-heading">Not counted:</strong> {CONTENT_AUDIT.itemDefinition.notCounted}</p>
            <p>{CONTENT_AUDIT.itemDefinition.languages}</p>
            <p>{CONTENT_AUDIT.itemDefinition.sampleRule}</p>
          </div>
        </details>
        <p className="text-center text-ink text-xs mt-6 max-w-2xl mx-auto">
          {CONTENT_AUDIT.vatNote}{" "}
          <Link href={CONTENT_AUDIT.samplePath} className="underline hover:text-heading">
            See what a Snapshot report looks like (illustrative sample)
          </Link>
        </p>
      </div>
    </section>
  );
}

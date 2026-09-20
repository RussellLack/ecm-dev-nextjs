import Link from "next/link";
import { isAuditOfferOpen } from "@/lib/auditOffer";

/* Content Audit tiers. Static (not Sanity-sourced), same reasoning as the
   homepage's former engagement-tiers section: pricing goes through code
   review, not a CMS edit. Shared across all three pillar pages, Content
   Audit is a cross-pillar entry point, not owned by a single pillar (see
   docs/CONTENT-PILLARS-POSITIONING.md), so this lives as one component
   rather than three copy-pasted sections that could drift out of sync.

   Currency: GBP, matching the UK-primary ICP (Ireland approved-adjacent,
   the Nordics excluded under the Innofactor wall). Figures are the ranges
   already agreed for this product, not new numbers: see
   docs/SERVICE-CLARITY-AUDIT-2026-09-20.md. Previously this showed EUR
   single points, a different currency and a narrower figure than the
   canonical range. */
const auditTiers = [
  {
    kicker: "First real proof",
    title: "Snapshot",
    price: "£2,000–3,000",
    meta: "5–7 business days · a real sample of your estate",
    description:
      "ecm-agent scans a genuine sample of your content, up to 100 items or 10% of the estate. A 5–10 page report, your top five findings, and one or two shown actually failing in an AI answer. 45-minute recorded readout.",
    note: "100% credited toward a Full Estate Audit if you sign within 30 days.",
  },
  {
    kicker: "Full proof, board-ready",
    title: "Full Estate Audit",
    price: "£12,000–15,000",
    meta: "3–4 weeks · your whole estate",
    description:
      "Every finding family available, scored across your full content estate, and a 20–30 page board-ready report with a costed remediation roadmap. 90-minute stakeholder readout, plus two weeks of async Q&A.",
  },
];

export default function ContentAuditTiers() {
  const offerOpen = isAuditOfferOpen();

  return (
    <section className="py-20 bg-surface border-t border-surface-border">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-center text-heading/70 font-barlow font-semibold text-xs tracking-widest uppercase mb-3">
          Content Audit
        </p>
        <h2 className="text-heading font-barlow font-bold text-3xl lg:text-4xl text-center mb-4">
          Deeper proof, when you need it in writing.
        </h2>
        <p className="text-ink text-center text-base mb-6 max-w-2xl mx-auto">
          ecm-agent scans your actual content estate rather than relying on
          self-reporting. Two depths, both fixed scope.
        </p>
        {offerOpen && (
          <p className="text-center text-sm mb-10 max-w-2xl mx-auto bg-ecm-lime/10 border border-ecm-lime/30 rounded-full px-5 py-2.5 text-heading">
            Audits requested before 30 September are free while we take on
            the first five, in exchange for a recommendation if the findings
            are useful. The prices below are what this becomes afterwards.
          </p>
        )}
        <div className="grid md:grid-cols-2 gap-6">
          {auditTiers.map((tier) => (
            <div
              key={tier.title}
              className="relative bg-ecm-green rounded-xl p-6 sm:p-8 border border-ecm-lime/20 flex flex-col"
            >
              <p className="text-ecm-lime/70 font-barlow font-semibold text-xs uppercase tracking-wide mb-1">
                {tier.kicker}
              </p>
              <h3 className="text-ecm-lime font-barlow font-bold text-xl mb-1">{tier.title}</h3>
              <p className="text-white font-barlow font-bold text-2xl mb-1">{tier.price}</p>
              <p className="text-white/60 text-xs mb-4">{tier.meta}</p>
              <p className="text-white/85 text-sm leading-relaxed mb-4 flex-1">{tier.description}</p>
              {tier.note && (
                <p className="text-ecm-lime/80 text-xs italic mb-4">{tier.note}</p>
              )}
              <Link
                href="/contact"
                className="inline-flex items-center justify-center bg-ecm-lime text-ecm-green font-barlow font-semibold text-sm px-6 py-3 rounded-full hover:bg-ecm-lime-hover transition-colors mt-auto"
              >
                Talk about a {tier.title}
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-ink text-xs mt-8 max-w-2xl mx-auto">
          All prices exclude VAT where applicable.
        </p>
      </div>
    </section>
  );
}

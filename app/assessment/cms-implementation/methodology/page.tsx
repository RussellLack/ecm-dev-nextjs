import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "CMS Implementation Estimator — Methodology | ECM.DEV",
  description:
    "How the CMS Implementation Cost Estimator coefficients are derived: vendor pricing, SI day rates, run-cost benchmarks, ROI studies. Confidence ratings per source.",
  alternates: {
    canonical: "/assessment/cms-implementation/methodology",
  },
};

export default function MethodologyPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-ecm-green pt-2 pb-16 lg:pb-24">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Assessments", path: "/assessment" },
            { name: "CMS Implementation Estimator", path: "/assessment/cms-implementation" },
            { name: "Methodology", path: null },
          ]}
        />
        <div className="mx-auto max-w-3xl px-6 pt-10 text-center lg:pt-14">
          <p className="mb-2 font-barlow text-[11px] font-bold uppercase tracking-[0.16em] text-ecm-lime/80">
            Methodology · Sources · Confidence
          </p>
          <h1 className="mb-4 font-barlow text-3xl font-bold leading-tight text-ecm-lime sm:text-4xl lg:text-5xl">
            How the numbers are derived
          </h1>
          <p className="font-barlow text-base text-white/75 sm:text-lg">
            The CMS Implementation Cost Estimator is built from a coefficients
            table sourced from public analyst reports, vendor pricing pages and
            ECM.dev's own consulting work. Every line below is rated A
            (published rate cards), B (analyst sources, commonly discounted in
            practice), or C (industry-anecdotal).
          </p>
        </div>
      </section>

      {/* Body */}
      <article className="bg-white py-14">
        <div className="mx-auto max-w-3xl px-6">
          <Heading2>1. Headless CMS — annual licence</Heading2>
          <P>
            Sources: vendor pricing pages (Sanity, Strapi, Storyblok, Contentful),
            broker aggregators (Vendr, ITQlick, G2). Self-serve and Growth-tier
            entry points are <Conf rating="A" /> — published rate cards.
            Enterprise tiers are <Conf rating="B" /> — published but commonly
            discounted at scale.
          </P>
          <Range>
            Self-serve $1.8k–$12k / yr · Growing team $12k–$60k · Mid-enterprise
            $60k–$180k · Enterprise $140k–$350k
          </Range>

          <Heading2>2. DXP / enterprise platform — annual licence</Heading2>
          <P>
            Sources: Brainvire, 40Q, ITQlick, SaM Solutions, Fishtank — broker
            and partner commentary. <Conf rating="C" /> across the board.
            Sitecore, Optimizely, AEM and Acquia are sales-gated; the calculator
            surfaces a ±40% disclaimer when these vendors are picked.
          </P>
          <Range>
            Entry $45k–$110k · Mid-enterprise $110k–$280k · Global enterprise
            $280k–$900k
          </Range>

          <Heading2>3. Mid-market CMS — annual licence</Heading2>
          <P>
            Kentico Xperience and Umbraco Heartcore publish rate cards{" "}
            <Conf rating="A" />. Sitefinity and Drupal Enterprise pricing is{" "}
            <Conf rating="C" /> via partner commentary.
          </P>
          <Range>
            Entry $6k–$25k · Standard $18k–$55k · Premium $50k–$150k
          </Range>

          <Heading2>4. ECM — annual licence</Heading2>
          <P>
            OnBase per-user pricing comes from ITQlick and SelectHub{" "}
            <Conf rating="B" />. Deployment-level totals for OpenText, IBM
            FileNet and M-Files are <Conf rating="C" /> — fully sales-gated.
          </P>
          <Range>
            Departmental $60k–$220k · Mid-enterprise $200k–$800k · Enterprise
            $600k–$2.5M
          </Range>

          <Heading2>5. Implementation cost</Heading2>
          <P>
            <strong>SI day rates</strong> drawn from ContractorUK Jan 2026,
            Index.dev European rates 2026, PayScale, Qubit Labs. UK senior
            consultant £700–£1,300/day; Western Europe €600–€1,200; US
            $900–$1,800; offshore $250–$550. <Conf rating="B" />.
          </P>
          <P>
            <strong>Project effort bands</strong> from Storyblok migration
            guide, Dellos, Clear Digital, Webflow Enterprise build cost. Small
            project 60–150 days; mid-market 300–700; enterprise 1,000–2,500;
            global enterprise 2,500–6,000+.
          </P>
          <P>
            <strong>Phase split</strong> from atechsight 2026, Solutions
            Review, Ingeniux: discovery 12% · design 20% · build 40% · content
            migration 12% · testing 7% · training 9%.{" "}
            <strong>Always-applied 18% contingency</strong> on top.{" "}
            <Conf rating="B" />.
          </P>
          <P>
            <strong>Scope multipliers</strong>: sites = √(sites). Locales = 1 +
            0.15 × (locales − 1). Each integration = +5% capped at +40%.
            Personalisation: light +10%, heavy +25%. Each compliance pick = +3%
            capped at +15%. Custom legacy migration uplift = +40%. Greenfield
            skips migration entirely and reduces contingency to 12%.
          </P>

          <Heading2>6. Ongoing run cost</Heading2>
          <P>
            Hosting, content-ops headcount, integration maintenance bundled into
            size-banded run-cost coefficients (mid-market $60k–$180k /
            mid-enterprise $180k–$520k / enterprise $500k–$1.8M). Vendor support
            adds 20% of licence — industry standard. <Conf rating="B" />.
          </P>
          <P>
            <strong>Out-year enhancement</strong> set at 60% of Year 1
            implementation, recurring annually from Year 2. Real Story Group's{" "}
            <em>CMS Implementation Cost Curve</em> cites ~100% (i.e. enhancement
            ≈ original implementation) — we soften to 60% to keep the
            conservative-defaults principle. Bumps to 75% if 10+ years on
            legacy. <Conf rating="A" /> for the underlying claim.
          </P>

          <Heading2>7. Benefit-side coefficients</Heading2>
          <P>
            Editor-hour and dev-hour savings, plus revenue uplift, drawn from
            Forrester Total Economic Impact studies of Contentstack (295% ROI),
            Kontent.ai (320% ROI) and Storyblok (582% ROI). These are{" "}
            <strong>vendor-commissioned composite-organisation studies</strong>{" "}
            — directional, not guarantees. <Conf rating="B" /> when used as
            benchmarks, never as targets. The default conservative case uses
            the low-end of the published ranges; the TEI toggle multiplies by
            2× to surface the vendor-cited case.
          </P>

          <Heading2>8. Risk profile / high-band widening</Heading2>
          <P>
            McKinsey research (via Forecast.app, Runn IT-PM stats 2025) finds
            that 66% of enterprise software projects overrun, with large
            project overruns commonly 200–400% over budget. The calculator
            applies a 1.4× mid → high multiplier by default, and lifts to 1.8×
            when ANY TWO of: locales ≥ 6, integrations ≥ 5, heavy AI
            personalisation, ≥ 3 compliance constraints, or 50,000+ pages.
          </P>

          <Heading2>9. Currency</Heading2>
          <P>
            All coefficients are anchored in USD. Display conversion applied
            at render time: GBP × 0.79, EUR × 0.92. FX rates refreshed
            quarterly. The single-source coefficient table avoids drift between
            currencies.
          </P>

          <Heading2>Full source list</Heading2>
          <P>
            The full benchmark research with 40+ source citations lives in the
            project repo at{" "}
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-[12px]">
              docs/CMS-IMPLEMENTATION-BENCHMARKS.md
            </code>
            . Key analyst sources include:
          </P>
          <ul className="mb-6 space-y-1.5 pl-6 font-barlow text-sm text-ecm-gray-dark">
            <li>
              • <Ext href="https://realstorygroup.com/Blog/cms-implementation-cost-curve">Real Story Group — CMS Implementation Cost Curve</Ext>
            </li>
            <li>
              • <Ext href="https://www.contentstack.com/blog/all-about-headless/contentstack-demonstrated-295-percent-roi-in-forrester-study">Forrester TEI of Contentstack — 295% ROI</Ext>
            </li>
            <li>
              • <Ext href="https://kontent.ai/blog/6-key-takeaways-from-the-tei-study-on-kontent-ai-s-roi/">Forrester TEI of Kontent.ai — 320% ROI</Ext>
            </li>
            <li>
              • <Ext href="https://www.storyblok.com/mp/storyblok-tei-study-press">Forrester TEI of Storyblok — 582% ROI</Ext>
            </li>
            <li>
              • <Ext href="https://www.brainvire.com/blog/adobe-aem-cost-breakdown-us-enterprises/">Brainvire — AEM cost guide for US enterprises 2026</Ext>
            </li>
            <li>
              • <Ext href="https://www.contractoruk.com/market_rates">ContractorUK — January 2026 market rates</Ext>
            </li>
            <li>
              • <Ext href="https://www.forecast.app/blog/66-of-enterprise-software-projects-have-cost-overruns">Forecast — 66% of enterprise software projects overrun (McKinsey)</Ext>
            </li>
          </ul>

          <Heading2>Refresh cadence</Heading2>
          <P>
            Coefficients are refreshed quarterly. The model version is shown in
            the result header — when you see{" "}
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-[12px]">v0.1</code>,
            the table you're looking at was last reviewed May 2026. We bump the
            version when any coefficient moves more than 10%.
          </P>

          {/* Back to estimator */}
          <div className="mt-12 border-t border-gray-100 pt-8 text-center">
            <Link
              href="/assessment/cms-implementation"
              className="inline-block rounded-full bg-ecm-green px-8 py-3 font-barlow text-sm font-semibold text-white transition-colors hover:bg-ecm-green-dark"
            >
              ← Back to the estimator
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}

/* ── Helpers ───────────────────────────────────────────────────────────── */

function Heading2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 mt-10 font-barlow text-2xl font-bold text-ecm-green first:mt-0">
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 font-barlow text-sm leading-relaxed text-ecm-gray-dark">
      {children}
    </p>
  );
}

function Range({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-6 rounded-lg border-l-4 border-ecm-lime bg-gray-50 px-4 py-3 font-barlow text-sm tabular-nums text-ecm-gray-dark">
      {children}
    </p>
  );
}

function Conf({ rating }: { rating: "A" | "B" | "C" }) {
  const map = {
    A: { label: "Confidence A", color: "bg-ecm-green text-white" },
    B: { label: "Confidence B", color: "bg-amber-100 text-amber-900" },
    C: { label: "Confidence C", color: "bg-orange-100 text-orange-900" },
  };
  const m = map[rating];
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${m.color}`}
    >
      {m.label}
    </span>
  );
}

function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-ecm-green underline hover:text-ecm-green-dark"
    >
      {children}
    </a>
  );
}

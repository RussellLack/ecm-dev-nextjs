"use client";

import { useState } from "react";
import type {
  CmsImplementationResult,
  CmsImplementationInputs,
} from "@/lib/assessment/cms-implementation/types";
import { buildShareableUrl } from "@/lib/assessment/cms-implementation/url";
import EmailCaptureForm from "./EmailCaptureForm";
import { trackLeadSubmit } from "@/lib/analytics/track";

interface Props {
  result: CmsImplementationResult;
  inputs: CmsImplementationInputs;
  onToggleTei: (value: boolean) => void;
  /** Hide the email-capture form. Used on the shared-link result page,
   *  where the original visitor has already submitted and the recipient
   *  shouldn't be re-prompted. Defaults to true (capture form shown). */
  showEmailCapture?: boolean;
  /** Optional shareable-link URL override. Used by the shared-link page
   *  so the "Copy shareable link" button copies the canonical URL even
   *  if the page was opened from a different host (e.g. share preview). */
  shareableUrl?: string;
}

/**
 * Phase 4 result composition. Renders below the form/sidebar as the
 * full report-style view that someone could screenshot or share with
 * their CFO. Phase 5 will add real PDF + email-gated shareable link.
 */
export default function Result({
  result,
  inputs,
  onToggleTei,
  showEmailCapture = true,
  shareableUrl,
}: Props) {
  const m = result.currencyMultiplier;
  const sym = currencySymbol(result.currency);
  const horizon = inputs.runtime.horizon;
  const horizonTotal =
    horizon === 5 ? result.fiveYearTotal : result.threeYearTotal;
  const benefit = inputs.options?.useTeiBenefit
    ? result.benefit.tei
    : result.benefit.conservative;
  const benefitHorizon =
    horizon === 5 ? benefit.fiveYearValue : benefit.threeYearValue;

  const net = {
    low: horizonTotal.low - benefitHorizon.high,
    mid: horizonTotal.mid - benefitHorizon.mid,
    high: horizonTotal.high - benefitHorizon.low,
  };

  return (
    <section className="border-t border-gray-100 bg-gray-50 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl px-6">
        {/* 1. Headline summary */}
        <Headline
          horizon={horizon}
          total={horizonTotal}
          net={net}
          confidence={result.flags.confidence}
          modelVersion={result.modelVersion}
          sym={sym}
          mul={m}
        />

        {/* 2. Cost breakdown table */}
        <BreakdownTable result={result} sym={sym} mul={m} />

        {/* 3. Year-by-year totals */}
        <YearByYear
          totals={result.totalsByYear}
          horizon={horizon}
          sym={sym}
          mul={m}
        />

        {/* 4. Risk-band visualiser */}
        <RiskBand
          horizon={horizon}
          total={horizonTotal}
          flags={result.flags}
          sym={sym}
          mul={m}
        />

        {/* 5. Benefit side */}
        <BenefitPanel
          benefit={benefit}
          conservative={result.benefit.conservative}
          tei={result.benefit.tei}
          horizon={horizon}
          editorHours={benefit.editorHoursSaved}
          devHours={benefit.devHoursSaved}
          revenueUplift={benefit.revenueUplift}
          useTei={!!inputs.options?.useTeiBenefit}
          onToggleTei={onToggleTei}
          sym={sym}
          mul={m}
        />

        {/* 6. Notes / disclaimers */}
        {result.flags.notes.length > 0 && (
          <Notes notes={result.flags.notes} salesGated={result.flags.salesGated} />
        )}

        {/* 7. Methodology + shareable-link block + email capture */}
        <ShareAndMethodology
          inputs={inputs}
          result={result}
          showEmailCapture={showEmailCapture}
          shareableUrl={shareableUrl}
        />
      </div>
    </section>
  );
}

/* ── Sub-components ────────────────────────────────────────────────────── */

function Headline({
  horizon,
  total,
  net,
  confidence,
  modelVersion,
  sym,
  mul,
}: {
  horizon: 3 | 5;
  total: { low: number; mid: number; high: number };
  net: { low: number; mid: number; high: number };
  confidence: "A" | "B" | "C";
  modelVersion: string;
  sym: string;
  mul: number;
}) {
  return (
    <div className="mb-10 rounded-2xl bg-ecm-green p-7 text-ecm-lime sm:p-9">
      <div className="mb-2 flex items-baseline justify-between">
        <p className="font-barlow text-[11px] font-bold uppercase tracking-[0.16em] text-ecm-lime/70">
          Indicative {horizon}-year TCO
        </p>
        <p className="font-barlow text-[10px] font-semibold uppercase tracking-wider text-ecm-lime/60">
          ECM.dev model {modelVersion} · refreshed quarterly
        </p>
      </div>
      <p className="mb-1 font-barlow text-3xl font-bold leading-tight text-ecm-lime sm:text-4xl lg:text-5xl">
        {fmt(total.low * mul, sym)} – {fmt(total.high * mul, sym)}
      </p>
      <p className="mb-5 font-barlow text-base text-white/75">
        Mid case {fmt(total.mid * mul, sym)} ·{" "}
        <ConfidenceLabel confidence={confidence} />
      </p>

      <div className="border-t border-ecm-lime/20 pt-4">
        <p className="mb-1 font-barlow text-[11px] font-bold uppercase tracking-[0.16em] text-ecm-lime/70">
          Net of benefit ({horizon}-yr)
        </p>
        <p className="font-barlow text-2xl font-bold text-ecm-lime sm:text-3xl">
          {fmt(net.low * mul, sym)} – {fmt(net.high * mul, sym)}
        </p>
        <p className="font-barlow text-sm text-white/70">
          Mid {fmt(net.mid * mul, sym)} after editor + dev productivity savings
        </p>
      </div>
    </div>
  );
}

function BreakdownTable({
  result,
  sym,
  mul,
}: {
  result: CmsImplementationResult;
  sym: string;
  mul: number;
}) {
  const lines = [
    {
      label: "Year 1 implementation",
      sublabel: "Days × SI rate, with scope multipliers",
      r: result.breakdown.implementation,
      oneOff: true,
    },
    {
      label: "+ Contingency",
      sublabel: "Always added on Year 1 build",
      r: result.breakdown.contingency,
      oneOff: true,
    },
    {
      label: "Annual licence",
      sublabel: "Subscription / SaaS / per-seat",
      r: result.breakdown.licence,
      oneOff: false,
    },
    {
      label: "Annual hosting + run team",
      sublabel: "Hosting, infra, content-ops FTEs, integrations",
      r: result.breakdown.hosting,
      oneOff: false,
    },
    {
      label: "Annual vendor support",
      sublabel: "20% of licence (industry standard)",
      r: result.breakdown.vendorSupport,
      oneOff: false,
    },
    {
      label: "Annual out-year enhancement",
      sublabel: "60% of Year 1 implementation, recurring (RSG benchmark)",
      r: result.breakdown.outYearEnhancement,
      oneOff: false,
    },
  ];

  return (
    <Section title="Cost breakdown">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-gray-200 bg-gray-50 px-5 py-3 font-barlow text-[10px] font-bold uppercase tracking-[0.14em] text-ecm-gray sm:grid-cols-[1fr_120px_180px]">
          <span>Line item</span>
          <span className="text-right">Cadence</span>
          <span className="text-right">Range</span>
        </div>
        {lines.map((line) => (
          <div
            key={line.label}
            className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-gray-100 px-5 py-3 last:border-b-0 sm:grid-cols-[1fr_120px_180px]"
          >
            <div>
              <p className="font-barlow text-sm font-semibold text-ecm-gray-dark">
                {line.label}
              </p>
              <p className="font-barlow text-xs text-ecm-gray">{line.sublabel}</p>
            </div>
            <p className="self-center text-right font-barlow text-xs text-ecm-gray">
              {line.oneOff ? "One-off" : "Annual"}
            </p>
            <p className="self-center text-right font-barlow text-sm tabular-nums text-ecm-gray-dark">
              {fmt(line.r.low * mul, sym)} – {fmt(line.r.high * mul, sym)}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function YearByYear({
  totals,
  horizon,
  sym,
  mul,
}: {
  totals: CmsImplementationResult["totalsByYear"];
  horizon: 3 | 5;
  sym: string;
  mul: number;
}) {
  // Find the largest mid total to scale the bar widths.
  const maxMid = Math.max(...totals.map((t) => t.mid));
  return (
    <Section title={`${horizon}-year cash flow`}>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {totals.map((y) => {
          const widthPct = maxMid > 0 ? (y.mid / maxMid) * 100 : 0;
          return (
            <div
              key={y.year}
              className="border-b border-gray-100 px-5 py-3 last:border-b-0"
            >
              <div className="mb-1.5 flex items-baseline justify-between font-barlow">
                <span className="text-sm font-semibold text-ecm-gray-dark">
                  Year {y.year}
                </span>
                <span className="text-sm tabular-nums text-ecm-gray-dark">
                  {fmt(y.low * mul, sym)} – {fmt(y.high * mul, sym)}
                </span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-ecm-green"
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function RiskBand({
  horizon,
  total,
  flags,
  sym,
  mul,
}: {
  horizon: 3 | 5;
  total: { low: number; mid: number; high: number };
  flags: CmsImplementationResult["flags"];
  sym: string;
  mul: number;
}) {
  // Position mid at 50%; spread low/high proportionally on a clamped axis.
  const range = total.high - total.low;
  const midOffset = range > 0 ? ((total.mid - total.low) / range) * 100 : 50;

  return (
    <Section title="Risk band">
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-baseline justify-between font-barlow text-xs text-ecm-gray-dark">
          <span>Conservative</span>
          <span className="font-semibold">Mid case</span>
          <span>Aggressive</span>
        </div>

        <div className="relative mb-3 h-3 w-full overflow-hidden rounded-full bg-gradient-to-r from-ecm-green via-amber-300 to-orange-500">
          <div
            className="absolute top-1/2 h-5 w-1 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white shadow-md ring-2 ring-ecm-green-dark"
            style={{ left: `${midOffset}%` }}
            title="Mid case"
          />
        </div>

        <div className="mb-4 flex items-baseline justify-between font-barlow text-sm tabular-nums text-ecm-gray-dark">
          <span>{fmt(total.low * mul, sym)}</span>
          <span className="font-semibold text-ecm-green">
            {fmt(total.mid * mul, sym)}
          </span>
          <span>{fmt(total.high * mul, sym)}</span>
        </div>

        {flags.highRiskProfile && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 font-barlow text-xs text-amber-900">
            <strong className="font-bold">High-risk profile detected.</strong>{" "}
            Two or more of: locales ≥ 6, integrations ≥ 5, heavy AI
            personalisation, ≥ 3 compliance constraints, or 50,000+ pages. The
            high band has been widened to 1.8× mid (vs. 1.4× baseline) — these
            scenarios historically overrun 200%+.
          </div>
        )}
      </div>
    </Section>
  );
}

function BenefitPanel({
  benefit,
  conservative,
  tei,
  horizon,
  editorHours,
  devHours,
  revenueUplift,
  useTei,
  onToggleTei,
  sym,
  mul,
}: {
  benefit: { threeYearValue: { low: number; mid: number; high: number }; fiveYearValue: { low: number; mid: number; high: number } };
  conservative: { threeYearValue: { low: number; mid: number; high: number }; fiveYearValue: { low: number; mid: number; high: number } };
  tei: { threeYearValue: { low: number; mid: number; high: number }; fiveYearValue: { low: number; mid: number; high: number } };
  horizon: 3 | 5;
  editorHours: number;
  devHours: number;
  revenueUplift: number;
  useTei: boolean;
  onToggleTei: (v: boolean) => void;
  sym: string;
  mul: number;
}) {
  const horizonValue =
    horizon === 5 ? benefit.fiveYearValue : benefit.threeYearValue;
  const altHorizonValue =
    horizon === 5
      ? (useTei ? conservative.fiveYearValue : tei.fiveYearValue)
      : (useTei ? conservative.threeYearValue : tei.threeYearValue);

  return (
    <Section title="Benefit side (indicative)">
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
          <p className="font-barlow text-2xl font-bold text-ecm-green">
            {fmt(horizonValue.low * mul, sym)} – {fmt(horizonValue.high * mul, sym)}{" "}
            <span className="font-barlow text-sm font-normal text-ecm-gray">
              over {horizon} years
            </span>
          </p>
          <label className="flex items-center gap-2 font-barlow text-xs text-ecm-gray-dark">
            <input
              type="checkbox"
              checked={useTei}
              onChange={(e) => onToggleTei(e.target.checked)}
              className="accent-ecm-green"
            />
            Use vendor-cited TEI benchmark
          </label>
        </div>

        <p className="mb-4 font-barlow text-xs text-ecm-gray">
          Currently showing <strong className="text-ecm-gray-dark">{useTei ? "vendor-cited TEI benchmark" : "conservative case"}</strong>.
          Toggle would change to {fmt(altHorizonValue.low * mul, sym)} – {fmt(altHorizonValue.high * mul, sym)}.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <BenefitTile
            label="Editor hours saved / yr"
            value={Math.round(editorHours).toLocaleString("en-GB")}
            sublabel="Across all content authors"
          />
          <BenefitTile
            label="Dev hours saved / yr"
            value={Math.round(devHours).toLocaleString("en-GB")}
            sublabel="Platform team only"
          />
          <BenefitTile
            label="Revenue uplift / yr"
            value={revenueUplift > 0 ? fmt(revenueUplift * mul, sym) : "—"}
            sublabel={revenueUplift > 0 ? "Currency-aware" : "Add revenue input to enable"}
          />
        </div>

        <p className="mt-4 border-t border-gray-100 pt-3 font-barlow text-[11px] leading-relaxed text-ecm-gray">
          Benefit numbers drawn from Forrester TEI studies of Contentstack (295% ROI),
          Kontent.ai (320% ROI) and Storyblok (582% ROI). These are
          vendor-commissioned composite-organisation studies — directional, not
          guarantees. The default conservative case uses the low-end of the
          published ranges.
        </p>
      </div>
    </Section>
  );
}

function BenefitTile({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string;
  sublabel: string;
}) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
      <p className="mb-1 font-barlow text-[10px] font-bold uppercase tracking-[0.14em] text-ecm-gray">
        {label}
      </p>
      <p className="mb-0.5 font-barlow text-2xl font-bold tabular-nums text-ecm-green">
        {value}
      </p>
      <p className="font-barlow text-xs text-ecm-gray">{sublabel}</p>
    </div>
  );
}

function Notes({
  notes,
  salesGated,
}: {
  notes: string[];
  salesGated: boolean;
}) {
  return (
    <Section title="Notes & disclaimers">
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        {salesGated && (
          <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-3 font-barlow text-xs text-orange-900">
            <strong className="font-bold">
              Sales-gated vendor selected.
            </strong>{" "}
            This vendor doesn't publish prices — analyst-broker estimates can
            diverge ±40% from negotiated price. The numbers above are
            indicative; book a 30-min benchmarking call with ECM.dev to
            tighten the range.
          </div>
        )}
        <ul className="space-y-2">
          {notes.map((note, i) => (
            <li key={i} className="flex gap-2 font-barlow text-xs text-ecm-gray-dark">
              <span className="text-ecm-green">•</span>
              <span className="leading-relaxed">{note}</span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

function ShareAndMethodology({
  inputs,
  result,
  showEmailCapture,
  shareableUrl,
}: {
  inputs: CmsImplementationInputs;
  result: CmsImplementationResult;
  showEmailCapture: boolean;
  shareableUrl?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (typeof window === "undefined") return;
    let url = shareableUrl;
    if (!url) {
      // No override (= calculator page). Bake current inputs into the URL
      // so the recipient sees the same scenario without filling the form.
      const base = `${window.location.origin}${window.location.pathname}`;
      url = buildShareableUrl(base, inputs);
    }
    try {
      await navigator.clipboard.writeText(url);
      trackLeadSubmit("cms_implementation", "share_link");
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  return (
    <Section title="Take it away">
      <div
        className={
          showEmailCapture
            ? "grid gap-4 sm:grid-cols-2"
            : "grid gap-4"
        }
      >
        {showEmailCapture && (
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <EmailCaptureForm inputs={inputs} result={result} />
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="mb-2 font-barlow text-sm font-semibold text-ecm-gray-dark">
            {showEmailCapture
              ? "Share this estimate"
              : "Pass it on"}
          </p>
          <p className="mb-3 font-barlow text-xs text-ecm-gray">
            {showEmailCapture
              ? "Skip the email gate — your inputs are baked into the URL. Anyone with the link sees the same scenario, ready to tweak. No contact details captured."
              : "Anyone with this link sees the same numbers. No login, no email gate, no further contact details captured."}
          </p>
          <button
            type="button"
            onClick={handleCopy}
            className="w-full rounded-full border border-ecm-green bg-white px-4 py-2.5 font-barlow text-xs font-semibold uppercase tracking-wider text-ecm-green transition-colors hover:bg-ecm-green hover:text-white"
          >
            {copied ? "Link copied" : "Copy shareable link"}
          </button>
          <p className="mt-4 border-t border-gray-100 pt-3 font-barlow text-[11px] leading-relaxed text-ecm-gray">
            Curious how the numbers are derived?{" "}
            <a
              href="/assessment/cms-implementation/methodology"
              className="font-semibold text-ecm-green underline hover:text-ecm-green-dark"
            >
              Read the methodology and sources
            </a>{" "}
            — every coefficient with its analyst origin and confidence
            rating.
          </p>
          {!showEmailCapture && (
            <p className="mt-3 font-barlow text-[11px] leading-relaxed text-ecm-gray">
              Want to run your own scenario?{" "}
              <a
                href="/assessment/cms-implementation"
                className="font-semibold text-ecm-green underline hover:text-ecm-green-dark"
              >
                Open the calculator
              </a>{" "}
              — same model, fresh inputs.
            </p>
          )}
        </div>
      </div>
    </Section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10 last:mb-0">
      <h2 className="mb-3 font-barlow text-[11px] font-bold uppercase tracking-[0.16em] text-ecm-gray">
        {title}
      </h2>
      {children}
    </section>
  );
}

function ConfidenceLabel({ confidence }: { confidence: "A" | "B" | "C" }) {
  const map = {
    A: { label: "High confidence", color: "text-ecm-lime" },
    B: { label: "Medium confidence", color: "text-amber-200" },
    C: { label: "Indicative only", color: "text-orange-200" },
  };
  const m = map[confidence];
  return <span className={`font-semibold ${m.color}`}>{m.label}</span>;
}

/* ── Helpers ───────────────────────────────────────────────────────────── */

function currencySymbol(c: "USD" | "GBP" | "EUR"): string {
  return c === "USD" ? "$" : c === "GBP" ? "£" : "€";
}

function fmt(value: number, sym: string): string {
  if (value === 0) return `${sym}0`;
  if (Math.abs(value) >= 1_000_000) {
    return `${value < 0 ? "-" : ""}${sym}${Math.abs(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${value < 0 ? "-" : ""}${sym}${Math.round(Math.abs(value) / 1_000).toLocaleString("en-GB")}k`;
  }
  return `${value < 0 ? "-" : ""}${sym}${Math.round(Math.abs(value)).toLocaleString("en-GB")}`;
}

"use client";

import type {
  CmsImplementationResult,
  CmsImplementationInputs,
} from "@/lib/assessment/cms-implementation/types";

interface Props {
  result: CmsImplementationResult;
  inputs: CmsImplementationInputs;
}

/**
 * Sticky side-panel summary that updates live as the visitor edits the
 * form. The TEI toggle lives in the result section's BenefitPanel below
 * (one source of truth) — this side panel just reflects whichever case is
 * currently selected. Currency is applied at render time via
 * result.currencyMultiplier.
 */
export default function RunningTotal({ result, inputs }: Props) {
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
    <aside className="sticky top-6 rounded-2xl border border-surface-border bg-surface p-5 shadow-sm">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-barlow text-[11px] font-bold uppercase tracking-[0.16em] text-ink-muted">
          Indicative {horizon}-year TCO
        </h2>
        <span className="font-barlow text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
          {result.modelVersion}
        </span>
      </div>

      <div className="mb-1 font-barlow text-2xl font-bold text-heading-dark">
        {fmt(horizonTotal.low * m, sym)} – {fmt(horizonTotal.high * m, sym)}
      </div>
      <p className="mb-4 font-barlow text-xs text-ink-muted">
        Mid case: {fmt(horizonTotal.mid * m, sym)} ·{" "}
        <ConfidenceBadge confidence={result.flags.confidence} />
      </p>

      <Separator />

      <Row label="Year 1 implementation"
        low={result.breakdown.implementation.low * m}
        mid={result.breakdown.implementation.mid * m}
        high={result.breakdown.implementation.high * m}
        sym={sym}
      />
      <Row label="+ Contingency"
        low={result.breakdown.contingency.low * m}
        mid={result.breakdown.contingency.mid * m}
        high={result.breakdown.contingency.high * m}
        sym={sym}
      />
      <Row label="Annual licence"
        low={result.breakdown.licence.low * m}
        mid={result.breakdown.licence.mid * m}
        high={result.breakdown.licence.high * m}
        sym={sym}
      />
      <Row label="Annual hosting + run team"
        low={result.breakdown.hosting.low * m}
        mid={result.breakdown.hosting.mid * m}
        high={result.breakdown.hosting.high * m}
        sym={sym}
      />
      <Row label="Annual vendor support"
        low={result.breakdown.vendorSupport.low * m}
        mid={result.breakdown.vendorSupport.mid * m}
        high={result.breakdown.vendorSupport.high * m}
        sym={sym}
      />
      <Row label="Annual out-year enhancement"
        low={result.breakdown.outYearEnhancement.low * m}
        mid={result.breakdown.outYearEnhancement.mid * m}
        high={result.breakdown.outYearEnhancement.high * m}
        sym={sym}
      />

      <Separator />

      <Row
        label={`Benefit (${horizon}-yr, ${inputs.options?.useTeiBenefit ? "TEI" : "conservative"})`}
        low={benefitHorizon.low * m}
        mid={benefitHorizon.mid * m}
        high={benefitHorizon.high * m}
        sym={sym}
        positive
      />

      <Separator />

      <div className="mt-3">
        <p className="mb-1 font-barlow text-[11px] font-bold uppercase tracking-[0.16em] text-ink-muted">
          Net {horizon}-year cost
        </p>
        <div className="font-barlow text-lg font-bold text-heading-dark">
          {fmt(net.low * m, sym)} – {fmt(net.high * m, sym)}
        </div>
        <p className="font-barlow text-xs text-ink-muted">
          Mid: {fmt(net.mid * m, sym)}
        </p>
      </div>

      {result.flags.notes.length > 0 && (
        <ul className="mt-4 space-y-1.5 border-t border-surface-border pt-3 text-[11px] text-ink-muted">
          {result.flags.notes.map((note, i) => (
            <li key={i} className="leading-snug">
              <span className="text-heading">•</span> {note}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 border-t border-surface-border pt-3 text-[10px] leading-relaxed text-ink-muted">
        Indicative range based on public benchmarks and ECM.dev estimates.
        Methodology + sources:{" "}
        <a
          href="/assessment/cms-implementation/methodology"
          className="text-heading underline hover:text-heading-dark"
        >
          read the docs
        </a>
        .
      </p>
    </aside>
  );
}

/* ── Helpers ───────────────────────────────────────────────────────────── */

function Row({
  label,
  low,
  mid,
  high,
  sym,
  positive = false,
}: {
  label: string;
  low: number;
  mid: number;
  high: number;
  sym: string;
  positive?: boolean;
}) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-3 text-xs">
      <span className="text-ink">{label}</span>
      <span
        className={`tabular-nums ${
          positive ? "text-heading" : "text-ink"
        }`}
      >
        {fmt(low, sym)} – {fmt(high, sym)}
      </span>
    </div>
  );
}

function Separator() {
  return <div className="my-3 border-t border-surface-border" />;
}

function ConfidenceBadge({ confidence }: { confidence: "A" | "B" | "C" }) {
  const map = {
    A: { label: "High confidence", color: "text-heading" },
    B: { label: "Medium confidence", color: "text-amber-600" },
    C: { label: "Indicative only", color: "text-orange-600" },
  };
  const m = map[confidence];
  return <span className={`font-semibold ${m.color}`}>{m.label}</span>;
}

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

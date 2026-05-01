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
 * Sticky-bottom mini-bar that appears on mobile only (md:hidden). Keeps
 * the headline TCO band in view while the visitor edits the form so they
 * see the effect of their inputs without scrolling back up to the
 * sidebar (which stacks below the form on narrow viewports).
 */
export default function MobileStickyBar({ result, inputs }: Props) {
  const m = result.currencyMultiplier;
  const sym = currencySymbol(result.currency);
  const horizon = inputs.runtime.horizon;
  const horizonTotal =
    horizon === 5 ? result.fiveYearTotal : result.threeYearTotal;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ecm-lime/30 bg-ecm-green-dark/95 backdrop-blur-sm shadow-[0_-4px_20px_rgba(0,0,0,0.15)] md:hidden">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2.5">
        <div>
          <p className="font-barlow text-[9px] font-bold uppercase tracking-[0.16em] text-ecm-lime/70">
            {horizon}-year TCO
          </p>
          <p className="font-barlow text-base font-bold leading-tight text-ecm-lime">
            {fmt(horizonTotal.low * m, sym)} – {fmt(horizonTotal.high * m, sym)}
          </p>
        </div>
        <a
          href="#cms-result"
          className="rounded-full border border-ecm-lime/40 px-3 py-1.5 font-barlow text-[10px] font-bold uppercase tracking-wider text-ecm-lime transition-colors hover:bg-ecm-lime hover:text-ecm-green-dark"
        >
          See breakdown ↓
        </a>
      </div>
    </div>
  );
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
    return `${value < 0 ? "-" : ""}${sym}${Math.round(Math.abs(value) / 1_000)}k`;
  }
  return `${value < 0 ? "-" : ""}${sym}${Math.round(Math.abs(value))}`;
}

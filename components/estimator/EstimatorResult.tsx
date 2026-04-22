"use client";

import {
  LAYER_META,
  CONFIDENCE_BAND,
  FX,
  MODEL_VERSION,
} from "@/lib/estimator/coefficients";
import { confidenceBounds, convertCurrency } from "@/lib/estimator/calc";
import type {
  EstimatorInputs,
  EstimatorResult as TResult,
  ScenarioResult,
  DisplayCurrency,
} from "@/lib/estimator/types";
import EmailCaptureCTA from "./EmailCaptureCTA";

interface Props {
  inputs: EstimatorInputs;
  result: TResult;
  scenario: ScenarioResult;
}

// Six-layer colour palette — harmonised with ecm-green / ecm-lime brand tokens.
// Layer 6 (friction) is a warm accent to signal "this is what you're losing".
const LAYER_COLOURS: Record<number, string> = {
  1: "#316148", // ecm-green
  2: "#4a7a5b",
  3: "#7a9680",
  4: "#b5c9b8",
  5: "#AAF870", // ecm-lime
  6: "#b85c3a",
};
const LAYER_TEXT_ON: Record<number, string> = {
  1: "text-white",
  2: "text-white",
  3: "text-white",
  4: "text-ecm-gray-dark",
  5: "text-ecm-green-dark",
  6: "text-white",
};

export default function EstimatorResult({ inputs, result, scenario }: Props) {
  const currency = inputs.displayCurrency;
  const secondary: DisplayCurrency = currency === "EUR" ? "USD" : "EUR";
  const { low, high } = confidenceBounds(result.total, CONFIDENCE_BAND);
  const recovery = result.total - scenario.total;
  const isBrokenState = result.frictionCoef > 0.25;

  return (
    <>
      {/* Headline */}
      <section className="mb-8 border-b border-gray-200 pb-7">
        <SectionTitle>Estimated annual localisation cost</SectionTitle>
        <p className="mb-1.5 font-barlow text-5xl font-bold leading-none tracking-tight text-ecm-green sm:text-6xl">
          {fmtCurrency(result.total, currency)}
        </p>
        <p className="mb-3.5 font-barlow text-lg text-ecm-gray">
          {fmtCurrency(result.total, secondary)}
        </p>
        <p className="font-barlow text-sm text-ecm-gray-dark">
          Confidence band ±{Math.round(CONFIDENCE_BAND * 100)}%
          <span className="text-ecm-gray">
            {" "}
            ({fmtCurrency(low, currency)} to {fmtCurrency(high, currency)})
          </span>
        </p>
      </section>

      {/* Six-layer breakdown */}
      <section className="mb-10">
        <SectionTitle>Six-layer breakdown</SectionTitle>
        <div className="mb-4 flex h-11 overflow-hidden rounded-md border border-gray-200">
          {LAYER_META.map((meta) => {
            const val = result.layers[meta.key as keyof TResult["layers"]];
            const pctVal = val / result.total;
            if (pctVal <= 0) return null;
            return (
              <div
                key={meta.key}
                className={`flex items-center justify-center whitespace-nowrap overflow-hidden font-barlow text-xs transition-[width] duration-300 ${LAYER_TEXT_ON[meta.n]}`}
                style={{ width: `${pctVal * 100}%`, background: LAYER_COLOURS[meta.n] }}
                title={`${meta.name}: ${fmtCurrency(val, currency)} (${fmtPct(pctVal)})`}
              >
                {pctVal > 0.06 ? meta.name : null}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-2 font-barlow text-sm sm:grid-cols-2">
          {LAYER_META.map((meta) => {
            const val = result.layers[meta.key as keyof TResult["layers"]];
            const pctVal = val / result.total;
            return (
              <div
                key={meta.key}
                className="group relative flex items-center justify-between gap-2 border-b border-dotted border-gray-200 py-2"
              >
                <span className="flex items-center gap-2 text-ecm-gray-dark">
                  <span
                    className="inline-block h-3 w-3 flex-shrink-0 rounded-sm"
                    style={{ background: LAYER_COLOURS[meta.n] }}
                  />
                  {meta.n}. {meta.name}
                </span>
                <span className="text-ecm-gray-dark">
                  {fmtCurrency(val, currency)}
                  <span className="ml-1 text-[11px] text-ecm-gray">{fmtPct(pctVal)}</span>
                </span>
                <div className="pointer-events-none invisible absolute bottom-[calc(100%+6px)] left-0 right-0 z-10 rounded-md bg-ecm-green-dark px-3 py-2.5 text-xs leading-snug text-white opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100">
                  {meta.desc}
                  <span className="mt-1.5 block text-[11px] text-white/70">
                    Source: {meta.source}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* AI-native comparison */}
      <section className="mb-10 rounded-xl border border-gray-200 bg-gray-50 p-6">
        <SectionTitle>AI-native comparison</SectionTitle>
        <div className="mb-4 flex items-baseline justify-between font-barlow text-sm text-ecm-gray-dark">
          <div>
            Current maturity: <strong className="text-ecm-green-dark">L{inputs.maturity}</strong>
          </div>
          <div>
            Target maturity: <strong className="text-ecm-green-dark">L{scenario.targetMaturity}</strong>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ScenarioBar
            label="Current state"
            layers={result.layers}
            total={Math.max(result.total, scenario.total)}
            currency={currency}
          />
          <ScenarioBar
            label="One maturity level up"
            layers={scenario.layers}
            total={Math.max(result.total, scenario.total)}
            currency={currency}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2.5 border-t border-gray-200 pt-4">
          <span className="font-barlow text-xs font-semibold uppercase tracking-wider text-ecm-gray">
            Potential annual recovery
          </span>
          <span className="font-barlow text-2xl font-bold tracking-tight text-ecm-green">
            {fmtCurrency(recovery, currency)}
          </span>
        </div>
      </section>

      {/* Wedge */}
      <section className="mb-8 border-l-[3px] border-ecm-green bg-gray-50 px-6 py-5 font-barlow text-base leading-relaxed text-ecm-gray-dark sm:text-lg">
        {isBrokenState ? (
          <>
            An estimated <strong className="text-ecm-green-dark">{fmtCurrency(result.layers.friction, currency)}</strong> of
            your annual spend — about <strong className="text-ecm-green-dark">{fmtPct(result.layers.friction / result.total)}</strong> —
            is being absorbed by friction. For operations at this level of fragmentation,
            moving up one AI maturity level alone won&apos;t recover most of it.{" "}
            <strong className="text-ecm-green-dark">What&apos;s needed is operating-model redesign</strong> — ECM.dev&apos;s
            work sits exactly here.
          </>
        ) : (
          <>
            An estimated <strong className="text-ecm-green-dark">{fmtCurrency(result.layers.friction, currency)}</strong> of
            your annual spend — about <strong className="text-ecm-green-dark">{fmtPct(result.layers.friction / result.total)}</strong> —
            is being absorbed by friction and uncoordinated AI spend. Your AI investment
            isn&apos;t translating to bottom-line savings because the operating model around AI
            is still the legacy one.{" "}
            <strong className="text-ecm-green-dark">ECM.dev redesigns the operating system, not just the tools.</strong>
          </>
        )}
      </section>

      {/* CTAs */}
      <div className="mb-5 flex flex-wrap items-start gap-4">
        <a
          href={process.env.NEXT_PUBLIC_CAL_BOOKING_URL ?? "/contact"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-ecm-green px-7 py-3.5 font-barlow text-sm font-semibold text-white transition-colors hover:bg-ecm-green-dark"
        >
          Talk to an ECM.dev architect →
        </a>
        <EmailCaptureCTA inputs={inputs} result={result} />
      </div>

      <p className="mb-8 border-t border-gray-200 pt-3 font-barlow text-xs text-ecm-gray">
        Model version {MODEL_VERSION}. Coefficients sourced from public benchmarks
        (CSA, Slator, Nimdzi, published LLM API pricing) and ECM.dev estimates — see{" "}
        <a href="/methodology" className="underline hover:text-ecm-green">
          methodology
        </a>
        .
      </p>
    </>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3.5 font-barlow text-[11px] font-bold uppercase tracking-[0.16em] text-ecm-gray">
      {children}
    </h3>
  );
}

function ScenarioBar({
  label,
  layers,
  total,
  currency,
}: {
  label: string;
  layers: TResult["layers"];
  total: number;
  currency: DisplayCurrency;
}) {
  return (
    <div>
      <div className="mb-1.5 font-barlow text-[11px] font-semibold uppercase tracking-wider text-ecm-gray">
        {label}
      </div>
      <div className="flex flex-col overflow-hidden rounded-md border border-gray-200 bg-white">
        {LAYER_META.map((meta) => {
          const val = layers[meta.key as keyof TResult["layers"]];
          if (val <= 0) return null;
          const heightPx = (val / total) * 240;
          return (
            <div
              key={meta.key}
              className={`min-h-[24px] overflow-hidden whitespace-nowrap px-2 py-1.5 font-barlow text-[11px] leading-tight transition-[height] duration-300 ${LAYER_TEXT_ON[meta.n]}`}
              style={{ height: `${heightPx}px`, background: LAYER_COLOURS[meta.n] }}
              title={`${meta.name}: ${fmtCurrency(val, currency)}`}
            >
              {meta.n}. {meta.name}
            </div>
          );
        })}
      </div>
      <div className="border-t-2 border-ecm-green-dark bg-gray-50 px-2 py-2.5 font-barlow text-sm font-bold text-ecm-gray-dark">
        {fmtCurrency(sumLayers(layers), currency)}
      </div>
    </div>
  );
}

function fmtCurrency(amountUsd: number, display: DisplayCurrency): string {
  const value = convertCurrency(amountUsd, display, FX.usdToEur);
  const symbol = display === "EUR" ? "€" : "$";
  return symbol + Math.round(value).toLocaleString("en-US");
}

function fmtPct(p: number): string {
  return (p * 100).toFixed(1) + "%";
}

function sumLayers(layers: TResult["layers"]): number {
  return (
    layers.translation +
    layers.production +
    layers.channel +
    layers.system +
    layers.aiOps +
    layers.friction
  );
}

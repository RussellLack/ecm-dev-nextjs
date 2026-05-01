"use client";

import { useCallback, useMemo, useState } from "react";
import { calculate } from "@/lib/assessment/cms-implementation/engine";
import { DEFAULT_INPUTS } from "@/lib/assessment/cms-implementation/defaults";
import { MODEL_VERSION } from "@/lib/assessment/cms-implementation/coefficients";
import type { CmsImplementationInputs } from "@/lib/assessment/cms-implementation/types";
import Form from "./Form";
import RunningTotal from "./RunningTotal";
import Result from "./Result";

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

function deepMerge<T>(base: T, patch: DeepPartial<T>): T {
  if (typeof base !== "object" || base === null) return patch as T;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const key of Object.keys(patch as Record<string, unknown>)) {
    const baseVal = (base as Record<string, unknown>)[key];
    const patchVal = (patch as Record<string, unknown>)[key];
    if (
      baseVal &&
      typeof baseVal === "object" &&
      !Array.isArray(baseVal) &&
      patchVal &&
      typeof patchVal === "object" &&
      !Array.isArray(patchVal)
    ) {
      out[key] = deepMerge(
        baseVal as Record<string, unknown>,
        patchVal as Record<string, unknown>,
      );
    } else {
      out[key] = patchVal;
    }
  }
  return out as T;
}

export default function CmsImplementationClient() {
  const [inputs, setInputs] = useState<CmsImplementationInputs>(DEFAULT_INPUTS);

  const result = useMemo(() => calculate(inputs), [inputs]);

  const handleChange = useCallback(
    (patch: DeepPartial<CmsImplementationInputs>) => {
      setInputs((prev) => deepMerge(prev, patch));
    },
    [],
  );

  const handleReset = useCallback(() => {
    setInputs(DEFAULT_INPUTS);
  }, []);

  const handleToggleTei = useCallback((useTei: boolean) => {
    setInputs((prev) => ({
      ...prev,
      options: { ...prev.options, useTeiBenefit: useTei },
    }));
  }, []);

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-ecm-green py-14 pb-24 sm:py-20 sm:pb-28 lg:py-28 lg:pb-36">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="mb-3 font-barlow text-xs font-bold uppercase tracking-[0.14em] text-ecm-lime/80">
            ECM.DEV · Assessments
          </div>
          <h1 className="mb-4 font-barlow text-3xl font-bold text-ecm-lime sm:text-4xl lg:text-5xl">
            CMS Implementation Cost Estimator
          </h1>
          <p className="mx-auto max-w-2xl font-barlow text-lg text-white/80">
            A self-serve TCO model for content platform projects. Twelve plain
            inputs in. A 3- or 5-year cost band, a benefit-side estimate, and
            a take-away PDF out — gated only by an email.
          </p>
          <div className="mt-5 inline-block rounded-full border border-ecm-lime/40 bg-ecm-green-dark/40 px-4 py-1.5 font-barlow text-xs text-white/80">
            <strong className="text-ecm-lime">
              Research preview · {MODEL_VERSION}
            </strong>{" "}
            — based on public benchmarks and ECM.dev estimates, refreshed
            quarterly
          </div>
        </div>
        <div className="wave-divider wave-divider-bottom">
          <svg
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z"
              fill="#ffffff"
            />
          </svg>
        </div>
      </section>

      {/* Form + running total */}
      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <Form
                inputs={inputs}
                onChange={handleChange}
                onReset={handleReset}
              />
            </div>
            <RunningTotal result={result} inputs={inputs} />
          </div>
        </div>
      </section>

      {/* Full result composition — breakdown table, year-by-year cash flow,
          risk-band visualiser, benefit panel, notes, share + methodology. */}
      <Result
        result={result}
        inputs={inputs}
        onToggleTei={handleToggleTei}
      />
    </div>
  );
}

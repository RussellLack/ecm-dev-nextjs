"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { calculate } from "@/lib/assessment/cms-implementation/engine";
import { DEFAULT_INPUTS } from "@/lib/assessment/cms-implementation/defaults";
import { MODEL_VERSION } from "@/lib/assessment/cms-implementation/coefficients";
import { decodeInputs } from "@/lib/assessment/cms-implementation/url";
import { SCENARIOS } from "@/lib/assessment/cms-implementation/scenarios";
import type { CmsImplementationInputs } from "@/lib/assessment/cms-implementation/types";
import Form from "./Form";
import RunningTotal from "./RunningTotal";
import Result from "./Result";
import MobileStickyBar from "./MobileStickyBar";
import {
  trackAssessmentStart,
  trackAssessmentStepComplete,
  trackAssessmentComplete,
} from "@/lib/analytics/track";

// Map each top-level input section to a stable form "Group" (1-based),
// mirroring the five <Group> sections rendered by Form.
const CMS_GROUPS = 5;
const SECTION_GROUP: Record<string, number> = {
  org: 1,
  current: 2,
  target: 3,
  scope: 4,
  runtime: 5,
};

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

  // Analytics (tool_name "cms_implementation"): assessment_start on first
  // interaction, step_complete the first time each form Group is touched, and
  // assessment_complete once the user has engaged with >=3 groups (a genuine
  // result), or immediately when a sample scenario is loaded.
  const startedRef = useRef(false);
  const completedRef = useRef(false);
  const touchedGroupsRef = useRef<Set<number>>(new Set());

  const markStarted = useCallback(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      trackAssessmentStart("cms_implementation");
    }
  }, []);

  const markComplete = useCallback(() => {
    if (!completedRef.current) {
      completedRef.current = true;
      trackAssessmentComplete("cms_implementation");
    }
  }, []);

  // Hydrate from ?d=... query param on first mount (shared-link case).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const fromUrl = decodeInputs(window.location.search);
    if (fromUrl) setInputs(fromUrl);
  }, []);

  const result = useMemo(() => calculate(inputs), [inputs]);

  const handleChange = useCallback(
    (patch: DeepPartial<CmsImplementationInputs>) => {
      markStarted();
      for (const key of Object.keys(patch)) {
        const group = SECTION_GROUP[key];
        if (group && !touchedGroupsRef.current.has(group)) {
          touchedGroupsRef.current.add(group);
          trackAssessmentStepComplete("cms_implementation", group, CMS_GROUPS);
        }
      }
      if (touchedGroupsRef.current.size >= 3) markComplete();
      setInputs((prev) => deepMerge(prev, patch));
    },
    [markStarted, markComplete],
  );

  const handleReset = useCallback(() => {
    setInputs(DEFAULT_INPUTS);
  }, []);

  const handleScenario = useCallback(
    (scenarioId: string) => {
      const scenario = SCENARIOS.find((s) => s.id === scenarioId);
      if (scenario) {
        markStarted();
        markComplete();
        setInputs(scenario.inputs);
      }
    },
    [markStarted, markComplete],
  );

  const handleToggleTei = useCallback((useTei: boolean) => {
    setInputs((prev) => ({
      ...prev,
      options: { ...prev.options, useTeiBenefit: useTei },
    }));
  }, []);

  return (
    <div className="bg-white" data-testid="assessment-interactive">
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

      {/* Sample-scenario quick-fill */}
      <section className="bg-white pt-10 sm:pt-14">
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-ecm-green/5 to-ecm-lime/10 p-5 sm:p-6">
            <p className="mb-1 font-barlow text-[11px] font-bold uppercase tracking-[0.16em] text-ecm-gray">
              First time? Try a sample scenario
            </p>
            <p className="mb-4 font-barlow text-xs text-ecm-gray">
              Loads a representative scenario into the form so you can see how
              the model behaves before entering your own.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  data-testid="assessment-option"
                  onClick={() => handleScenario(s.id)}
                  className="group flex-1 rounded-xl border border-gray-200 bg-white p-3 text-left transition-all hover:border-ecm-green hover:shadow-md"
                  title={s.blurb}
                >
                  <p className="mb-0.5 font-barlow text-sm font-semibold text-ecm-green-dark group-hover:text-ecm-green">
                    {s.label}
                  </p>
                  <p className="font-barlow text-[11px] leading-snug text-ecm-gray">
                    {s.blurb}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Form + running total */}
      <section className="bg-white py-8 sm:py-10 pb-24 md:pb-16">
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
      <div id="cms-result">
        <Result
          result={result}
          inputs={inputs}
          onToggleTei={handleToggleTei}
        />
      </div>

      {/* Mobile sticky-bottom mini-bar — keeps headline TCO in view while
          editing on narrow viewports. */}
      <MobileStickyBar result={result} inputs={inputs} />
    </div>
  );
}

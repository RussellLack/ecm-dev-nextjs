"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { calculate, calculateScenario } from "@/lib/estimator/calc";
import { DEFAULT_INPUTS } from "@/lib/estimator/defaults";
import { MODEL_VERSION } from "@/lib/estimator/coefficients";
import type { EstimatorInputs } from "@/lib/estimator/types";
import EstimatorForm from "./EstimatorForm";
import EstimatorResult from "./EstimatorResult";
import FeedbackWidget from "./FeedbackWidget";
import {
  trackAssessmentStart,
  trackAssessmentStepComplete,
  trackAssessmentComplete,
} from "@/lib/analytics/track";

// Map each estimator input key to a stable form "Group" (1-based). These
// mirror the six <Group> sections rendered by EstimatorForm.
const ESTIMATOR_GROUPS = 6;
const INPUT_KEY_GROUP: Record<string, number> = {
  volume: 1,
  aiShare: 1,
  languages: 1,
  contentMix: 2,
  maturity: 3,
  cadence: 3,
  rework: 4,
  fragmentation: 4,
  aiCoordGap: 4,
  channelMix: 5,
  regulated: 6,
  displayCurrency: 6,
};

export default function EstimatorClient() {
  const [inputs, setInputs] = useState<EstimatorInputs>(DEFAULT_INPUTS);

  const result = useMemo(() => calculate(inputs), [inputs]);
  const scenario = useMemo(() => calculateScenario(inputs), [inputs]);

  // Analytics: fire assessment_start once on first interaction, a
  // step_complete the first time each form Group is touched, and
  // assessment_complete once the user has engaged with >=3 groups (a genuine
  // result). tool_name is "localisation_cost".
  const startedRef = useRef(false);
  const completedRef = useRef(false);
  const touchedGroupsRef = useRef<Set<number>>(new Set());

  const handleChange = useCallback((patch: Partial<EstimatorInputs>) => {
    if (!startedRef.current) {
      startedRef.current = true;
      trackAssessmentStart("localisation_cost");
    }
    for (const key of Object.keys(patch)) {
      const group = INPUT_KEY_GROUP[key];
      if (group && !touchedGroupsRef.current.has(group)) {
        touchedGroupsRef.current.add(group);
        trackAssessmentStepComplete("localisation_cost", group, ESTIMATOR_GROUPS);
      }
    }
    if (!completedRef.current && touchedGroupsRef.current.size >= 3) {
      completedRef.current = true;
      trackAssessmentComplete("localisation_cost");
    }
    setInputs((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleReset = useCallback(() => {
    setInputs(DEFAULT_INPUTS);
  }, []);

  return (
    <div className="bg-white" data-testid="assessment-interactive">
      {/* Hero — matches Assessments landing page style */}
      <section className="relative overflow-hidden bg-ecm-green py-14 pb-24 sm:py-20 sm:pb-28 lg:py-28 lg:pb-36">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="mb-3 font-barlow text-xs font-bold uppercase tracking-[0.14em] text-ecm-lime/80">
            ECM.DEV · Assessments
          </div>
          <h1 className="mb-4 font-barlow text-3xl font-bold text-ecm-lime sm:text-4xl lg:text-5xl">
            Localisation Cost Estimator
          </h1>
          <p className="mx-auto max-w-2xl font-barlow text-lg text-white/80">
            A diagnostic for content operations leaders in multilingual, multichannel environments —
            surfacing the five cost layers that traditional calculators miss, and the AI-native
            operating model that could reshape them.
          </p>
          <div className="mt-5 inline-block rounded-full border border-ecm-lime/40 bg-ecm-green-dark/40 px-4 py-1.5 font-barlow text-xs text-white/80">
            <strong className="text-ecm-lime">Research preview · {MODEL_VERSION}</strong> — based on
            public benchmarks and ECM.dev estimates, refined quarterly from user feedback
          </div>
        </div>
        <div className="wave-divider wave-divider-bottom">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="#ffffff" />
          </svg>
        </div>
      </section>

      {/* Tool body */}
      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-6">
          <main className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[420px_1fr] lg:gap-12">
            <aside className="rounded-2xl border border-gray-200 bg-gray-50 p-6 lg:sticky lg:top-5">
              <EstimatorForm inputs={inputs} onChange={handleChange} onReset={handleReset} />
            </aside>

            <section className="min-w-0">
              <EstimatorResult inputs={inputs} result={result} scenario={scenario} />
              <FeedbackWidget inputs={inputs} result={result} />
            </section>
          </main>

          <footer className="mt-12 border-t border-gray-200 pt-6 font-barlow text-xs text-ecm-gray">
            <Link href="/methodology" className="mr-5 hover:text-ecm-green">
              Methodology
            </Link>
            <Link href="/methodology#changelog" className="mr-5 hover:text-ecm-green">
              Model changelog
            </Link>
            <Link href="/privacy" className="mr-5 hover:text-ecm-green">
              Privacy
            </Link>
            <Link href="/" className="mr-5 hover:text-ecm-green">
              About ECM.dev
            </Link>
            <span className="ml-5 text-ecm-gray">© ECM.dev · Last reviewed April 2026</span>
          </footer>
        </div>
      </section>
    </div>
  );
}

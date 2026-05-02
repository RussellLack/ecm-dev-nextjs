"use client";

import { useCallback, useState } from "react";
import { calculate } from "@/lib/assessment/cms-implementation/engine";
import { MODEL_VERSION } from "@/lib/assessment/cms-implementation/coefficients";
import type { CmsImplementationInputs } from "@/lib/assessment/cms-implementation/types";
import Result from "./Result";

interface Props {
  inputs: CmsImplementationInputs;
  shareableUrl: string;
  submittedAt: string;
}

/**
 * Read-only shared-link view of a CMS Implementation assessment result.
 *
 * The original visitor's submission lives in Netlify Blobs. The page route
 * fetches it server-side, then this client component re-runs `calculate()`
 * locally so the TEI toggle remains interactive without making the result
 * stale relative to model updates.
 *
 * The email-capture form is hidden — the original visitor already
 * submitted, and the recipient is just here to read.
 */
export default function SharedResultClient({
  inputs,
  shareableUrl,
  submittedAt,
}: Props) {
  // Hold inputs in state so the TEI toggle works (it patches inputs.options).
  const [liveInputs, setLiveInputs] = useState(inputs);
  const result = calculate(liveInputs);

  const handleToggleTei = useCallback((useTei: boolean) => {
    setLiveInputs((prev) => ({
      ...prev,
      options: { ...prev.options, useTeiBenefit: useTei },
    }));
  }, []);

  const submittedDate = submittedAt
    ? new Date(submittedAt).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="bg-white">
      {/* Hero — same dark green band as the calculator, but framed as a
          shared snapshot rather than an active calculator. */}
      <section className="relative overflow-hidden bg-ecm-green py-14 pb-16 sm:py-20 sm:pb-20">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="mb-3 font-barlow text-xs font-bold uppercase tracking-[0.14em] text-ecm-lime/80">
            ECM.DEV · Shared Assessment Result
          </div>
          <h1 className="mb-4 font-barlow text-3xl font-bold text-ecm-lime sm:text-4xl">
            CMS Implementation TCO — shared snapshot
          </h1>
          <p className="mx-auto max-w-2xl font-barlow text-base text-white/80">
            This is a read-only view of an estimate someone ran on the ECM.DEV
            CMS Implementation calculator
            {submittedDate ? ` on ${submittedDate}` : ""}. The numbers below
            recompute live against the current model.
          </p>
          <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-3 rounded-full border border-ecm-lime/40 bg-ecm-green-dark/40 px-4 py-1.5 font-barlow text-xs text-white/80">
            <span>
              <strong className="text-ecm-lime">Model {MODEL_VERSION}</strong>
            </span>
            <span className="text-white/40">·</span>
            <a
              href="/assessment/cms-implementation"
              className="text-ecm-lime underline hover:text-white"
            >
              Run your own scenario
            </a>
          </div>
        </div>
      </section>

      {/* Result composition — full report, no email capture. */}
      <Result
        result={result}
        inputs={liveInputs}
        onToggleTei={handleToggleTei}
        showEmailCapture={false}
        shareableUrl={shareableUrl}
      />
    </div>
  );
}

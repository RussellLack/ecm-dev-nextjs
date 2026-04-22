"use client";

import Link from "next/link";
import { useState } from "react";
import { useCsrf } from "@/lib/useCsrf";
import { CONSENT_TEXT, CONSENT_VERSION } from "@/lib/consent";
import { MODEL_VERSION } from "@/lib/estimator/coefficients";
import type { EstimatorInputs, EstimatorResult } from "@/lib/estimator/types";

interface Props {
  inputs: EstimatorInputs;
  result: EstimatorResult;
}

type View = "button" | "form" | "sent";

export default function EmailCaptureCTA({ inputs, result }: Props) {
  const { withCsrf } = useCsrf();
  const [view, setView] = useState<View>("button");
  const [email, setEmail] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = emailValid && consentGiven && !saving;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/feedback/email", {
        method: "POST",
        headers: withCsrf({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          email: email.trim(),
          consentGiven: true,
          consentText: CONSENT_TEXT,
          consentVersion: CONSENT_VERSION,
          consentSource: "pdf_request",
          modelVersion: MODEL_VERSION,
          inputs,
          computed: { total: result.total, layers: result.layers },
          _hp: "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Could not save email");
      }
      setView("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (view === "button") {
    return (
      <button
        type="button"
        onClick={() => setView("form")}
        className="inline-flex items-center gap-2 rounded-full border border-ecm-green bg-transparent px-7 py-3.5 font-barlow text-sm font-semibold text-ecm-green transition-colors hover:bg-ecm-green hover:text-white"
      >
        Email me the full breakdown
      </button>
    );
  }

  if (view === "sent") {
    return (
      <div className="rounded-xl border border-ecm-green/30 bg-ecm-green/5 px-5 py-4 font-barlow text-sm text-ecm-green-dark">
        Thanks — we&apos;ve got it. We&apos;ll be in touch when the full breakdown is ready and
        when the next model refresh ships material changes.
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="w-full max-w-xl rounded-xl border border-gray-200 bg-gray-50 p-5 font-barlow"
    >
      <label className="mb-2 block text-sm font-semibold text-ecm-gray-dark">
        Email me the full breakdown
      </label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        autoComplete="email"
        required
        className="w-full rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm text-ecm-gray-dark focus:border-ecm-green focus:outline-none"
      />

      <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-ecm-gray">
        <span
          onClick={(e) => {
            e.preventDefault();
            setConsentGiven(!consentGiven);
          }}
          className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-sm border-2 transition-colors ${
            consentGiven
              ? "border-ecm-green bg-ecm-green"
              : "border-gray-300"
          }`}
        >
          {consentGiven && (
            <svg viewBox="0 0 10 8" className="h-2.5 w-2.5 text-white" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          )}
        </span>
        <span>
          I consent to ECM.dev storing this information for the purpose of sending me the full
          breakdown and notifying me of material model updates. Handled under GDPR and our{" "}
          <Link href="/privacy" className="text-ecm-green underline hover:text-ecm-green-dark">
            privacy policy
          </Link>
          . Never shared with third parties.
        </span>
      </label>

      {error && (
        <div className="mt-3 text-sm text-red-600">{error}</div>
      )}

      <div className="mt-4 flex flex-wrap gap-2.5">
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center gap-2 rounded-full bg-ecm-green px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ecm-green-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? "Sending…" : "Send me the breakdown"}
        </button>
        <button
          type="button"
          onClick={() => {
            setView("button");
            setError(null);
          }}
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-ecm-gray-dark transition-colors hover:border-ecm-gray hover:text-ecm-gray-dark"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

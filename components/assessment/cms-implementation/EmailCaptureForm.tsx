"use client";

import { useCallback, useState } from "react";
import type {
  CmsImplementationInputs,
  CmsImplementationResult,
} from "@/lib/assessment/cms-implementation/types";

const CONSENT_VERSION = "2026-05-01-v1";
const CONSENT_TEXT =
  "I agree to receive my assessment result by email and accept ECM.DEV's privacy policy.";

interface Props {
  inputs: CmsImplementationInputs;
  result: CmsImplementationResult;
}

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; resultsUrl?: string }
  | { kind: "error"; message: string };

/**
 * Two-step capture:
 *   1. POST /api/assessment/tool-submit with toolType=cms-implementation,
 *      answers=inputs, results=result, contact=basic. Returns submissionId.
 *   2. POST /api/assessment/cms-implementation/send with submissionId,
 *      email + consent. Sends the bespoke HTML email and pushes to Snov.
 */
export default function EmailCaptureForm({ inputs, result }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [bookCall, setBookCall] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!consent) {
        setStatus({
          kind: "error",
          message: "Please tick the consent box to receive your results.",
        });
        return;
      }
      setStatus({ kind: "submitting" });

      try {
        // Step 1 — create submission record.
        const createRes = await fetch("/api/assessment/tool-submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            toolType: "cms-implementation",
            answers: inputs,
            results: result,
            contact: {
              name,
              email,
              role: jobTitle,
              company,
            },
            tracking: collectTracking(),
            consentGiven: consent,
            consentText: CONSENT_TEXT,
            consentVersion: CONSENT_VERSION,
          }),
        });

        if (!createRes.ok) {
          const errBody = await safeJson(createRes);
          throw new Error(errBody?.error || "Failed to save submission");
        }
        const { submissionId } = await createRes.json();

        // Step 2 — send the email + activate Snov.
        const sendRes = await fetch(
          "/api/assessment/cms-implementation/send",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              submissionId,
              email,
              name,
              company,
              role: jobTitle,
              consentGiven: consent,
              consentText: CONSENT_TEXT,
              consentVersion: CONSENT_VERSION,
              bookCall,
              // marketing opt-in is captured but not yet wired to a list;
              // record-keeping for now.
              marketingOptIn: marketing,
            }),
          },
        );

        if (!sendRes.ok) {
          const errBody = await safeJson(sendRes);
          throw new Error(errBody?.error || "Failed to send email");
        }
        const sendBody = await sendRes.json();
        setStatus({ kind: "success", resultsUrl: sendBody.resultsUrl });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Something went wrong";
        setStatus({ kind: "error", message });
      }
    },
    [name, email, company, jobTitle, bookCall, marketing, consent, inputs, result],
  );

  if (status.kind === "success") {
    return (
      <div className="rounded-xl border border-ecm-green/20 bg-ecm-green/5 p-5">
        <p className="mb-2 font-barlow text-sm font-bold text-ecm-green-dark">
          Sent — check your inbox.
        </p>
        <p className="mb-3 font-barlow text-xs leading-relaxed text-ecm-gray-dark">
          You'll receive the take-away email with the TCO summary, breakdown
          and shareable link in a moment. The link below opens the result
          page directly — share it with anyone you want to see the same
          numbers.
        </p>
        {status.resultsUrl && (
          <a
            href={status.resultsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-barlow text-xs font-semibold text-ecm-green underline hover:text-ecm-green-dark"
          >
            Open shareable link →
          </a>
        )}
      </div>
    );
  }

  const submitting = status.kind === "submitting";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="mb-2 font-barlow text-sm font-semibold text-ecm-gray-dark">
        Get the PDF take-away
      </p>
      <p className="mb-3 font-barlow text-xs text-ecm-gray">
        We'll email a one-page summary plus a shareable link your CFO can
        open without filling in the form. Email-gated only.
      </p>

      <Field label="Full name" required>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={submitting}
          className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-ecm-gray-dark focus:border-ecm-green focus:outline-none disabled:opacity-50"
        />
      </Field>

      <Field label="Work email" required>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
          className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-ecm-gray-dark focus:border-ecm-green focus:outline-none disabled:opacity-50"
        />
      </Field>

      <Field label="Company" required>
        <input
          type="text"
          required
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          disabled={submitting}
          className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-ecm-gray-dark focus:border-ecm-green focus:outline-none disabled:opacity-50"
        />
      </Field>

      <Field label="Job title (optional)">
        <input
          type="text"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          disabled={submitting}
          className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-ecm-gray-dark focus:border-ecm-green focus:outline-none disabled:opacity-50"
        />
      </Field>

      <label className="flex cursor-pointer items-start gap-2 pt-1 font-barlow text-xs text-ecm-gray-dark">
        <input
          type="checkbox"
          checked={bookCall}
          onChange={(e) => setBookCall(e.target.checked)}
          disabled={submitting}
          className="mt-0.5 accent-ecm-green"
        />
        <span>I'd like a 30-min benchmarking call</span>
      </label>

      <label className="flex cursor-pointer items-start gap-2 font-barlow text-xs text-ecm-gray-dark">
        <input
          type="checkbox"
          checked={marketing}
          onChange={(e) => setMarketing(e.target.checked)}
          disabled={submitting}
          className="mt-0.5 accent-ecm-green"
        />
        <span>Subscribe to ECM.DEV's monthly content-operations brief</span>
      </label>

      <label className="flex cursor-pointer items-start gap-2 border-t border-gray-100 pt-3 font-barlow text-xs text-ecm-gray-dark">
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          disabled={submitting}
          className="mt-0.5 accent-ecm-green"
        />
        <span>{CONSENT_TEXT}</span>
      </label>

      {status.kind === "error" && (
        <p className="rounded-md border border-red-200 bg-red-50 p-2 font-barlow text-xs text-red-800">
          {status.message}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 w-full rounded-full bg-ecm-green px-4 py-2.5 font-barlow text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-ecm-green-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Sending..." : "Email me the take-away"}
      </button>
    </form>
  );
}

/* ── Helpers ───────────────────────────────────────────────────────────── */

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block font-barlow">
      <span className="mb-1 block text-xs text-ecm-gray-dark">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
    </label>
  );
}

function collectTracking() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get("utm_source") || undefined,
    utmMedium: params.get("utm_medium") || undefined,
    utmCampaign: params.get("utm_campaign") || undefined,
    utmContent: params.get("utm_content") || undefined,
    utmTerm: params.get("utm_term") || undefined,
    referrer: document.referrer || undefined,
    landingPage: window.location.href,
  };
}

async function safeJson(res: Response): Promise<{ error?: string } | null> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

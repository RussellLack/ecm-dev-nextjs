"use client";

import { useCallback, useState } from "react";
import type {
  CmsImplementationInputs,
  CmsImplementationResult,
} from "@/lib/assessment/cms-implementation/types";

const CONSENT_VERSION = "2026-05-01-v2-transactional";
const CONSENT_TEXT =
  "I requested my CMS Implementation TCO estimate via this form. The act of submitting constitutes consent for that one transactional email.";

interface Props {
  inputs: CmsImplementationInputs;
  result: CmsImplementationResult;
}

type Status =
  | { kind: "idle" }                                      // initial: just email field
  | { kind: "submitting" }                                // sending email
  | { kind: "sent"; submissionId: string; resultsUrl?: string }   // PDF queued, enrichment available
  | { kind: "enriching"; submissionId: string; resultsUrl?: string } // enrichment posting
  | { kind: "thanks"; resultsUrl?: string; bookCall: boolean }    // all done
  | { kind: "error"; message: string };

/**
 * Two-step progressive disclosure capture:
 *
 *   Step 1 — email-only required field. Submit click = consent for the
 *            transactional email. POSTs to tool-submit + send and
 *            triggers PDF + Resend.
 *
 *   Step 2 — optional enrichment (name, company, role, book-a-call).
 *            POSTs to /api/assessment/cms-implementation/enrich which
 *            patches the existing Blobs record and re-pushes to Snov.
 *            Visitor can skip and just leave with the link.
 */
export default function EmailCaptureForm({ inputs, result }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const handleSubmitEmail = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setStatus({ kind: "submitting" });

      try {
        // Step 1 — create submission record. Submit-click is the consent
        // moment for the transactional email; we record it as consentGiven=true
        // with a transactional consent text + version.
        const createRes = await fetch("/api/assessment/tool-submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            toolType: "cms-implementation",
            answers: inputs,
            results: result,
            contact: { email },
            tracking: collectTracking(),
            consentGiven: true,
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
              consentGiven: true,
              consentText: CONSENT_TEXT,
              consentVersion: CONSENT_VERSION,
            }),
          },
        );
        if (!sendRes.ok) {
          const errBody = await safeJson(sendRes);
          throw new Error(errBody?.error || "Failed to send email");
        }
        const sendBody = await sendRes.json();
        setStatus({
          kind: "sent",
          submissionId,
          resultsUrl: sendBody.resultsUrl,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Something went wrong";
        setStatus({ kind: "error", message });
      }
    },
    [email, inputs, result],
  );

  const handleSubmitEnrichment = useCallback(
    async (
      enrichment: {
        name: string;
        company: string;
        role: string;
        bookCall: boolean;
        marketingOptIn: boolean;
      },
    ) => {
      if (status.kind !== "sent") return;
      const { submissionId, resultsUrl } = status;
      setStatus({ kind: "enriching", submissionId, resultsUrl });

      try {
        const res = await fetch(
          "/api/assessment/cms-implementation/enrich",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ submissionId, ...enrichment }),
          },
        );
        if (!res.ok) {
          const errBody = await safeJson(res);
          throw new Error(errBody?.error || "Failed to save details");
        }
        setStatus({
          kind: "thanks",
          resultsUrl,
          bookCall: enrichment.bookCall,
        });
      } catch (err: unknown) {
        // Don't block the visitor on enrichment failure — show thanks anyway.
        console.error("Enrichment failed:", err);
        setStatus({
          kind: "thanks",
          resultsUrl,
          bookCall: enrichment.bookCall,
        });
      }
    },
    [status],
  );

  const handleSkipEnrichment = useCallback(() => {
    if (status.kind !== "sent") return;
    setStatus({
      kind: "thanks",
      resultsUrl: status.resultsUrl,
      bookCall: false,
    });
  }, [status]);

  /* ── Renders ────────────────────────────────────────────────────────── */

  if (status.kind === "thanks") {
    return (
      <div className="rounded-xl border border-ecm-green/20 bg-ecm-green/5 p-5">
        <p className="mb-2 font-barlow text-sm font-bold text-ecm-green-dark">
          {status.bookCall ? "Got it — we'll be in touch." : "Sent — check your inbox."}
        </p>
        <p className="mb-3 font-barlow text-xs leading-relaxed text-ecm-gray-dark">
          {status.bookCall
            ? "Your TCO summary is on its way. Someone from ECM.dev will reach out within one working day to schedule the benchmarking call."
            : "Your TCO summary is on its way."}{" "}
          The shareable link below opens the result page directly — pass it to
          your CFO or steering group with no extra steps.
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

  if (status.kind === "sent" || status.kind === "enriching") {
    return (
      <EnrichmentForm
        submitting={status.kind === "enriching"}
        resultsUrl={status.resultsUrl}
        onSubmit={handleSubmitEnrichment}
        onSkip={handleSkipEnrichment}
      />
    );
  }

  // idle / submitting / error — show the email-only form.
  const submitting = status.kind === "submitting";

  return (
    <form onSubmit={handleSubmitEmail} className="space-y-3">
      <p className="mb-1 font-barlow text-sm font-semibold text-ecm-gray-dark">
        Get the take-away by email
      </p>
      <p className="mb-4 font-barlow text-xs leading-relaxed text-ecm-gray">
        We'll send a one-page TCO summary plus a shareable link your CFO can
        open without filling in the form. Just your work email — nothing else
        required.
      </p>

      <label className="block font-barlow">
        <span className="mb-1 block text-xs text-ecm-gray-dark">
          Work email <span className="text-red-500">*</span>
        </span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
          autoComplete="email"
          placeholder="you@company.com"
          className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-ecm-gray-dark focus:border-ecm-green focus:outline-none disabled:opacity-50"
        />
      </label>

      <p className="font-barlow text-[11px] leading-relaxed text-ecm-gray">
        We'll email your TCO estimate and store the submission per our{" "}
        <a
          href="/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-ecm-green underline hover:text-ecm-green-dark"
        >
          privacy policy
        </a>
        . We never share your details. You can ask us to delete the record at
        any time.
      </p>

      {status.kind === "error" && (
        <p className="rounded-md border border-red-200 bg-red-50 p-2 font-barlow text-xs text-red-800">
          {status.message}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 w-full rounded-full bg-ecm-green px-4 py-2.5 font-barlow text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-ecm-green-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Sending..." : "Email me the take-away"}
      </button>
    </form>
  );
}

/* ── Enrichment sub-form (optional second step) ────────────────────────── */

function EnrichmentForm({
  submitting,
  resultsUrl,
  onSubmit,
  onSkip,
}: {
  submitting: boolean;
  resultsUrl?: string;
  onSubmit: (enrichment: {
    name: string;
    company: string;
    role: string;
    bookCall: boolean;
    marketingOptIn: boolean;
  }) => void;
  onSkip: () => void;
}) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [bookCall, setBookCall] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, company, role, bookCall, marketingOptIn });
  };

  return (
    <div>
      <div className="mb-4 rounded-lg border border-ecm-green/20 bg-ecm-green/5 p-3">
        <p className="mb-1 font-barlow text-sm font-bold text-ecm-green-dark">
          PDF on its way
        </p>
        <p className="font-barlow text-xs text-ecm-gray-dark">
          Check your inbox in a moment.
          {resultsUrl && (
            <>
              {" "}
              Or open the{" "}
              <a
                href={resultsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-ecm-green underline hover:text-ecm-green-dark"
              >
                shareable link
              </a>{" "}
              now.
            </>
          )}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <p className="mb-1 font-barlow text-sm font-semibold text-ecm-gray-dark">
          Want a tighter estimate?
        </p>
        <p className="mb-3 font-barlow text-xs leading-relaxed text-ecm-gray">
          Add a few details below and we'll prep a 30-min benchmarking call —
          we'll stress-test your inputs and pull on negotiated pricing where we
          can. Optional; skip if you'd rather just take the PDF.
        </p>

        <label className="block font-barlow">
          <span className="mb-1 block text-xs text-ecm-gray-dark">First name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting}
            autoComplete="given-name"
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-ecm-gray-dark focus:border-ecm-green focus:outline-none disabled:opacity-50"
          />
        </label>

        <label className="block font-barlow">
          <span className="mb-1 block text-xs text-ecm-gray-dark">Company</span>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            disabled={submitting}
            autoComplete="organization"
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-ecm-gray-dark focus:border-ecm-green focus:outline-none disabled:opacity-50"
          />
        </label>

        <label className="block font-barlow">
          <span className="mb-1 block text-xs text-ecm-gray-dark">Role / job title</span>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={submitting}
            autoComplete="organization-title"
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-ecm-gray-dark focus:border-ecm-green focus:outline-none disabled:opacity-50"
          />
        </label>

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
            checked={marketingOptIn}
            onChange={(e) => setMarketingOptIn(e.target.checked)}
            disabled={submitting}
            className="mt-0.5 accent-ecm-green"
          />
          <span>Subscribe to ECM.DEV's monthly content-operations brief</span>
        </label>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-full bg-ecm-green px-4 py-2.5 font-barlow text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-ecm-green-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save & request call"}
          </button>
          <button
            type="button"
            onClick={onSkip}
            disabled={submitting}
            className="rounded-full border border-gray-200 px-4 py-2.5 font-barlow text-xs font-semibold uppercase tracking-wider text-ecm-gray-dark transition-colors hover:border-ecm-gray hover:text-ecm-green disabled:cursor-not-allowed disabled:opacity-50"
          >
            Skip
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Helpers ───────────────────────────────────────────────────────────── */

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

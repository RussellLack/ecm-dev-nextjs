"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useCsrf } from "@/lib/useCsrf";
import { pushGateEvent } from "@/lib/analytics";
import {
  GATE_CONSENT_TEXT,
  GATE_CONSENT_VERSION,
  hasGateAccess,
  setGateAccess,
} from "@/lib/assessment/gate";

interface Props {
  /** Assessment slug/id, stored on the lead + used for notifications. */
  slug: string;
  /** Human-readable assessment name shown in the gate + notification. */
  title: string;
  /** The actual assessment tool, revealed once the visitor registers. */
  children: React.ReactNode;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function collectTracking(): Record<string, string | undefined> {
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

/**
 * Registration gate that fronts an assessment tool. Renders the tool directly
 * when a gate-access cookie is present (returning visitors, and the Playwright
 * suite which sets the cookie), otherwise shows a short registration form with
 * a required functional consent plus two optional choices (consultant
 * read-through, marketing opt-in). Submitting POSTs to /api/assessment/gate,
 * which archives the lead, activates Snov.io, notifies rl@ecm.dev, and sets the
 * access cookie server-side; we mirror the cookie client-side and reveal the
 * tool with no navigation.
 */
export default function AssessmentGate({ slug, title, children }: Props) {
  const [mode, setMode] = useState<"checking" | "gate" | "open">("checking");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [company, setCompany] = useState("");
  const [consultCall, setConsultCall] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [consent, setConsent] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { withCsrf } = useCsrf();

  // Cookie read must happen after mount to stay SSR-consistent (no document on
  // the server). 'checking' renders identically on server + first client paint.
  useEffect(() => {
    const hasAccess = hasGateAccess();
    setMode(hasAccess ? "open" : "gate");
    if (!hasAccess) pushGateEvent("gate_view", { tool_name: slug });
  }, [slug]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const emailOk = EMAIL_RE.test(email.trim());
      const consentOk = consent;
      setEmailError(!emailOk);
      setConsentError(!consentOk);
      if (!emailOk || !consentOk) return;

      setSubmitting(true);
      setError(null);
      try {
        const res = await fetch("/api/assessment/gate", {
          method: "POST",
          headers: withCsrf({ "Content-Type": "application/json" }),
          body: JSON.stringify({
            toolSlug: slug,
            toolTitle: title,
            email: email.trim(),
            firstName: firstName.trim(),
            company: company.trim(),
            consentGiven: true,
            consentText: GATE_CONSENT_TEXT,
            consentVersion: GATE_CONSENT_VERSION,
            marketingOptIn,
            consultRequested: consultCall,
            tracking: collectTracking(),
            _hp: "",
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || "Something went wrong. Please try again.");
        }
        setGateAccess();
        pushGateEvent("gate_register", {
          tool_name: slug,
          consult_requested: consultCall,
          marketing_opt_in: marketingOptIn,
        });
        setMode("open");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
        setSubmitting(false);
      }
    },
    [
      email,
      firstName,
      company,
      consent,
      consultCall,
      marketingOptIn,
      slug,
      title,
      withCsrf,
    ],
  );

  if (mode === "checking") {
    return (
      <div
        className="flex min-h-[60vh] items-center justify-center bg-white"
        aria-busy="true"
      >
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ecm-green/20 border-t-ecm-green" />
      </div>
    );
  }

  if (mode === "open") {
    return <>{children}</>;
  }

  // ── Registration gate ──
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-ecm-green py-14 pb-24 sm:py-20 sm:pb-28 lg:py-24 lg:pb-32">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="mb-3 font-barlow text-xs font-bold uppercase tracking-[0.14em] text-ecm-lime/80">
            ECM.DEV · Assessments
          </div>
          <h1 className="mb-4 font-barlow text-3xl font-bold text-ecm-lime sm:text-4xl">
            {title}
          </h1>
          <p className="mx-auto max-w-xl font-barlow text-lg text-white/80">
            Tell us where to send your results, and whether you would like a
            consultant to walk you through them. It takes a few seconds.
          </p>
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

      <section className="bg-white pb-20">
        <div className="mx-auto -mt-12 max-w-md px-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg sm:p-8">
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Honeypot — visually hidden, bots fill it. */}
              <div className="hidden" aria-hidden="true">
                <label>
                  Leave this field empty
                  <input type="text" tabIndex={-1} autoComplete="off" name="_hp" />
                </label>
              </div>

              <label className="block font-barlow">
                <span className="mb-1 block text-xs font-semibold text-ecm-gray-dark">
                  Work email <span className="text-red-500">*</span>
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(false);
                  }}
                  disabled={submitting}
                  autoComplete="email"
                  placeholder="you@company.com"
                  className={`w-full rounded-md border bg-white px-3 py-2.5 text-sm text-ecm-gray-dark focus:outline-none disabled:opacity-50 ${
                    emailError
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 focus:border-ecm-green"
                  }`}
                />
                {emailError && (
                  <span className="mt-1 block font-barlow text-[11px] text-red-600">
                    Please enter a valid work email.
                  </span>
                )}
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block font-barlow">
                  <span className="mb-1 block text-xs font-semibold text-ecm-gray-dark">
                    First name
                  </span>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={submitting}
                    autoComplete="given-name"
                    placeholder="Optional"
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm text-ecm-gray-dark focus:border-ecm-green focus:outline-none disabled:opacity-50"
                  />
                </label>
                <label className="block font-barlow">
                  <span className="mb-1 block text-xs font-semibold text-ecm-gray-dark">
                    Company
                  </span>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    disabled={submitting}
                    autoComplete="organization"
                    placeholder="Optional"
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm text-ecm-gray-dark focus:border-ecm-green focus:outline-none disabled:opacity-50"
                  />
                </label>
              </div>

              {/* Optional: consultant read-through — an offer, not consent. */}
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-ecm-green/25 bg-ecm-lime/10 p-3 transition-colors hover:bg-ecm-lime/20">
                <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-ecm-green">
                  <svg
                    className="h-4 w-4 text-ecm-lime"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 10.5h8M8 14h5m-9 5.5l3.2-2.4A2 2 0 0110.4 16.7H18a2.5 2.5 0 002.5-2.5v-7A2.5 2.5 0 0018 4.7H6A2.5 2.5 0 003.5 7.2v12.3z"
                    />
                  </svg>
                </span>
                <span className="font-barlow text-xs leading-relaxed text-ecm-gray-dark">
                  <span className="block text-[13px] font-bold text-ecm-green-dark">
                    Book a read-through with a consultant
                  </span>
                  Have someone from ECM.DEV walk you through your results and
                  suggest the best next steps. Optional, no obligation.
                </span>
                <input
                  type="checkbox"
                  checked={consultCall}
                  onChange={(e) => setConsultCall(e.target.checked)}
                  disabled={submitting}
                  className="mt-0.5 h-4 w-4 flex-shrink-0 accent-ecm-green"
                />
              </label>

              {/* Required functional consent. */}
              <label
                className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 transition-colors ${
                  consentError
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 bg-gray-50/60"
                }`}
              >
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    if (consentError && e.target.checked) setConsentError(false);
                  }}
                  disabled={submitting}
                  className="mt-0.5 h-4 w-4 flex-shrink-0 accent-ecm-green"
                />
                <span className="font-barlow text-xs leading-relaxed text-ecm-gray-dark">
                  <span className="mb-0.5 block text-[10.5px] font-bold uppercase tracking-wider text-ecm-green">
                    Required
                  </span>
                  I agree that ECM.DEV can process the details above to run this
                  assessment and send my results, in line with the{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="text-ecm-green underline hover:text-ecm-green-dark"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
              {consentError && (
                <p className="-mt-2 font-barlow text-[11px] text-red-600">
                  Please tick this box so we can send your results.
                </p>
              )}

              {/* Optional marketing opt-in. */}
              <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-gray-200 p-3">
                <input
                  type="checkbox"
                  checked={marketingOptIn}
                  onChange={(e) => setMarketingOptIn(e.target.checked)}
                  disabled={submitting}
                  className="mt-0.5 h-4 w-4 flex-shrink-0 accent-ecm-green"
                />
                <span className="font-barlow text-xs leading-relaxed text-ecm-gray-dark">
                  <span className="mb-0.5 block text-[10.5px] font-bold uppercase tracking-wider text-ecm-gray">
                    Optional
                  </span>
                  Yes, keep me posted. I would like ECM.DEV to send occasional
                  content-operations insights and updates. I can unsubscribe at
                  any time.
                </span>
              </label>

              {error && (
                <p className="rounded-md border border-red-200 bg-red-50 p-2 font-barlow text-xs text-red-800">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-ecm-green px-6 py-3 font-barlow text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-ecm-green-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Starting…" : "Start assessment"}
                {!submitting && (
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                )}
              </button>

              <p className="font-barlow text-[11px] leading-relaxed text-ecm-gray">
                Two separate choices, by design. The first is what we need to
                deliver your results. The second is a genuine opt-in for future
                communications, never pre-ticked. We never share your details,
                and you can ask us to delete your record at any time.
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

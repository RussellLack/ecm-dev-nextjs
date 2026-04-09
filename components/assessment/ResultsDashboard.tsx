"use client";

import { useState } from "react";
import Link from "next/link";
import { useCsrf } from "@/lib/useCsrf";
import type { DimensionScore, Recommendation } from "@/lib/assessment/types";

interface ResultsDashboardProps {
  submissionId: string;
  firstName: string;
  totalScore: number;
  bandTitle: string;
  bandHeadline: string;
  bandDescription: string;
  bandColor: string;
  bandLevel: number;
  dimensionScores: DimensionScore[];
  weakAreas: string[];
  recommendations: Recommendation[];
  resultsIntro?: string;
  ctaHeading?: string;
  ctaBody?: string;
}

export default function ResultsDashboard({
  submissionId,
  firstName,
  totalScore,
  bandTitle,
  bandHeadline,
  bandDescription,
  bandColor,
  bandLevel,
  dimensionScores,
  weakAreas,
  recommendations,
  resultsIntro,
  ctaHeading,
  ctaBody,
}: ResultsDashboardProps) {
  const { withCsrf } = useCsrf();
  const [reportEmail, setReportEmail] = useState("");
  const [reportName, setReportName] = useState("");
  const [reportHp, setReportHp] = useState(""); // honeypot
  const [reportSending, setReportSending] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  async function handleRequestReport(e: React.FormEvent) {
    e.preventDefault();
    if (!reportEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reportEmail)) {
      setReportError("Please enter a valid email address");
      return;
    }

    setReportSending(true);
    setReportError(null);

    try {
      const res = await fetch("/api/assessment/report", {
        method: "POST",
        credentials: "same-origin",
        headers: withCsrf({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          submissionId,
          email: reportEmail.trim(),
          name: reportName.trim() || undefined,
          _hp: reportHp,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send report");
      }

      setReportSent(true);
    } catch (err: any) {
      setReportError(err.message || "Something went wrong. Please try again.");
    } finally {
      setReportSending(false);
    }
  }

  // Band level indicator dots
  const bandLevels = [
    { level: 1, label: "Ad Hoc" },
    { level: 2, label: "Developing" },
    { level: 3, label: "Structured" },
    { level: 4, label: "Optimised" },
  ];

  return (
    <div className="min-h-screen bg-ecm-green">
      {/* Topbar */}
      <div className="border-b border-white/10 sticky top-0 bg-ecm-green z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/assessments"
              className="text-white/40 hover:text-white text-sm font-barlow transition-colors"
            >
              ← Assessments
            </Link>
            <div className="text-xs font-bold text-ecm-lime tracking-widest uppercase font-barlow">
              Maturity Results
            </div>
          </div>
          <a
            href={`/api/assessment/pdf?sid=${submissionId}&type=maturity`}
            className="text-xs font-semibold bg-white/10 hover:bg-white/15 text-white/70 px-4 py-2 rounded-xl transition-colors font-barlow"
          >
            Download PDF
          </a>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 overflow-hidden">
        <div className="max-w-3xl mx-auto px-6">
          {resultsIntro && (
            <p className="text-white/50 font-barlow text-sm mb-4 uppercase tracking-wider">
              {resultsIntro}
            </p>
          )}

          <h1 className="text-white font-barlow font-bold text-2xl sm:text-3xl lg:text-4xl mb-2">
            {firstName ? `${firstName}, your` : "Your"} content operations maturity:
          </h1>

          {/* Score + Band */}
          <div className="mt-8 mb-6 flex items-end gap-6">
            <div className="text-7xl sm:text-8xl font-barlow font-bold" style={{ color: bandColor }}>
              {totalScore}%
            </div>
            <div className="pb-3">
              <div
                className="inline-block px-4 py-1 rounded-full font-barlow font-bold text-sm uppercase tracking-wider mb-1"
                style={{ backgroundColor: bandColor, color: "#1a1a2e" }}
              >
                {bandTitle}
              </div>
            </div>
          </div>

          {/* Band Level Indicator */}
          <div className="flex items-center gap-1 mb-8">
            {bandLevels.map((b) => (
              <div key={b.level} className="flex flex-col items-center">
                <div
                  className={`w-16 sm:w-24 h-2 rounded-full transition-all ${
                    b.level <= bandLevel ? "opacity-100" : "opacity-20"
                  }`}
                  style={{
                    backgroundColor: b.level <= bandLevel ? bandColor : "#ffffff",
                  }}
                />
                <span
                  className={`font-barlow text-xs mt-1 ${
                    b.level === bandLevel ? "text-white" : "text-white/30"
                  }`}
                >
                  {b.label}
                </span>
              </div>
            ))}
          </div>

          {/* Band headline + description */}
          {bandHeadline && (
            <h2 className="text-ecm-lime font-barlow font-semibold text-lg sm:text-xl mb-3">
              {bandHeadline}
            </h2>
          )}
          {bandDescription && (
            <p className="text-white/70 font-barlow leading-relaxed mb-12">
              {bandDescription}
            </p>
          )}
        </div>
      </section>

      {/* Dimension Scores */}
      <section className="pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <h3 className="text-white font-barlow font-bold text-xl mb-6">
            Score by dimension
          </h3>
          <div className="space-y-4">
            {dimensionScores.map((dim) => {
              const isWeak = weakAreas.includes(dim.dimensionKey);
              return (
                <div key={dim.dimensionKey}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/80 font-barlow text-sm">
                      {dim.dimensionTitle}
                      {isWeak && (
                        <span className="ml-2 text-xs text-amber-400 font-semibold">
                          Needs attention
                        </span>
                      )}
                    </span>
                    <span className="text-white/60 font-barlow text-sm font-semibold">
                      {dim.score}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${dim.score}%`,
                        backgroundColor: isWeak ? "#F59E0B" : "#AAF870",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <section className="pb-16">
          <div className="max-w-3xl mx-auto px-6">
            <h3 className="text-white font-barlow font-bold text-xl mb-2">
              Where to focus next
            </h3>
            <p className="text-white/50 font-barlow text-sm mb-6">
              Based on your weakest dimensions, here is where we would start.
            </p>
            <div className="grid gap-4">
              {recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-ecm-lime/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-white/40 font-barlow text-xs uppercase tracking-wider mb-1">
                        {rec.dimensionTitle}
                      </p>
                      <h4 className="text-ecm-lime font-barlow font-semibold text-base mb-2">
                        {rec.title}
                      </h4>
                      {rec.summary && (
                        <p className="text-white/60 font-barlow text-sm leading-relaxed">
                          {rec.summary}
                        </p>
                      )}
                    </div>
                    {rec.serviceHref && (
                      <Link
                        href={rec.serviceHref}
                        className="flex-shrink-0 text-ecm-lime font-barlow text-xs font-semibold px-4 py-2 border border-ecm-lime/30 rounded-full hover:bg-ecm-lime/10 transition-colors whitespace-nowrap"
                      >
                        Learn more
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Save or Share Your Results ─── */}
      <section className="pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl px-8 py-10">
            {!reportSent ? (
              <>
                <div className="text-xs font-bold text-white/60 uppercase tracking-wide font-barlow mb-1">Optional</div>
                <h3 className="text-white font-barlow font-bold text-xl mb-1">
                  Want to save or share your results?
                </h3>
                <p className="text-white/60 font-barlow text-sm mb-6">
                  Add your details to email yourself the full report or generate a shareable link.
                </p>
                <form onSubmit={handleRequestReport} className="space-y-4">
                  <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
                    <label>
                      Leave empty
                      <input type="text" name="_hp" tabIndex={-1} autoComplete="off" value={reportHp} onChange={(e) => setReportHp(e.target.value)} />
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={reportName}
                      onChange={(e) => setReportName(e.target.value)}
                      placeholder="Your name (optional)"
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/15 text-white font-barlow placeholder-white/30 focus:outline-none focus:border-ecm-lime transition-colors"
                    />
                    <input
                      type="email"
                      value={reportEmail}
                      onChange={(e) => setReportEmail(e.target.value)}
                      placeholder="Email address"
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/15 text-white font-barlow placeholder-white/30 focus:outline-none focus:border-ecm-lime transition-colors"
                    />
                  </div>
                  {/* GDPR consent */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div
                      onClick={() => setConsentGiven(!consentGiven)}
                      className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${consentGiven ? "bg-ecm-lime border-ecm-lime" : "border-white/30 group-hover:border-white/50"}`}
                    >
                      {consentGiven && (
                        <svg className="w-3 h-3 text-ecm-green" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs text-white/50 leading-relaxed font-barlow">
                      I consent to ECM.dev storing the information I have provided above for the purpose of sending me my assessment results and, if applicable, supporting a future engagement. Your data is handled in accordance with GDPR and our{" "}
                      <Link href="/privacy" className="text-ecm-lime underline hover:text-ecm-lime/80">privacy policy</Link>.
                      We will never share your information with third parties.
                    </span>
                  </label>
                  {reportError && (
                    <p className="text-red-400 font-barlow text-xs">{reportError}</p>
                  )}
                  {/* Save / Share actions */}
                  <div className={`grid grid-cols-2 gap-3 transition-opacity ${consentGiven && reportEmail.includes("@") && reportEmail.includes(".") ? "opacity-100" : "opacity-30 pointer-events-none"}`}>
                    <button
                      type="submit"
                      disabled={reportSending}
                      className="bg-ecm-lime hover:bg-ecm-lime-hover text-ecm-green font-barlow font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {reportSending ? "Sending..." : "Email my results"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href).then(() => {
                          setLinkCopied(true);
                          setTimeout(() => setLinkCopied(false), 2000);
                        });
                      }}
                      className="bg-white/10 hover:bg-white/15 text-white font-barlow font-semibold py-3 rounded-xl text-sm transition-colors"
                    >
                      {linkCopied ? "✓ Copied" : "Copy shareable link"}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <svg className="w-10 h-10 text-ecm-lime mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-white font-barlow font-semibold text-lg mb-1">
                  Report sent
                </p>
                <p className="text-white/50 font-barlow text-sm">
                  Check your inbox at {reportEmail}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-ecm-green-dark/60 border border-ecm-lime/15 rounded-2xl px-8 py-10 text-center">
            <h3 className="text-ecm-lime font-barlow font-bold text-2xl sm:text-3xl mb-3">
              {ctaHeading || "Ready to move up?"}
            </h3>
            {ctaBody && (
              <p className="text-white/60 font-barlow mb-6 max-w-lg mx-auto">
                {ctaBody}
              </p>
            )}
            <Link
              href="/contact"
              className="inline-block bg-ecm-lime text-ecm-green font-barlow font-bold text-lg px-10 py-4 rounded-full hover:bg-ecm-lime-hover transition-colors"
            >
              Talk to us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useCsrf } from "@/lib/useCsrf";
import { CONSENT_TEXT, CONSENT_VERSION } from "@/lib/consent";
import type { DimensionScore, Recommendation } from "@/lib/assessment/types";

/** Assessments that get the post-results feedback prompt. */
const FEEDBACK_ENABLED_SLUGS = new Set(["content-operations-maturity"]);

const FEEDBACK_Q1_OPTIONS = [
  "Not very",
  "Somewhat",
  "Mostly",
  "Very accurately",
] as const;

const FEEDBACK_Q2_OPTIONS = [
  "Not likely",
  "Maybe",
  "Likely",
  "Very likely",
] as const;

interface ResultsDashboardProps {
  submissionId: string;
  assessmentSlug: string;
  firstName: string;
  totalScore: number;
  bandTitle: string;
  bandHeadline: string;
  bandDescription: string;
  bandColor: string;
  bandLevel: number;
  /** This assessment's own bands (level + title), so the indicator shows
   * the right labels for every Sanity-authored assessment. Falls back to
   * the maturity labels when not supplied. */
  bands?: Array<{ level: number; title: string }>;
  dimensionScores: DimensionScore[];
  weakAreas: string[];
  recommendations: Recommendation[];
  resultsIntro?: string;
  ctaHeading?: string;
  ctaBody?: string;
}

export default function ResultsDashboard({
  submissionId,
  assessmentSlug,
  firstName,
  totalScore,
  bandTitle,
  bandHeadline,
  bandDescription,
  bandColor,
  bandLevel,
  bands,
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

  // Post-results feedback (Content Infrastructure Maturity only — see
  // FEEDBACK_ENABLED_SLUGS).
  const [feedbackQ1, setFeedbackQ1] = useState<string | null>(null);
  const [feedbackQ2, setFeedbackQ2] = useState<string | null>(null);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackHp, setFeedbackHp] = useState(""); // honeypot
  const [feedbackSending, setFeedbackSending] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  async function handleRequestReport(e: React.FormEvent) {
    e.preventDefault();
    if (!reportEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reportEmail)) {
      setReportError("Please enter a valid email address");
      return;
    }
    if (!consentGiven) {
      setReportError("Please tick the consent box so we can send you the report.");
      return;
    }

    setReportSending(true);
    setReportError(null);

    try {
      const res = await fetch("/api/assessment/report", {
        method: "POST",
        credentials: "same-origin",
        headers: await withCsrf({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          submissionId,
          email: reportEmail.trim(),
          name: reportName.trim() || undefined,
          _hp: reportHp,
          consentGiven,
          consentText: CONSENT_TEXT,
          consentVersion: CONSENT_VERSION,
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

  async function handleSubmitFeedback(e: React.FormEvent) {
    e.preventDefault();
    if (!feedbackQ1 || !feedbackQ2) {
      setFeedbackError("Please answer both questions.");
      return;
    }

    setFeedbackSending(true);
    setFeedbackError(null);

    try {
      const res = await fetch("/api/assessment/feedback", {
        method: "POST",
        credentials: "same-origin",
        headers: await withCsrf({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          submissionId,
          q1: feedbackQ1,
          q2: feedbackQ2,
          comment: feedbackComment.trim(),
          _hp: feedbackHp,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send feedback");
      }

      setFeedbackSent(true);
    } catch (err: any) {
      setFeedbackError(err.message || "Something went wrong. Please try again.");
    } finally {
      setFeedbackSending(false);
    }
  }

  // Band level indicator dots. Labels come from the assessment's own bands;
  // the maturity labels are only a fallback.
  const bandLevels =
    bands && bands.length > 0
      ? [...bands]
          .sort((a, b) => a.level - b.level)
          .map((b) => ({ level: b.level, label: b.title }))
      : [
          { level: 1, label: "Ad Hoc" },
          { level: 2, label: "Developing" },
          { level: 3, label: "Structured" },
          { level: 4, label: "Optimised" },
        ];

  // Executive readout: translate the weakest areas into the consequence a
  // leader actually feels. Keyed by dimension key; keys are unique across
  // assessments (the Expertise-to-Sales Check uses the "e2s-" prefix).
  const dimensionCost: Record<string, string> = {
    // Content Operations Maturity Assessment
    strategy:
      "Content is not planned around the questions buyers ask, so effort goes into work that is hard to defend or measure.",
    governance:
      "Nobody owns the answer, so conflicting versions stay live and customers, and AI tools, repeat whichever they find first.",
    workflow:
      "Work waits at approvals and on the same few experts, so publishing is slow and the same knowledge is extracted again each time.",
    technology:
      "The platform is not set up for how you work, so content stays cut off from sales systems and each new language starts from scratch.",
    measurement:
      "Content and sales run apart, so you cannot show which content helps win work, and what customers ask never shapes what gets produced.",
    "ai-readiness":
      "Content is hard for AI tools to find, date or trust, so what they say about you is incomplete, out of date or wrong.",
    // Expertise-to-Sales Check
    "e2s-where-it-lives":
      "What wins you work sits with a few people, so it leaves when they do and every proposal starts from memory.",
    "e2s-getting-it-out":
      "Marketing and sales wait on the same few experts, who spend their time rewriting answers they have already given.",
    "e2s-keeping-it-right":
      "Nobody owns the current answer, so old versions resurface in proposals and review stalls with no one to decide.",
    "e2s-using-it-in-sales":
      "Sales cannot answer technical questions without an expert, so responses are slow and marketing reads like any other firm's.",
    // Platform or Setup Check (a low area score means the platform is the limit)
    "pos-publishing":
      "Routine changes depend on a developer or on rigid templates, so publishing waits and small edits become projects.",
    "pos-structure":
      "Content is locked into pages, so each new channel, language or AI use means copying or custom work.",
    "pos-integration":
      "Connections and running costs are tied to custom work, so every upgrade and every new system costs more than it should.",
    "pos-vendor":
      "Support, compliance or skills for this platform are at risk, so the timing of a decision may not be yours to choose.",
  };

  // Overall framing by band level, per assessment. The maturity copy is the
  // default for any assessment without its own entry.
  const maturityBandCost: Record<number, string> = {
    1: "At this level, content runs on individual effort, not a system. That limits how fast you can move and how much you can produce without adding people.",
    2: "You have pockets of good practice, but the inconsistency between teams is where time, cost and quality leak.",
    3: "The foundations hold. The remaining cost is in reuse: across sales, across languages, and in what AI tools can find.",
    4: "Little is being lost today. The cost to watch is drift: content going out of date as people, products and methods change.",
  };
  const bandCostBySlug: Record<string, Record<number, string>> = {
    "expertise-to-sales": {
      1: "At this level, what your firm knows is only available when a particular person is. That slows every bid and enquiry, and puts the knowledge at risk when people move on.",
      2: "The knowledge exists in writing, but finding it costs time on every proposal, and experts keep redoing work they have already done.",
      3: "Most of what your experts know can be used without them. The remaining cost is in upkeep: older versions in circulation, and areas that still depend on one person.",
      4: "Little is being lost today. The cost to watch is drift, as people, methods and standards change.",
    },
  };
  bandCostBySlug["platform-or-setup"] = {
    1: "Most of the friction you describe is built into the platform. Working around it costs developer time on every change, and that cost does not fall.",
    2: "The platform is the main constraint, and setup problems add to it. Both cost you, but only one needs a migration to fix.",
    3: "Most of the cost comes from setup and structure, which can be fixed in place for a fraction of what a migration costs.",
    4: "The cost here comes from setup, not the platform. A migration would be an expensive way to carry the same problems to a new system.",
  };
  const bandCost = bandCostBySlug[assessmentSlug] || maturityBandCost;

  // Platform or Setup Check only: the score is the share of problems that
  // point at setup, so bands 1 and 2 lead to costing a move and bands 3 and
  // 4 lead to reviewing the setup first. The estimator is step two.
  const isPlatformCheck = assessmentSlug === "platform-or-setup";
  const platformLed = isPlatformCheck && bandLevel <= 2;

  // For the Platform or Setup Check, only list an area as a cost when it
  // really leans towards the platform (half or less of it points at setup).
  const weakDims = dimensionScores.filter(
    (d) =>
      weakAreas.includes(d.dimensionKey) &&
      (assessmentSlug !== "platform-or-setup" || d.score <= 50)
  );
  const topStep = recommendations[0];
  const otherSteps = recommendations.slice(1);

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
              Executive Readout
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
            {firstName ? `${firstName}, your` : "Your"} content infrastructure readout
          </h1>
          <p className="text-white/60 font-barlow text-sm sm:text-base mb-2 max-w-xl">
            Where your content infrastructure is helping or holding back marketing performance, and the one thing to do first.
          </p>

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
                  className={`font-barlow text-xs mt-1 w-16 sm:w-24 text-center leading-tight ${
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

      {/* What this is costing you */}
      <section className="pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl px-8 py-10">
            <h3 className="text-white font-barlow font-bold text-xl mb-2">
              What this is costing you
            </h3>
            <p className="text-white/70 font-barlow leading-relaxed mb-6">
              {bandCost[bandLevel] || bandCost[1]}
            </p>
            {weakDims.length > 0 && (
              <ul className="space-y-4">
                {weakDims.map((dim) => (
                  <li key={dim.dimensionKey} className="flex gap-3">
                    <span
                      className="mt-1 flex-shrink-0 w-2 h-2 rounded-full"
                      style={{ backgroundColor: "#F59E0B" }}
                    />
                    <span className="text-white/70 font-barlow text-sm leading-relaxed">
                      <span className="text-white font-semibold">
                        {dim.dimensionTitle}:
                      </span>{" "}
                      {dimensionCost[dim.dimensionKey] ||
                        "This is one of your weakest areas, and the first place to look."}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Platform or Setup Check: step two depends on the band */}
      {isPlatformCheck && (
        <section className="pb-16">
          <div className="max-w-3xl mx-auto px-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl px-8 py-10">
              <p className="text-ecm-lime font-barlow text-xs uppercase tracking-widest font-bold mb-2">
                Step two
              </p>
              <h3 className="text-white font-barlow font-bold text-xl sm:text-2xl mb-2">
                {platformLed
                  ? "Cost the move."
                  : "Review the setup before you cost anything."}
              </h3>
              <p className="text-white/70 font-barlow leading-relaxed mb-6 max-w-2xl">
                {platformLed
                  ? "Your answers point at the platform. The CMS Implementation Cost Estimator gives a three or five year cost range for a move, so the decision rests on a number. Fix any setup issues you named first, so they do not travel with you."
                  : "Your answers point at how the platform was set up, not at the platform. A migration would carry those problems to a new system. Have the setup reviewed first. The estimator is there if you want the cost of a move for comparison."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                {platformLed ? (
                  <Link
                    href="/assessment/cms-implementation"
                    className="inline-flex items-center justify-center bg-ecm-lime text-ecm-green font-barlow font-bold px-8 py-3 rounded-full hover:bg-ecm-lime-hover transition-colors"
                  >
                    Open the cost estimator
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/content-technology"
                      className="inline-flex items-center justify-center bg-ecm-lime text-ecm-green font-barlow font-bold px-8 py-3 rounded-full hover:bg-ecm-lime-hover transition-colors"
                    >
                      See how a setup review works
                    </Link>
                    <Link
                      href="/assessment/cms-implementation"
                      className="inline-flex items-center justify-center border border-ecm-lime/40 text-ecm-lime font-barlow font-semibold px-8 py-3 rounded-full hover:bg-ecm-lime/10 transition-colors"
                    >
                      Open the cost estimator anyway
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Your recommended next step */}
      {topStep && (
        <section className="pb-16">
          <div className="max-w-3xl mx-auto px-6">
            <div className="bg-ecm-lime/10 border border-ecm-lime/30 rounded-2xl px-8 py-10">
              <p className="text-ecm-lime font-barlow text-xs uppercase tracking-widest font-bold mb-2">
                Your recommended next step
              </p>
              <h3 className="text-white font-barlow font-bold text-xl sm:text-2xl mb-2">
                {topStep.title}
              </h3>
              {topStep.summary && (
                <p className="text-white/70 font-barlow leading-relaxed mb-6 max-w-2xl">
                  {topStep.summary}
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center bg-ecm-lime text-ecm-green font-barlow font-bold px-8 py-3 rounded-full hover:bg-ecm-lime-hover transition-colors"
                >
                  Book a strategy session
                </Link>
                {topStep.serviceHref && (
                  <Link
                    href={topStep.serviceHref}
                    className="inline-flex items-center justify-center border border-ecm-lime/40 text-ecm-lime font-barlow font-semibold px-8 py-3 rounded-full hover:bg-ecm-lime/10 transition-colors"
                  >
                    See how we fix this
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

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

      {/* Recommendations (beyond the first, highlighted step) */}
      {otherSteps.length > 0 && (
        <section className="pb-16">
          <div className="max-w-3xl mx-auto px-6">
            <h3 className="text-white font-barlow font-bold text-xl mb-2">
              The rest of the picture
            </h3>
            <p className="text-white/50 font-barlow text-sm mb-6">
              Once the first step is underway, these are the next areas we would address.
            </p>
            <div className="grid gap-4">
              {otherSteps.map((rec, i) => (
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
                      data-testid="assessment-email"
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
                      data-testid="assessment-consent"
                      onClick={() => setConsentGiven(!consentGiven)}
                      className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${consentGiven ? "bg-ecm-lime border-ecm-lime" : "border-white/30 group-hover:border-white/50"}`}
                    >
                      {consentGiven && (
                        <svg className="w-3 h-3 text-heading" viewBox="0 0 10 8" fill="none">
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
                      data-testid="assessment-submit"
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
              <div className="text-center py-4" data-testid="assessment-email-sent">
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

      {/* ─── Quick Feedback (Content Infrastructure Maturity only) ─── */}
      {FEEDBACK_ENABLED_SLUGS.has(assessmentSlug) && (
        <section className="pb-16">
          <div className="max-w-3xl mx-auto px-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl px-8 py-10">
              {!feedbackSent ? (
                <>
                  <div className="text-xs font-bold text-white/60 uppercase tracking-wide font-barlow mb-1">Optional</div>
                  <h3 className="text-white font-barlow font-bold text-xl mb-1">
                    Quick feedback?
                  </h3>
                  <p className="text-white/60 font-barlow text-sm mb-6">
                    Two questions, ten seconds, no email required. Helps us make this more useful.
                  </p>
                  <form onSubmit={handleSubmitFeedback} className="space-y-6">
                    <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
                      <label>
                        Leave empty
                        <input type="text" name="_hp" tabIndex={-1} autoComplete="off" value={feedbackHp} onChange={(e) => setFeedbackHp(e.target.value)} />
                      </label>
                    </div>

                    <div>
                      <p className="text-white/80 font-barlow text-sm mb-3">
                        How accurately did this reflect your content operation?
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {FEEDBACK_Q1_OPTIONS.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setFeedbackQ1(option)}
                            className={`px-4 py-2 rounded-full text-sm font-barlow font-semibold transition-colors ${
                              feedbackQ1 === option
                                ? "bg-ecm-lime text-ecm-green"
                                : "bg-white/10 text-white/70 hover:bg-white/15"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-white/80 font-barlow text-sm mb-3">
                        How likely are you to act on the recommended next step?
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {FEEDBACK_Q2_OPTIONS.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setFeedbackQ2(option)}
                            className={`px-4 py-2 rounded-full text-sm font-barlow font-semibold transition-colors ${
                              feedbackQ2 === option
                                ? "bg-ecm-lime text-ecm-green"
                                : "bg-white/10 text-white/70 hover:bg-white/15"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-white/80 font-barlow text-sm mb-3">
                        Anything else you&rsquo;d like to share? (optional)
                      </label>
                      <textarea
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        maxLength={2000}
                        rows={3}
                        placeholder="Your comment"
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/15 text-white font-barlow placeholder-white/30 focus:outline-none focus:border-ecm-lime transition-colors resize-none"
                      />
                    </div>

                    {feedbackError && (
                      <p className="text-red-400 font-barlow text-xs">{feedbackError}</p>
                    )}

                    <button
                      type="submit"
                      disabled={feedbackSending || !feedbackQ1 || !feedbackQ2}
                      className="bg-ecm-lime hover:bg-ecm-lime-hover text-ecm-green font-barlow font-bold py-3 px-8 rounded-xl text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {feedbackSending ? "Sending..." : "Send feedback"}
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-4">
                  <svg className="w-10 h-10 text-ecm-lime mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-white font-barlow font-semibold text-lg mb-1">
                    Thanks for the feedback
                  </p>
                  <p className="text-white/50 font-barlow text-sm">
                    It genuinely helps us make this better.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="pb-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-ecm-green-dark/60 border border-ecm-lime/15 rounded-2xl px-8 py-10 text-center">
            <h3 className="text-ecm-lime font-barlow font-bold text-2xl sm:text-3xl mb-3">
              {ctaHeading || "Review your readout with us"}
            </h3>
            <p className="text-white/60 font-barlow mb-6 max-w-lg mx-auto">
              {ctaBody ||
                "Bring this readout to a 30-minute strategy session. We'll talk through where your marketing operation is leaking time, cost, and quality, and what fixing it looks like. No pitch, no obligation."}
            </p>
            <Link
              href="/contact"
              className="inline-block bg-ecm-lime text-ecm-green font-barlow font-bold text-lg px-10 py-4 rounded-full hover:bg-ecm-lime-hover transition-colors"
            >
              Book a strategy session
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

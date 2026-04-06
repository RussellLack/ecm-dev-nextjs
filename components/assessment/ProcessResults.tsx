"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Server-renderable Process Assessment results view.
 * Receives pre-computed results from Sanity toolSubmission.
 */

interface Flag {
  type: "critical" | "warning";
  msg: string;
}

interface ProcessResultsProps {
  submissionId: string;
  submittedAt: string;
  name?: string;
  role?: string;
  company?: string;
  results: {
    flags: Flag[];
    topics: string[];
    brief: string;
    ratingLabel: string;
    ratingColor: string;
    impactLabel: string;
    impactColor: string;
    domain: string;
    processType: string;
    processTypeIcon: string;
    frequency: string;
    people: string;
    duration: string;
    processOwner: string;
    approvalStyle: string;
    exceptions: string;
    sops: string;
    workStyle: string;
    systemsUsed: string;
    timeLost: string[];
    painPoints: string[];
    automationDiscussed: string;
    changeAppetite: string;
    notes: string;
  };
}

export default function ProcessResults({
  submissionId,
  submittedAt,
  name,
  role,
  company,
  results,
}: ProcessResultsProps) {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const critCount = results.flags.filter((f) => f.type === "critical").length;
  const warnCount = results.flags.filter((f) => f.type === "warning").length;
  const dateStr = submittedAt
    ? new Date(submittedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  function copyBrief() {
    navigator.clipboard.writeText(results.brief).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  }

  return (
    <div className="min-h-screen bg-ecm-green text-white font-barlow">
      {/* Topbar */}
      <div className="border-b border-white/10 sticky top-0 bg-ecm-green z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/assessments"
              className="text-white/40 hover:text-white text-sm transition-colors"
            >
              ← Assessments
            </Link>
            <div className="text-xs font-bold text-ecm-lime tracking-widest uppercase">
              Pre-Diagnostic Brief
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyLink}
              className="text-xs font-semibold bg-white/10 hover:bg-white/15 text-white/70 px-4 py-2 rounded-xl transition-colors"
            >
              {linkCopied ? "✓ Copied" : "Share link"}
            </button>
            <button
              onClick={copyBrief}
              className="text-xs font-semibold bg-ecm-lime/20 hover:bg-ecm-lime-hover text-ecm-lime hover:text-ecm-green px-4 py-2 rounded-xl transition-colors"
            >
              {copied ? "✓ Copied" : "Copy as Markdown"}
            </button>
            <a
              href={`/api/assessment/pdf?sid=${submissionId}&type=process`}
              className="text-xs font-semibold bg-white/10 hover:bg-white/15 text-white/70 px-4 py-2 rounded-xl transition-colors"
            >
              Download PDF
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-5">
        {/* Client + summary cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-2 bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="text-xs font-bold text-white/40 uppercase tracking-wide mb-1">
              Client
            </div>
            <div className="font-bold text-white">{name || "Anonymous"}</div>
            <div className="text-sm text-white/60">
              {[role, company].filter(Boolean).join(" · ") ||
                "Details not provided"}
            </div>
            {dateStr && (
              <div className="text-xs text-white/30 mt-1">{dateStr}</div>
            )}
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
            <div
              className={`text-xl font-black ${results.ratingColor}`}
            >
              {results.ratingLabel?.split(" ")[0] || "—"}
            </div>
            <div className="text-xs text-white/40 mt-1">Process State</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
            <div
              className={`text-xl font-black ${results.impactColor}`}
            >
              {results.impactLabel || "—"}
            </div>
            <div className="text-xs text-white/40 mt-1">Impact Level</div>
          </div>
        </div>

        {/* Process + ownership detail */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="text-xs font-bold text-white/40 uppercase tracking-wide mb-3">
              Process Overview
            </div>
            <div className="space-y-1.5 text-sm">
              <div>
                <span className="text-white/40">Domain:</span>{" "}
                <span className="text-white">{results.domain}</span>
              </div>
              <div>
                <span className="text-white/40">Type:</span>{" "}
                <span className="text-white">
                  {results.processTypeIcon} {results.processType}
                </span>
              </div>
              <div>
                <span className="text-white/40">Frequency:</span>{" "}
                <span className="text-white">{results.frequency}</span>
              </div>
              <div>
                <span className="text-white/40">People:</span>{" "}
                <span className="text-white">{results.people}</span>
              </div>
              <div>
                <span className="text-white/40">Duration:</span>{" "}
                <span className="text-white">{results.duration}</span>
              </div>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="text-xs font-bold text-white/40 uppercase tracking-wide mb-3">
              Ownership & Decisions
            </div>
            <div className="space-y-1.5 text-sm">
              <div>
                <span className="text-white/40">Owner:</span>{" "}
                <span className="text-white">{results.processOwner}</span>
              </div>
              <div>
                <span className="text-white/40">Approvals:</span>{" "}
                <span className="text-white">{results.approvalStyle}</span>
              </div>
              <div>
                <span className="text-white/40">Exceptions:</span>{" "}
                <span className="text-white">{results.exceptions}</span>
              </div>
              <div>
                <span className="text-white/40">SOPs:</span>{" "}
                <span className="text-white">{results.sops}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Time lost tags */}
        {results.timeLost.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="text-xs font-bold text-white/40 uppercase tracking-wide mb-3">
              Where Time Gets Lost
            </div>
            <div className="flex flex-wrap gap-2">
              {results.timeLost.map((label) => (
                <span
                  key={label}
                  className="text-xs font-semibold bg-white/10 text-white/80 px-3 py-1.5 rounded-lg"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Pain points tags */}
        {results.painPoints.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="text-xs font-bold text-white/40 uppercase tracking-wide mb-3">
              Pain Points Identified
            </div>
            <div className="flex flex-wrap gap-2">
              {results.painPoints.map((label) => (
                <span
                  key={label}
                  className="text-xs font-semibold bg-white/10 text-white/80 px-3 py-1.5 rounded-lg"
                >
                  {label}
                </span>
              ))}
            </div>
            {results.notes && (
              <p className="text-sm text-white/60 mt-3 italic">
                &ldquo;{results.notes}&rdquo;
              </p>
            )}
          </div>
        )}

        {/* Readiness signals */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <div className="text-sm font-semibold text-white">
              {results.automationDiscussed}
            </div>
            <div className="text-xs text-white/40 mt-1">Automation discussed</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <div className="text-sm font-semibold text-white">
              {results.sops?.split("—")[0] || "—"}
            </div>
            <div className="text-xs text-white/40 mt-1">Documentation</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <div className="text-sm font-semibold text-white">
              {results.changeAppetite}
            </div>
            <div className="text-xs text-white/40 mt-1">Change appetite</div>
          </div>
        </div>

        {/* Flags */}
        {results.flags.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
            <div className="text-xs font-bold text-white/40 uppercase tracking-wide">
              Consultant Flags
            </div>
            {results.flags.map((flag, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 text-sm ${
                  flag.type === "critical" ? "text-red-400" : "text-yellow-400"
                }`}
              >
                <span>{flag.type === "critical" ? "🔴" : "🟡"}</span>
                <span>{flag.msg}</span>
              </div>
            ))}
          </div>
        )}

        {critCount === 0 && warnCount === 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-sm text-emerald-400">
              ✓ No major flags. Process appears relatively well-defined.
            </p>
          </div>
        )}

        {/* Discussion topics */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
          <div className="text-xs font-bold text-white/40 uppercase tracking-wide">
            Suggested Discussion Topics
          </div>
          {results.topics.map((topic, i) => (
            <div
              key={i}
              className="flex items-start gap-3 text-sm text-white/80"
            >
              <span className="text-ecm-lime font-bold shrink-0">{i + 1}.</span>
              <span>{topic}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-white/5 border border-ecm-lime/20 border-opacity-50 rounded-2xl p-8 text-center space-y-4">
          <h3 className="text-xl font-extrabold">Ready to dig deeper?</h3>
          <p className="text-white/60 text-sm leading-relaxed">
            Your consultant has everything they need to make the first call
            count. Book your discovery session now.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-ecm-lime text-ecm-green font-barlow font-bold px-8 py-3.5 rounded-full hover:bg-ecm-lime-hover transition-colors"
          >
            Book a discovery call →
          </Link>
        </div>
      </div>
    </div>
  );
}

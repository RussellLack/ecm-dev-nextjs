"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Server-renderable Lead Magnet Ideation results view.
 * Receives pre-computed results from Sanity toolSubmission.
 */

interface Gap {
  dimension: string;
  current: number;
  required: number;
  gap: number;
}

interface FormatResult {
  id: string;
  name: string;
  icon: string;
  description: string;
  effort: string;
  timeToCreate: string;
  topicTemplate: string;
  topicExamples: string[];
  score: number;
  gaps: Gap[];
}

interface CapabilityDim {
  id: string;
  label: string;
  shortLabel: string;
}

interface LeadMagnetResultsProps {
  submissionId: string;
  submittedAt: string;
  name?: string;
  role?: string;
  company?: string;
  results: {
    topThree: FormatResult[];
    readiness: number;
    readinessLabel: string;
    readinessColor: string;
    capabilities: Record<string, number>;
    capabilityDimensions: CapabilityDim[];
    biggestGap: Gap | null;
    gapActions: string[];
    allGaps: Gap[];
  };
}

/* ── Radar chart (SVG, no dependencies) ── */

function RadarChart({
  capabilities,
  dimensions,
}: {
  capabilities: Record<string, number>;
  dimensions: CapabilityDim[];
}) {
  const cx = 140,
    cy = 140,
    r = 95;
  const n = dimensions.length;

  const pt = (i: number, val: number): [number, number] => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    const rv = (val / 5) * r;
    return [cx + rv * Math.cos(angle), cy + rv * Math.sin(angle)];
  };

  const rings = [1, 2, 3, 4, 5];

  const ringPath = (val: number) =>
    dimensions
      .map((_, i) => {
        const [x, y] = pt(i, val);
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ") + " Z";

  const dataPath =
    dimensions
      .map((dim, i) => {
        const [x, y] = pt(i, capabilities[dim.id] || 1);
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ") + " Z";

  return (
    <svg viewBox="0 0 280 280" className="w-full max-w-xs mx-auto">
      {rings.map((v) => (
        <path
          key={v}
          d={ringPath(v)}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
        />
      ))}
      {dimensions.map((_, i) => {
        const [x, y] = pt(i, 5);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
        );
      })}
      <path
        d={dataPath}
        fill="#AAF870"
        fillOpacity={0.25}
        stroke="#AAF870"
        strokeWidth={2}
      />
      {dimensions.map((dim, i) => {
        const [x, y] = pt(i, 5.7);
        return (
          <text
            key={dim.id}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={9}
            fontWeight={600}
            fill="rgba(255,255,255,0.5)"
          >
            {dim.shortLabel}
          </text>
        );
      })}
    </svg>
  );
}

/* ── Format card ── */

function FormatCard({ format, rank }: { format: FormatResult; rank: number }) {
  const medal = rank === 0 ? "🥇" : rank === 1 ? "🥈" : "🥉";

  return (
    <div
      className={`bg-white/5 border rounded-2xl p-6 space-y-4 ${
        rank === 0
          ? "border-ecm-lime/30 ring-1 ring-ecm-lime/10"
          : "border-white/10"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">{format.icon}</span>
            <span className="text-lg font-bold">{format.name}</span>
            <span className="ml-1">{medal}</span>
          </div>
          <p className="text-sm text-white/50">{format.description}</p>
        </div>
      </div>
      <div className="flex gap-3 text-xs text-white/40">
        <span>
          Effort: <span className="text-white/70">{format.effort}</span>
        </span>
        <span>•</span>
        <span>
          Timeline: <span className="text-white/70">{format.timeToCreate}</span>
        </span>
      </div>
      <div className="space-y-2">
        <p className="text-xs text-white/40 font-semibold uppercase tracking-wider">
          Topic ideas
        </p>
        <p className="text-sm text-ecm-lime italic">{format.topicTemplate}</p>
        <div className="flex flex-wrap gap-2">
          {format.topicExamples.map((ex) => (
            <span
              key={ex}
              className="text-xs bg-white/5 text-white/60 px-3 py-1 rounded-lg"
            >
              {ex}
            </span>
          ))}
        </div>
      </div>
      {format.gaps && format.gaps.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-white/40 font-semibold uppercase tracking-wider">
            Capability gaps
          </p>
          {format.gaps.map((g) => (
            <div
              key={g.dimension}
              className="flex items-center justify-between text-xs bg-white/5 rounded-lg px-3 py-2"
            >
              <span className="text-white/60">{g.dimension}</span>
              <span className="text-white/30">
                {g.current}/5 → need {g.required}/5
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main results view ── */

export default function LeadMagnetResults({
  submissionId,
  submittedAt,
  name,
  role,
  company,
  results,
}: LeadMagnetResultsProps) {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const dateStr = submittedAt
    ? new Date(submittedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  }

  // Build a text summary for "Copy as Markdown"
  function copyMarkdown() {
    const lines: string[] = [];
    lines.push("# Lead Magnet Analysis");
    if (name || company) lines.push(`**Client:** ${[name, company].filter(Boolean).join(" — ")}`);
    if (dateStr) lines.push(`**Date:** ${dateStr}`);
    lines.push("");
    lines.push(`## Readiness Score: ${results.readiness}% — ${results.readinessLabel}`);
    lines.push("");
    lines.push("## Top 3 Lead Magnet Formats");
    results.topThree.forEach((f, i) => {
      lines.push(`\n### ${i + 1}. ${f.icon} ${f.name}`);
      lines.push(f.description);
      lines.push(`- Effort: ${f.effort} · Timeline: ${f.timeToCreate}`);
      lines.push(`- Topic template: *${f.topicTemplate}*`);
      if (f.gaps.length > 0) {
        lines.push("- Gaps: " + f.gaps.map((g) => `${g.dimension} (${g.current}→${g.required})`).join(", "));
      }
    });
    lines.push("");
    lines.push("## Capability Profile");
    results.capabilityDimensions.forEach((dim) => {
      lines.push(`- ${dim.label}: ${results.capabilities[dim.id] || 1}/5`);
    });
    if (results.biggestGap) {
      lines.push("");
      lines.push(`## Priority Gap: ${results.biggestGap.dimension}`);
      lines.push(`Current: ${results.biggestGap.current}/5 · Required: ${results.biggestGap.required}/5`);
      if (results.gapActions.length > 0) {
        lines.push("**Actions:**");
        results.gapActions.forEach((a) => lines.push(`- ${a}`));
      }
    }
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const readinessColorClass =
    results.readiness >= 75
      ? "text-green-400"
      : results.readiness >= 50
        ? "text-yellow-400"
        : "text-orange-400";

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
              Lead Magnet Analysis
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
              onClick={copyMarkdown}
              className="text-xs font-semibold bg-ecm-lime/20 hover:bg-ecm-lime-hover text-ecm-lime hover:text-ecm-green px-4 py-2 rounded-xl transition-colors"
            >
              {copied ? "✓ Copied" : "Copy as Markdown"}
            </button>
            <a
              href={`/api/assessment/pdf?sid=${submissionId}&type=lead-magnet`}
              className="text-xs font-semibold bg-white/10 hover:bg-white/15 text-white/70 px-4 py-2 rounded-xl transition-colors"
            >
              Download PDF
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-5">
        {/* Client + readiness cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
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
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center flex flex-col justify-center">
            <div className={`text-4xl font-black ${readinessColorClass}`}>
              {results.readiness}%
            </div>
            <div className="text-xs text-white/40 mt-1">Readiness Score</div>
            <div className={`text-xs font-semibold mt-0.5 ${readinessColorClass}`}>
              {results.readinessLabel}
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center flex flex-col justify-center">
            <div className="text-3xl">
              {results.topThree[0]?.icon || "📘"}
            </div>
            <div className="text-xs text-white/40 mt-1">Best fit format</div>
            <div className="text-xs font-semibold text-white mt-0.5">
              {results.topThree[0]?.name || "—"}
            </div>
          </div>
        </div>

        {/* Top 3 formats */}
        <div className="space-y-4">
          <div className="text-xs font-bold text-white/40 uppercase tracking-wide">
            Top 3 Lead Magnet Formats
          </div>
          {results.topThree.map((format, i) => (
            <FormatCard key={format.id} format={format} rank={i} />
          ))}
        </div>

        {/* Radar chart + capability bars */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-6">
          <div className="text-xs font-bold text-white/40 uppercase tracking-wide">
            Capability Profile
          </div>
          <RadarChart
            capabilities={results.capabilities}
            dimensions={results.capabilityDimensions}
          />
          <div className="grid grid-cols-1 gap-2">
            {results.capabilityDimensions.map((dim) => (
              <div
                key={dim.id}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-white/60">{dim.label}</span>
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div
                        key={n}
                        className={`w-2.5 h-2.5 rounded-sm ${
                          n <= (results.capabilities[dim.id] || 1)
                            ? "bg-ecm-lime"
                            : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-white/30 w-4 text-right">
                    {results.capabilities[dim.id] || 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority gap */}
        {results.biggestGap && (
          <div className="bg-amber-500/10 border border-amber-400/30 rounded-2xl p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-bold text-white/40 uppercase tracking-wide mb-2">
                  Priority Gap to Close
                </div>
                <p className="font-bold text-lg text-amber-300">
                  {results.biggestGap.dimension}
                </p>
                <p className="text-sm text-white/60 mt-1">
                  You&apos;re at {results.biggestGap.current}/5 · Your best-fit
                  format needs {results.biggestGap.required}/5
                </p>
              </div>
              <span className="text-2xl">⚡</span>
            </div>
            {results.gapActions.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">
                  3 ways to close this gap
                </p>
                {results.gapActions.map((action, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-sm text-white/80"
                  >
                    <span className="text-amber-500 shrink-0 mt-0.5">→</span>
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Other gaps */}
        {results.allGaps.length > 1 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
            <div className="text-xs font-bold text-white/40 uppercase tracking-wide">
              Other gaps for your top format
            </div>
            {results.allGaps.slice(1).map((g) => (
              <div
                key={g.dimension}
                className="flex items-center justify-between text-sm bg-white/5 border border-white/10 rounded-xl px-4 py-3"
              >
                <span className="text-white/60">{g.dimension}</span>
                <span className="text-white/30 text-xs">
                  {g.current}/5 → need {g.required}/5
                </span>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="bg-white/5 border border-ecm-lime/20 border-opacity-50 rounded-2xl p-8 text-center space-y-4">
          <div className="text-3xl">◈</div>
          <h3 className="text-xl font-extrabold">Want help building it?</h3>
          <p className="text-white/60 text-sm leading-relaxed">
            ECM.dev designs content operating systems — including the lead
            magnets, workflows, and AI-powered distribution that turn content
            into a consistent growth engine.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-ecm-lime text-ecm-green font-barlow font-bold px-8 py-3.5 rounded-full hover:bg-ecm-lime-hover transition-colors"
          >
            Talk to the team →
          </Link>
        </div>
      </div>
    </div>
  );
}

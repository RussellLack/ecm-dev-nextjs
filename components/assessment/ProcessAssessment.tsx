"use client";

/**
 * ProcessAssessment.tsx
 * ECM.dev — Process Mining Self-Assessment Tool
 *
 * 6-stage self-assessment that maps a key business process, surfaces blockers
 * and ownership gaps, and generates a Pre-Diagnostic Brief for the consultant.
 * No external dependencies — pure React + Tailwind.
 */

import { useState } from "react";
import Link from "next/link";
import { useCsrf } from "@/lib/useCsrf";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface Option {
  v: string;
  l: string;
  d?: string;
  icon?: string;
  col?: string;
}

interface Assessment {
  id: string;
  createdAt: string;
  status: "draft" | "submitted";
  submittedAt?: string;
  name: string;
  role: string;
  company: string;
  email: string;
  domain: string;
  processType: string;
  processDescription: string;
  frequency: string;
  people: string;
  duration: string;
  rating: string;
  timeLost: string[];
  workStyle: string;
  systemsUsed: string;
  processOwner: string;
  approvalStyle: string;
  whenWrong: string;
  painPoints: string[];
  businessImpact: string;
  notes: string;
  automationDiscussed: string;
  hasSops: string;
  changeAppetite: string;
}

interface Flag {
  type: "critical" | "warning" | "info";
  msg: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const DOMAINS: Option[] = [
  { v: "finance",     l: "Finance & Procurement" },
  { v: "sales",       l: "Sales & Revenue Operations" },
  { v: "customer",    l: "Customer Operations" },
  { v: "hr",          l: "HR & People Operations" },
  { v: "it",          l: "IT & Technology Operations" },
  { v: "supply",      l: "Supply Chain & Logistics" },
  { v: "compliance",  l: "Compliance & Risk" },
  { v: "marketing",   l: "Marketing & Content Operations" },
  { v: "operations",  l: "General / Business Operations" },
  { v: "custom",      l: "Other / Not listed" },
];

const PROCESS_TYPES: Option[] = [
  { v: "approval",     icon: "📋", l: "Approval Workflow",        d: "A request, document, or decision that needs sign-off before it can proceed" },
  { v: "data",         icon: "🔄", l: "Data Processing",          d: "Moving, transforming, or consolidating information between people or systems" },
  { v: "fulfilment",   icon: "📥", l: "Request Fulfilment",       d: "Responding to and completing internal or external requests" },
  { v: "onboarding",   icon: "👥", l: "Onboarding / Offboarding", d: "Bringing a person, supplier, or system on or off — structured setup or closedown" },
  { v: "reporting",    icon: "📊", l: "Reporting & Analysis",     d: "Gathering data from multiple sources and producing outputs or insights" },
  { v: "compliance",   icon: "✅", l: "Compliance & Audit",       d: "Checking, verifying, or recording against standards, policies, or regulations" },
  { v: "customer",     icon: "🤝", l: "Customer Journey Step",    d: "A key touchpoint or handoff in the end-to-end customer experience" },
  { v: "coordination", icon: "🔗", l: "Cross-team Coordination",  d: "Orchestrating work or decisions across multiple teams, roles, or systems" },
  { v: "other",        icon: "⚙️", l: "Other",                   d: "A process that doesn't fit neatly into the categories above" },
];

const FREQUENCIES: Option[] = [
  { v: "many-daily",  l: "Multiple times a day" },
  { v: "daily",       l: "Daily" },
  { v: "weekly",      l: "Weekly" },
  { v: "fortnightly", l: "Fortnightly" },
  { v: "monthly",     l: "Monthly" },
  { v: "adhoc",       l: "Ad hoc / as needed" },
];

const PEOPLE: Option[] = [
  { v: "1",    l: "Just me",          d: "A solo process — one person handles it end to end" },
  { v: "2-5",  l: "2 – 5 people",    d: "A small team or a handful of roles" },
  { v: "6-15", l: "6 – 15 people",   d: "Spans multiple teams or departments" },
  { v: "15+",  l: "More than 15",     d: "A wide-reaching process touching many stakeholders" },
];

const DURATIONS: Option[] = [
  { v: "<1h",   l: "Under an hour" },
  { v: "1-8h",  l: "1 – 8 hours (same day)" },
  { v: "1-3d",  l: "1 – 3 days" },
  { v: "1-2w",  l: "1 – 2 weeks" },
  { v: "2w+",   l: "More than 2 weeks" },
];

const RATINGS: Option[] = [
  { v: "smooth",   l: "Runs smoothly",            d: "Generally works well. Minor friction at most.",                          col: "text-emerald-400" },
  { v: "mostly",   l: "Mostly works",             d: "Gets the job done, but noticeably slower or harder than it should be.", col: "text-yellow-400" },
  { v: "friction", l: "Has significant friction", d: "Regularly slows work down, causes frustration, or requires workarounds.", col: "text-orange-400" },
  { v: "broken",   l: "Frequently breaks down",   d: "Causes real problems — missed deadlines, errors, or escalations.",      col: "text-red-400" },
];

const TIME_LOST: Option[] = [
  { v: "approvals",  l: "Waiting for approvals",         d: "Bottlenecks at sign-off or decision points" },
  { v: "manual",     l: "Manual data entry",             d: "Retyping or copying information that already exists" },
  { v: "chasing",    l: "Chasing people for responses",  d: "Following up on tasks or information that stall" },
  { v: "switching",  l: "Switching between systems",     d: "Jumping across tools that don't talk to each other" },
  { v: "rework",     l: "Fixing errors and rework",      d: "Correcting mistakes made earlier in the process" },
  { v: "ownership",  l: "Unclear who should act",        d: "Tasks sit with no one because ownership is ambiguous" },
  { v: "finding",    l: "Finding the right information", d: "Searching for data, documents, or context before starting" },
  { v: "handoffs",   l: "Poor handoffs between teams",   d: "Work gets lost or delayed when it crosses a boundary" },
];

const WORK_STYLES: Option[] = [
  { v: "manual",  l: "Mostly manual",             d: "Most steps rely on people — email, spreadsheets, phone calls, physical documents" },
  { v: "mixed",   l: "Mix of manual and digital", d: "Some steps use systems, but manual effort still bridges the gaps" },
  { v: "systems", l: "Mostly system-driven",      d: "Most steps run through software — human input at key decision points only" },
];

const OWNER_OPTIONS: Option[] = [
  { v: "clear",   l: "Yes — a named person or role owns it",    d: "There's a clear point of accountability. Everyone knows who to go to." },
  { v: "shared",  l: "Shared — a team or group is responsible", d: "Ownership is collective. Accountability is distributed." },
  { v: "unclear", l: "Unclear — it's not formally owned",       d: "It works because individuals step up, not because the process is governed." },
];

const APPROVAL_OPTIONS: Option[] = [
  { v: "one",        l: "One person approves everything",        d: "A single decision-maker, consistent and clear" },
  { v: "sequential", l: "Multiple approvers in sequence",        d: "A chain — each approver passes to the next" },
  { v: "any",        l: "Anyone at the right level can approve", d: "Approval is role-based, not person-specific" },
  { v: "adhoc",      l: "It's ad hoc — depends on the situation", d: "No consistent approach. Decisions happen informally." },
];

const WRONG_OPTIONS: Option[] = [
  { v: "clear",   l: "Clear escalation path",             d: "There's a defined process for exceptions. People know what to do." },
  { v: "adhoc",   l: "Ad hoc — depends on who's around", d: "Someone takes initiative. No formal escalation exists." },
  { v: "stalls",  l: "It often stalls and waits",         d: "Exceptions tend to sit unresolved until someone notices." },
  { v: "unknown", l: "I'm not sure",                      d: "The exception-handling process isn't visible or documented." },
];

const PAIN_OPTIONS: Option[] = [
  { v: "slow",         l: "Takes too long" },
  { v: "manual",       l: "Too many manual steps" },
  { v: "errors",       l: "Errors and rework are common" },
  { v: "ownership",    l: "Unclear ownership or accountability" },
  { v: "visibility",   l: "Hard to track progress or status" },
  { v: "compliance",   l: "Creates compliance or audit risk" },
  { v: "inconsistent", l: "Outcomes are inconsistent" },
  { v: "costly",       l: "High cost or resource-intensive" },
  { v: "knowledge",    l: "Relies on one person's knowledge" },
  { v: "handoffs",     l: "Poor handoffs between teams or systems" },
];

const IMPACT_OPTIONS: Option[] = [
  { v: "minor",       l: "Minor inconvenience",      d: "Frustrating but not business-critical",                                    col: "text-blue-400" },
  { v: "noticeable",  l: "Noticeable inefficiency",  d: "Costs time and affects team productivity",                                  col: "text-yellow-400" },
  { v: "significant", l: "Significant cost or risk", d: "Has measurable business impact — financial, reputational, or operational",  col: "text-orange-400" },
  { v: "critical",    l: "Critical blocker",         d: "Actively prevents the organisation from operating effectively",             col: "text-red-400" },
];

const AUTO_OPTIONS: Option[] = [
  { v: "active",  l: "Yes — actively being discussed", d: "There's momentum and intent behind it" },
  { v: "briefly", l: "It's come up, but no plans yet", d: "The idea has been floated but not prioritised" },
  { v: "no",      l: "Not yet",                        d: "This is a new conversation" },
];

const SOP_OPTIONS: Option[] = [
  { v: "yes",      l: "Yes — documented and up to date",  d: "Clear, current guidelines exist and people follow them" },
  { v: "outdated", l: "Yes — but outdated or incomplete", d: "Documentation exists but doesn't reflect how things actually work" },
  { v: "no",       l: "No — not documented",              d: "The process lives in people's heads" },
];

const APPETITE_OPTIONS: Option[] = [
  { v: "eager",    l: "Eager",    d: "The team actively wants better tools and processes" },
  { v: "open",     l: "Open",     d: "Willing to change if the case is made well" },
  { v: "cautious", l: "Cautious", d: "Sceptical — will need evidence and reassurance" },
  { v: "resistant",l: "Resistant",d: "There is active pushback on change" },
];

// ─────────────────────────────────────────────────────────────────────────────
// DIAGNOSTIC ENGINE
// ─────────────────────────────────────────────────────────────────────────────

function generateFlags(a: Assessment): Flag[] {
  const flags: Flag[] = [];
  const hi = ["critical", "significant"];
  const ratingBad = ["friction", "broken"].includes(a.rating);

  if (ratingBad && hi.includes(a.businessImpact))
    flags.push({ type: "critical", msg: "Process is in poor shape with high business impact — priority engagement." });
  if (a.processOwner === "unclear")
    flags.push({ type: "critical", msg: "No clear process owner. Ownership must be established before any automation design." });
  if (a.approvalStyle === "adhoc")
    flags.push({ type: "warning", msg: "Approval process is ad hoc. This creates unpredictability and is a risk to automation." });
  if (a.whenWrong === "stalls" || a.whenWrong === "unknown")
    flags.push({ type: "warning", msg: "Exception handling is undefined or stalls — a significant gap for automation design." });
  if (a.hasSops === "no")
    flags.push({ type: "critical", msg: "No SOPs documented. Process knowledge is tacit and must be captured before automation." });
  if (a.hasSops === "outdated")
    flags.push({ type: "warning", msg: "SOPs exist but are outdated. Documentation must be refreshed before automation design." });
  if (a.automationDiscussed === "active" && a.hasSops === "no")
    flags.push({ type: "critical", msg: "Automation intent exists but no documented process — sequencing risk." });
  if (a.changeAppetite === "resistant")
    flags.push({ type: "warning", msg: "Team resistance to change identified — change management will be required." });
  if (a.painPoints.includes("compliance"))
    flags.push({ type: "critical", msg: "Compliance or audit risk identified. Address before automation." });
  if (a.painPoints.includes("knowledge"))
    flags.push({ type: "warning", msg: "Process relies on specific individuals' knowledge — a key fragility and automation risk." });
  if (a.timeLost.includes("ownership") && a.processOwner !== "clear")
    flags.push({ type: "warning", msg: "Unclear ownership appears as both a time sink and a governance gap — consistent theme." });
  if (a.workStyle === "manual" && a.businessImpact === "critical")
    flags.push({ type: "warning", msg: "High manual effort on a critical process — strong automation case, but high redesign complexity." });

  return flags;
}

function generateTopics(a: Assessment): string[] {
  const topics: string[] = [];
  topics.push("Confirm the exact scope: is this an end-to-end process or a segment of a larger workflow?");
  if (a.processOwner !== "clear")
    topics.push("Establish who is accountable for this process — and formalise that ownership.");
  if (a.approvalStyle === "adhoc" || a.whenWrong !== "clear")
    topics.push("Map the decision points: who approves what, and what happens when something goes wrong.");
  if (a.hasSops !== "yes")
    topics.push("Agree on a documentation sprint — capture the process before designing automation.");
  if (a.timeLost.length > 0)
    topics.push(`Walk through the top friction points: ${a.timeLost.slice(0, 3).map(v => TIME_LOST.find(o => o.v === v)?.l || v).join(", ")}.`);
  if (a.painPoints.includes("compliance"))
    topics.push("Understand the compliance exposure — what regulations or policies are at risk?");
  if (a.changeAppetite === "cautious" || a.changeAppetite === "resistant")
    topics.push("Discuss change readiness — what would make the team more confident in this initiative?");
  topics.push("Identify quick wins: which parts of the process could be improved immediately without full automation?");
  return topics;
}

function generateBrief(a: Assessment): string {
  const domain   = DOMAINS.find(d => d.v === a.domain)?.l || a.domain;
  const ptype    = PROCESS_TYPES.find(p => p.v === a.processType)?.l || a.processType;
  const rating   = RATINGS.find(r => r.v === a.rating)?.l || a.rating;
  const owner    = OWNER_OPTIONS.find(o => o.v === a.processOwner)?.l || a.processOwner;
  const approval = APPROVAL_OPTIONS.find(o => o.v === a.approvalStyle)?.l || a.approvalStyle;
  const excepts  = WRONG_OPTIONS.find(o => o.v === a.whenWrong)?.l || a.whenWrong;
  const impact   = IMPACT_OPTIONS.find(o => o.v === a.businessImpact)?.l || a.businessImpact;
  const sops     = SOP_OPTIONS.find(o => o.v === a.hasSops)?.l || a.hasSops;
  const auto     = AUTO_OPTIONS.find(o => o.v === a.automationDiscussed)?.l || a.automationDiscussed;
  const appetite = APPETITE_OPTIONS.find(o => o.v === a.changeAppetite)?.l || a.changeAppetite;
  const freq     = FREQUENCIES.find(f => f.v === a.frequency)?.l || a.frequency;
  const people   = PEOPLE.find(p => p.v === a.people)?.l || a.people;
  const duration = DURATIONS.find(d => d.v === a.duration)?.l || a.duration;
  const workStyle = WORK_STYLES.find(w => w.v === a.workStyle)?.l || a.workStyle;
  const timeLostLabels = a.timeLost.map(v => TIME_LOST.find(o => o.v === v)?.l || v);
  const painLabels = a.painPoints.map(v => PAIN_OPTIONS.find(o => o.v === v)?.l || v);
  const flags  = generateFlags(a);
  const topics = generateTopics(a);
  const d = new Date(a.submittedAt || a.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const clientLine = [a.company, a.name, a.role].filter(Boolean).join(" — ") || "Process Assessment";
  return `# Pre-Diagnostic Brief
## ${clientLine}
**Submitted:** ${d}

---

## Process Overview
**Domain:** ${domain}
**Process Type:** ${ptype}
**Frequency:** ${freq}
**People Involved:** ${people}
**End-to-End Duration:** ${duration}${a.processDescription ? `\n**Description:** ${a.processDescription}` : ""}

---

## Current State
**Rating:** ${rating}

**Where time is lost:**
${timeLostLabels.map(l => `- ${l}`).join("\n") || "- Not specified"}

**How work is carried out:** ${workStyle}
**Systems in use:** ${a.systemsUsed || "Not specified"}

---

## Ownership & Decision-Making
**Process Owner:** ${owner}
**Approval Model:** ${approval}
**Exception Handling:** ${excepts}

---

## Pain Points & Impact
**Issues identified:**
${painLabels.map(l => `- ${l}`).join("\n") || "- None selected"}

**Business Impact:** ${impact}${a.notes ? `\n\n**Client notes:** "${a.notes}"` : ""}

---

## Readiness Signals
**Automation discussed:** ${auto}
**SOPs / documentation:** ${sops}
**Team appetite for change:** ${appetite}

---

## Consultant Flags
${flags.length === 0
    ? "✓ No major flags. Process appears relatively well-defined."
    : flags.map(f => `[${f.type.toUpperCase()}] ${f.msg}`).join("\n")}

---

## Suggested Discussion Topics for First Call
${topics.map((t, i) => `${i + 1}. ${t}`).join("\n")}

---
_Generated by ECM.dev Process Assessment Tool_`;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function blankAssessment(): Assessment {
  return {
    id: uid(), createdAt: new Date().toISOString(), status: "draft",
    name: "", role: "", company: "", email: "", domain: "",
    processType: "", processDescription: "",
    frequency: "", people: "", duration: "",
    rating: "", timeLost: [], workStyle: "", systemsUsed: "",
    processOwner: "", approvalStyle: "", whenWrong: "",
    painPoints: [], businessImpact: "", notes: "",
    automationDiscussed: "", hasSops: "", changeAppetite: "",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function QLabel({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-bold text-white">{label}</h3>
      {hint && <p className="text-sm text-white/60 mt-1">{hint}</p>}
    </div>
  );
}

function SingleOpt({
  selected, onSelect, label, desc, col = "", icon,
}: {
  selected: boolean; onSelect: () => void; label: string; desc?: string; col?: string; icon?: string;
}) {
  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer border-2 rounded-xl p-4 bg-white/5 transition-all ${selected ? "border-ecm-lime bg-ecm-lime/10" : "border-white/15 hover:border-ecm-lime/50"}`}
    >
      {icon && <div className="text-2xl mb-2">{icon}</div>}
      <div className={`font-semibold text-sm ${col}`}>{label}</div>
      {desc && <div className="text-xs text-white/40 mt-1 leading-relaxed">{desc}</div>}
    </div>
  );
}

function MultiOpt({
  selected, onToggle, label, desc,
}: {
  selected: boolean; onToggle: () => void; label: string; desc?: string;
}) {
  return (
    <div
      onClick={onToggle}
      className={`cursor-pointer border-2 rounded-xl p-3.5 bg-white/5 flex items-start gap-3 transition-all ${selected ? "border-ecm-lime bg-ecm-lime/10" : "border-white/15 hover:border-ecm-lime/50"}`}
    >
      <div className={`mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center ${selected ? "bg-ecm-lime border-ecm-lime" : "border-white/20"}`}>
        {selected && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <div>
        <div className="text-sm font-semibold">{label}</div>
        {desc && <div className="text-xs text-white/40 mt-0.5">{desc}</div>}
      </div>
    </div>
  );
}

function ProgressBar({ stage }: { stage: number }) {
  return (
    <div className="flex gap-1 mb-8">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i <= stage ? "bg-ecm-lime" : "bg-white/10"}`} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BRIEF VIEW
// ─────────────────────────────────────────────────────────────────────────────

function BriefView({ assessment, onBack }: { assessment: Assessment; onBack: () => void }) {
  const [copied, setCopied] = useState(false);
  const flags  = generateFlags(assessment);
  const topics = generateTopics(assessment);
  const brief  = generateBrief(assessment);

  const critCount = flags.filter(f => f.type === "critical").length;
  const warnCount = flags.filter(f => f.type === "warning").length;

  const rating = RATINGS.find(r => r.v === assessment.rating);
  const impact = IMPACT_OPTIONS.find(o => o.v === assessment.businessImpact);
  const domain = DOMAINS.find(d => d.v === assessment.domain)?.l || assessment.domain;
  const pt = PROCESS_TYPES.find(p => p.v === assessment.processType);

  function copyBrief() {
    navigator.clipboard.writeText(brief).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div>
      {/* Topbar */}
      <div className="border-b border-white/10 sticky top-0 bg-ecm-green z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-white/40 hover:text-white text-sm transition-colors">← Back</button>
            <div className="text-xs font-bold text-ecm-lime tracking-widest uppercase">Pre-Diagnostic Brief</div>
          </div>
          <button
            onClick={copyBrief}
            className="text-xs font-semibold bg-ecm-lime/20 hover:bg-ecm-lime-hover text-ecm-lime hover:text-ecm-green px-4 py-2 rounded-xl transition-colors"
          >
            {copied ? "✓ Copied" : "Copy as Markdown"}
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-5">
        {/* Client + summary cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-2 bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="text-xs font-bold text-white/40 uppercase tracking-wide mb-1">Client</div>
            <div className="font-bold text-white">{assessment.name || "Anonymous"}</div>
            <div className="text-sm text-white/60">{[assessment.role, assessment.company].filter(Boolean).join(" · ") || "Details not provided"}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
            <div className={`text-xl font-black ${rating?.col || ""}`}>{rating?.l?.split(" ")[0] || "—"}</div>
            <div className="text-xs text-white/40 mt-1">Process State</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
            <div className={`text-xl font-black ${impact?.col || ""}`}>{assessment.businessImpact || "—"}</div>
            <div className="text-xs text-white/40 mt-1">Impact Level</div>
          </div>
        </div>

        {/* Process + ownership detail */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="text-xs font-bold text-white/40 uppercase tracking-wide mb-3">Process Overview</div>
            <div className="space-y-1.5 text-sm">
              <div><span className="text-white/40">Domain:</span> <span className="text-white">{domain}</span></div>
              <div><span className="text-white/40">Type:</span> <span className="text-white">{pt?.icon} {pt?.l || "—"}</span></div>
              <div><span className="text-white/40">Frequency:</span> <span className="text-white">{FREQUENCIES.find(f => f.v === assessment.frequency)?.l || "—"}</span></div>
              <div><span className="text-white/40">People:</span> <span className="text-white">{PEOPLE.find(p => p.v === assessment.people)?.l || "—"}</span></div>
              <div><span className="text-white/40">Duration:</span> <span className="text-white">{DURATIONS.find(d => d.v === assessment.duration)?.l || "—"}</span></div>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="text-xs font-bold text-white/40 uppercase tracking-wide mb-3">Ownership & Decisions</div>
            <div className="space-y-1.5 text-sm">
              <div><span className="text-white/40">Owner:</span> <span className="text-white">{OWNER_OPTIONS.find(o => o.v === assessment.processOwner)?.l || "—"}</span></div>
              <div><span className="text-white/40">Approvals:</span> <span className="text-white">{APPROVAL_OPTIONS.find(o => o.v === assessment.approvalStyle)?.l || "—"}</span></div>
              <div><span className="text-white/40">Exceptions:</span> <span className="text-white">{WRONG_OPTIONS.find(o => o.v === assessment.whenWrong)?.l || "—"}</span></div>
              <div><span className="text-white/40">SOPs:</span> <span className="text-white">{SOP_OPTIONS.find(o => o.v === assessment.hasSops)?.l || "—"}</span></div>
            </div>
          </div>
        </div>

        {/* Time lost tags */}
        {assessment.timeLost.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="text-xs font-bold text-white/40 uppercase tracking-wide mb-3">Where Time Gets Lost</div>
            <div className="flex flex-wrap gap-2">
              {assessment.timeLost.map(v => (
                <span key={v} className="text-xs font-semibold bg-white/10 text-white/80 px-3 py-1.5 rounded-lg">
                  {TIME_LOST.find(o => o.v === v)?.l || v}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Pain points tags */}
        {assessment.painPoints.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="text-xs font-bold text-white/40 uppercase tracking-wide mb-3">Pain Points Identified</div>
            <div className="flex flex-wrap gap-2">
              {assessment.painPoints.map(v => (
                <span key={v} className="text-xs font-semibold bg-white/10 text-white/80 px-3 py-1.5 rounded-lg">
                  {PAIN_OPTIONS.find(o => o.v === v)?.l || v}
                </span>
              ))}
            </div>
            {assessment.notes && <p className="text-sm text-white/60 mt-3 italic">&ldquo;{assessment.notes}&rdquo;</p>}
          </div>
        )}

        {/* Readiness signals */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <div className="text-sm font-semibold text-white">{AUTO_OPTIONS.find(o => o.v === assessment.automationDiscussed)?.l || "—"}</div>
            <div className="text-xs text-white/40 mt-1">Automation discussed</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <div className="text-sm font-semibold text-white">{SOP_OPTIONS.find(o => o.v === assessment.hasSops)?.l?.split("—")[0] || "—"}</div>
            <div className="text-xs text-white/40 mt-1">Documentation</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <div className="text-sm font-semibold text-white">{APPETITE_OPTIONS.find(o => o.v === assessment.changeAppetite)?.l || "—"}</div>
            <div className="text-xs text-white/40 mt-1">Change appetite</div>
          </div>
        </div>

        {/* Flags */}
        {flags.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
            <div className="text-xs font-bold text-white/40 uppercase tracking-wide">Consultant Flags</div>
            {flags.map((flag, i) => (
              <div key={i} className={`flex items-start gap-2 text-sm ${flag.type === "critical" ? "text-red-400" : "text-yellow-400"}`}>
                <span>{flag.type === "critical" ? "🔴" : "🟡"}</span>
                <span>{flag.msg}</span>
              </div>
            ))}
          </div>
        )}

        {critCount === 0 && warnCount === 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-sm text-emerald-400">✓ No major flags. Process appears relatively well-defined.</p>
          </div>
        )}

        {/* Discussion topics */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
          <div className="text-xs font-bold text-white/40 uppercase tracking-wide">Suggested Discussion Topics</div>
          {topics.map((topic, i) => (
            <div key={i} className="flex items-start gap-3 text-sm text-white/80">
              <span className="text-ecm-lime font-bold shrink-0">{i + 1}.</span>
              <span>{topic}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-white/5 border border-ecm-lime/20 border-opacity-50 rounded-2xl p-8 text-center space-y-4">
          <h3 className="text-xl font-extrabold">Ready to dig deeper?</h3>
          <p className="text-white/60 text-sm leading-relaxed">
            Your consultant has everything they need to make the first call count.
            Book your discovery session now.
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

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

type View = "welcome" | "stage" | "complete" | "brief";

export default function ProcessAssessment() {
  const { withCsrf } = useCsrf();
  const [hp, setHp] = useState(""); // honeypot
  const [view, setView] = useState<View>("welcome");
  const [stage, setStage] = useState(1);
  const [assessment, setAssessment] = useState<Assessment>(blankAssessment());
  const [consentGiven, setConsentGiven] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  /** Resolve assessment values to display labels and save to Sanity */
  async function saveSubmission(): Promise<string | null> {
    if (submissionId) return submissionId;
    setSaving(true);
    try {
      const a = assessment;
      const rating = RATINGS.find(r => r.v === a.rating);
      const impact = IMPACT_OPTIONS.find(o => o.v === a.businessImpact);
      const pt = PROCESS_TYPES.find(p => p.v === a.processType);

      const results = {
        flags: generateFlags(a),
        topics: generateTopics(a),
        brief: generateBrief(a),
        ratingLabel: rating?.l || "",
        ratingColor: rating?.col || "",
        impactLabel: impact?.l || "",
        impactColor: impact?.col || "",
        domain: DOMAINS.find(d => d.v === a.domain)?.l || a.domain,
        processType: pt?.l || "",
        processTypeIcon: pt?.icon || "",
        frequency: FREQUENCIES.find(f => f.v === a.frequency)?.l || "",
        people: PEOPLE.find(p => p.v === a.people)?.l || "",
        duration: DURATIONS.find(d => d.v === a.duration)?.l || "",
        processOwner: OWNER_OPTIONS.find(o => o.v === a.processOwner)?.l || "",
        approvalStyle: APPROVAL_OPTIONS.find(o => o.v === a.approvalStyle)?.l || "",
        exceptions: WRONG_OPTIONS.find(o => o.v === a.whenWrong)?.l || "",
        sops: SOP_OPTIONS.find(o => o.v === a.hasSops)?.l || "",
        workStyle: WORK_STYLES.find(o => o.v === a.workStyle)?.l || "",
        systemsUsed: a.systemsUsed,
        timeLost: a.timeLost.map(v => TIME_LOST.find(o => o.v === v)?.l || v),
        painPoints: a.painPoints.map(v => PAIN_OPTIONS.find(o => o.v === v)?.l || v),
        automationDiscussed: AUTO_OPTIONS.find(o => o.v === a.automationDiscussed)?.l || "",
        changeAppetite: APPETITE_OPTIONS.find(o => o.v === a.changeAppetite)?.l || "",
        notes: a.notes,
      };

      const res = await fetch("/api/assessment/tool-submit", {
        method: "POST",
        credentials: "same-origin",
        headers: withCsrf({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          toolType: "process",
          answers: a,
          results,
          contact: {
            name: a.name,
            email: a.email,
            role: a.role,
            company: a.company,
          },
          consentGiven,
          _hp: hp,
        }),
      });

      if (!res.ok) throw new Error("Save failed");
      const data = await res.json();
      setSubmissionId(data.submissionId);
      return data.submissionId;
    } catch (err) {
      console.error("Save error:", err);
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function handleCopyLink() {
    const sid = await saveSubmission();
    if (sid) {
      const url = `${window.location.origin}/assessment/process/results?sid=${sid}`;
      await navigator.clipboard.writeText(url);
    }
  }

  async function handleEmailResults() {
    const sid = await saveSubmission();
    if (sid && assessment.email.trim()) {
      try {
        const res = await fetch("/api/assessment/tool-email", {
          method: "POST",
          credentials: "same-origin",
          headers: withCsrf({ "Content-Type": "application/json" }),
          body: JSON.stringify({ submissionId: sid, email: assessment.email.trim(), _hp: hp }),
        });
        if (res.ok) {
          alert("Results sent to " + assessment.email.trim());
        } else {
          // Fallback: open results page
          window.open(`/assessment/process/results?sid=${sid}`, "_blank");
        }
      } catch {
        window.open(`/assessment/process/results?sid=${sid}`, "_blank");
      }
    }
  }

  function pick<K extends keyof Assessment>(field: K, val: Assessment[K]) {
    setAssessment(prev => ({ ...prev, [field]: val }));
  }

  function toggle(field: "timeLost" | "painPoints", val: string) {
    setAssessment(prev => {
      const arr = prev[field] as string[];
      return { ...prev, [field]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] };
    });
  }

  function isSelected(field: keyof Assessment, val: string): boolean {
    const v = assessment[field];
    return Array.isArray(v) ? v.includes(val) : v === val;
  }

  function stageValid(): boolean {
    const a = assessment;
    if (stage === 1) return !!a.domain;
    if (stage === 2) return !!(a.processType && a.frequency && a.people && a.duration);
    if (stage === 3) return !!(a.rating && a.timeLost.length > 0 && a.workStyle);
    if (stage === 4) return !!(a.processOwner && a.approvalStyle && a.whenWrong);
    if (stage === 5) return !!(a.painPoints.length > 0 && a.businessImpact);
    if (stage === 6) return !!(a.automationDiscussed && a.hasSops && a.changeAppetite);
    return true;
  }

  function goStage(n: number) {
    setStage(n);
    window.scrollTo(0, 0);
  }

  function submit() {
    setAssessment(prev => ({ ...prev, status: "submitted", submittedAt: new Date().toISOString() }));
    setView("complete");
    window.scrollTo(0, 0);
  }

  // WELCOME
  if (view === "welcome") {
    return (
      <div className="min-h-screen bg-ecm-green text-white font-barlow">
        <div className="border-b border-white/10">
          <div className="max-w-3xl mx-auto px-6 py-4">
            <Link href="/assessments" className="text-xs font-barlow font-bold text-ecm-lime tracking-widest uppercase hover:text-ecm-lime/80 transition-colors">
              ← Assessments
            </Link>
          </div>
        </div>
        <div className="max-w-xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-ecm-lime/10 border border-ecm-lime/25 text-ecm-lime text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-8">
            ECM.dev · Process Assessment
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">Break down how your process really works</h1>
          <p className="text-white/60 text-base leading-relaxed mb-4">
            Map a key process in your organisation — where it runs well, where it gets stuck, and how ready it is for improvement. No sign-up required.
          </p>
          <p className="text-white/60 text-sm leading-relaxed mb-4">
            When you&apos;re done, you can save your results via email or a shareable link. If you choose to work with ECM.dev, your completed assessment becomes a ready-made diagnostic — giving your consultant a head start before the first conversation.
          </p>
          <p className="text-white/40 text-sm mb-10">
            Takes around <strong className="text-white/80">10–15 minutes</strong>. No wrong answers — just honest ones.
          </p>
          <div className="grid grid-cols-3 gap-4 mb-6 text-center">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="text-2xl font-black text-ecm-lime">6</div>
              <div className="text-xs text-white/40 mt-1">Short sections</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="text-2xl font-black text-ecm-lime">~15</div>
              <div className="text-xs text-white/40 mt-1">Minutes</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="text-2xl font-black text-ecm-lime">1</div>
              <div className="text-xs text-white/40 mt-1">Process at a time</div>
            </div>
          </div>
          <p className="text-white/30 text-xs mb-10">
            Your responses are processed in accordance with GDPR. No personal data is collected unless you choose to provide it at the end. Results are never shared with third parties.
          </p>
          <button
            onClick={() => { setView("stage"); setStage(1); }}
            className="w-full bg-ecm-lime hover:bg-ecm-lime-hover text-ecm-green font-barlow font-bold font-bold py-4 rounded-xl transition-colors"
          >
            Start Assessment →
          </button>
        </div>
      </div>
    );
  }

  // BRIEF VIEW
  if (view === "brief") {
    return (
      <div className="min-h-screen bg-ecm-green text-white font-barlow">
        <BriefView assessment={assessment} onBack={() => setView("complete")} />
      </div>
    );
  }

  // COMPLETE VIEW
  if (view === "complete") {
    const flags = generateFlags(assessment);
    const critCount = flags.filter(f => f.type === "critical").length;
    const warnCount = flags.filter(f => f.type === "warning").length;

    return (
      <div className="min-h-screen bg-ecm-green text-white font-barlow">
        <div className="border-b border-white/10">
          <div className="max-w-3xl mx-auto px-6 py-4">
            <div className="text-xs font-bold text-ecm-lime tracking-widest uppercase">Assessment Complete</div>
          </div>
        </div>
        <div className="max-w-xl mx-auto px-6 py-16 text-center">
          <div className="text-5xl mb-6">✓</div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-3">Your assessment is ready.</h1>
          <p className="text-white/60 mb-8">Review your pre-diagnostic brief below, or book your discovery call.</p>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left mb-8 space-y-3">
            <div className="text-xs font-bold text-white/60 uppercase tracking-wide mb-3">What happens next</div>
            <div className="flex gap-3 text-sm"><span className="text-ecm-lime font-bold">1.</span><span className="text-white/80">Review your pre-diagnostic brief to see what we found.</span></div>
            <div className="flex gap-3 text-sm"><span className="text-ecm-lime font-bold">2.</span><span className="text-white/80">Optionally, add your details below to email yourself the results or share a link.</span></div>
            <div className="flex gap-3 text-sm"><span className="text-ecm-lime font-bold">3.</span><span className="text-white/80">Book a discovery call — your consultant will review the brief before your first conversation.</span></div>
          </div>
          {(critCount > 0 || warnCount > 0) && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left mb-6">
              <div className="text-xs font-bold text-white/60 uppercase tracking-wide mb-2">Headline signals</div>
              {critCount > 0 && <div className="text-sm text-red-400 font-semibold">{critCount} critical flag{critCount > 1 ? "s" : ""} identified</div>}
              {warnCount > 0 && <div className="text-sm text-yellow-400 font-semibold mt-1">{warnCount} warning{warnCount > 1 ? "s" : ""} to discuss</div>}
            </div>
          )}
          <button
            onClick={() => setView("brief")}
            className="w-full bg-ecm-lime hover:bg-ecm-lime-hover text-ecm-green font-barlow font-bold py-3.5 rounded-xl text-sm transition-colors mb-3"
          >
            View Pre-Diagnostic Brief →
          </button>
          <Link
            href="/contact"
            className="block w-full bg-white/10 hover:bg-white/15 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors text-center mb-8"
          >
            Book a discovery call
          </Link>

          {/* Optional contact capture */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left">
            <div className="text-xs font-bold text-white/60 uppercase tracking-wide mb-1">Optional</div>
            <div className="text-sm font-semibold text-white mb-1">Want to save or share your results?</div>
            <p className="text-xs text-white/40 mb-4">Add your details to email yourself the brief or generate a shareable link.</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-barlow font-semibold text-white/60 uppercase tracking-wide mb-1.5">Name</label>
                <input
                  value={assessment.name}
                  onChange={e => pick("name", e.target.value)}
                  placeholder="e.g. Sarah Brennan"
                  className="w-full bg-white/5 border border-white/20 focus:border-ecm-lime outline-none rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-barlow font-semibold text-white/60 uppercase tracking-wide mb-1.5">Role</label>
                <input
                  value={assessment.role}
                  onChange={e => pick("role", e.target.value)}
                  placeholder="e.g. Operations Manager"
                  className="w-full bg-white/5 border border-white/20 focus:border-ecm-lime outline-none rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm transition-colors"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-barlow font-semibold text-white/60 uppercase tracking-wide mb-1.5">Organisation</label>
                <input
                  value={assessment.company}
                  onChange={e => pick("company", e.target.value)}
                  placeholder="e.g. Acme Corporation"
                  className="w-full bg-white/5 border border-white/20 focus:border-ecm-lime outline-none rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-barlow font-semibold text-white/60 uppercase tracking-wide mb-1.5">Email</label>
                <input
                  value={assessment.email}
                  onChange={e => pick("email", e.target.value)}
                  placeholder="e.g. sarah@acme.com"
                  type="email"
                  className="w-full bg-white/5 border border-white/20 focus:border-ecm-lime outline-none rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm transition-colors"
                />
              </div>
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
              <span className="text-xs text-white/50 leading-relaxed">
                I consent to ECM.dev storing the information I have provided above for the purpose of sending me my assessment results and, if applicable, supporting a future engagement. Your data is handled in accordance with GDPR and our{" "}
                <Link href="/privacy" className="text-ecm-lime underline hover:text-ecm-lime/80">privacy policy</Link>.
                We will never share your information with third parties.
              </span>
            </label>
            {/* Save / Share actions */}
            <div className={`grid grid-cols-2 gap-3 mt-4 transition-opacity ${consentGiven && assessment.email.trim() ? "opacity-100" : "opacity-30 pointer-events-none"}`}>
              <button
                onClick={handleEmailResults}
                disabled={saving}
                className="bg-ecm-lime hover:bg-ecm-lime-hover text-ecm-green font-barlow font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-50"
              >
                {saving ? "Saving…" : submissionId ? "View saved results" : "Email my results"}
              </button>
              <button
                onClick={handleCopyLink}
                disabled={saving}
                className="bg-white/10 hover:bg-white/15 text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-50"
              >
                {saving ? "Saving…" : "Copy shareable link"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STAGE VIEW
  const valid = stageValid();
  const isLast = stage === 6;

  return (
    <div className="min-h-screen bg-ecm-green text-white font-barlow">
      {/* Honeypot — bot trap */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
        <label>
          Leave empty
          <input type="text" name="_hp" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
        </label>
      </div>
      {/* Topbar */}
      <div className="border-b border-white/10 sticky top-0 bg-ecm-green z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => stage > 1 ? goStage(stage - 1) : setView("welcome")}
              className="text-white/40 hover:text-white text-sm transition-colors"
            >
              ← Back
            </button>
            <div>
              <div className="text-xs font-bold text-ecm-lime tracking-widest uppercase">ecm.dev</div>
              <div className="text-sm font-semibold text-white">Section {stage} of 6</div>
            </div>
          </div>
          {assessment.company && <span className="text-xs text-white/30">{assessment.company}</span>}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 pb-24">
        <ProgressBar stage={stage} />

        {/* STAGE 1 — About you */}
        {stage === 1 && (
          <div className="space-y-6">
            <QLabel label="Which department owns this process?" hint="Select the area that best describes where this process sits." />
            <div className="grid grid-cols-2 gap-2">
              {DOMAINS.map(d => (
                <SingleOpt key={d.v} selected={isSelected("domain", d.v)} onSelect={() => pick("domain", d.v)} label={d.l} />
              ))}
            </div>
          </div>
        )}

        {/* STAGE 2 — Process basics */}
        {stage === 2 && (
          <div className="space-y-8">
            <div>
              <QLabel label="Which of these best describes the process you're assessing?" hint="Choose the one that fits closest. You'll have a chance to add detail later." />
              <div className="grid grid-cols-3 gap-3">
                {PROCESS_TYPES.map(p => (
                  <SingleOpt key={p.v} selected={isSelected("processType", p.v)} onSelect={() => pick("processType", p.v)} label={p.l} desc={p.d} icon={p.icon} />
                ))}
              </div>
            </div>
            <div>
              <QLabel label="How often does this process run?" />
              <div className="grid grid-cols-3 gap-2">
                {FREQUENCIES.map(f => (
                  <SingleOpt key={f.v} selected={isSelected("frequency", f.v)} onSelect={() => pick("frequency", f.v)} label={f.l} />
                ))}
              </div>
            </div>
            <div>
              <QLabel label="Roughly how many people are typically involved?" hint="Count everyone who touches this process — not just the person who starts it." />
              <div className="grid grid-cols-2 gap-3">
                {PEOPLE.map(p => (
                  <SingleOpt key={p.v} selected={isSelected("people", p.v)} onSelect={() => pick("people", p.v)} label={p.l} desc={p.d} />
                ))}
              </div>
            </div>
            <div>
              <QLabel label="How long does it take from start to finish?" hint="Think about an average run — not the best case or worst case." />
              <div className="grid grid-cols-2 gap-2">
                {DURATIONS.map(d => (
                  <SingleOpt key={d.v} selected={isSelected("duration", d.v)} onSelect={() => pick("duration", d.v)} label={d.l} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STAGE 3 — Current state */}
        {stage === 3 && (
          <div className="space-y-8">
            <div>
              <QLabel label="How would you honestly rate the current state of this process?" />
              <div className="grid grid-cols-2 gap-3">
                {RATINGS.map(r => (
                  <SingleOpt key={r.v} selected={isSelected("rating", r.v)} onSelect={() => pick("rating", r.v)} label={r.l} desc={r.d} col={r.col} />
                ))}
              </div>
            </div>
            <div>
              <QLabel label="Where does time most often get lost?" hint="Select everything that applies." />
              <div className="grid grid-cols-2 gap-2">
                {TIME_LOST.map(t => (
                  <MultiOpt key={t.v} selected={isSelected("timeLost", t.v)} onToggle={() => toggle("timeLost", t.v)} label={t.l} desc={t.d} />
                ))}
              </div>
            </div>
            <div>
              <QLabel label="How is most of the work in this process carried out?" />
              <div className="space-y-2">
                {WORK_STYLES.map(w => (
                  <SingleOpt key={w.v} selected={isSelected("workStyle", w.v)} onSelect={() => pick("workStyle", w.v)} label={w.l} desc={w.d} />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-barlow font-semibold text-white/60 uppercase tracking-wide mb-1.5">
                Which systems or tools are mainly used? <span className="text-white/30 normal-case font-normal">(Optional)</span>
              </label>
              <input
                value={assessment.systemsUsed}
                onChange={e => pick("systemsUsed", e.target.value)}
                placeholder="e.g. SAP, Excel, Salesforce, email"
                className="w-full bg-white/5 border border-white/20 focus:border-ecm-lime outline-none rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm transition-colors"
              />
            </div>
          </div>
        )}

        {/* STAGE 4 — Ownership */}
        {stage === 4 && (
          <div className="space-y-8">
            <div>
              <QLabel label="Is there a clear, named person or role accountable for this process?" />
              <div className="space-y-2">
                {OWNER_OPTIONS.map(o => (
                  <SingleOpt key={o.v} selected={isSelected("processOwner", o.v)} onSelect={() => pick("processOwner", o.v)} label={o.l} desc={o.d} />
                ))}
              </div>
            </div>
            <div>
              <QLabel label="How are approvals and key decisions handled within this process?" />
              <div className="grid grid-cols-2 gap-3">
                {APPROVAL_OPTIONS.map(o => (
                  <SingleOpt key={o.v} selected={isSelected("approvalStyle", o.v)} onSelect={() => pick("approvalStyle", o.v)} label={o.l} desc={o.d} />
                ))}
              </div>
            </div>
            <div>
              <QLabel label="When something goes wrong or gets stuck, what typically happens?" />
              <div className="grid grid-cols-2 gap-3">
                {WRONG_OPTIONS.map(o => (
                  <SingleOpt key={o.v} selected={isSelected("whenWrong", o.v)} onSelect={() => pick("whenWrong", o.v)} label={o.l} desc={o.d} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STAGE 5 — Pain & impact */}
        {stage === 5 && (
          <div className="space-y-8">
            <div>
              <QLabel label="Which of these describe your current process?" hint="Select all that apply — honesty here leads to the most useful brief." />
              <div className="grid grid-cols-2 gap-2">
                {PAIN_OPTIONS.map(p => (
                  <MultiOpt key={p.v} selected={isSelected("painPoints", p.v)} onToggle={() => toggle("painPoints", p.v)} label={p.l} />
                ))}
              </div>
            </div>
            <div>
              <QLabel label="What is the overall business impact of these issues?" />
              <div className="grid grid-cols-2 gap-3">
                {IMPACT_OPTIONS.map(o => (
                  <SingleOpt key={o.v} selected={isSelected("businessImpact", o.v)} onSelect={() => pick("businessImpact", o.v)} label={o.l} desc={o.d} col={o.col} />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-barlow font-semibold text-white/60 uppercase tracking-wide mb-1.5">
                Anything else you&apos;d like the consultant to know? <span className="text-white/30 normal-case font-normal">(Optional)</span>
              </label>
              <textarea
                value={assessment.notes}
                onChange={e => pick("notes", e.target.value)}
                rows={3}
                placeholder="Context, history, previous attempts to fix this, specific concerns..."
                className="w-full bg-white/5 border border-white/20 focus:border-ecm-lime outline-none rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm transition-colors"
              />
            </div>
          </div>
        )}

        {/* STAGE 6 — Readiness */}
        {stage === 6 && (
          <div className="space-y-8">
            <div>
              <QLabel label="Has your organisation discussed automating or improving this process?" />
              <div className="space-y-2">
                {AUTO_OPTIONS.map(o => (
                  <SingleOpt key={o.v} selected={isSelected("automationDiscussed", o.v)} onSelect={() => pick("automationDiscussed", o.v)} label={o.l} desc={o.d} />
                ))}
              </div>
            </div>
            <div>
              <QLabel label="Do you have documented process guidelines or standard operating procedures (SOPs)?" />
              <div className="space-y-2">
                {SOP_OPTIONS.map(o => (
                  <SingleOpt key={o.v} selected={isSelected("hasSops", o.v)} onSelect={() => pick("hasSops", o.v)} label={o.l} desc={o.d} />
                ))}
              </div>
            </div>
            <div>
              <QLabel label="How would you describe your team's appetite for change?" />
              <div className="grid grid-cols-2 gap-3">
                {APPETITE_OPTIONS.map(o => (
                  <SingleOpt key={o.v} selected={isSelected("changeAppetite", o.v)} onSelect={() => pick("changeAppetite", o.v)} label={o.l} desc={o.d} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Nav buttons */}
        <button
          onClick={() => isLast ? submit() : goStage(stage + 1)}
          disabled={!valid}
          className={`w-full mt-8 py-4 rounded-xl font-semibold text-sm transition-colors ${valid ? "bg-ecm-lime hover:bg-ecm-lime-hover text-ecm-green font-barlow font-bold" : "bg-white/10 text-white/30 cursor-not-allowed"}`}
        >
          {isLast ? "Submit Assessment →" : "Continue →"}
        </button>
        {stage > 1 && (
          <button
            onClick={() => goStage(stage - 1)}
            className="w-full mt-2 py-3 rounded-xl font-semibold text-sm border border-white/20 hover:border-white/30 text-white/60 hover:text-white transition-colors"
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}

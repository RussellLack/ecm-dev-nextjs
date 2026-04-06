"use client";

/**
 * LeadMagnetAssessment.tsx
 * ECM.dev — Lead Magnet Ideation & Capability Gap Tool
 *
 * Self-contained client component. No external chart libraries required —
 * uses a pure SVG radar chart. Drop into any Next.js App Router page.
 */

import { useState } from "react";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface Option {
  id: string;
  label: string;
  desc: string;
}

interface Format {
  id: string;
  name: string;
  icon: string;
  description: string;
  effort: string;
  timeToCreate: string;
  topicTemplate: string;
  topicExamples: string[];
  capabilityRequirements: Record<string, number>;
  bestMarkets: string[];
  bestBuyers: string[];
  bestValues: string[];
  bestIP: string[];
  bestLeadership: string[];
  score?: number;
  gaps?: Gap[];
}

interface Gap {
  dimension: string;
  current: number;
  required: number;
  gap: number;
}

interface Answers {
  marketType: string | null;
  buyerType: string | null;
  coreValue: string | null;
  thoughtLeadership: string | null;
  proprietaryIP: string | null;
  uniqueValue: string | null;
  competition: string | null;
}

type Capabilities = Record<string, number>;

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const MARKET_TYPES: Option[] = [
  { id: "b2b_services", label: "B2B Services", desc: "Consulting, agencies, professional services" },
  { id: "b2b_products", label: "B2B Products / SaaS", desc: "Software, platforms, data products" },
  { id: "agency", label: "Agency / Managed Services", desc: "Delivering work on behalf of clients" },
  { id: "b2c", label: "B2C", desc: "Direct-to-consumer products or services" },
  { id: "mixed", label: "Mixed B2B & B2C", desc: "You serve both business and consumer audiences" },
];

const BUYER_TYPES: Option[] = [
  { id: "c_suite", label: "C-Suite / Founders", desc: "CEO, CMO, CTO, Managing Directors" },
  { id: "marketing", label: "Marketing & Comms", desc: "Marketing managers, content leads, brand teams" },
  { id: "operations", label: "Operations & IT", desc: "Ops, IT, procurement, transformation leads" },
  { id: "product", label: "Product & Innovation", desc: "Product managers, R&D, digital teams" },
  { id: "consumer", label: "Individual Consumers", desc: "End-users purchasing for themselves" },
];

const CORE_VALUES: Option[] = [
  { id: "revenue", label: "Revenue Growth", desc: "Drive more leads, pipeline, and sales" },
  { id: "efficiency", label: "Efficiency & Productivity", desc: "Save time, reduce friction, streamline work" },
  { id: "brand", label: "Brand & Thought Leadership", desc: "Build credibility, visibility, and authority" },
  { id: "risk", label: "Risk & Compliance", desc: "Reduce exposure, ensure governance" },
  { id: "transformation", label: "Capability & Transformation", desc: "Build skills, change culture, drive adoption" },
  { id: "cost", label: "Cost Reduction", desc: "Cut spend, improve margins, do more with less" },
];

const THOUGHT_LEADERSHIP_STATES: Option[] = [
  { id: "active", label: "Actively publishing", desc: "Regular blog, newsletter, talks, or podcast output" },
  { id: "occasional", label: "Occasional content", desc: "Publish now and then — no consistent cadence" },
  { id: "internal", label: "Mostly internal", desc: "Great content shared internally, not yet public" },
  { id: "none", label: "Very little so far", desc: "Little to no public-facing thought leadership" },
];

const PROPRIETARY_IP: Option[] = [
  { id: "strong", label: "Yes — distinct frameworks or original data", desc: "You have proprietary methodologies, research, or approaches" },
  { id: "some", label: "Some — adaptations of known frameworks", desc: "You put your own spin on established thinking" },
  { id: "potential", label: "Not yet, but the raw material is there", desc: "Client work contains insight not yet systematised" },
  { id: "none", label: "Primarily applying established best practice", desc: "You deliver proven approaches with strong execution" },
];

const UNIQUE_VALUE: Option[] = [
  { id: "expertise", label: "Deep expertise & judgment", desc: "Clients come for your knowledge and strategic insight" },
  { id: "systems", label: "Systems & operational rigour", desc: "You bring order, structure, and scalable processes" },
  { id: "speed", label: "Speed & reliable delivery", desc: "You execute fast and consistently" },
  { id: "innovation", label: "Innovation & fresh thinking", desc: "You bring new ideas and challenge convention" },
  { id: "relationship", label: "Trust & long-term partnership", desc: "Valued for how you work, not just what you produce" },
];

const COMPETITION_LEVEL: Option[] = [
  { id: "very_crowded", label: "Highly crowded", desc: "Everyone is producing similar content and lead magnets" },
  { id: "moderate", label: "Moderately competitive", desc: "A few players publish well, most don't" },
  { id: "open", label: "Relatively open", desc: "Few competitors publish strong thought leadership" },
  { id: "niche", label: "Niche / specialist", desc: "Very focused space with small but specific audience" },
];

const CAPABILITY_DIMENSIONS = [
  { id: "writing", label: "Writing & Communication", shortLabel: "Writing", desc: "Producing clear, compelling written content" },
  { id: "research", label: "Research & Data Synthesis", shortLabel: "Research", desc: "Gathering, analysing, and presenting data-backed insight" },
  { id: "design", label: "Design & Visual Production", shortLabel: "Design", desc: "Creating visual assets, layouts, and graphics" },
  { id: "video", label: "Video & Audio", shortLabel: "Video", desc: "Recording, editing, and presenting on camera or mic" },
  { id: "technical", label: "Technical Build", shortLabel: "Technical", desc: "Building interactive tools, calculators, or digital experiences" },
  { id: "distribution", label: "Distribution & Reach", shortLabel: "Distrib.", desc: "Getting content in front of the right audience at scale" },
];

const FORMATS: Format[] = [
  {
    id: "guide",
    name: "Definitive Guide",
    icon: "📘",
    description: "An in-depth, authoritative resource that becomes the go-to reference in your space",
    effort: "High",
    timeToCreate: "2–4 weeks",
    topicTemplate: "The Complete [Market] Guide to [Outcome]",
    topicExamples: ["The Content Ops Guide to AI-Ready Workflows", "The B2B Guide to Localisation at Scale"],
    capabilityRequirements: { writing: 4, research: 3, design: 2, video: 1, technical: 1, distribution: 3 },
    bestMarkets: ["b2b_services", "agency", "b2b_products"],
    bestBuyers: ["c_suite", "marketing", "operations"],
    bestValues: ["brand", "transformation", "revenue"],
    bestIP: ["strong", "some"],
    bestLeadership: ["active", "occasional"],
  },
  {
    id: "framework",
    name: "Proprietary Framework or Canvas",
    icon: "🗺️",
    description: "A visual model or structured approach that positions you as a category originator",
    effort: "Medium",
    timeToCreate: "1–2 weeks",
    topicTemplate: "The [Brand] [Function] Framework",
    topicExamples: ["The ECM Content Operating System Canvas", "The 4-Layer B2B Content Architecture"],
    capabilityRequirements: { writing: 3, research: 3, design: 3, video: 1, technical: 1, distribution: 3 },
    bestMarkets: ["b2b_services", "agency", "b2b_products"],
    bestBuyers: ["c_suite", "marketing", "operations", "product"],
    bestValues: ["brand", "transformation", "efficiency"],
    bestIP: ["strong", "some", "potential"],
    bestLeadership: ["active", "occasional", "internal"],
  },
  {
    id: "benchmark",
    name: "Benchmark Report / Research Study",
    icon: "📊",
    description: "Original data revealing where the market stands — instantly shareable and highly credible",
    effort: "High",
    timeToCreate: "4–8 weeks",
    topicTemplate: "The State of [Industry/Function] [Year] Report",
    topicExamples: ["The State of Content Operations 2025", "Enterprise Localisation Maturity Benchmark"],
    capabilityRequirements: { writing: 4, research: 5, design: 3, video: 1, technical: 2, distribution: 4 },
    bestMarkets: ["b2b_services", "b2b_products", "agency"],
    bestBuyers: ["c_suite", "marketing"],
    bestValues: ["brand", "revenue"],
    bestIP: ["strong", "some"],
    bestLeadership: ["active", "occasional"],
  },
  {
    id: "checklist",
    name: "Checklist or Template",
    icon: "✅",
    description: "A highly actionable tool that helps your audience do something specific, right now",
    effort: "Low",
    timeToCreate: "3–5 days",
    topicTemplate: "The [Audience] [X-Step] Checklist for [Task]",
    topicExamples: ["The 12-Step Content Audit Checklist", "AI Content Governance Starter Template"],
    capabilityRequirements: { writing: 2, research: 2, design: 2, video: 1, technical: 1, distribution: 2 },
    bestMarkets: ["b2b_services", "b2b_products", "agency", "b2c", "mixed"],
    bestBuyers: ["marketing", "operations", "product"],
    bestValues: ["efficiency", "revenue", "cost"],
    bestIP: ["some", "potential", "none"],
    bestLeadership: ["active", "occasional", "internal", "none"],
  },
  {
    id: "email_course",
    name: "Email Mini-Course",
    icon: "✉️",
    description: "A 5–7 part sequence that delivers value over days, building relationship and trust",
    effort: "Medium",
    timeToCreate: "1–2 weeks",
    topicTemplate: "[Outcome] in 5 Days: A Free Email Course",
    topicExamples: ["Content Strategy in 5 Days", "Build Your First AI Content Workflow: Free 7-Day Course"],
    capabilityRequirements: { writing: 4, research: 2, design: 1, video: 1, technical: 2, distribution: 3 },
    bestMarkets: ["b2b_services", "b2b_products", "b2c", "agency"],
    bestBuyers: ["marketing", "c_suite", "consumer"],
    bestValues: ["transformation", "brand", "revenue"],
    bestIP: ["some", "potential", "none"],
    bestLeadership: ["occasional", "internal", "none"],
  },
  {
    id: "video_training",
    name: "Video Training / Masterclass",
    icon: "🎬",
    description: "A focused video session that demonstrates your expertise and personal authority",
    effort: "High",
    timeToCreate: "1–3 weeks",
    topicTemplate: "Free Masterclass: [Outcome] in 60 Minutes",
    topicExamples: ["Free Masterclass: How to Build a Content Operating System", "60-Minute AI Content Strategy Bootcamp"],
    capabilityRequirements: { writing: 2, research: 2, design: 2, video: 4, technical: 2, distribution: 3 },
    bestMarkets: ["b2b_services", "agency", "b2c"],
    bestBuyers: ["c_suite", "marketing", "consumer"],
    bestValues: ["transformation", "brand"],
    bestIP: ["strong", "some"],
    bestLeadership: ["active"],
  },
  {
    id: "tool",
    name: "ROI Calculator or Interactive Tool",
    icon: "🔧",
    description: "A data-driven interactive that helps buyers quantify the value of your approach",
    effort: "High",
    timeToCreate: "2–4 weeks",
    topicTemplate: "Calculate Your [Outcome] ROI",
    topicExamples: ["Content ROI Calculator", "Cost of Content Chaos: What Inefficiency Is Costing You"],
    capabilityRequirements: { writing: 2, research: 3, design: 2, video: 1, technical: 4, distribution: 2 },
    bestMarkets: ["b2b_products", "b2b_services"],
    bestBuyers: ["c_suite", "operations", "product"],
    bestValues: ["efficiency", "cost", "revenue", "risk"],
    bestIP: ["strong", "some"],
    bestLeadership: ["active", "occasional"],
  },
  {
    id: "case_study",
    name: "Case Study Pack",
    icon: "💼",
    description: "A set of client stories that build social proof and demonstrate real-world results",
    effort: "Medium",
    timeToCreate: "1–2 weeks",
    topicTemplate: "How [Client Type] Achieved [Result]: [N] Case Studies",
    topicExamples: ["How Mid-Market Teams Cut Content Production Time by 40%: 3 Case Studies"],
    capabilityRequirements: { writing: 4, research: 2, design: 2, video: 1, technical: 1, distribution: 2 },
    bestMarkets: ["b2b_services", "agency"],
    bestBuyers: ["c_suite", "marketing"],
    bestValues: ["revenue", "brand", "transformation"],
    bestIP: ["strong", "some", "potential"],
    bestLeadership: ["active", "occasional", "internal"],
  },
  {
    id: "swipe_file",
    name: "Swipe File or Resource Library",
    icon: "📁",
    description: "A curated collection of examples, tools, or templates for a specific problem",
    effort: "Low–Medium",
    timeToCreate: "3–7 days",
    topicTemplate: "The [Audience] [Function] Swipe File",
    topicExamples: ["The Content Strategist's AI Prompt Swipe File", "30 B2B Content Templates That Convert"],
    capabilityRequirements: { writing: 2, research: 3, design: 2, video: 1, technical: 1, distribution: 2 },
    bestMarkets: ["b2b_services", "agency", "b2b_products", "mixed"],
    bestBuyers: ["marketing", "product", "operations"],
    bestValues: ["efficiency", "revenue"],
    bestIP: ["potential", "none", "some"],
    bestLeadership: ["occasional", "internal", "none"],
  },
  {
    id: "assessment",
    name: "Assessment or Maturity Quiz",
    icon: "📋",
    description: "An interactive quiz that helps prospects benchmark where they are — and where they need to go",
    effort: "Medium",
    timeToCreate: "1–2 weeks",
    topicTemplate: "How [Ready/Mature/Effective] Is Your [Function]? Take the Assessment",
    topicExamples: ["Content Operations Maturity Assessment", "Is Your Content Stack AI-Ready? Find Out in 10 Questions"],
    capabilityRequirements: { writing: 3, research: 3, design: 2, video: 1, technical: 3, distribution: 3 },
    bestMarkets: ["b2b_services", "b2b_products", "agency"],
    bestBuyers: ["c_suite", "marketing", "operations"],
    bestValues: ["transformation", "brand", "efficiency"],
    bestIP: ["strong", "some", "potential"],
    bestLeadership: ["active", "occasional"],
  },
];

const GAP_ACTIONS: Record<string, string[]> = {
  "Writing & Communication": [
    "Commit to one weekly 400-word reflection on a client problem — it compounds fast",
    "Use AI drafting tools to accelerate your first full guide, then edit with your voice",
    "Bring in a content writer or editor for the first production run; own the IP, delegate the craft",
  ],
  "Research & Data Synthesis": [
    "Run a 20-question survey with existing clients — you already have the relationships",
    "Partner with an industry body or analyst to co-produce a benchmark study",
    "Synthesise client feedback and project learnings into a proprietary insight report",
  ],
  "Design & Visual Production": [
    "Start with Canva Pro or a Figma template — professional enough for a launch",
    "Hire a freelance designer for layout only; you supply the content and brief",
    "Constrain the palette: one brand colour, clean type, white space. Simple beats complex.",
  ],
  "Video & Audio": [
    "Start audio-only (podcast-style Loom or Riverside.fm) — removes camera anxiety immediately",
    "Use a teleprompter app and a decent USB mic; gear matters less than content",
    "Partner with a video studio for your flagship piece; record a library of supporting clips in one session",
  ],
  "Technical Build": [
    "Use Typeform or Tally for interactive assessments — no code, looks great",
    "Use Notion, Carrd, or Framer for simple tool delivery",
    "Commission a developer for custom interactive builds; scope it tightly to one core function",
  ],
  "Distribution & Reach": [
    "Run a 30-day LinkedIn content sprint before launch to build an audience for the drop",
    "Partner with a complementary brand for co-promotion — double the reach, split the effort",
    "Build your email list through your existing network first; warm audiences always convert better",
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// SCORING ENGINE
// ─────────────────────────────────────────────────────────────────────────────

function scoreFormats(answers: Answers, capabilities: Capabilities): Format[] {
  return FORMATS.map((format) => {
    let score = 0;

    if (answers.marketType && format.bestMarkets.includes(answers.marketType)) score += 18;
    if (answers.buyerType && format.bestBuyers.includes(answers.buyerType)) score += 14;
    if (answers.coreValue && format.bestValues.includes(answers.coreValue)) score += 14;
    if (answers.proprietaryIP && format.bestIP.includes(answers.proprietaryIP)) score += 10;
    if (answers.thoughtLeadership && format.bestLeadership?.includes(answers.thoughtLeadership)) score += 8;

    if (answers.competition === "open" && ["guide", "benchmark", "framework"].includes(format.id)) score += 10;
    if (answers.competition === "very_crowded" && ["tool", "assessment", "framework"].includes(format.id)) score += 10;

    CAPABILITY_DIMENSIONS.forEach((dim) => {
      const have = capabilities[dim.id] || 1;
      const need = format.capabilityRequirements[dim.id];
      if (have >= need) {
        score += 8;
      } else {
        score -= (need - have) * 4;
      }
    });

    const gaps: Gap[] = CAPABILITY_DIMENSIONS.map((dim) => ({
      dimension: dim.label,
      current: capabilities[dim.id] || 1,
      required: format.capabilityRequirements[dim.id],
      gap: Math.max(0, format.capabilityRequirements[dim.id] - (capabilities[dim.id] || 1)),
    })).filter((g) => g.gap > 0);

    return { ...format, score, gaps };
  }).sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}

function getReadinessScore(capabilities: Capabilities, topFormat: Format | undefined): number {
  if (!topFormat) return 50;
  const totalRequired = Object.values(topFormat.capabilityRequirements).reduce((a, b) => a + b, 0);
  const totalHave = CAPABILITY_DIMENSIONS.reduce((acc, dim) => {
    return acc + Math.min(capabilities[dim.id] || 1, topFormat.capabilityRequirements[dim.id]);
  }, 0);
  return Math.round((totalHave / totalRequired) * 100);
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG RADAR CHART
// ─────────────────────────────────────────────────────────────────────────────

function RadarChart({ capabilities }: { capabilities: Capabilities }) {
  const cx = 140, cy = 140, r = 95;
  const n = CAPABILITY_DIMENSIONS.length;

  const pt = (i: number, val: number): [number, number] => {
    const angle = (2 * Math.PI * i / n) - Math.PI / 2;
    const rv = (val / 5) * r;
    return [cx + rv * Math.cos(angle), cy + rv * Math.sin(angle)];
  };

  const rings = [1, 2, 3, 4, 5];

  const ringPath = (val: number) => {
    return CAPABILITY_DIMENSIONS.map((_, i) => {
      const [x, y] = pt(i, val);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(" ") + " Z";
  };

  const dataPath = CAPABILITY_DIMENSIONS.map((dim, i) => {
    const [x, y] = pt(i, capabilities[dim.id] || 1);
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ") + " Z";

  return (
    <svg viewBox="0 0 280 280" className="w-full max-w-xs mx-auto">
      {/* Grid rings */}
      {rings.map((v) => (
        <path key={v} d={ringPath(v)} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      ))}
      {/* Axes */}
      {CAPABILITY_DIMENSIONS.map((_, i) => {
        const [x, y] = pt(i, 5);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />;
      })}
      {/* Data polygon */}
      <path d={dataPath} fill="#AAF870" fillOpacity={0.25} stroke="#AAF870" strokeWidth={2} />
      {/* Labels */}
      {CAPABILITY_DIMENSIONS.map((dim, i) => {
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

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function SectionHeader({ step, title, subtitle }: { step: string; title: string; subtitle: string }) {
  return (
    <div className="space-y-2">
      <div className="text-xs text-ecm-lime font-semibold uppercase tracking-widest">Section {step}</div>
      <h2 className="text-2xl font-extrabold tracking-tight">{title}</h2>
      <p className="text-white/60 text-sm leading-relaxed">{subtitle}</p>
    </div>
  );
}

function Question({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Option[];
  value: string | null;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="font-semibold text-sm text-white/60 leading-snug">{label}</p>
      <div className="space-y-2">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-150 ${
              value === opt.id
                ? "bg-ecm-lime border-ecm-lime text-ecm-green"
                : "bg-white/5 border-white/15 text-white/80 hover:border-white/30 hover:bg-white/10"
            }`}
          >
            <div className="font-semibold text-sm">{opt.label}</div>
            {opt.desc && (
              <div className={`text-xs mt-0.5 ${value === opt.id ? "text-ecm-lime/70" : "text-white/40"}`}>
                {opt.desc}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function CapabilitySlider({
  label,
  desc,
  value,
  onChange,
}: {
  label: string;
  desc: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const LABELS = ["Beginner", "Basic", "Competent", "Strong", "Expert"];
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="font-semibold text-sm text-white/60">{label}</p>
          <p className="text-xs text-white/40 mt-0.5">{desc}</p>
        </div>
        <span className="text-xs font-bold text-ecm-lime shrink-0 mt-0.5">{LABELS[value - 1]}</span>
      </div>
      <input
        type="range"
        min="1"
        max="5"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full accent-[#AAF870] cursor-pointer"
      />
      <div className="flex justify-between text-xs text-white/20">
        <span>Beginner</span>
        <span>Expert</span>
      </div>
    </div>
  );
}

function NavButtons({
  onBack,
  onNext,
  canNext,
}: {
  onBack: () => void;
  onNext: () => void;
  canNext: boolean;
}) {
  return (
    <div className="flex gap-3 pt-2">
      <button
        onClick={onBack}
        className="py-3 px-5 border border-white/20 text-white/40 rounded-full hover:border-white/40 hover:text-white/70 transition-colors text-sm"
      >
        ← Back
      </button>
      <button
        onClick={onNext}
        disabled={!canNext}
        className="flex-1 py-3 px-5 bg-ecm-lime hover:bg-ecm-lime-hover active:bg-ecm-lime-hover disabled:bg-white/10 disabled:text-white/30/30 text-ecm-green font-barlow font-bold rounded-full transition-colors text-sm"
      >
        Continue →
      </button>
    </div>
  );
}

function FormatCard({ format, rank }: { format: Format; rank: number }) {
  const [open, setOpen] = useState(rank === 0);
  const isBest = rank === 0;

  return (
    <div
      className={`border rounded-2xl overflow-hidden transition-all ${
        isBest ? "border-ecm-lime bg-white/5 bg-opacity-40" : "border-white/15 bg-white/5"
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left p-5 flex items-start gap-4"
      >
        <span className="text-2xl mt-0.5">{format.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {isBest && (
              <span className="text-xs bg-ecm-lime text-ecm-green font-barlow font-bold px-2 py-0.5 rounded-full font-semibold">
                Best fit
              </span>
            )}
            <span className="text-xs text-white/40">#{rank + 1}</span>
          </div>
          <p className="font-bold">{format.name}</p>
          <p className="text-sm text-white/60 mt-0.5">{format.description}</p>
        </div>
        <span className="text-white/30 text-sm mt-1 shrink-0">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-white/10 pt-4">
          <div className="flex gap-4 text-xs text-white/40">
            <span>Effort: <span className="text-white/80 font-medium">{format.effort}</span></span>
            <span>Time to create: <span className="text-white/80 font-medium">{format.timeToCreate}</span></span>
          </div>
          <div className="bg-black/20 rounded-xl p-4 space-y-2">
            <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">Topic template</p>
            <p className="text-sm text-ecm-lime/80 italic">&ldquo;{format.topicTemplate}&rdquo;</p>
          </div>
          {format.topicExamples && format.topicExamples.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">Example topics</p>
              {format.topicExamples.map((ex, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-white/80">
                  <span className="text-ecm-lime shrink-0">›</span>
                  <span className="italic">&ldquo;{ex}&rdquo;</span>
                </div>
              ))}
            </div>
          )}
          {format.gaps && format.gaps.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-white/40">Gaps to close:</span>
              {format.gaps.map((g) => (
                <span
                  key={g.dimension}
                  className="text-xs bg-yellow-950 border border-yellow-800 border-opacity-50 text-yellow-400 px-2 py-0.5 rounded-full"
                >
                  {g.dimension.split(" ")[0]}
                </span>
              ))}
            </div>
          )}
          {format.gaps && format.gaps.length === 0 && (
            <p className="text-xs text-green-400">✓ No significant capability gaps for this format</p>
          )}
        </div>
      )}
    </div>
  );
}

function Results({
  topThree,
  readiness,
  capabilities,
  email,
  setEmail,
  answers,
}: {
  topThree: Format[];
  readiness: number;
  capabilities: Capabilities;
  email: string;
  setEmail: (v: string) => void;
  answers: Answers;
}) {
  const [consentGiven, setConsentGiven] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const readinessColor =
    readiness >= 75 ? "text-green-400" : readiness >= 50 ? "text-yellow-400" : "text-orange-400";
  const readinessLabel =
    readiness >= 75 ? "Ready to build" : readiness >= 50 ? "Build with some support" : "Bridge key gaps first";

  const allGaps = [...(topThree[0]?.gaps || [])].sort((a, b) => b.gap - a.gap);
  const biggestGap = allGaps[0];

  async function saveSubmission(): Promise<string | null> {
    if (submissionId) return submissionId;
    setSaving(true);
    try {
      const resultsPayload = {
        topThree: topThree.map(f => ({
          id: f.id, name: f.name, icon: f.icon, description: f.description,
          effort: f.effort, timeToCreate: f.timeToCreate,
          topicTemplate: f.topicTemplate, topicExamples: f.topicExamples,
          score: f.score, gaps: f.gaps,
        })),
        readiness,
        readinessLabel,
        readinessColor,
        capabilities,
        capabilityDimensions: CAPABILITY_DIMENSIONS.map(d => ({
          id: d.id, label: d.label, shortLabel: d.shortLabel,
        })),
        biggestGap: biggestGap || null,
        gapActions: biggestGap ? (GAP_ACTIONS[biggestGap.dimension] || []) : [],
        allGaps,
      };

      const res = await fetch("/api/assessment/tool-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolType: "lead-magnet",
          answers,
          results: resultsPayload,
          contact: { name: "", email, role: "", company: "" },
          consentGiven,
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
      const url = `${window.location.origin}/assessment/lead-magnet/results?sid=${sid}`;
      await navigator.clipboard.writeText(url);
    }
  }

  async function handleEmailResults() {
    const sid = await saveSubmission();
    if (sid && email.trim()) {
      try {
        const res = await fetch("/api/assessment/tool-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ submissionId: sid, email: email.trim() }),
        });
        if (res.ok) {
          alert("Results sent to " + email.trim());
        } else {
          window.open(`/assessment/lead-magnet/results?sid=${sid}`, "_blank");
        }
      } catch {
        window.open(`/assessment/lead-magnet/results?sid=${sid}`, "_blank");
      }
    }
  }

  return (
    <div className="space-y-12">
      <div className="space-y-2">
        <div className="text-xs text-ecm-lime font-semibold uppercase tracking-widest">Your Results</div>
        <h2 className="text-3xl font-extrabold tracking-tight">Lead Magnet Analysis</h2>
      </div>

      {/* Readiness score */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Readiness Score</p>
            <p className={`text-6xl font-black tracking-tight ${readinessColor}`}>{readiness}%</p>
            <p className={`text-sm font-semibold mt-2 ${readinessColor}`}>{readinessLabel}</p>
          </div>
          <div className="text-right text-xs text-white/30 space-y-1 leading-relaxed">
            <p>Scored against your best-fit</p>
            <p>format&apos;s capability requirements</p>
          </div>
        </div>
      </div>

      {/* Top 3 formats */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">Your top 3 lead magnet formats</h3>
        <p className="text-sm text-white/40">Ranked and scored to your market position, IP level, and current capabilities.</p>
        {topThree.map((format, i) => (
          <FormatCard key={format.id} format={format} rank={i} />
        ))}
      </div>

      {/* Radar chart */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">Your capability profile</h3>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
          <RadarChart capabilities={capabilities} />
          <div className="grid grid-cols-1 gap-2">
            {CAPABILITY_DIMENSIONS.map((dim) => (
              <div key={dim.id} className="flex items-center justify-between text-xs">
                <span className="text-white/60">{dim.label}</span>
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div
                        key={n}
                        className={`w-2.5 h-2.5 rounded-sm ${n <= capabilities[dim.id] ? "bg-ecm-lime" : "bg-white/10"}`}
                      />
                    ))}
                  </div>
                  <span className="text-white/30 w-4 text-right">{capabilities[dim.id]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Priority gap */}
      {biggestGap && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Your priority gap to close</h3>
          <div className="bg-amber-500/10 border border-amber-400/30 rounded-2xl p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-lg text-amber-300">{biggestGap.dimension}</p>
                <p className="text-sm text-white/60 mt-1">
                  You&apos;re at {biggestGap.current}/5 · Your best-fit format needs {biggestGap.required}/5
                </p>
              </div>
              <span className="text-2xl">⚡</span>
            </div>
            <div className="space-y-3">
              <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">3 ways to close this gap</p>
              {(GAP_ACTIONS[biggestGap.dimension] || []).map((action, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-white/80">
                  <span className="text-amber-500 shrink-0 mt-0.5">→</span>
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Other gaps */}
      {topThree[0]?.gaps && topThree[0].gaps.length > 1 && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-white/80">Other gaps for your top format</h3>
          <div className="space-y-2">
            {topThree[0].gaps.slice(1).map((g) => (
              <div key={g.dimension} className="flex items-center justify-between text-sm bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <span className="text-white/60">{g.dimension}</span>
                <span className="text-white/30 text-xs">{g.current}/5 → need {g.required}/5</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save / Share */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <div>
          <div className="text-xs font-bold text-white/60 uppercase tracking-wide mb-1">Optional</div>
          <div className="text-sm font-semibold text-white mb-1">Want to save or share your results?</div>
          <p className="text-xs text-white/40 mb-4">Add your email to receive a copy of your recommendations or generate a shareable link.</p>
        </div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full bg-white/5 border border-white/20 focus:border-ecm-lime outline-none rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm transition-colors"
        />
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
        <div className={`grid grid-cols-2 gap-3 transition-opacity ${consentGiven && email.includes("@") && email.includes(".") ? "opacity-100" : "opacity-30 pointer-events-none"}`}>
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

      {/* CTA */}
      <div className="bg-white/5 border border-ecm-lime/20 border-opacity-50 rounded-2xl p-8 text-center space-y-5">
        <div className="text-3xl">◈</div>
        <h3 className="text-2xl font-extrabold">Want help building it?</h3>
        <p className="text-white/60 leading-relaxed">
          ECM.dev designs content operating systems — including the lead magnets, workflows,
          and AI-powered distribution that turn content into a consistent growth engine.
        </p>
        <Link
          href="/contact"
          className="inline-block bg-ecm-lime text-ecm-green font-barlow font-bold px-8 py-3.5 rounded-full hover:bg-ecm-lime-hover active:bg-white/5 transition-colors"
        >
          Talk to the team →
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const STEPS = ["welcome", "market", "authority", "capabilities", "context", "results"];

export default function LeadMagnetAssessment() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    marketType: null,
    buyerType: null,
    coreValue: null,
    thoughtLeadership: null,
    proprietaryIP: null,
    uniqueValue: null,
    competition: null,
  });
  const [capabilities, setCapabilities] = useState<Capabilities>({
    writing: 3,
    research: 3,
    design: 2,
    video: 2,
    technical: 2,
    distribution: 2,
  });
  const [email, setEmail] = useState("");

  const currentStep = STEPS[step];

  const setAnswer = (key: keyof Answers, val: string) =>
    setAnswers((prev) => ({ ...prev, [key]: val }));
  const setCap = (key: string, val: number) =>
    setCapabilities((prev) => ({ ...prev, [key]: val }));

  const canAdvance = () => {
    if (currentStep === "market") return !!(answers.marketType && answers.buyerType && answers.coreValue);
    if (currentStep === "authority") return !!(answers.thoughtLeadership && answers.proprietaryIP && answers.uniqueValue);
    if (currentStep === "context") return !!answers.competition;
    return true;
  };

  const rankedFormats = scoreFormats(answers, capabilities);
  const topThree = rankedFormats.slice(0, 3);
  const readiness = getReadinessScore(capabilities, topThree[0]);

  return (
    <div className="min-h-screen bg-ecm-green text-white font-barlow">
      {/* Progress bar */}
      <div className="border-b border-white/10 px-6 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link href="/assessments" className="text-sm font-semibold tracking-tight text-ecm-lime hover:text-ecm-lime/80 transition-colors">
            ← Assessments
          </Link>
          {step > 0 && step < STEPS.length - 1 && (
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    step >= i ? "bg-ecm-lime w-8" : "bg-white/5 w-5"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-xl mx-auto px-6 py-12 pb-24">

        {/* WELCOME */}
        {currentStep === "welcome" && (
          <div className="space-y-8">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 bg-ecm-lime bg-opacity-15 border border-ecm-lime border-opacity-30 text-ecm-lime text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full">
                <span>◎</span> Lead Magnet Ideation Tool
              </div>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
                Find your lead magnet.
                <br />
                <span className="text-white/40">Close the gaps that matter.</span>
              </h1>
              <p className="text-white/60 text-lg leading-relaxed">
                Answer 13 questions. Get three ranked lead magnet recommendations with specific topic ideas,
                a capability radar, and the exact gaps standing between you and a market-leading asset.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: "◎", stat: "13 questions", sub: "~5 minutes" },
                { icon: "◈", stat: "3 formats ranked", sub: "Scored to your context" },
                { icon: "◉", stat: "Capability report", sub: "With closing actions" },
              ].map((item) => (
                <div key={item.stat} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center space-y-1">
                  <div className="text-xl text-ecm-lime">{item.icon}</div>
                  <div className="text-sm font-semibold">{item.stat}</div>
                  <div className="text-xs text-white/40">{item.sub}</div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setStep(1)}
              className="w-full bg-ecm-lime hover:bg-ecm-lime-hover text-ecm-green font-barlow font-bold py-4 px-6 rounded-full transition-colors text-base"
            >
              Start the assessment →
            </button>
            <p className="text-center text-xs text-white/30">No sign-up required. Your responses are processed in accordance with GDPR and never shared with third parties.</p>
          </div>
        )}

        {/* MARKET */}
        {currentStep === "market" && (
          <div className="space-y-8">
            <SectionHeader step="1 of 4" title="Your market position" subtitle="The right lead magnet starts with knowing your audience and what they actually buy." />
            <Question label="What best describes your primary market?" options={MARKET_TYPES} value={answers.marketType} onChange={(v) => setAnswer("marketType", v)} />
            <Question label="Who is your primary decision-maker or buyer?" options={BUYER_TYPES} value={answers.buyerType} onChange={(v) => setAnswer("buyerType", v)} />
            <Question label="What core outcome do you deliver to your market?" options={CORE_VALUES} value={answers.coreValue} onChange={(v) => setAnswer("coreValue", v)} />
            <NavButtons onBack={() => setStep(0)} onNext={() => setStep(2)} canNext={canAdvance()} />
          </div>
        )}

        {/* AUTHORITY */}
        {currentStep === "authority" && (
          <div className="space-y-8">
            <SectionHeader step="2 of 4" title="Your authority & IP" subtitle="The format you should build depends heavily on the intellectual property you can genuinely claim." />
            <Question label="How would you describe your current thought leadership activity?" options={THOUGHT_LEADERSHIP_STATES} value={answers.thoughtLeadership} onChange={(v) => setAnswer("thoughtLeadership", v)} />
            <Question label="Do you have proprietary frameworks, methodologies, or original data?" options={PROPRIETARY_IP} value={answers.proprietaryIP} onChange={(v) => setAnswer("proprietaryIP", v)} />
            <Question label="What do your best clients say you are uniquely good at?" options={UNIQUE_VALUE} value={answers.uniqueValue} onChange={(v) => setAnswer("uniqueValue", v)} />
            <NavButtons onBack={() => setStep(1)} onNext={() => setStep(3)} canNext={canAdvance()} />
          </div>
        )}

        {/* CAPABILITIES */}
        {currentStep === "capabilities" && (
          <div className="space-y-8">
            <SectionHeader step="3 of 4" title="Your current capabilities" subtitle="Be honest — this is where the tool earns its value. Rate each area 1 (beginner) to 5 (expert)." />
            <div className="space-y-7">
              {CAPABILITY_DIMENSIONS.map((dim) => (
                <CapabilitySlider key={dim.id} label={dim.label} desc={dim.desc} value={capabilities[dim.id]} onChange={(v) => setCap(dim.id, v)} />
              ))}
            </div>
            <NavButtons onBack={() => setStep(2)} onNext={() => setStep(4)} canNext={true} />
          </div>
        )}

        {/* CONTEXT */}
        {currentStep === "context" && (
          <div className="space-y-8">
            <SectionHeader step="4 of 4" title="Your competitive context" subtitle="One last question — this shapes which formats will help you stand out rather than blend in." />
            <Question label="How would you describe the content / lead magnet landscape in your space?" options={COMPETITION_LEVEL} value={answers.competition} onChange={(v) => setAnswer("competition", v)} />
            <NavButtons onBack={() => setStep(3)} onNext={() => setStep(5)} canNext={canAdvance()} />
          </div>
        )}

        {/* RESULTS */}
        {currentStep === "results" && (
          <Results topThree={topThree} readiness={readiness} capabilities={capabilities} email={email} setEmail={setEmail} answers={answers} />
        )}
      </div>
    </div>
  );
}

// coefficients.ts — every model coefficient in one file.
// Ported from 02_cost_model_v0_2.xlsx.
// Quarterly refresh: update values here, bump MODEL_VERSION, note changes in methodology changelog.

export const MODEL_VERSION = "v0.2";
export const MODEL_LAST_REVIEWED = "2026-04-22";

// ----- A. Translation rate blend (USD per source word) -----
// Portfolio-weighted across EN→{FR,DE,ES,IT,NL,JA,ZH,KO,PL,PT,SV}.
// Source: CSA Research 2024 rate survey + Slator 2024 Pricing Survey + Nimdzi 2024 benchmarks.
// REFRESH: LLM-era pricing drifts fast; verify each quarter.
export const RATES = {
  human: 0.16,
  mtpe: 0.06,   // MT + human post-edit
  ai: 0.03,     // AI translation + evaluation pass
} as const;

// Maturity blend: share of translation work done by each method at each AI maturity level
export const MATURITY_BLEND: readonly { human: number; mtpe: number; ai: number }[] = [
  { human: 1.00, mtpe: 0.00, ai: 0.00 }, // L0 — no AI
  { human: 0.85, mtpe: 0.10, ai: 0.05 }, // L1 — ad-hoc AI
  { human: 0.50, mtpe: 0.40, ai: 0.10 }, // L2 — systematic MT+PE
  { human: 0.20, mtpe: 0.30, ai: 0.50 }, // L3 — AI in creation + translation
  { human: 0.10, mtpe: 0.20, ai: 0.70 }, // L4 — fully AI-native
];

// ----- B. TM leverage by update cadence -----
// Source: CSA/Nimdzi TM-leverage benchmarks.
export const TM_LEVERAGE: Record<number, number> = {
  1: 0.10, // rare / one-off
  2: 0.20, // annual
  3: 0.30, // quarterly
  4: 0.35, // monthly
  5: 0.40, // continuous
};

// ----- C. Production multipliers by content type -----
// base = traditional operation, mature = AI-augmented.
export const PRODUCTION = {
  marketing: { base: 1.60, mature: 1.35 }, // CSA project-premium + ECM.dev estimate
  product:   { base: 1.40, mature: 1.20 }, // Slator tech-loc benchmark
  support:   { base: 1.30, mature: 1.10 }, // ECM.dev estimate
  legal:     { base: 1.80, mature: 1.65 }, // ECM.dev estimate
  video:     { base: 3.20, mature: 2.60 }, // Slator 2024 Media Loc Report
  training:  { base: 1.60, mature: 1.35 }, // Nimdzi LMS benchmark
} as const;

// ----- D. Channel adaptation factors (multiplier on translated volume) -----
export const CHANNEL = {
  web:       { base: 1.00, mature: 1.00 },
  mobile:    { base: 1.10, mature: 1.05 },
  inproduct: { base: 1.20, mature: 1.10 },
  video:     { base: 2.60, mature: 2.10 }, // Slator media-loc 2024
  print:     { base: 1.30, mature: 1.20 },
  email:     { base: 1.00, mature: 0.95 }, // most AI-compressible
  social:    { base: 1.10, mature: 0.95 },
  voice:     { base: 1.40, mature: 1.15 },
} as const;

// ----- E. System & governance (USD/year at 1M-word reference scale) -----
export const SYSTEM = {
  baseTooling: 30000,        // scaled by scale_factor. Slator TMS pricing 2024.
  glossaryPct: 0.03,         // % of translation. CSA governance benchmarks.
  vendorPct: 0.07,           // CSA vendor-mgmt survey 2024.
  internalReviewPct: 0.12,   // ECM.dev estimate.
} as const;

// ----- F. AI Operations -----
export const AI_OPS = {
  llmPer1kWords: 0.80,        // Blend of Claude, GPT-4-class, smaller models. Snapshot May 2025. REFRESH often.
  promptLibBase: 25000,       // at 1M ref. Scaled by scale_factor × intensity. ECM.dev estimate.
  governanceBase: 35000,      // Brand guardrails, safety, model ops. ECM.dev estimate.
  regulatedUplift: 80000,     // EU AI Act, fin-serv, health, life-sciences compliance. Uses reg_scale.
  humanInLoopPct: 0.22,       // % uplift on AI-touched translation. ECM.dev estimate.
  intensity: [0.00, 0.30, 0.70, 1.20, 1.60] as const, // by maturity level
} as const;

// ----- G. Scale factor parameters -----
export const SCALE = {
  exponent: 0.6,   // scale_factor = max(floor, (volume/1M)^exponent)
  floor: 0.15,     // minimum for very small ops
  regBase: 0.5,    // regulated_scale = regBase + (1-regBase) × scale_factor
} as const;

// ----- H. Friction coefficient derivation -----
export const FRICTION = {
  base: 0.05,          // well-run integrated baseline
  reworkWeight: 0.04,  // per 0–3 point
  fragWeight: 0.03,    // per 0–3 point
  aiCoordWeight: 0.05, // per 0–3 point — highest weight, differentiating signal
  cap: 0.30,           // maximum friction coefficient
} as const;

// ----- I. AI variant multiplier -----
// More AI-generated source content → more variants to translate.
export const AI_VARIANT_COEF = 0.80;
// Effective volume = source_volume × (1 + coef × ai_share)

// ----- J. Confidence band -----
export const CONFIDENCE_BAND = 0.30; // ±30% for research preview v0.2

// ----- K. FX rates -----
// Snapshot. Production should refresh weekly from an FX API or similar.
export const FX = {
  usdToEur: 0.92,
  lastUpdated: "2026-04-22",
} as const;

// Layer metadata — labels, tooltip copy, source tags
export const LAYER_META = [
  {
    key: "translation",
    n: 1,
    name: "Translation",
    desc: "Blended human + MT post-edit + AI translation across your language portfolio.",
    source: "CSA Research 2024, Slator 2024 Pricing Survey, Nimdzi 2024 benchmarks",
  },
  {
    key: "production",
    n: 2,
    name: "Production",
    desc: "Project management, LQA, in-country review, DTP, multimedia adaptation.",
    source: "CSA + Slator + Nimdzi + ECM.dev estimate (interpolated by AI maturity)",
  },
  {
    key: "channel",
    n: 3,
    name: "Channel adaptation",
    desc: "Cost uplift to finish translated content for each delivery channel (video, UI, voice, etc.).",
    source: "Slator Media/Product Loc 2024 + ECM.dev estimate",
  },
  {
    key: "system",
    n: 4,
    name: "System & governance",
    desc: "TMS, connectors, glossary, vendor management, internal review.",
    source: "Slator TMS pricing 2024 + CSA vendor-mgmt survey + ECM.dev estimate",
  },
  {
    key: "aiOps",
    n: 5,
    name: "AI Operations",
    desc: "LLM API spend, prompt library, eval infra, AI governance, human-in-the-loop review, regulated compliance uplift.",
    source: "Published LLM API pricing (May 2025) + ECM.dev estimate",
  },
  {
    key: "friction",
    n: 6,
    name: "Friction",
    desc: "Rework, version drift, missed reuse, duplicate AI spend. The cost of a bad operating system.",
    source: "ECM.dev estimate. Derived from your input signals.",
  },
] as const;

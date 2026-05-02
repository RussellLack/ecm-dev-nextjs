// coefficients.ts — every coefficient for the CMS Implementation assessment.
// Sources and confidence levels documented in
// docs/CMS-IMPLEMENTATION-BENCHMARKS.md. Bump MODEL_VERSION when these change.
// USD-anchored. Currency display conversion happens at render time.

export const MODEL_VERSION = "v0.1";
export const MODEL_LAST_REVIEWED = "2026-05-01";

export type Range = { low: number; mid: number; high: number };
export type Confidence = "A" | "B" | "C";

/* ── 1. Headless CMS — annual licence (USD/yr) ─────────────────────────── */
export const HEADLESS_LICENCE: Record<string, Range> = {
  selfServe:    { low: 1_800,   mid: 6_000,    high: 12_000 },
  growingTeam:  { low: 12_000,  mid: 30_000,   high: 60_000 },
  midEnterprise:{ low: 60_000,  mid: 110_000,  high: 180_000 },
  enterprise:   { low: 140_000, mid: 220_000,  high: 350_000 },
} as const;

/* ── 2. DXP / enterprise platform — annual licence (USD/yr) ────────────── */
export const DXP_LICENCE: Record<string, Range> = {
  entry:        { low: 45_000,  mid: 70_000,   high: 110_000 },
  midEnterprise:{ low: 110_000, mid: 180_000,  high: 280_000 },
  global:       { low: 280_000, mid: 500_000,  high: 900_000 },
} as const;

/* ── 3. Mid-market CMS — annual licence (USD/yr) ───────────────────────── */
export const MID_MARKET_LICENCE: Record<string, Range> = {
  entry:    { low: 6_000,  mid: 14_000,  high: 25_000 },
  standard: { low: 18_000, mid: 32_000,  high: 55_000 },
  premium:  { low: 50_000, mid: 90_000,  high: 150_000 },
} as const;

/* ── 4. ECM — annual licence (USD/yr) ──────────────────────────────────── */
export const ECM_LICENCE: Record<string, Range> = {
  departmental:  { low: 60_000,  mid: 120_000,   high: 220_000 },
  midEnterprise: { low: 200_000, mid: 450_000,   high: 800_000 },
  enterprise:    { low: 600_000, mid: 1_100_000, high: 2_500_000 },
} as const;

/* ── 5a. SI day rates (USD per consultant-day) ─────────────────────────── */
export const SI_DAY_RATE: Record<"UK" | "EU" | "US" | "Other", Range> = {
  UK:    { low: 700, mid: 950,   high: 1_300 },
  EU:    { low: 600, mid: 900,   high: 1_200 },
  US:    { low: 900, mid: 1_300, high: 1_800 },
  Other: { low: 360, mid: 540,   high: 720 }, // CEE / offshore proxy
} as const;

/* ── 5b. Project effort range (consultant-days) ────────────────────────── */
export const PROJECT_EFFORT: Record<string, Range> = {
  small:           { low: 60,    mid: 105,   high: 150 },   // single brochure / headless
  midMarket:       { low: 300,   mid: 500,   high: 700 },   // B2B site, integrations
  enterprise:      { low: 1_000, mid: 1_750, high: 2_500 }, // multi-site / multi-locale
  globalEnterprise:{ low: 2_500, mid: 4_250, high: 6_000 }, // multi-brand replatform
} as const;

/* ── 5c. Implementation phase split (must sum to 1.00 at mid) ─────────── */
export const PHASE_SPLIT = {
  discovery:    0.12,
  design:       0.20,
  build:        0.40,
  contentMig:   0.12,
  testing:      0.07,
  trainingChg:  0.09,
} as const;

/** Always-applied uplift on the implementation subtotal. */
export const CONTINGENCY_PCT = 0.18;

/* ── 5d. Migration complexity multipliers ──────────────────────────────── */
export const MIGRATION_COMPLEXITY = {
  greenfield:    0,     // skip migration entirely
  customLegacy:  1.4,   // custom in-house OR ECM source — data-shape mismatch
  standard:      1.0,
} as const;

/** Greenfield reduces contingency from 18% → 12%. */
export const GREENFIELD_CONTINGENCY_PCT = 0.12;

/* ── 5e. Scope multipliers on implementation effort ────────────────────── */
/** sites multiplier = √(sites). 1 site → 1.0; 4 sites → 2.0; 9 → 3.0. */
export const sitesMultiplier = (sites: number): number =>
  Math.sqrt(Math.max(1, sites));

/** locales multiplier = 1 + 0.15 × (locales − 1). 1 → 1.0; 6 → 1.75; 11 → 2.5. */
export const localesMultiplier = (locales: number): number =>
  1 + 0.15 * Math.max(0, locales - 1);

/** Each ticked integration adds 5%, capped at 8 picks (40%). */
export const INTEGRATION_UPLIFT_PER_PICK = 0.05;
export const INTEGRATION_UPLIFT_CAP = 0.40;

/** Personalisation uplift on implementation. */
export const PERSONALISATION_UPLIFT = {
  none:  0,
  light: 0.10,
  heavy: 0.25,
} as const;

/** Each compliance pick = +3% on implementation, capped at +15%. */
export const COMPLIANCE_UPLIFT_PER_PICK = 0.03;
export const COMPLIANCE_UPLIFT_CAP = 0.15;

/* ── 6. Run-cost — annual (USD/yr, excl. licence) ──────────────────────── */
export const RUN_COST: Record<string, Range> = {
  midMarket:     { low: 60_000,  mid: 110_000,  high: 180_000 },
  midEnterprise: { low: 180_000, mid: 320_000,  high: 520_000 },
  enterprise:    { low: 500_000, mid: 900_000,  high: 1_800_000 },
} as const;

/** Vendor support % of licence (always added). */
export const VENDOR_SUPPORT_PCT = 0.20;

/**
 * Deployment-model multiplier on the run-cost hosting bucket.
 * SaaS → vendor bundles infra + much of ops into the licence, so the
 *   buyer's hosting+team line is materially smaller.
 * PaaS → baseline (cloud-managed but you run the app team).
 * Self-hosted → infra + ops sit fully on the buyer (slightly higher
 *   on average; some buyers save on infra but bear more headcount).
 * Unsure → assume PaaS baseline.
 */
export const DEPLOYMENT_HOSTING_MULTIPLIER: Record<
  "saas" | "paas" | "self-hosted" | "unsure",
  number
> = {
  saas: 0.7,
  paas: 1.0,
  "self-hosted": 1.1,
  unsure: 1.0,
};

/** Out-year enhancement = 60% of Year 1 implementation, recurring annually
 *  from Year 2. Real Story Group cite ~100%; we soften to keep conservative
 *  defaults principle. Bumps to 75% if 10+ years on legacy platform. */
export const OUT_YEAR_ENHANCEMENT_PCT = 0.60;
export const OUT_YEAR_ENHANCEMENT_LEGACY_PCT = 0.75;

/* ── 7. Benefit-side coefficients (per year) ───────────────────────────── */

/** Editor hours saved per year per content-author FTE. */
export const EDITOR_HOURS_SAVED: Range = {
  low: 80,
  mid: 240,
  high: 520,
};

/** Loaded hourly cost per editor by region (USD/hr). */
export const EDITOR_HOURLY_COST: Record<"UK" | "EU" | "US" | "Other", number> = {
  UK:    43,
  EU:    40,
  US:    58,
  Other: 28,
};

/** Dev hours saved per year (whole platform team). */
export const DEV_HOURS_SAVED: Range = {
  low: 200,
  mid: 600,
  high: 1_400,
};

/** Revenue-uplift % attributable to platform (only if visitor enters revenue). */
export const REVENUE_UPLIFT_PCT: Range = {
  low: 0,
  mid: 0.02,
  high: 0.04,
};

/** TEI benchmark multiplier — applied when "Use vendor-cited TEI" toggle on. */
export const TEI_BENEFIT_MULTIPLIER = 2.0;

/* ── 8. Risk profile — high-band widening factor ───────────────────────── */
export const HIGH_BAND_BASE_MULTIPLIER = 1.4;     // applied to high vs mid
export const HIGH_RISK_MULTIPLIER = 1.8;          // when triggered

/* ── 9. Currency display conversion (USD anchor) ───────────────────────── */
export const CURRENCY_MULTIPLIERS = {
  USD: 1.00,
  GBP: 0.79,
  EUR: 0.92,
} as const;

/* ── 10. Update-frequency multiplier on editor productivity benefit ────── */
export const UPDATE_FREQ_MULTIPLIER: Record<string, number> = {
  "<10":    0.5,
  "10-50":  1.0,
  "50-200": 1.5,
  "200+":   2.2,
};

/* ── 11. Sales-gated DXP / ECM vendor list ─────────────────────────────── */
/** Triggers the ±40% disclaimer on the result page. */
export const SALES_GATED_VENDORS: ReadonlySet<string> = new Set([
  "sitecore-on-prem",
  "sitecore-xm-cloud",
  "optimizely",
  "adobe-aem",
  "acquia",
  "opentext",
  "hyland-onbase",
  "ibm-filenet",
]);

/* ── 12. Vendor → tier lookup (drives which licence table is used) ─────── */
export const VENDOR_TIER: Record<
  string,
  | { tier: "headless"; size: keyof typeof HEADLESS_LICENCE }
  | { tier: "midMarket"; size: keyof typeof MID_MARKET_LICENCE }
  | { tier: "dxp"; size: keyof typeof DXP_LICENCE }
  | { tier: "ecm"; size: keyof typeof ECM_LICENCE }
> = {
  // Headless
  sanity:     { tier: "headless", size: "growingTeam" },
  contentful: { tier: "headless", size: "midEnterprise" },
  storyblok:  { tier: "headless", size: "growingTeam" },
  strapi:     { tier: "headless", size: "selfServe" },
  "kontent-ai":{ tier: "headless", size: "midEnterprise" },
  hygraph:    { tier: "headless", size: "growingTeam" },
  payload:    { tier: "headless", size: "growingTeam" },
  // Mid-market
  kentico:    { tier: "midMarket", size: "standard" },
  umbraco:    { tier: "midMarket", size: "entry" },
  sitefinity: { tier: "midMarket", size: "premium" },
  drupal:     { tier: "midMarket", size: "entry" },
  // DXP
  "sitecore-on-prem":  { tier: "dxp", size: "midEnterprise" },
  "sitecore-xm-cloud": { tier: "dxp", size: "midEnterprise" },
  optimizely: { tier: "dxp", size: "midEnterprise" },
  "adobe-aem":{ tier: "dxp", size: "global" },
  acquia:     { tier: "dxp", size: "midEnterprise" },
  bloomreach: { tier: "dxp", size: "midEnterprise" },
  // ECM
  "hyland-onbase": { tier: "ecm", size: "midEnterprise" },
  opentext:        { tier: "ecm", size: "midEnterprise" },
  "ibm-filenet":   { tier: "ecm", size: "enterprise" },
  "m-files":       { tier: "ecm", size: "departmental" },
  alfresco:        { tier: "ecm", size: "departmental" },
};

/* ── Confidence rating per coefficient family ──────────────────────────── */
export const CONFIDENCE: Record<string, Confidence> = {
  HEADLESS_LICENCE: "B",
  DXP_LICENCE: "C",
  MID_MARKET_LICENCE: "A",
  ECM_LICENCE: "B",
  SI_DAY_RATE: "B",
  PROJECT_EFFORT: "B",
  RUN_COST: "B",
  OUT_YEAR_ENHANCEMENT: "A",
  BENEFIT: "B",
};

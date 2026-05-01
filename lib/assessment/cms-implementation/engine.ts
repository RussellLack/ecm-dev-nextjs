// engine.ts — pure calculator for the CMS Implementation assessment.
// Zero I/O, zero React. Inputs in, result out. Currency is USD-anchored;
// the result includes a currency multiplier so the UI can render in the
// visitor's chosen currency without re-running the calc.

import {
  HEADLESS_LICENCE,
  DXP_LICENCE,
  MID_MARKET_LICENCE,
  ECM_LICENCE,
  SI_DAY_RATE,
  PROJECT_EFFORT,
  CONTINGENCY_PCT,
  GREENFIELD_CONTINGENCY_PCT,
  MIGRATION_COMPLEXITY,
  sitesMultiplier,
  localesMultiplier,
  INTEGRATION_UPLIFT_PER_PICK,
  INTEGRATION_UPLIFT_CAP,
  PERSONALISATION_UPLIFT,
  COMPLIANCE_UPLIFT_PER_PICK,
  COMPLIANCE_UPLIFT_CAP,
  RUN_COST,
  VENDOR_SUPPORT_PCT,
  DEPLOYMENT_HOSTING_MULTIPLIER,
  OUT_YEAR_ENHANCEMENT_PCT,
  OUT_YEAR_ENHANCEMENT_LEGACY_PCT,
  EDITOR_HOURS_SAVED,
  EDITOR_HOURLY_COST,
  DEV_HOURS_SAVED,
  REVENUE_UPLIFT_PCT,
  TEI_BENEFIT_MULTIPLIER,
  HIGH_BAND_BASE_MULTIPLIER,
  HIGH_RISK_MULTIPLIER,
  CURRENCY_MULTIPLIERS,
  UPDATE_FREQ_MULTIPLIER,
  SALES_GATED_VENDORS,
  VENDOR_TIER,
  CONFIDENCE,
  MODEL_VERSION,
  type Range,
  type Confidence,
} from "./coefficients.ts";
import type {
  CmsImplementationInputs,
  CmsImplementationResult,
  BreakdownByLine,
  BenefitSide,
  OrgSize,
  TargetTier,
  CurrentPlatformBucket,
} from "./types.ts";

/* ── Helpers ───────────────────────────────────────────────────────────── */

const ZERO: Range = { low: 0, mid: 0, high: 0 };

const scaleRange = (r: Range, factor: number): Range => ({
  low: r.low * factor,
  mid: r.mid * factor,
  high: r.high * factor,
});

const sumRanges = (...ranges: Range[]): Range =>
  ranges.reduce<Range>(
    (acc, r) => ({
      low: acc.low + r.low,
      mid: acc.mid + r.mid,
      high: acc.high + r.high,
    }),
    { ...ZERO },
  );

/** Re-derive the "high" leg from mid using a wider multiplier. Used for the
 *  high-risk-profile widening that lifts × 1.4 → × 1.8. */
const widenHigh = (r: Range, fromMul: number, toMul: number): Range => ({
  low: r.low,
  mid: r.mid,
  high: r.mid * (toMul / fromMul) * (r.high / (r.mid * fromMul) || 1),
});

/* ── Mapping helpers ───────────────────────────────────────────────────── */

function pickLicenceRange(tier: TargetTier, size: OrgSize, vendorKey?: string): Range {
  // Vendor override — when the visitor names a specific vendor, the
  // VENDOR_TIER table picks a more precise sub-bucket.
  if (vendorKey && VENDOR_TIER[vendorKey]) {
    const v = VENDOR_TIER[vendorKey];
    if (v.tier === "headless") return HEADLESS_LICENCE[v.size];
    if (v.tier === "midMarket") return MID_MARKET_LICENCE[v.size];
    if (v.tier === "dxp") return DXP_LICENCE[v.size];
    if (v.tier === "ecm") return ECM_LICENCE[v.size];
  }

  // Otherwise — pick by tier + org size.
  switch (tier) {
    case "headless":
      if (size === "small") return HEADLESS_LICENCE.selfServe;
      if (size === "mid") return HEADLESS_LICENCE.growingTeam;
      if (size === "enterprise") return HEADLESS_LICENCE.midEnterprise;
      return HEADLESS_LICENCE.enterprise;
    case "midMarket":
      if (size === "small") return MID_MARKET_LICENCE.entry;
      if (size === "mid") return MID_MARKET_LICENCE.standard;
      return MID_MARKET_LICENCE.premium;
    case "dxp":
      if (size === "mid") return DXP_LICENCE.entry;
      if (size === "enterprise") return DXP_LICENCE.midEnterprise;
      return DXP_LICENCE.global;
    case "ecm":
      if (size === "small" || size === "mid") return ECM_LICENCE.departmental;
      if (size === "enterprise") return ECM_LICENCE.midEnterprise;
      return ECM_LICENCE.enterprise;
    case "unsure":
    default:
      // Default to a mid-market tier when the visitor doesn't know yet.
      return MID_MARKET_LICENCE.standard;
  }
}

function pickProjectEffort(size: OrgSize): Range {
  switch (size) {
    case "small": return PROJECT_EFFORT.small;
    case "mid": return PROJECT_EFFORT.midMarket;
    case "enterprise": return PROJECT_EFFORT.enterprise;
    case "global": return PROJECT_EFFORT.globalEnterprise;
  }
}

function pickRunCost(size: OrgSize): Range {
  if (size === "small" || size === "mid") return RUN_COST.midMarket;
  if (size === "enterprise") return RUN_COST.midEnterprise;
  return RUN_COST.enterprise;
}

function migrationComplexity(platform: CurrentPlatformBucket): number {
  if (platform === "greenfield") return MIGRATION_COMPLEXITY.greenfield;
  if (platform === "custom" || platform === "opentext" ||
      platform === "hyland-onbase" || platform === "other-ecm") {
    return MIGRATION_COMPLEXITY.customLegacy;
  }
  return MIGRATION_COMPLEXITY.standard;
}

/** Worst-case (most pessimistic) confidence across a list. */
function worstConfidence(list: Confidence[]): Confidence {
  if (list.includes("C")) return "C";
  if (list.includes("B")) return "B";
  return "A";
}

/* ── Risk profile detection ────────────────────────────────────────────── */

function isHighRiskProfile(inputs: CmsImplementationInputs): boolean {
  const checks = [
    inputs.scope.locales >= 6,
    inputs.scope.integrations.length >= 5,
    inputs.scope.personalisation === "heavy",
    inputs.scope.compliance.length >= 3,
    inputs.scope.pageBucket === "50k+",
  ];
  return checks.filter(Boolean).length >= 2;
}

/* ── Implementation cost calc ──────────────────────────────────────────── */

function calculateImplementation(
  inputs: CmsImplementationInputs,
  highRisk: boolean,
): { implementation: Range; contingency: Range } {
  const baseEffort = pickProjectEffort(inputs.org.size);
  const dayRate = SI_DAY_RATE[inputs.org.region];

  // Implementation effort multipliers.
  const sitesMul = sitesMultiplier(inputs.scope.sites);
  const localesMul = localesMultiplier(inputs.scope.locales);
  const integrationsMul = 1 + Math.min(
    INTEGRATION_UPLIFT_CAP,
    inputs.scope.integrations.length * INTEGRATION_UPLIFT_PER_PICK,
  );
  const personalisationMul = 1 + PERSONALISATION_UPLIFT[inputs.scope.personalisation];
  const complianceMul = 1 + Math.min(
    COMPLIANCE_UPLIFT_CAP,
    inputs.scope.compliance.length * COMPLIANCE_UPLIFT_PER_PICK,
  );
  const migrationMul = migrationComplexity(inputs.current.platform);

  const totalMultiplier =
    sitesMul *
    localesMul *
    integrationsMul *
    personalisationMul *
    complianceMul *
    Math.max(0.4, migrationMul); // greenfield (0) handled below; keep 0.4 floor for non-zero migrations

  // Days × dayRate × multipliers. Migration of 0 is special-cased — pure
  // build cost only, no migration uplift.
  const effectiveMultiplier =
    migrationMul === 0
      ? sitesMul * localesMul * integrationsMul * personalisationMul * complianceMul * 0.65
      : totalMultiplier;

  // Cost = days × dayRate. Apply low/mid/high pairings: low days × low rate
  // would understate; mid days × mid rate is honest; we cross-pair the
  // extremes to surface a wider band.
  const implementation: Range = {
    low: baseEffort.low * dayRate.low * effectiveMultiplier,
    mid: baseEffort.mid * dayRate.mid * effectiveMultiplier,
    high: baseEffort.high * dayRate.high * effectiveMultiplier,
  };

  // High-band widening for high-risk profiles.
  if (highRisk) {
    implementation.high = implementation.mid * HIGH_RISK_MULTIPLIER;
  } else {
    implementation.high = Math.max(
      implementation.high,
      implementation.mid * HIGH_BAND_BASE_MULTIPLIER,
    );
  }

  // Contingency.
  const contingencyPct =
    migrationMul === 0 ? GREENFIELD_CONTINGENCY_PCT : CONTINGENCY_PCT;
  const contingency = scaleRange(implementation, contingencyPct);

  return { implementation, contingency };
}

/* ── Run-cost calc ─────────────────────────────────────────────────────── */

function calculateAnnualRun(
  inputs: CmsImplementationInputs,
  licence: Range,
): Range {
  // Hosting + content-ops headcount + integrations + monitoring — packaged
  // into the size-banded RUN_COST coefficient.
  const baseRun = pickRunCost(inputs.org.size);
  const vendorSupport = scaleRange(licence, VENDOR_SUPPORT_PCT);
  return sumRanges(baseRun, vendorSupport);
}

/* ── Out-year enhancement ──────────────────────────────────────────────── */

function calculateOutYearEnhancement(
  inputs: CmsImplementationInputs,
  implementation: Range,
): Range {
  const pct =
    inputs.current.yearsOnPlatform === "10+"
      ? OUT_YEAR_ENHANCEMENT_LEGACY_PCT
      : OUT_YEAR_ENHANCEMENT_PCT;
  return scaleRange(implementation, pct);
}

/* ── Benefit-side calc ─────────────────────────────────────────────────── */

function calculateBenefit(
  inputs: CmsImplementationInputs,
  useTei: boolean,
): BenefitSide {
  const teiMul = useTei ? TEI_BENEFIT_MULTIPLIER : 1;
  const updateMul =
    UPDATE_FREQ_MULTIPLIER[inputs.runtime.updateFreq] ?? 1;

  // Editor hours saved — use mid coefficient as the single hours figure;
  // monetary value uses the full range.
  const editorHoursPerFte = EDITOR_HOURS_SAVED.mid * teiMul * updateMul;
  const editorHoursTotal = editorHoursPerFte * inputs.runtime.editors;
  const editorRate = EDITOR_HOURLY_COST[inputs.org.region];

  const editorValueLow =
    EDITOR_HOURS_SAVED.low * teiMul * updateMul * inputs.runtime.editors * editorRate;
  const editorValueMid = editorHoursTotal * editorRate;
  const editorValueHigh =
    EDITOR_HOURS_SAVED.high * teiMul * updateMul * inputs.runtime.editors * editorRate;

  // Dev hours saved — single coefficient, monetised at SI mid day rate / 8.
  const devHoursMid = DEV_HOURS_SAVED.mid * teiMul;
  const devRate = SI_DAY_RATE[inputs.org.region].mid / 8;
  const devValueLow = DEV_HOURS_SAVED.low * teiMul * devRate;
  const devValueMid = devHoursMid * devRate;
  const devValueHigh = DEV_HOURS_SAVED.high * teiMul * devRate;

  // Revenue uplift — only when revenue provided.
  const revenueLow = (inputs.runtime.revenue ?? 0) * REVENUE_UPLIFT_PCT.low;
  const revenueMid = (inputs.runtime.revenue ?? 0) * REVENUE_UPLIFT_PCT.mid * teiMul;
  const revenueHigh = (inputs.runtime.revenue ?? 0) * REVENUE_UPLIFT_PCT.high * teiMul;

  const annualLow = editorValueLow + devValueLow + revenueLow;
  const annualMid = editorValueMid + devValueMid + revenueMid;
  const annualHigh = editorValueHigh + devValueHigh + revenueHigh;

  return {
    editorHoursSaved: editorHoursTotal,
    devHoursSaved: devHoursMid,
    revenueUplift: revenueMid,
    threeYearValue: {
      low: annualLow * 3,
      mid: annualMid * 3,
      high: annualHigh * 3,
    },
    fiveYearValue: {
      low: annualLow * 5,
      mid: annualMid * 5,
      high: annualHigh * 5,
    },
  };
}

/* ── Year-by-year totals (USD, anchor) ─────────────────────────────────── */

function buildYearTotals(
  licence: Range,
  implementation: Range,
  contingency: Range,
  hosting: Range,           // run-cost split: hosting+team+integrations
  vendorSupport: Range,
  outYearEnhancement: Range,
  horizon: 3 | 5,
) {
  const out: { year: number; low: number; mid: number; high: number }[] = [];
  const annualRecurring = sumRanges(licence, hosting, vendorSupport);

  for (let y = 1; y <= horizon; y++) {
    if (y === 1) {
      const total = sumRanges(annualRecurring, implementation, contingency);
      out.push({ year: 1, low: total.low, mid: total.mid, high: total.high });
    } else {
      const total = sumRanges(annualRecurring, outYearEnhancement);
      out.push({ year: y, low: total.low, mid: total.mid, high: total.high });
    }
  }
  return out;
}

/* ── Public API ────────────────────────────────────────────────────────── */

export function calculate(inputs: CmsImplementationInputs): CmsImplementationResult {
  const highRisk = isHighRiskProfile(inputs);
  const salesGated = !!inputs.target.vendor && SALES_GATED_VENDORS.has(inputs.target.vendor);

  // 1. Licence
  const licence = pickLicenceRange(inputs.target.tier, inputs.org.size, inputs.target.vendor);

  // 2. Implementation + contingency
  const { implementation, contingency } = calculateImplementation(inputs, highRisk);

  // 3. Run cost — split into hosting/team chunk + vendor support.
  //    Deployment model scales the hosting+team line: SaaS bundles much of
  //    the infra into the licence, self-hosted moves infra + ops onto the
  //    buyer.
  const hostingAndTeam = scaleRange(
    pickRunCost(inputs.org.size),
    DEPLOYMENT_HOSTING_MULTIPLIER[inputs.target.deployment],
  );
  const vendorSupport = scaleRange(licence, VENDOR_SUPPORT_PCT);

  // 4. Out-year enhancement
  const outYearEnhancement = calculateOutYearEnhancement(inputs, implementation);

  // 5. Benefit
  const conservative = calculateBenefit(inputs, false);
  const tei = calculateBenefit(inputs, true);

  // 6. Year-by-year (always run for 5 years; we present 3- and 5-yr totals)
  const horizon = inputs.runtime.horizon;
  const totalsByYear = buildYearTotals(
    licence,
    implementation,
    contingency,
    hostingAndTeam,
    vendorSupport,
    outYearEnhancement,
    horizon,
  );
  const totalsByYear5 = buildYearTotals(
    licence,
    implementation,
    contingency,
    hostingAndTeam,
    vendorSupport,
    outYearEnhancement,
    5,
  );

  const sumTotals = (years: typeof totalsByYear): Range =>
    years.reduce<Range>(
      (acc, y) => ({
        low: acc.low + y.low,
        mid: acc.mid + y.mid,
        high: acc.high + y.high,
      }),
      { ...ZERO },
    );

  const threeYearTotal = sumTotals(totalsByYear5.slice(0, 3));
  const fiveYearTotal = sumTotals(totalsByYear5);

  const breakdown: BreakdownByLine = {
    licence,
    implementation,
    hosting: hostingAndTeam,
    vendorSupport,
    runTeam: ZERO, // packaged into hosting in v1; reserved for v2 split
    outYearEnhancement,
    contingency,
  };

  // 7. Confidence — worst-case across used coefficient families
  const usedConfidence: Confidence[] = [
    CONFIDENCE[
      inputs.target.tier === "headless"
        ? "HEADLESS_LICENCE"
        : inputs.target.tier === "dxp"
          ? "DXP_LICENCE"
          : inputs.target.tier === "ecm"
            ? "ECM_LICENCE"
            : "MID_MARKET_LICENCE"
    ],
    CONFIDENCE.SI_DAY_RATE,
    CONFIDENCE.RUN_COST,
    CONFIDENCE.BENEFIT,
  ];
  const confidence = worstConfidence(usedConfidence);

  // 8. Notes
  const notes: string[] = [];
  if (salesGated) {
    notes.push(
      "Vendor doesn't publish prices — analyst-broker estimates can diverge ±40% from negotiated price.",
    );
  }
  if (highRisk) {
    notes.push(
      "Your scenario crosses thresholds where projects historically overrun 200%+. High band widened accordingly.",
    );
  }
  if (inputs.current.yearsOnPlatform === "10+") {
    notes.push(
      "10+ years on legacy platform — out-year enhancement coefficient bumped to 75% of Year 1 implementation.",
    );
  }
  if (inputs.scope.locales >= 3) {
    notes.push(
      "For per-locale localisation cost detail, also run the localisation cost estimator.",
    );
  }

  return {
    modelVersion: MODEL_VERSION,
    currency: inputs.org.currency,
    currencyMultiplier: CURRENCY_MULTIPLIERS[inputs.org.currency],
    totalsByYear,
    threeYearTotal,
    fiveYearTotal,
    breakdown,
    benefit: { conservative, tei },
    flags: {
      salesGated,
      highRiskProfile: highRisk,
      confidence,
      notes,
    },
    inputsEcho: inputs,
  };
}

/* ── Re-exports for downstream consumers ───────────────────────────────── */
export { MODEL_VERSION } from "./coefficients.ts";
export type {
  CmsImplementationInputs,
  CmsImplementationResult,
  BreakdownByLine,
  BenefitSide,
} from "./types.ts";

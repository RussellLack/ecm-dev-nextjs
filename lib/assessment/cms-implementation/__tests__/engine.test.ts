// engine.test.ts — golden-case assertions for the CMS Implementation engine.
// Runnable via Node 22.6+ native TS:
//   node --experimental-strip-types lib/assessment/cms-implementation/__tests__/engine.test.ts
//
// No external test runner. Self-contained `assert` helper. Throws on first
// failure with a descriptive message. When CI eventually adopts Vitest,
// these checks slot in unchanged — just wrap each in `test(...)`.

import { calculate } from "../engine.ts";
import type { CmsImplementationInputs } from "../types.ts";
import {
  HEADLESS_LICENCE,
  DXP_LICENCE,
  CURRENCY_MULTIPLIERS,
} from "../coefficients.ts";
import { encodeInputs, decodeInputs, buildShareableUrl } from "../url.ts";

/* ── Tiny test harness ─────────────────────────────────────────────────── */

let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(name: string, condition: boolean, detail = "") {
  if (condition) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function approx(a: number, b: number, tolerancePct = 0.001): boolean {
  if (b === 0) return Math.abs(a) < tolerancePct;
  return Math.abs((a - b) / b) <= tolerancePct;
}

/* ── Fixtures ──────────────────────────────────────────────────────────── */

const baseline: CmsImplementationInputs = {
  org: { size: "mid", industry: "manufacturing", region: "UK", currency: "GBP" },
  current: { platform: "wordpress", yearsOnPlatform: "3-6", painPoints: [] },
  target: { tier: "headless", deployment: "saas" },
  scope: {
    sites: 1,
    locales: 1,
    pageBucket: "500-5k",
    integrations: [],
    personalisation: "none",
    compliance: [],
  },
  runtime: { editors: 5, updateFreq: "10-50", teamSize: "1-2", horizon: 3 },
};

/* ── Tests ─────────────────────────────────────────────────────────────── */

console.log("\nCMS Implementation Engine — golden-case checks\n");

// 1. Baseline calc returns sensible structure
console.log("1. Baseline calc");
{
  const r = calculate(baseline);
  check("returns USD anchor licence in headless growingTeam range",
    r.breakdown.licence.mid === HEADLESS_LICENCE.growingTeam.mid,
    `got ${r.breakdown.licence.mid}, expected ${HEADLESS_LICENCE.growingTeam.mid}`);
  check("returns 3-year horizon when requested",
    r.totalsByYear.length === 3);
  check("currency multiplier = GBP × 0.79",
    r.currencyMultiplier === CURRENCY_MULTIPLIERS.GBP);
  check("not sales-gated for headless without vendor",
    r.flags.salesGated === false);
  check("not high-risk for simple baseline",
    r.flags.highRiskProfile === false);
  check("threeYearTotal.mid > Year 1 only",
    r.threeYearTotal.mid > r.totalsByYear[0].mid);
  check("threeYearTotal.mid < fiveYearTotal.mid",
    r.threeYearTotal.mid < r.fiveYearTotal.mid);
}

// 2. Sales-gated flag triggers on Sitecore / AEM / etc.
console.log("\n2. Sales-gated disclaimer");
{
  const r = calculate({
    ...baseline,
    target: { tier: "dxp", vendor: "adobe-aem", deployment: "paas" },
  });
  check("AEM triggers salesGated=true", r.flags.salesGated === true);
  check("AEM picks dxp.global licence",
    r.breakdown.licence.mid === DXP_LICENCE.global.mid);
  check("notes contains disclaimer",
    r.flags.notes.some((n) => n.includes("Vendor doesn't publish prices")));
}

// 3. High-risk profile auto-toggle
console.log("\n3. High-risk profile auto-toggle");
{
  const baselineHigh = calculate(baseline);
  const highRiskInputs: CmsImplementationInputs = {
    ...baseline,
    scope: {
      ...baseline.scope,
      locales: 8,           // ≥ 6 ✓
      integrations: ["crm", "erp", "pim", "marketing", "commerce"], // ≥ 5 ✓
      personalisation: "heavy",
      compliance: ["gdpr", "iso", "soc2"],
      pageBucket: "50k+",
    },
  };
  const r = calculate(highRiskInputs);
  check("high-risk flag set", r.flags.highRiskProfile === true);
  check("high-risk notes present",
    r.flags.notes.some((n) => n.includes("overrun 200%+")));
  check("high band widened relative to mid",
    r.breakdown.implementation.high / r.breakdown.implementation.mid >= 1.79,
    `ratio ${r.breakdown.implementation.high / r.breakdown.implementation.mid}`);
  check("high-risk implementation > baseline implementation",
    r.breakdown.implementation.mid > baselineHigh.breakdown.implementation.mid);
}

// 4. Greenfield drops migration uplift + reduces contingency
console.log("\n4. Greenfield");
{
  const r = calculate({
    ...baseline,
    current: { ...baseline.current, platform: "greenfield" },
  });
  const baselineR = calculate(baseline);
  check("greenfield implementation < baseline",
    r.breakdown.implementation.mid < baselineR.breakdown.implementation.mid);
  // Contingency is 12% of greenfield impl, vs 18% of baseline impl. Verify ratio.
  const greenfieldRatio = r.breakdown.contingency.mid / r.breakdown.implementation.mid;
  check("greenfield contingency = 12% of impl",
    approx(greenfieldRatio, 0.12, 0.01),
    `got ${(greenfieldRatio * 100).toFixed(1)}%`);
}

// 5. Custom legacy → migration multiplier 1.4
console.log("\n5. Custom legacy migration uplift");
{
  const baselineR = calculate(baseline);
  const r = calculate({
    ...baseline,
    current: { ...baseline.current, platform: "custom" },
  });
  check("custom legacy implementation > baseline (×1.4 floor)",
    r.breakdown.implementation.mid > baselineR.breakdown.implementation.mid * 1.3);
}

// 6. 10+ years on platform → out-year enhancement bumps to 75%
console.log("\n6. Legacy enhancement uplift");
{
  const r = calculate({
    ...baseline,
    current: { ...baseline.current, yearsOnPlatform: "10+" },
  });
  const ratio = r.breakdown.outYearEnhancement.mid / r.breakdown.implementation.mid;
  check("out-year enhancement = 75% of implementation",
    approx(ratio, 0.75, 0.005),
    `got ${(ratio * 100).toFixed(1)}%`);
  check("legacy note in flags",
    r.flags.notes.some((n) => n.includes("75% of Year 1")));
}

// 7. Region drives day rate
console.log("\n7. Region-driven day rate");
{
  const uk = calculate(baseline);
  const us = calculate({
    ...baseline,
    org: { ...baseline.org, region: "US", currency: "USD" },
  });
  check("US implementation > UK implementation",
    us.breakdown.implementation.mid > uk.breakdown.implementation.mid);
  const offshore = calculate({
    ...baseline,
    org: { ...baseline.org, region: "Other", currency: "USD" },
  });
  check("Other (offshore) implementation < UK",
    offshore.breakdown.implementation.mid < uk.breakdown.implementation.mid);
}

// 8. Locales / sites multipliers compound
console.log("\n8. Scope multipliers");
{
  const r1 = calculate(baseline);
  const rSites = calculate({
    ...baseline,
    scope: { ...baseline.scope, sites: 4 },
  });
  // sites 1→4, multiplier √4=2 → roughly 2× the implementation
  check("sites 4 → ~2× implementation",
    rSites.breakdown.implementation.mid >= r1.breakdown.implementation.mid * 1.8 &&
    rSites.breakdown.implementation.mid <= r1.breakdown.implementation.mid * 2.2,
    `ratio ${(rSites.breakdown.implementation.mid / r1.breakdown.implementation.mid).toFixed(2)}`);

  const rLocales = calculate({
    ...baseline,
    scope: { ...baseline.scope, locales: 11 },
  });
  // locales 1→11, multiplier 1+0.15×10=2.5
  check("locales 11 → ~2.5× implementation",
    rLocales.breakdown.implementation.mid >= r1.breakdown.implementation.mid * 2.3 &&
    rLocales.breakdown.implementation.mid <= r1.breakdown.implementation.mid * 2.7,
    `ratio ${(rLocales.breakdown.implementation.mid / r1.breakdown.implementation.mid).toFixed(2)}`);
}

// 9. Benefit side — TEI toggle doubles benefit
console.log("\n9. Benefit-side TEI toggle");
{
  const r = calculate(baseline);
  check("conservative editor hours saved > 0",
    r.benefit.conservative.editorHoursSaved > 0);
  check("TEI editor hours saved = 2× conservative",
    approx(
      r.benefit.tei.editorHoursSaved,
      r.benefit.conservative.editorHoursSaved * 2,
      0.01,
    ));
  check("revenue uplift = 0 when revenue not provided",
    r.benefit.conservative.revenueUplift === 0);
}

// 10. Revenue uplift only when revenue provided
console.log("\n10. Revenue uplift");
{
  const r = calculate({
    ...baseline,
    runtime: { ...baseline.runtime, revenue: 50_000_000 },
  });
  check("conservative revenue uplift = 50M × 2% = 1M",
    approx(r.benefit.conservative.revenueUplift, 1_000_000, 0.001));
  check("threeYearValue.mid scales with revenue",
    r.benefit.conservative.threeYearValue.mid > 3_000_000);
}

// 11. 5-year horizon larger than 3-year
console.log("\n11. Horizon");
{
  const r3 = calculate({ ...baseline, runtime: { ...baseline.runtime, horizon: 3 } });
  const r5 = calculate({ ...baseline, runtime: { ...baseline.runtime, horizon: 5 } });
  check("5-year totalsByYear has 5 entries",
    r5.totalsByYear.length === 5);
  check("5-year total > 3-year total",
    r5.fiveYearTotal.mid > r3.threeYearTotal.mid);
  // Difference should be ~2× annual recurring (years 4 + 5)
  const annualRecurring =
    r5.totalsByYear[1].mid; // Year 2 is pure recurring
  const expectedDelta = annualRecurring * 2;
  const actualDelta = r5.fiveYearTotal.mid - r3.threeYearTotal.mid;
  check("5yr − 3yr ≈ 2× annual recurring",
    approx(actualDelta, expectedDelta, 0.01),
    `actual ${actualDelta.toFixed(0)}, expected ${expectedDelta.toFixed(0)}`);
}

// 11b. Deployment model drives hosting cost
console.log("\n11b. Deployment hosting modifier");
{
  const paas = calculate({
    ...baseline,
    target: { ...baseline.target, deployment: "paas" },
  });
  const saas = calculate({
    ...baseline,
    target: { ...baseline.target, deployment: "saas" },
  });
  const selfHosted = calculate({
    ...baseline,
    target: { ...baseline.target, deployment: "self-hosted" },
  });
  check("SaaS hosting < PaaS hosting (vendor bundles infra)",
    saas.breakdown.hosting.mid < paas.breakdown.hosting.mid);
  check("self-hosted hosting > PaaS hosting (buyer bears infra + ops)",
    selfHosted.breakdown.hosting.mid > paas.breakdown.hosting.mid);
  // SaaS hosting = 0.7× PaaS — verify ratio.
  check("SaaS hosting = 0.7× PaaS",
    approx(saas.breakdown.hosting.mid / paas.breakdown.hosting.mid, 0.7, 0.001));
}

// 12. Confidence rating cascades to worst-case
console.log("\n12. Confidence cascade");
{
  const headless = calculate(baseline);
  const dxp = calculate({
    ...baseline,
    target: { tier: "dxp", deployment: "saas" },
  });
  check("headless tier confidence = B",
    headless.flags.confidence === "B");
  check("DXP tier confidence = C (worst-case)",
    dxp.flags.confidence === "C");
}

// 13. URL encode/decode round-trip
console.log("\n13. URL encode/decode round-trip");
{
  const customScenario: CmsImplementationInputs = {
    ...baseline,
    org: { ...baseline.org, region: "US", currency: "USD" },
    target: { tier: "dxp", vendor: "adobe-aem", deployment: "paas" },
    scope: { ...baseline.scope, locales: 8, sites: 3 },
  };
  const encoded = encodeInputs(customScenario);
  const decoded = decodeInputs(`?d=${encoded}`);
  check("decoded result is non-null", decoded !== null);
  check("region survives round-trip", decoded?.org.region === "US");
  check("vendor survives round-trip", decoded?.target.vendor === "adobe-aem");
  check("locales survives round-trip", decoded?.scope.locales === 8);

  // Built URL contains ?d=
  const url = buildShareableUrl("https://ecm.dev/assessment/cms-implementation", customScenario);
  check("built URL contains ?d=", url.includes("?d="));
  check("built URL is reasonable size (<1000 chars)", url.length < 1000);

  // Invalid input → null (not throw)
  check("decoding garbage returns null", decodeInputs("?d=not-base64!!!") === null);
  check("decoding missing param returns null", decodeInputs("?other=value") === null);
}

/* ── Summary ───────────────────────────────────────────────────────────── */

console.log(`\n${passed} passed, ${failed} failed`);

if (failed > 0) {
  console.log("\nFailures:");
  failures.forEach((f) => console.log(`  - ${f}`));
  process.exit(1);
}

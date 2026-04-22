// calc.ts — the cost engine. Pure functions, no side effects, no framework.
// Ported from 02_cost_model_v0_2.xlsx. Output matches the xlsx to the dollar.

import {
  RATES,
  MATURITY_BLEND,
  TM_LEVERAGE,
  PRODUCTION,
  CHANNEL,
  SYSTEM,
  AI_OPS,
  SCALE,
  FRICTION,
  AI_VARIANT_COEF,
} from "./coefficients";
import type {
  EstimatorInputs,
  EstimatorResult,
  ScenarioResult,
  MaturityLevel,
} from "./types";

export function calculate(inputs: EstimatorInputs): EstimatorResult {
  const m = inputs.maturity;
  const blend = MATURITY_BLEND[m];

  // A. Blended translation rate
  const blendedRate =
    blend.human * RATES.human +
    blend.mtpe * RATES.mtpe +
    blend.ai * RATES.ai;

  // B. TM leverage
  const tmLeverage = TM_LEVERAGE[inputs.cadence];

  // I. Effective volume — source words scaled up for AI-generated variants
  const effectiveVolume = inputs.volume * (1 + AI_VARIANT_COEF * inputs.aiShare);

  // G. Scale factor — sub-linear scaling for fixed-cost layers
  const scaleFactor = Math.max(
    SCALE.floor,
    Math.pow(inputs.volume / 1_000_000, SCALE.exponent)
  );
  // Regulated uplift uses a gentler blended scale
  const regScale = SCALE.regBase + (1 - SCALE.regBase) * scaleFactor;

  // Maturity weight for interpolating base→mature multipliers
  const matWeight = m / 4;

  // ----- Layer 1: Translation -----
  const translation =
    effectiveVolume * inputs.languages * blendedRate * (1 - tmLeverage);

  // ----- Layer 2: Production (content-mix weighted, maturity-interpolated) -----
  const cm = inputs.contentMix;
  const prodMult =
    cm.marketing * interp(PRODUCTION.marketing, matWeight) +
    cm.product * interp(PRODUCTION.product, matWeight) +
    cm.support * interp(PRODUCTION.support, matWeight) +
    cm.legal * interp(PRODUCTION.legal, matWeight) +
    cm.video * interp(PRODUCTION.video, matWeight) +
    cm.training * interp(PRODUCTION.training, matWeight);
  const production = translation * (prodMult - 1);

  // ----- Layer 3: Channel adaptation -----
  const ch = inputs.channelMix;
  const chanFactor =
    ch.web * interp(CHANNEL.web, matWeight) +
    ch.mobile * interp(CHANNEL.mobile, matWeight) +
    ch.inproduct * interp(CHANNEL.inproduct, matWeight) +
    ch.video * interp(CHANNEL.video, matWeight) +
    ch.print * interp(CHANNEL.print, matWeight) +
    ch.email * interp(CHANNEL.email, matWeight) +
    ch.social * interp(CHANNEL.social, matWeight) +
    ch.voice * interp(CHANNEL.voice, matWeight);
  const channel = translation * (chanFactor - 1);

  // ----- Layer 4: System & governance -----
  const sysBase = SYSTEM.baseTooling * scaleFactor;
  const system =
    sysBase +
    translation * SYSTEM.glossaryPct +
    translation * SYSTEM.vendorPct +
    translation * SYSTEM.internalReviewPct;

  // ----- Layer 5: AI Operations -----
  const intensity = AI_OPS.intensity[m];
  const llm = AI_OPS.llmPer1kWords * (effectiveVolume / 1000) * intensity;
  const promptLib = AI_OPS.promptLibBase * intensity * scaleFactor;
  const governance = AI_OPS.governanceBase * intensity * scaleFactor;
  const regulated = inputs.regulated
    ? AI_OPS.regulatedUplift * intensity * regScale
    : 0;
  const hitl = translation * AI_OPS.humanInLoopPct * intensity;
  const aiOps = llm + promptLib + governance + regulated + hitl;

  // ----- Layer 6: Friction -----
  const frictionCoef = Math.min(
    FRICTION.cap,
    FRICTION.base +
      inputs.rework * FRICTION.reworkWeight +
      inputs.fragmentation * FRICTION.fragWeight +
      inputs.aiCoordGap * FRICTION.aiCoordWeight
  );
  const friction =
    (translation + production + channel + aiOps) * frictionCoef;

  const total = translation + production + channel + system + aiOps + friction;

  return {
    total,
    layers: { translation, production, channel, system, aiOps, friction },
    frictionCoef,
    blendedRate,
    effectiveVolume,
    scaleFactor,
    intensity,
  };
}

// Scenario: one maturity level up, AI coordination gap assumed to improve by 1
export function calculateScenario(inputs: EstimatorInputs): ScenarioResult {
  const targetM = Math.min(4, inputs.maturity + 1) as MaturityLevel;
  const scenarioInputs: EstimatorInputs = {
    ...inputs,
    maturity: targetM,
    aiCoordGap: Math.max(0, inputs.aiCoordGap - 1) as EstimatorInputs["aiCoordGap"],
  };
  const result = calculate(scenarioInputs);
  return { ...result, targetMaturity: targetM };
}

// Helper: interpolate between base and mature values by maturity weight
function interp(
  pair: { readonly base: number; readonly mature: number },
  weight: number
): number {
  return pair.base * (1 - weight) + pair.mature * weight;
}

// Convenience: confidence band bounds
export function confidenceBounds(total: number, band: number): {
  low: number;
  high: number;
} {
  return { low: total * (1 - band), high: total * (1 + band) };
}

// Convenience: currency conversion (USD-native internal math)
export function convertCurrency(
  amountUsd: number,
  to: "USD" | "EUR",
  usdToEur: number
): number {
  return to === "EUR" ? amountUsd * usdToEur : amountUsd;
}

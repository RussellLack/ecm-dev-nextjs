// types.ts — shared TypeScript interfaces for the Localisation Cost Estimator.
// Framework-agnostic: no React, no Next.js, no Supabase dependencies.

export type MaturityLevel = 0 | 1 | 2 | 3 | 4;
export type CadenceLevel = 1 | 2 | 3 | 4 | 5;
export type FrictionScore = 0 | 1 | 2 | 3;
export type DisplayCurrency = "EUR" | "USD";
export type RegulatedFlag = 0 | 1;

export interface ContentMix {
  marketing: number;
  product: number;
  support: number;
  legal: number;
  video: number;
  training: number;
}

export interface ChannelMix {
  web: number;
  mobile: number;
  inproduct: number;
  video: number;
  print: number;
  email: number;
  social: number;
  voice: number;
}

export interface EstimatorInputs {
  volume: number;          // annual source words
  aiShare: number;         // 0–1, share of source AI-assisted
  languages: number;       // target language count
  maturity: MaturityLevel;
  cadence: CadenceLevel;
  rework: FrictionScore;
  fragmentation: FrictionScore;
  aiCoordGap: FrictionScore;
  regulated: RegulatedFlag;
  displayCurrency: DisplayCurrency;
  contentMix: ContentMix;
  channelMix: ChannelMix;
}

export interface LayerCosts {
  translation: number;
  production: number;
  channel: number;
  system: number;
  aiOps: number;
  friction: number;
}

export interface EstimatorResult {
  total: number;
  layers: LayerCosts;
  frictionCoef: number;
  blendedRate: number;
  effectiveVolume: number;
  scaleFactor: number;
  intensity: number;
}

export interface ScenarioResult extends EstimatorResult {
  targetMaturity: MaturityLevel;
}

export type FeedbackReaction = "too_low" | "about_right" | "too_high" | "not_sure";

export interface FeedbackSubmission {
  modelVersion: string;
  inputs: EstimatorInputs;
  computed: {
    total: number;
    layers: LayerCosts;
  };
  scenarioShown: string; // e.g. "one_level_up_maturity"
  reaction: FeedbackReaction;
  comment?: string;
}

export interface FeedbackResponse {
  ok: boolean;
  token?: string; // 12-char token for later PATCH with comment
  error?: string;
}

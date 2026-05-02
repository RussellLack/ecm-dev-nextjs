// types.ts — input + output shapes for the CMS Implementation engine.
// Framework-agnostic: no React, no Next, no Sanity.

import type { Range, Confidence } from "./coefficients.ts";

export type OrgSize = "small" | "mid" | "enterprise" | "global";
export type Region = "UK" | "EU" | "US" | "Other";
export type Currency = "USD" | "GBP" | "EUR";
export type CurrentPlatformBucket =
  | "wordpress"
  | "sitecore-on-prem"
  | "sitecore-xm-cloud"
  | "optimizely"
  | "adobe-aem"
  | "drupal-acquia"
  | "kentico"
  | "umbraco"
  | "sitefinity"
  | "custom"
  | "opentext"
  | "hyland-onbase"
  | "other-ecm"
  | "headless"
  | "greenfield";
export type YearsOnPlatform = "<3" | "3-6" | "6-10" | "10+";
export type TargetTier = "headless" | "midMarket" | "dxp" | "ecm" | "unsure";
export type Deployment = "saas" | "paas" | "self-hosted" | "unsure";
export type PageBucket = "<500" | "500-5k" | "5k-50k" | "50k+";
export type Personalisation = "none" | "light" | "heavy";
export type UpdateFreq = "<10" | "10-50" | "50-200" | "200+";
export type TeamSize = "0" | "1-2" | "3-5" | "6+";

export interface CmsImplementationInputs {
  org: {
    size: OrgSize;
    industry: string;
    region: Region;
    currency: Currency;
  };
  current: {
    platform: CurrentPlatformBucket;
    yearsOnPlatform: YearsOnPlatform;
    painPoints: string[];
  };
  target: {
    tier: TargetTier;
    vendor?: string; // key in VENDOR_TIER
    deployment: Deployment;
  };
  scope: {
    sites: number;
    locales: number;
    pageBucket: PageBucket;
    integrations: string[];
    personalisation: Personalisation;
    compliance: string[];
  };
  runtime: {
    editors: number;
    updateFreq: UpdateFreq;
    teamSize: TeamSize;
    revenue?: number; // optional; in selected currency
    horizon: 3 | 5;
  };
  options?: {
    /** When true, use TEI benchmark multiplier on the benefit side. */
    useTeiBenefit?: boolean;
  };
}

export interface YearTotal {
  year: number;
  low: number;
  mid: number;
  high: number;
}

export interface BreakdownByLine {
  licence: Range;
  implementation: Range;
  hosting: Range;
  vendorSupport: Range;
  runTeam: Range;
  outYearEnhancement: Range; // recurring annual, applied from Year 2
  contingency: Range;        // one-off, on Year 1 implementation
}

export interface BenefitSide {
  editorHoursSaved: number;
  devHoursSaved: number;
  revenueUplift: number; // currency / yr
  threeYearValue: Range;
  fiveYearValue: Range;
}

export interface CmsImplementationResult {
  modelVersion: string;
  currency: Currency;
  currencyMultiplier: number;
  totalsByYear: YearTotal[];
  threeYearTotal: Range;
  fiveYearTotal: Range;
  breakdown: BreakdownByLine;
  benefit: {
    conservative: BenefitSide;
    tei: BenefitSide;
  };
  flags: {
    salesGated: boolean;
    highRiskProfile: boolean;
    confidence: Confidence;
    notes: string[];
  };
  inputsEcho: CmsImplementationInputs;
}

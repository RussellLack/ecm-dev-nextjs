// defaults.ts — starting input values for the CMS Implementation calculator.
// Calibrated for a mid-market UK B2B brand on WordPress, considering a
// headless replatform.

import type { CmsImplementationInputs } from "./types.ts";

export const DEFAULT_INPUTS: CmsImplementationInputs = {
  org: {
    size: "mid",
    industry: "manufacturing",
    region: "UK",
    currency: "GBP",
  },
  current: {
    platform: "wordpress",
    yearsOnPlatform: "3-6",
    painPoints: [],
  },
  target: {
    tier: "headless",
    deployment: "saas",
  },
  scope: {
    sites: 1,
    locales: 1,
    pageBucket: "500-5k",
    integrations: [],
    personalisation: "none",
    compliance: [],
  },
  runtime: {
    editors: 5,
    updateFreq: "10-50",
    teamSize: "1-2",
    horizon: 3,
  },
  options: {
    useTeiBenefit: false,
  },
};

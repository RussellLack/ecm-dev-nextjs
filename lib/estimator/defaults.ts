// defaults.ts — starting input values.
// Calibrated for a mid-sized international firm (250k words, 6 target languages).

import type { EstimatorInputs } from "./types";

export const DEFAULT_INPUTS: EstimatorInputs = {
  volume: 250_000,
  aiShare: 0.20,
  languages: 6,
  maturity: 2,
  cadence: 3,
  rework: 1,
  fragmentation: 2,
  aiCoordGap: 2,
  regulated: 0,
  displayCurrency: "EUR",
  contentMix: {
    marketing: 0.25,
    product: 0.25,
    support: 0.25,
    legal: 0.05,
    video: 0.10,
    training: 0.10,
  },
  channelMix: {
    web: 0.25,
    mobile: 0.15,
    inproduct: 0.15,
    video: 0.10,
    print: 0.05,
    email: 0.10,
    social: 0.10,
    voice: 0.10,
  },
};

// scenarios.ts — pre-built example scenarios surfaced as quick-fill
// buttons at the top of the form. Helps first-time visitors see the
// model do something useful before committing 12 inputs of their own.

import type { CmsImplementationInputs } from "./types.ts";

export interface Scenario {
  id: string;
  label: string;
  blurb: string;
  inputs: CmsImplementationInputs;
}

export const SCENARIOS: Scenario[] = [
  {
    id: "midmarket-uk-headless",
    label: "Mid-market UK B2B → headless",
    blurb:
      "200–2,000-employee manufacturer, single brand, 6 locales, replatforming WordPress to a headless CMS with light personalisation.",
    inputs: {
      org: {
        size: "mid",
        industry: "manufacturing",
        region: "UK",
        currency: "GBP",
      },
      current: {
        platform: "wordpress",
        yearsOnPlatform: "6-10",
        painPoints: ["slow-publish", "dev-bottleneck", "no-localisation"],
      },
      target: {
        tier: "headless",
        vendor: "sanity",
        deployment: "saas",
      },
      scope: {
        sites: 1,
        locales: 6,
        pageBucket: "5k-50k",
        integrations: ["crm", "marketing", "analytics"],
        personalisation: "light",
        compliance: ["gdpr", "wcag"],
      },
      runtime: {
        editors: 12,
        updateFreq: "50-200",
        teamSize: "1-2",
        horizon: 3,
      },
      options: { useTeiBenefit: false },
    },
  },
  {
    id: "global-enterprise-aem",
    label: "Global enterprise → Adobe AEM",
    blurb:
      "10,000+ employees, multi-brand, 15 locales, 50,000+ pages, heavy personalisation, full compliance stack. Sales-gated DXP example.",
    inputs: {
      org: {
        size: "global",
        industry: "financial-services",
        region: "US",
        currency: "USD",
      },
      current: {
        platform: "adobe-aem",
        yearsOnPlatform: "10+",
        painPoints: ["expensive", "dev-bottleneck", "no-ai"],
      },
      target: {
        tier: "dxp",
        vendor: "adobe-aem",
        deployment: "paas",
      },
      scope: {
        sites: 8,
        locales: 15,
        pageBucket: "50k+",
        integrations: ["crm", "erp", "pim-dam", "marketing", "commerce", "sso", "analytics", "personalisation"],
        personalisation: "heavy",
        compliance: ["gdpr", "wcag", "iso", "soc2", "sector"],
      },
      runtime: {
        editors: 80,
        updateFreq: "200+",
        teamSize: "6+",
        horizon: 5,
      },
      options: { useTeiBenefit: false },
    },
  },
  {
    id: "small-startup-headless",
    label: "Small startup → headless greenfield",
    blurb:
      "Sub-200-employee SaaS company, no existing platform, single locale, light integrations. Greenfield headless build.",
    inputs: {
      org: {
        size: "small",
        industry: "technology",
        region: "EU",
        currency: "EUR",
      },
      current: {
        platform: "greenfield",
        yearsOnPlatform: "<3",
        painPoints: [],
      },
      target: {
        tier: "headless",
        vendor: "sanity",
        deployment: "saas",
      },
      scope: {
        sites: 1,
        locales: 2,
        pageBucket: "<500",
        integrations: ["analytics", "marketing"],
        personalisation: "none",
        compliance: ["gdpr", "wcag"],
      },
      runtime: {
        editors: 3,
        updateFreq: "10-50",
        teamSize: "1-2",
        horizon: 3,
      },
      options: { useTeiBenefit: false },
    },
  },
];

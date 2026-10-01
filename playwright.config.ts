import { defineConfig, devices } from "@playwright/test";

import { resolveBaseURL, LOCAL_BASE_URL } from "./tests/e2e/base-url";

/**
 * Playwright config for the assessment E2E suite.
 *
 * The target origin comes from tests/e2e/base-url.ts:
 *
 *   npm run test:e2e                                  local server (default)
 *   BASE_URL=<deploy preview> npm run test:e2e        deploy-preview gate
 *   E2E_BASE_URL=https://ecm.dev npm run test:e2e:smoke   production, explicitly
 *
 * Every spec imports from tests/e2e/fixtures.ts, which blocks Google
 * Analytics and the /gtm/ proxy so test runs never reach GA4.
 */
const baseURL = resolveBaseURL();
const isLocal = baseURL === LOCAL_BASE_URL;

export default defineConfig({
  testDir: "./tests/e2e",
  // Discovers the assessment target list (bespoke routes + sitemap) once, up
  // front, and writes it to test-results/targets.json for the smoke spec.
  globalSetup: "./tests/e2e/global-setup.ts",
  // Tests hit a remote origin, so allow generous timeouts for cold edges.
  timeout: 30_000,
  expect: { timeout: 10_000 },
  // Absorb transient network / cron flakiness without masking real failures.
  retries: 2,
  // Remote-only suite: no local web server, parallelism is safe and wanted.
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI
    ? [["list"], ["html", { open: "never" }]]
    : [["list"]],
  // Default local target: reuse a running `npm run dev`, or start one.
  webServer: isLocal
    ? {
        command: "npm run dev",
        url: LOCAL_BASE_URL,
        reuseExistingServer: true,
        timeout: 180_000,
      }
    : undefined,
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});

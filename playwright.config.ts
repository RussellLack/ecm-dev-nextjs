import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for the assessment E2E suite.
 *
 * Target is selected entirely by the BASE_URL env var so the same specs run
 * against a Netlify deploy preview (the gate) or production (the monitor):
 *
 *   BASE_URL=https://www.ecm.dev npm run test:e2e:smoke
 *
 * There is deliberately no default — an unset BASE_URL should fail loudly
 * rather than silently testing the wrong origin.
 */
const baseURL = process.env.BASE_URL;

if (!baseURL) {
  throw new Error(
    "BASE_URL is required (e.g. BASE_URL=https://www.ecm.dev). " +
      "Set it to the deploy-preview or production origin under test.",
  );
}

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
  // In CI, the target is often a deploy preview seconds old: its serverless
  // functions are still scaling out to handle concurrent load. A single real
  // browser page load already issues far more simultaneous requests (JS
  // bundles, RSC fetches, fonts) than the global-setup warm-up's plain GETs;
  // running the smoke and full specs as two concurrent workers doubles that
  // burst right when the origin can least afford it. Serialize to one worker
  // in CI so the origin only ever sees one real browser's worth of load at a
  // time -- locally (against a stable target) full parallelism is still fine
  // and faster.
  workers: process.env.CI ? 1 : undefined,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI
    ? [["list"], ["html", { open: "never" }]]
    : [["list"]],
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

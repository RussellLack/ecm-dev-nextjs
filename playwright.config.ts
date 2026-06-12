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

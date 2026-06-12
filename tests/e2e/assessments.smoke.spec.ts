import fs from "node:fs";
import { test, expect } from "@playwright/test";
import { TARGETS_FILE } from "./global-setup";
import type { AssessmentTarget } from "./helpers/targets";
import { attachConsoleGuard } from "./helpers/hydration";
import { exerciseAssessment } from "./helpers/flows";

/**
 * Smoke suite — runs against every discovered assessment (bespoke routes +
 * Sanity-authored slugs from the sitemap). For each one it proves the page
 * HYDRATED and is interactive, and that no CSP / hydration / runtime errors
 * appeared. It never submits a lead or sends an email, so it is safe to run
 * against production on a schedule.
 *
 * Targets are read at runtime (after globalSetup has written targets.json) and
 * each is exercised in its own browser context for isolation. A failing target
 * is reported as a red step but does not stop the others, so a single run
 * surfaces every broken assessment.
 */

function loadTargets(): AssessmentTarget[] {
  if (!fs.existsSync(TARGETS_FILE)) {
    throw new Error(
      `Targets file missing (${TARGETS_FILE}). globalSetup should have written it — ` +
        "ensure BASE_URL is set and global setup ran.",
    );
  }
  return JSON.parse(fs.readFileSync(TARGETS_FILE, "utf-8")) as AssessmentTarget[];
}

test("every assessment hydrates and is interactive", async ({ browser }) => {
  const targets = loadTargets();
  expect(
    targets.length,
    "should have discovered at least the bespoke assessments",
  ).toBeGreaterThan(0);

  // One test exercises every target sequentially (isolated contexts), so the
  // default per-test timeout is far too short — scale it to the target count.
  test.setTimeout(Math.max(60_000, targets.length * 30_000));

  const failures: string[] = [];

  for (const target of targets) {
    try {
      await test.step(`${target.slug} — ${target.url}`, async () => {
        const context = await browser.newContext();
        const page = await context.newPage();
        const guard = attachConsoleGuard(page);
        try {
          const res = await page.goto(target.url, {
            waitUntil: "domcontentloaded",
          });
          expect(res?.ok(), `navigation to ${target.url} should return 2xx`).toBeTruthy();

          // The core check: page must be genuinely interactive, not just rendered.
          await exerciseAssessment(page);

          // Let any late (post-interaction) console errors surface.
          await page.waitForTimeout(500);

          expect(
            guard.errors(),
            `CSP/hydration/runtime errors on ${target.slug}`,
          ).toEqual([]);
        } finally {
          await context.close();
        }
      });
    } catch (err) {
      failures.push(`${target.slug}: ${(err as Error).message.split("\n")[0]}`);
    }
  }

  expect(
    failures,
    `assessments that failed:\n${failures.join("\n")}`,
  ).toEqual([]);
});

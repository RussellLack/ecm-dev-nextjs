import { test, expect } from "./fixtures";
import {
  REPRESENTATIVE_ENGAGEMENTS,
  HOMEPAGE_ENGAGEMENTS,
  ENGAGEMENTS_PATH,
  PROVENANCE_STATEMENT,
  engagementHref,
} from "../../lib/representativeEngagements";

/**
 * Smoke checks for the representative-engagement proof library
 * (lib/representativeEngagements.ts). Read-only: no forms, no submissions,
 * analytics blocked by the shared fixtures, so it is safe against
 * production. Runs in the deploy-preview gate (all specs) and in the
 * six-hourly production monitor (via `npm run test:e2e:smoke`).
 *
 * The key guarantees: scenarios stay out of the Projects grid (they must
 * never read as delivered client work or inflate its count), the archive
 * strip points to them, and every scenario surface carries its label and
 * provenance.
 */

const CARD_CTA = "See the representative engagement";
const BADGE = /^Representative engagement$/i;

test("Projects archive links to representative engagements without listing them", async ({ page }) => {
  const res = await page.goto("/case-study");
  expect(res?.status(), "/case-study should load").toBeLessThan(400);

  const strip = page.locator("aside", {
    has: page.getByRole("heading", { name: "Representative engagements" }),
  });
  await expect(strip, "the strip below the Projects grid").toBeVisible();
  await expect(strip.getByRole("link", { name: /See what this looks like in practice/ }))
    .toHaveAttribute("href", ENGAGEMENTS_PATH);

  // No scenario card or badge anywhere on the archive page.
  await expect(page.getByRole("link", { name: new RegExp(CARD_CTA) })).toHaveCount(0);
  await expect(page.getByText(BADGE)).toHaveCount(0);
});

test("index lists every scenario with the provenance statement", async ({ page }) => {
  const res = await page.goto(ENGAGEMENTS_PATH);
  expect(res?.status()).toBeLessThan(400);
  await expect(page.getByText(PROVENANCE_STATEMENT)).toBeVisible();
  await expect(page.getByRole("link", { name: new RegExp(CARD_CTA) }))
    .toHaveCount(REPRESENTATIVE_ENGAGEMENTS.length);
});

test("homepage shows exactly the three featured scenarios", async ({ page }) => {
  await page.goto("/");
  const section = page.locator("section", { has: page.locator("#in-practice-heading") });
  await expect(section).toBeVisible();
  const cards = section.getByRole("link", { name: new RegExp(CARD_CTA) });
  await expect(cards).toHaveCount(HOMEPAGE_ENGAGEMENTS.length);
  for (const id of HOMEPAGE_ENGAGEMENTS) {
    const e = REPRESENTATIVE_ENGAGEMENTS.find((x) => x.id === id)!;
    await expect(section.locator(`a[href="${engagementHref(e)}"]`)).toHaveCount(1);
  }
});

test("a scenario page carries its label and provenance", async ({ page }) => {
  const e = REPRESENTATIVE_ENGAGEMENTS[0];
  const res = await page.goto(engagementHref(e));
  expect(res?.status()).toBeLessThan(400);
  await expect(page.getByRole("heading", { level: 1, name: e.title })).toBeVisible();
  await expect(page.getByText(BADGE).first()).toBeVisible();
  await expect(page.getByText(PROVENANCE_STATEMENT)).toBeVisible();
});

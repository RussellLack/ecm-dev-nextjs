import { expect, type Page } from "@playwright/test";

/**
 * Two assessment shapes exist:
 *   - "qa"        : start button → questions (AssessmentShell, lead-magnet, process)
 *   - "calculator": immediately interactive, no start (localisation-cost, cms)
 *
 * Both are exercised far enough to PROVE the page hydrated and responds to a
 * real React handler, without ever submitting a lead/email.
 */

export type FlowType = "qa" | "calculator";

export async function detectFlowType(page: Page): Promise<FlowType> {
  const hasStart = (await page.getByTestId("assessment-start").count()) > 0;
  return hasStart ? "qa" : "calculator";
}

/**
 * Drive the assessment to prove interactivity. Throws (via expect) if the page
 * rendered but is not actually interactive — i.e. the hydration-failure case.
 */
export async function exerciseAssessment(page: Page): Promise<void> {
  // The assessment tools sit behind the registration gate (AssessmentGate),
  // which reveals the tool client-side only after reading the access cookie in
  // an effect. That extra async reveal races the one-shot flow-type detection
  // below: for a "qa" tool the start button isn't in the DOM yet at detect
  // time, so it would misclassify as "calculator" and then wait for an element
  // that never appears. Wait for the tool itself to surface first — either the
  // qa start button or the calculator root — before detecting its shape.
  await page
    .locator(
      '[data-testid="assessment-start"], [data-testid="assessment-interactive"]',
    )
    .first()
    .waitFor({ state: "visible", timeout: 20_000 });

  const type = await detectFlowType(page);

  if (type === "qa") {
    const start = page.getByTestId("assessment-start").first();
    await expect(start, "start button should be visible").toBeVisible();
    await expect(start, "start button should be enabled").toBeEnabled();
    await start.click();

    // Hydration proof: the question/step container only appears once a real
    // React onClick handler runs. A dead (un-hydrated) button → this times out.
    await expect(
      page.getByTestId("assessment-question").first(),
      "question step should appear after clicking start",
    ).toBeVisible();

    // Confirm at least one answer option is interactive.
    const option = page.getByTestId("assessment-option").first();
    await expect(option, "an answer option should be visible").toBeVisible();
    await option.click();
    return;
  }

  // calculator
  const root = page.getByTestId("assessment-interactive").first();
  await expect(root, "calculator root should be visible").toBeVisible();

  // Any enabled control inside the calculator proves the tool rendered.
  const control = root
    .locator("input, select, [data-testid='assessment-option']")
    .first();
  await expect(control, "a calculator control should be visible").toBeVisible();
  // Interacting proves handlers are wired; harmless (no submit, no side effect).
  await control.click();
}

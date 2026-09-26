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

/**
 * Drive an AssessmentShell questionnaire to the end. Single-select questions
 * auto-advance after 400ms; multi-select ones need an explicit Next. After
 * the last answer the shell shows "Calculating your results..." while it
 * scores the submission (a cold serverless call, often several seconds),
 * then redirects to /results. Every wait here is bounded, so a stuck step
 * fails with a message naming it instead of silently eating the test timeout.
 */
export async function completeShell(page: Page): Promise<void> {
  const question = page.getByTestId("assessment-question");
  const heading = question.locator("h2");
  const retry = page.getByRole("button", { name: "Try again" });
  const onResults = () => /\/results\?sid=/.test(page.url());

  for (let i = 0; i < 100; i++) {
    // Next state: another question, the results page, or a scoring error.
    await expect
      .poll(
        async () => onResults() || (await retry.count()) > 0 || (await question.count()) > 0,
        { timeout: 60_000, message: "waiting for the next question or the results page" },
      )
      .toBe(true);
    if (onResults()) return;
    if ((await retry.count()) > 0) {
      const msg = await page.locator(".text-red-400").first().textContent({ timeout: 1_000 }).catch(() => "");
      throw new Error(`scoring submission failed: ${msg?.trim() || "unknown error"}`);
    }

    const before = await heading.textContent({ timeout: 5_000 });
    await page.getByTestId("assessment-option").first().click();

    const advanced = await expect
      .poll(
        async () =>
          onResults() ||
          (await question.count()) === 0 ||
          (await heading.textContent({ timeout: 1_000 }).catch(() => null)) !== before,
        { timeout: 2_000 },
      )
      .toBe(true)
      .then(() => true, () => false);

    // Multi-select: no auto-advance, so press Next ("See results" on the last).
    if (!advanced) await page.getByTestId("assessment-next").click({ timeout: 5_000 });
  }
  throw new Error("questionnaire did not reach the results page within 100 questions");
}

/**
 * On a Sanity-authored results page, wait for the "email my report" form. If
 * it never renders (e.g. the page 404s because the just-stored submission
 * can't be read back yet), fail with what the page actually shows.
 */
export async function expectReportForm(page: Page): Promise<void> {
  try {
    await page.getByTestId("assessment-email").waitFor({ state: "visible", timeout: 30_000 });
  } catch {
    const shown = await page
      .locator("h1, h2")
      .allTextContents()
      .then((t) => t.map((s) => s.trim()).filter(Boolean).slice(0, 3).join(" | "))
      .catch(() => "");
    throw new Error(
      `results page did not render the report form (${page.url()}); page shows: "${shown || "nothing"}"`,
    );
  }
}

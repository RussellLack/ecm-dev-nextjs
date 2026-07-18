import { test, expect } from "@playwright/test";
import { attachConsoleGuard } from "./helpers/hydration";

/**
 * Full end-to-end flow for the representative `lead-magnet` assessment.
 *
 * Unlike the smoke suite, this completes the ENTIRE flow including the final
 * submit. To avoid creating a real lead or sending a real email, every
 * /api/assessment/** request is intercepted and fulfilled with a stub. We then
 * assert the client fired well-formed submit + email requests and rendered the
 * success state. No backend is touched, so this is safe on deploy previews.
 *
 * Runs only via `test:e2e:full` (the deploy-preview gate), not the prod monitor.
 */

const LEAD_MAGNET_PATH = "/assessment/lead-magnet";
const TEST_EMAIL = "e2e-noreply@example.com";

test("lead-magnet completes end-to-end with submission intercepted", async ({
  page,
}) => {
  let submitCalls = 0;
  let emailCalls = 0;
  let submitBody: any = null;
  let emailBody: any = null;

  // Intercept all assessment API calls so nothing is persisted or emailed.
  await page.route("**/api/assessment/**", async (route) => {
    const req = route.request();
    const url = req.url();
    if (req.method() === "POST" && url.includes("/api/assessment/tool-submit")) {
      submitCalls++;
      try {
        submitBody = JSON.parse(req.postData() || "{}");
      } catch {
        /* ignore */
      }
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ submissionId: "e2e-test-submission" }),
      });
    }
    if (req.method() === "POST" && url.includes("/api/assessment/tool-email")) {
      emailCalls++;
      try {
        emailBody = JSON.parse(req.postData() || "{}");
      } catch {
        /* ignore */
      }
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    }
    return route.continue();
  });

  const guard = attachConsoleGuard(page);

  // The success path ends in an alert("Results sent to ...").
  let alertMessage = "";
  page.on("dialog", async (dialog) => {
    alertMessage = dialog.message();
    await dialog.accept();
  });

  // Grant registration-gate access so the tool renders (the gate itself is
  // exercised separately; here we test the assessment flow behind it). Same
  // cookie the gate sets on real registration (see lib/assessment/gate.ts).
  await page.context().addCookies([
    {
      name: "ecm_assess_access",
      value: "1",
      url: new URL(LEAD_MAGNET_PATH, process.env.BASE_URL).toString(),
    },
  ]);

  await page.goto(LEAD_MAGNET_PATH, { waitUntil: "domcontentloaded" });

  // ── Welcome → start
  await page.getByTestId("assessment-start").click();

  // Answer every question group visible in the current step, then continue.
  async function answerStep(expectedQuestions: number) {
    const groups = page.getByTestId("assessment-question-group");
    await expect(groups).toHaveCount(expectedQuestions);
    for (let i = 0; i < expectedQuestions; i++) {
      await groups.nth(i).getByTestId("assessment-option").first().click();
    }
  }
  async function clickNext() {
    const next = page.getByTestId("assessment-next");
    await expect(next).toBeEnabled();
    await next.click();
  }

  // ── market (3 questions)
  await answerStep(3);
  await clickNext();

  // ── authority (3 questions)
  await answerStep(3);
  await clickNext();

  // ── capabilities (sliders have defaults — no questions to answer)
  await expect(page.getByTestId("assessment-question-group")).toHaveCount(0);
  await clickNext();

  // ── context (1 question)
  await answerStep(1);
  await clickNext();

  // ── results: fill email + consent, then submit
  await page.getByTestId("assessment-email").fill(TEST_EMAIL);
  await page.getByTestId("assessment-consent").click();
  const submit = page.getByTestId("assessment-submit");
  await expect(submit).toBeEnabled();
  await submit.click();

  // ── assertions: client fired well-formed, intercepted requests
  await expect.poll(() => submitCalls, { timeout: 10_000 }).toBeGreaterThan(0);
  expect(submitBody?.toolType).toBe("lead-magnet");
  expect(submitBody?.consentGiven).toBe(true);

  await expect.poll(() => emailCalls, { timeout: 10_000 }).toBeGreaterThan(0);
  expect(emailBody?.email).toBe(TEST_EMAIL);

  // Success surfaced to the user.
  await expect.poll(() => alertMessage, { timeout: 10_000 }).toContain(TEST_EMAIL);

  // No CSP / hydration / runtime errors anywhere in the flow.
  expect(guard.errors(), "console errors during full flow").toEqual([]);
});

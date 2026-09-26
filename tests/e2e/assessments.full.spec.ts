import fs from "node:fs";
import { test, expect, type Page } from "@playwright/test";
import { TARGETS_FILE } from "./global-setup";
import { BESPOKE_SLUGS, type AssessmentTarget } from "./helpers/targets";
import { attachConsoleGuard } from "./helpers/hydration";
import {
  TEST_EMAIL,
  gateIsShowing,
  interceptSubmissions,
  registerViaGate,
  type SubmissionRecorder,
} from "./helpers/submissions";

/**
 * Full end-to-end journey for EVERY assessment, simulating a brand-new
 * visitor from registration through to emailing their results:
 *
 *   1. land with no access cookie → registration gate is shown
 *   2. register (work email + required consent) → tool is revealed
 *   3. complete the assessment
 *   4. enter email + consent on the results → submit
 *
 * Every lead / email / CRM endpoint is intercepted and fulfilled with a stub
 * (see helpers/submissions.ts), and each test asserts the client sent a
 * well-formed payload and showed the success state. No real lead is created
 * and no email is sent, so this is safe on deploy previews.
 *
 * Runs only via `test:e2e:full` / `test:e2e` (the deploy-preview gate), not
 * the production monitor.
 */

// A single navigation can take up to 60s on a cold function (see targets.ts
// warm-up), and each test then runs a whole questionnaire.
test.setTimeout(150_000);

async function open(page: Page, path: string) {
  const res = await page.goto(path, { waitUntil: "domcontentloaded", timeout: 60_000 });
  expect(res?.ok(), `navigation to ${path} should return 2xx`).toBeTruthy();
}

/** Nothing outside the stubbed set was written, and no CSP/hydration errors. */
function expectCleanRun(recorder: SubmissionRecorder, guard: { errors(): string[] }) {
  expect(recorder.unexpected, "unexpected (blocked) API writes").toEqual([]);
  expect(guard.errors(), "console errors during full flow").toEqual([]);
}

async function clickNext(page: Page) {
  const next = page.getByTestId("assessment-next");
  await expect(next).toBeEnabled();
  await next.click();
}

/** Pick the first option in every question group on the current step. */
async function answerStep(page: Page, expectedQuestions: number) {
  const groups = page.getByTestId("assessment-question-group");
  await expect(groups).toHaveCount(expectedQuestions);
  for (let i = 0; i < expectedQuestions; i++) {
    await groups.nth(i).getByTestId("assessment-option").first().click();
  }
}

// ─── Lead Magnet ────────────────────────────────────────────────────────────

test("lead-magnet: register → complete → email results", async ({ page }) => {
  const recorder = await interceptSubmissions(page);
  const guard = attachConsoleGuard(page);

  // The success path ends in an alert("Results sent to ...").
  let alertMessage = "";
  page.on("dialog", async (dialog) => {
    alertMessage = dialog.message();
    await dialog.accept();
  });

  await open(page, "/assessment/lead-magnet");
  await registerViaGate(page, recorder, "lead-magnet");

  await page.getByTestId("assessment-start").click();

  await answerStep(page, 3); // market
  await clickNext(page);
  await answerStep(page, 3); // authority
  await clickNext(page);
  // capabilities: sliders have defaults, no questions to answer
  await expect(page.getByTestId("assessment-question-group")).toHaveCount(0);
  await clickNext(page);
  await answerStep(page, 1); // context
  await clickNext(page);

  await page.getByTestId("assessment-email").fill(TEST_EMAIL);
  await page.getByTestId("assessment-consent").click();
  const submit = page.getByTestId("assessment-submit");
  await expect(submit).toBeEnabled();
  await submit.click();

  await expect
    .poll(() => recorder.bodies("/api/assessment/tool-email").length, { timeout: 10_000 })
    .toBeGreaterThan(0);
  const [submitBody] = recorder.bodies("/api/assessment/tool-submit");
  expect(submitBody?.toolType).toBe("lead-magnet");
  expect(submitBody?.consentGiven).toBe(true);
  const [emailBody] = recorder.bodies("/api/assessment/tool-email");
  expect(emailBody?.email).toBe(TEST_EMAIL);
  expect(emailBody?.submissionId).toBe("e2e-test-submission");

  await expect.poll(() => alertMessage, { timeout: 10_000 }).toContain(TEST_EMAIL);
  expectCleanRun(recorder, guard);
});

// ─── Process Assessment ─────────────────────────────────────────────────────

test("process: register → complete → email results", async ({ page }) => {
  const recorder = await interceptSubmissions(page);
  const guard = attachConsoleGuard(page);

  let alertMessage = "";
  page.on("dialog", async (dialog) => {
    alertMessage = dialog.message();
    await dialog.accept();
  });

  await open(page, "/assessment/process");
  await registerViaGate(page, recorder, "process");

  await page.getByTestId("assessment-start").click();

  // Six sections; question counts mirror stageValid() in ProcessAssessment.
  for (const questions of [1, 4, 3, 3, 2, 3]) {
    await answerStep(page, questions);
    await clickNext(page); // last one is "Submit Assessment →"
  }

  // Completion screen → optional email capture.
  const submit = page.getByTestId("assessment-submit");
  await page.getByTestId("assessment-email").fill(TEST_EMAIL);
  await page.getByTestId("assessment-consent").click();
  await expect(submit).toBeEnabled();
  await submit.click();

  await expect
    .poll(() => recorder.bodies("/api/assessment/tool-email").length, { timeout: 10_000 })
    .toBeGreaterThan(0);
  const [submitBody] = recorder.bodies("/api/assessment/tool-submit");
  expect(submitBody?.toolType).toBe("process");
  expect(submitBody?.consentGiven).toBe(true);
  expect(submitBody?.contact?.email).toBe(TEST_EMAIL);
  expect(submitBody?.results?.brief, "pre-diagnostic brief is generated").toBeTruthy();
  const [emailBody] = recorder.bodies("/api/assessment/tool-email");
  expect(emailBody?.email).toBe(TEST_EMAIL);
  expect(emailBody?.submissionId).toBe("e2e-test-submission");

  await expect.poll(() => alertMessage, { timeout: 10_000 }).toContain(TEST_EMAIL);
  expectCleanRun(recorder, guard);
});

// ─── Localisation Cost Estimator ────────────────────────────────────────────

test("localisation-cost: register → estimate → email breakdown", async ({ page }) => {
  const recorder = await interceptSubmissions(page);
  const guard = attachConsoleGuard(page);

  await open(page, "/assessment/localisation-cost");
  await registerViaGate(page, recorder, "localisation-cost");

  // Calculator renders a live estimate from defaults; no steps to complete.
  await expect(page.getByTestId("assessment-interactive")).toBeVisible();

  await page.getByTestId("assessment-email-open").click();
  const submit = page.getByTestId("assessment-submit");
  await page.getByTestId("assessment-email").fill(TEST_EMAIL);
  // Consent is required: submit stays disabled until it is ticked.
  await expect(submit).toBeDisabled();
  await page.getByTestId("assessment-consent").click();
  await expect(submit).toBeEnabled();
  await submit.click();

  await expect(page.getByTestId("assessment-email-sent")).toBeVisible({ timeout: 10_000 });
  const [body] = recorder.bodies("/api/feedback/email");
  expect(body?.email).toBe(TEST_EMAIL);
  expect(body?.consentGiven).toBe(true);
  expect(body?.consentSource).toBe("pdf_request");
  expect(typeof body?.computed?.total, "estimate total is sent").toBe("number");

  expectCleanRun(recorder, guard);
});

// ─── CMS Implementation Cost Estimator ──────────────────────────────────────

test("cms-implementation: register → estimate → email take-away", async ({ page }) => {
  const recorder = await interceptSubmissions(page);
  const guard = attachConsoleGuard(page);

  await open(page, "/assessment/cms-implementation");
  await registerViaGate(page, recorder, "cms-implementation");

  // Load a sample scenario so the estimate is non-default, as a visitor would.
  await page.getByTestId("assessment-option").first().click();

  const email = page.getByTestId("assessment-email");
  await email.scrollIntoViewIfNeeded();
  await email.fill(TEST_EMAIL);
  await page.getByTestId("assessment-submit").click();

  // Email sent → optional enrichment step appears.
  await expect(page.getByTestId("assessment-email-sent")).toBeVisible({ timeout: 10_000 });

  const [submitBody] = recorder.bodies("/api/assessment/tool-submit");
  expect(submitBody?.toolType).toBe("cms-implementation");
  expect(submitBody?.contact?.email).toBe(TEST_EMAIL);
  expect(submitBody?.consentGiven).toBe(true);
  expect(submitBody?.results, "TCO result is sent").toBeTruthy();
  const [sendBody] = recorder.bodies("/api/assessment/cms-implementation/send");
  expect(sendBody?.email).toBe(TEST_EMAIL);
  expect(sendBody?.submissionId).toBe("e2e-test-submission");

  expectCleanRun(recorder, guard);
});

// ─── Sanity-authored assessments (/assessment/[slug]) ───────────────────────

function sanityTargets(): AssessmentTarget[] {
  if (!fs.existsSync(TARGETS_FILE)) return [];
  const all = JSON.parse(fs.readFileSync(TARGETS_FILE, "utf-8")) as AssessmentTarget[];
  const bespoke = new Set<string>(BESPOKE_SLUGS);
  return all.filter((t) => !bespoke.has(t.slug));
}

/**
 * Drive an AssessmentShell questionnaire to the end. Single-select questions
 * auto-advance after 400ms; multi-select ones need an explicit Next. After
 * the last answer the shell scores the submission and redirects to /results.
 */
async function completeShell(page: Page) {
  const heading = page.getByTestId("assessment-question").locator("h2");
  for (let i = 0; i < 100; i++) {
    if (/\/results/.test(page.url())) return;
    const before = await heading.textContent().catch(() => null);
    if (before === null) break; // submitting screen
    await page.getByTestId("assessment-option").first().click();

    const advanced = await expect
      .poll(
        async () =>
          /\/results/.test(page.url()) ||
          (await heading.count()) === 0 ||
          (await heading.textContent().catch(() => null)) !== before,
        { timeout: 2_000 },
      )
      .toBe(true)
      .then(() => true, () => false);

    if (!advanced) await clickNext(page);
  }
  await page.waitForURL(/\/results\?sid=/, { timeout: 60_000 });
}

test("sanity-authored: register → complete → email report", async ({ browser }) => {
  const targets = sanityTargets();
  test.skip(targets.length === 0, "no Sanity-authored assessments discovered");
  test.setTimeout(Math.max(150_000, targets.length * 150_000));

  const failures: string[] = [];
  for (const target of targets) {
    try {
      await test.step(`${target.slug} — ${target.url}`, async () => {
        const context = await browser.newContext();
        const page = await context.newPage();
        try {
          // The shell's anonymous scoring POST must reach the server: the
          // results page is server-rendered from the stored submission. It
          // holds answers + score only (no email, no CRM push). UTM tags mark
          // these records as test traffic.
          const recorder = await interceptSubmissions(page, { allowAnonymousScoring: true });
          const guard = attachConsoleGuard(page);

          const url = new URL(target.url);
          url.searchParams.set("utm_source", "e2e");
          url.searchParams.set("utm_campaign", "playwright-full-flow");
          await open(page, url.toString());

          // Most are gated; content-operations-maturity is deliberately open.
          if (await gateIsShowing(page)) {
            await registerViaGate(page, recorder, target.slug);
          }

          await page.getByTestId("assessment-start").click();
          await completeShell(page);

          // Results page → email the full report.
          const submit = page.getByTestId("assessment-submit");
          await page.getByTestId("assessment-email").fill(TEST_EMAIL);
          await page.getByTestId("assessment-consent").click();
          await submit.click();

          await expect(page.getByTestId("assessment-email-sent")).toBeVisible({
            timeout: 10_000,
          });
          const [reportBody] = recorder.bodies("/api/assessment/report");
          expect(reportBody?.email).toBe(TEST_EMAIL);
          expect(reportBody?.consentGiven).toBe(true);
          expect(reportBody?.submissionId, "report is tied to the stored submission").toBe(
            new URL(page.url()).searchParams.get("sid"),
          );

          expectCleanRun(recorder, guard);
        } finally {
          await context.close();
        }
      });
    } catch (err) {
      failures.push(`${target.slug}: ${(err as Error).message.split("\n")[0]}`);
    }
  }

  expect(failures, `assessments that failed:\n${failures.join("\n")}`).toEqual([]);
});

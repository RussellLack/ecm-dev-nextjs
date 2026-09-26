import { expect, type Page, type Request } from "@playwright/test";

/**
 * Network harness for the full-flow suite.
 *
 * Every endpoint that creates a lead, sends an email or pushes to the CRM is
 * fulfilled with a stub, and the request body is recorded so the spec can
 * assert the client sent a well-formed payload. Nothing reaches Postmark,
 * Snov.io, the rl@ecm.dev notification or the lead archive.
 *
 * Any OTHER write to /api/** is aborted and recorded as unexpected, so a new
 * lead endpoint added to a tool fails the suite loudly instead of silently
 * emailing someone from CI. The only pass-through writes are:
 *   - /api/csrf               (token issue, read-only)
 *   - /api/assessment (exact) (anonymous scoring for Sanity-authored tools,
 *                              opt-in via `allowAnonymousScoring`, because the
 *                              server-rendered results page needs a real
 *                              stored submission to render)
 */

export const TEST_EMAIL = "e2e-noreply@example.com";

/** Stubbed lead / email endpoints and the JSON each one answers with. */
const STUBS: Record<string, (req: Request) => unknown> = {
  "/api/assessment/gate": () => ({ ok: true }),
  "/api/assessment/tool-submit": () => ({ submissionId: "e2e-test-submission" }),
  "/api/assessment/tool-email": () => ({ ok: true }),
  "/api/assessment/report": () => ({ ok: true }),
  "/api/assessment/cms-implementation/send": (req) => ({
    ok: true,
    resultsUrl: new URL(
      "/assessment/cms-implementation/result/e2e-test-submission",
      req.url(),
    ).toString(),
  }),
  "/api/assessment/cms-implementation/enrich": () => ({ ok: true }),
  "/api/feedback/email": () => ({ ok: true }),
  "/api/feedback": () => ({ ok: true }),
};

export interface CapturedRequest {
  path: string;
  body: any;
}

export interface SubmissionRecorder {
  /** Every stubbed request, in order. */
  captured: CapturedRequest[];
  /** Writes that were neither stubbed nor allow-listed (should stay empty). */
  unexpected: string[];
  /** Bodies sent to one stubbed path, in order. */
  bodies(path: string): any[];
}

export async function interceptSubmissions(
  page: Page,
  opts: { allowAnonymousScoring?: boolean } = {},
): Promise<SubmissionRecorder> {
  const captured: CapturedRequest[] = [];
  const unexpected: string[] = [];

  await page.route("**/api/**", async (route) => {
    const req = route.request();
    const path = new URL(req.url()).pathname.replace(/\/+$/, "");

    if (req.method() === "GET" || req.method() === "HEAD") {
      return route.continue();
    }

    const stub = STUBS[path];
    if (stub) {
      let body: any = null;
      try {
        body = JSON.parse(req.postData() || "{}");
      } catch {
        body = req.postData();
      }
      captured.push({ path, body });
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(stub(req)),
      });
    }

    if (path === "/api/csrf") return route.continue();
    if (path === "/api/assessment" && opts.allowAnonymousScoring) {
      return route.continue();
    }

    unexpected.push(`${req.method()} ${path}`);
    return route.abort("blockedbyclient");
  });

  return {
    captured,
    unexpected,
    bodies: (path) => captured.filter((c) => c.path === path).map((c) => c.body),
  };
}

/**
 * Register through the AssessmentGate exactly as a new visitor would: work
 * email + the required functional consent, then "Start assessment". Asserts
 * the gate POST carried the email and consent, the gate disappeared, and the
 * access cookie was set so the visitor is not re-gated.
 */
export async function registerViaGate(
  page: Page,
  recorder: SubmissionRecorder,
  slug: string,
): Promise<void> {
  const form = page.getByTestId("gate-form");
  await expect(form, "registration gate should be shown to a new visitor").toBeVisible({
    timeout: 20_000,
  });

  // Submitting empty must be rejected client-side (no request fired).
  await page.getByTestId("gate-submit").click();
  await expect(form).toBeVisible();
  expect(recorder.bodies("/api/assessment/gate")).toHaveLength(0);

  await page.getByTestId("gate-email").fill(TEST_EMAIL);
  await page.getByTestId("gate-consent").check();
  await page.getByTestId("gate-submit").click();

  await expect(form, "gate should close after registering").toBeHidden({
    timeout: 15_000,
  });

  const [gateBody] = recorder.bodies("/api/assessment/gate");
  expect(gateBody, "gate registration request").toBeTruthy();
  expect(gateBody.email).toBe(TEST_EMAIL);
  expect(gateBody.toolSlug).toBe(slug);
  expect(gateBody.consentGiven).toBe(true);
  expect(gateBody.consentText, "consent text is stored for GDPR audit").toBeTruthy();
  expect(gateBody.consentVersion).toBeTruthy();
  expect(gateBody.marketingOptIn, "marketing opt-in is never pre-ticked").toBe(false);

  const cookies = await page.context().cookies();
  expect(
    cookies.some((c) => c.name === "ecm_assess_access" && c.value === "1"),
    "gate access cookie should be set after registering",
  ).toBe(true);
}

/**
 * Wait for whichever surface loads first: the gate (new visitor) or the tool
 * itself (ungated assessment). Returns true when the gate is showing.
 */
export async function gateIsShowing(page: Page): Promise<boolean> {
  await page
    .locator(
      '[data-testid="gate-form"], [data-testid="assessment-start"], [data-testid="assessment-interactive"]',
    )
    .first()
    .waitFor({ state: "visible", timeout: 20_000 });
  return (await page.getByTestId("gate-form").count()) > 0;
}

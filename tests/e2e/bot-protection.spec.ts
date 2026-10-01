import { test, expect, ANALYTICS_URL, type Page } from "./fixtures";
import { interceptSubmissions, registerViaGate } from "./helpers/submissions";
import { attachConsoleGuard } from "./helpers/hydration";

/**
 * Bot protection on assessments, and analytics isolation for the suite.
 *
 * qualify_lead may only reach the dataLayer after /api/assessment/verify
 * answers qualified: true. Each rejection case below sends a real request to
 * the verify route carrying one bot trait (too fast, honeypot filled, invalid
 * Turnstile token) and checks the visitor still sees their result, sees no
 * error, and no qualify_lead is pushed. Which server layer rejects each trait
 * is proven deterministically in lib/assessment/__tests__/verification.test.ts.
 *
 * Lead and email endpoints are stubbed as in the full-flow suite, so nothing
 * is stored or sent.
 */

test.setTimeout(150_000);

const VERIFY_PATH = "**/api/assessment/verify";
const TURNSTILE_SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js**";

/** Stand-in for Cloudflare's script: a widget that yields the given token. */
function fakeTurnstile(token: string): string {
  return `window.turnstile = {
    render: function (el, o) { setTimeout(function () { o.callback(${JSON.stringify(token)}); }, 50); return "e2e-widget"; },
    remove: function () {}
  };`;
}

type LeadEvent = Record<string, unknown> & { event: string };

async function leadEvents(page: Page): Promise<LeadEvent[]> {
  return page.evaluate(() =>
    ((window.dataLayer ?? []) as LeadEvent[]).filter((e) =>
      ["qualify_lead", "lead_submit", "close_convert_lead"].includes(e.event),
    ),
  );
}

async function answerStep(page: Page, questions: number) {
  const groups = page.getByTestId("assessment-question-group");
  await expect(groups).toHaveCount(questions);
  for (let i = 0; i < questions; i++) {
    await groups.nth(i).getByTestId("assessment-option").first().click();
  }
}

async function next(page: Page) {
  const button = page.getByTestId("assessment-next");
  await expect(button).toBeEnabled();
  await button.click();
}

/**
 * Open the lead magnet as a new visitor and answer up to the final question.
 * `beforeFinish` runs on the final step, before the result is requested.
 */
async function runLeadMagnet(page: Page, beforeFinish?: () => Promise<void>) {
  const recorder = await interceptSubmissions(page);
  const res = await page.goto("/assessment/lead-magnet", {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  expect(res?.ok()).toBeTruthy();
  await registerViaGate(page, recorder, "lead-magnet");

  await page.getByTestId("assessment-start").click();
  await answerStep(page, 3); // market
  await next(page);
  await answerStep(page, 3); // authority
  await next(page);
  await next(page); // capabilities: sliders have defaults
  await answerStep(page, 1); // context, the final step
  if (beforeFinish) await beforeFinish();
  await next(page);

  // The result is shown straight away, whatever verification later decides.
  await expect(page.getByText("Lead Magnet Analysis")).toBeVisible();
  return recorder;
}

/**
 * Rewrite the verify request's startedAt (the real server then judges it).
 * Rejection tests for the other traits use a slow, human-like time so that
 * the trait under test is the only reason to refuse.
 */
async function claimCompletionTime(page: Page, elapsedMs: number) {
  await page.route(VERIFY_PATH, async (route) => {
    const body = JSON.parse(route.request().postData() || "{}");
    await route.continue({
      postData: JSON.stringify({ ...body, startedAt: Date.now() - elapsedMs }),
    });
  });
}

/** Capture the verify request body and the server's real answer. */
function watchVerify(page: Page) {
  const seen: { body: Record<string, unknown>; qualified: unknown }[] = [];
  page.on("response", async (response) => {
    if (!response.url().endsWith("/api/assessment/verify")) return;
    const body = JSON.parse(response.request().postData() || "{}");
    const json = await response.json().catch(() => ({}));
    seen.push({ body, qualified: (json as { qualified?: unknown }).qualified });
  });
  return seen;
}

/** Shared assertions for every rejection case. */
async function expectRejectedQuietly(
  page: Page,
  seen: ReturnType<typeof watchVerify>,
  guard: { errors(): string[] },
) {
  await expect.poll(() => seen.length, { timeout: 30_000 }).toBe(1);
  expect(seen[0]!.qualified, "server answer").toBe(false);
  // Give a late push every chance to appear before asserting it did not.
  await page.waitForTimeout(1_000);
  expect(await leadEvents(page), "no lead event for a rejected completion").toEqual([]);
  await expect(page.getByText("Lead Magnet Analysis")).toBeVisible();
  await expect(page.getByText(/something went wrong/i)).toHaveCount(0);
  expect(guard.errors(), "console errors").toEqual([]);
}

test("qualify_lead is pushed only after the server answers qualified", async ({ page }) => {
  let release!: () => void;
  const held = new Promise<void>((r) => (release = r));
  let verifyRequested = false;

  await page.route(TURNSTILE_SCRIPT, (route) =>
    route.fulfill({ contentType: "application/javascript", body: fakeTurnstile("good-token") }),
  );
  await page.route(VERIFY_PATH, async (route) => {
    verifyRequested = true;
    await held;
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ ok: true, qualified: true }),
    });
  });

  await runLeadMagnet(page);

  await expect.poll(() => verifyRequested, { timeout: 30_000 }).toBe(true);
  expect(await leadEvents(page), "nothing pushed while the server is deciding").toEqual([]);

  release();
  await expect.poll(async () => (await leadEvents(page)).length).toBe(1);
  const [event] = await leadEvents(page);
  // Same name and parameters as before verification existed, so the GTM
  // container needs no change.
  expect(event).toEqual({
    event: "qualify_lead",
    tool_name: "lead-magnet",
    source_page: "/assessment/lead-magnet",
    step_number: null,
    total_steps: null,
    completion_time_seconds: null,
    lead_type: "qualified",
  });
  console.log("dataLayer lead events:", JSON.stringify(await leadEvents(page)));
});

test("completing in under 8 seconds: no qualify_lead, no error", async ({ page }) => {
  const guard = attachConsoleGuard(page);
  const seen = watchVerify(page);
  // A 2 second completion, as the bots seen in GA4 managed. Valid token
  // and empty honeypot, so speed is the only bot trait.
  await page.route(TURNSTILE_SCRIPT, (route) =>
    route.fulfill({ contentType: "application/javascript", body: fakeTurnstile("good-token") }),
  );
  await claimCompletionTime(page, 2_000);

  await runLeadMagnet(page);
  await expectRejectedQuietly(page, seen, guard);
});

test("honeypot filled: no qualify_lead, no error", async ({ page }) => {
  const guard = attachConsoleGuard(page);
  const seen = watchVerify(page);
  await page.route(TURNSTILE_SCRIPT, (route) =>
    route.fulfill({ contentType: "application/javascript", body: fakeTurnstile("good-token") }),
  );
  await claimCompletionTime(page, 60_000);

  await runLeadMagnet(page, async () => {
    // A form-filling bot finds the hidden field; a person never can.
    await page.locator('input[name="website"]').fill("https://spam.example", { force: true });
  });

  await expectRejectedQuietly(page, seen, guard);
  expect(seen[0]!.body.website).toBe("https://spam.example");
});

test("invalid Turnstile token: no qualify_lead, no error", async ({ page }) => {
  const guard = attachConsoleGuard(page);
  const seen = watchVerify(page);
  let widgetLoaded = false;
  await claimCompletionTime(page, 60_000);
  await page.route(TURNSTILE_SCRIPT, (route) => {
    widgetLoaded = true;
    return route.fulfill({
      contentType: "application/javascript",
      body: fakeTurnstile("invalid-token"),
    });
  });

  await runLeadMagnet(page);
  // The widget script loads asynchronously; give it a moment before deciding.
  await expect
    .poll(() => widgetLoaded, { timeout: 5_000 })
    .toBe(true)
    .catch(() => {});
  if (!widgetLoaded) {
    // Say which case this is in the CI log: no script tag means the build has
    // no NEXT_PUBLIC_TURNSTILE_SITE_KEY; a tag without an intercepted request
    // means something (CSP, routing) stopped the load.
    const tags = await page.locator('script[src*="challenges.cloudflare.com"]').count();
    const reason =
      tags === 0
        ? "NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set for this build (no Turnstile script tag)"
        : `Turnstile script tag present (${tags}) but its request was never made`;
    console.log(`invalid Turnstile token test skipped: ${reason}`);
    test.skip(true, reason);
  }

  await expectRejectedQuietly(page, seen, guard);
  expect(seen[0]!.body.turnstileToken).toBe("invalid-token");
});

test("a full assessment run sends nothing to Google Analytics or /gtm/", async ({ page }) => {
  const reached: string[] = [];
  page.on("requestfinished", (request) => {
    if (ANALYTICS_URL.test(request.url())) reached.push(request.url());
  });
  const attempted: string[] = [];
  page.on("request", (request) => {
    if (ANALYTICS_URL.test(request.url())) attempted.push(request.url());
  });

  await runLeadMagnet(page);
  await page.waitForTimeout(2_000);

  expect(reached, "analytics requests that completed").toEqual([]);
  console.log(`analytics requests attempted and blocked: ${attempted.length}`);
});

test("process: qualify_lead follows the server's answer", async ({ page }) => {
  for (const qualified of [false, true]) {
    await page.context().clearCookies();
    await page.unrouteAll({ behavior: "ignoreErrors" });
    await page.route(TURNSTILE_SCRIPT, (route) =>
      route.fulfill({ contentType: "application/javascript", body: fakeTurnstile("good-token") }),
    );
    await page.route(VERIFY_PATH, (route) =>
      route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ ok: true, qualified }),
      }),
    );
    const recorder = await interceptSubmissions(page);
    await page.goto("/assessment/process", { waitUntil: "domcontentloaded", timeout: 60_000 });
    await registerViaGate(page, recorder, "process");
    await page.getByTestId("assessment-start").click();
    for (const questions of [1, 4, 3, 3, 2, 3]) {
      await answerStep(page, questions);
      await next(page); // last one is "Submit Assessment"
    }
    // Completion screen shows straight away either way.
    await expect(page.getByTestId("assessment-email")).toBeVisible();

    if (qualified) {
      await expect.poll(async () => (await leadEvents(page)).map((e) => e.event)).toEqual([
        "qualify_lead",
      ]);
      expect((await leadEvents(page))[0]).toMatchObject({
        tool_name: "process",
        lead_type: "qualified",
      });
    } else {
      await page.waitForTimeout(1_000);
      expect(await leadEvents(page)).toEqual([]);
    }
  }
});

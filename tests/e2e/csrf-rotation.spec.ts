import { test, expect, type Page } from "./fixtures";
import { TEST_EMAIL, interceptSubmissions, registerViaGate } from "./helpers/submissions";

/**
 * CSRF token rotation between useCsrf() instances.
 *
 * The server accepts a POST only when the x-csrf-token header equals the
 * ecm-csrf cookie the browser sends (lib/csrf.ts verifyCsrfToken). Several
 * components on one page call useCsrf() (AssessmentGate plus the tool, the
 * lead magnet's Results screen, a second tab), and each one GETs /api/csrf.
 * If a GET could replace the cookie after another instance had stored its
 * token, that instance's next POST would carry a stale header and get 403.
 *
 * Each browser test below forces the worst ordering (one /api/csrf response
 * held back so it lands last, or a second tab opened mid-flow) and asserts
 * every form POST carried a header equal to the cookie sent with it. The lead
 * endpoints stay stubbed, so nothing is stored or sent. The API test proves
 * the server side: a second GET keeps the first token valid.
 */

test.setTimeout(150_000);

const ACCESS_COOKIE = "ecm_assess_access";
const CSRF_COOKIE = "ecm-csrf";
const CSRF_HEADER = "x-csrf-token";

interface CsrfCheck {
  path: string;
  header: string | null;
  cookie: string | null;
}

function cookieValue(cookieHeader: string | undefined, name: string): string | null {
  for (const part of (cookieHeader ?? "").split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

/**
 * Record the header/cookie pair of every POST to /api/**, then hand the
 * request on to the stubs. Registered after interceptSubmissions so it runs
 * first (Playwright runs the newest matching route first).
 */
async function recordCsrfPairs(target: Page): Promise<CsrfCheck[]> {
  const checks: CsrfCheck[] = [];
  await target.route("**/api/**", async (route) => {
    const req = route.request();
    if (req.method() === "POST") {
      const headers = await req.allHeaders();
      checks.push({
        path: new URL(req.url()).pathname,
        header: headers[CSRF_HEADER] ?? null,
        cookie: cookieValue(headers.cookie, CSRF_COOKIE),
      });
    }
    return route.fallback();
  });
  return checks;
}

function expectAllMatch(checks: CsrfCheck[], paths: string[]) {
  for (const path of paths) {
    expect(checks.map((c) => c.path), `a POST to ${path} was sent`).toContain(path);
  }
  for (const c of checks) {
    expect(c.header, `${c.path} carried a CSRF header`).toBeTruthy();
    expect(c.header, `${c.path}: header must equal the cookie sent with it`).toBe(c.cookie);
  }
}

/** Hold back the first /api/csrf request so its response lands last. */
async function delayFirstCsrfResponse(page: Page, ms = 1_500) {
  let seen = 0;
  await page.route("**/api/csrf", async (route) => {
    if (seen++ === 0) await new Promise((r) => setTimeout(r, ms));
    return route.fallback();
  });
}

function countCsrfResponses(page: Page): () => number {
  let n = 0;
  page.on("response", (res) => {
    if (new URL(res.url()).pathname === "/api/csrf") n++;
  });
  return () => n;
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

async function emailResults(page: Page) {
  await page.getByTestId("assessment-email").fill(TEST_EMAIL);
  await page.getByTestId("assessment-consent").click();
  const submit = page.getByTestId("assessment-submit");
  await expect(submit).toBeEnabled();
  await submit.click();
}

test("/api/csrf keeps a valid existing token instead of rotating it", async ({ request }) => {
  const first = await request.get("/api/csrf");
  expect(first.ok()).toBeTruthy();
  const { token: t1 } = await first.json();

  const second = await request.get("/api/csrf");
  expect(second.ok()).toBeTruthy();
  const { token: t2 } = await second.json();
  expect(t2, "a second GET returns the token already in the cookie").toBe(t1);

  // The first token still passes the real server check. An empty gate body
  // gets past the guard (CSRF ok) and stops at validation, so nothing is
  // stored. The guard rate-limits per x-forwarded-for before checking CSRF,
  // so each POST gets its own address and a 429 cannot hide the result.
  const gatePost = (token: string) =>
    request.post("/api/assessment/gate", {
      headers: {
        [CSRF_HEADER]: token,
        "Content-Type": "application/json",
        "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 254) + 1}`,
      },
      data: {},
    });
  expect((await gatePost(t1)).status(), "held token must not be rejected as CSRF").toBe(400);
  // Control: the check is live, a header that differs from the cookie is refused.
  expect((await gatePost(`${t1}x`)).status()).toBe(403);

  // A forged cookie is not reused: the server mints a fresh signed token.
  const forged = await request.get("/api/csrf", {
    headers: { cookie: `${CSRF_COOKIE}=forged.value` },
  });
  const { token: t3 } = await forged.json();
  expect(t3).not.toBe("forged.value");
  expect(t3.split(".")).toHaveLength(2);
});

test("returning visitor: gate and tool mount together, late /api/csrf does not break the tool", async ({
  page,
  baseURL,
}) => {
  await page.context().addCookies([{ name: ACCESS_COOKIE, value: "1", url: baseURL! }]);
  const recorder = await interceptSubmissions(page);
  const checks = await recordCsrfPairs(page);
  await delayFirstCsrfResponse(page);
  const csrfResponses = countCsrfResponses(page);

  await page.goto("/assessment/process", { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.getByTestId("assessment-start").click();
  // Gate and tool have both fetched, and the held-back response has landed.
  await expect.poll(csrfResponses, { timeout: 15_000 }).toBeGreaterThanOrEqual(2);

  for (const questions of [1, 4, 3, 3, 2, 3]) {
    await answerStep(page, questions);
    await next(page);
  }
  page.on("dialog", (d) => d.accept());
  await emailResults(page);
  await expect
    .poll(() => recorder.bodies("/api/assessment/tool-email").length, { timeout: 10_000 })
    .toBeGreaterThan(0);

  expectAllMatch(checks, ["/api/assessment/tool-submit", "/api/assessment/tool-email"]);
});

test("new visitor: Results mount and a second tab do not break the first tab's POSTs", async ({
  page,
  context,
}) => {
  const recorder = await interceptSubmissions(page);
  const checks = await recordCsrfPairs(page);
  const csrfResponses = countCsrfResponses(page);

  await page.goto("/assessment/lead-magnet", { waitUntil: "domcontentloaded", timeout: 60_000 });
  // The gate's own token has arrived (a POST before any token exists is a
  // different problem from rotation, so it is kept out of this test).
  await expect.poll(csrfResponses, { timeout: 15_000 }).toBeGreaterThanOrEqual(1);
  await registerViaGate(page, recorder, "lead-magnet");

  await page.getByTestId("assessment-start").click();
  await answerStep(page, 3);
  await next(page);
  await answerStep(page, 3);
  await next(page);
  await next(page);
  await answerStep(page, 1);
  await next(page);
  await expect(page.getByText("Lead Magnet Analysis")).toBeVisible();
  // Gate instance plus the Results instance.
  await expect.poll(csrfResponses, { timeout: 15_000 }).toBeGreaterThanOrEqual(2);

  // Another tab on the same site fetches /api/csrf for its own forms.
  const other = await context.newPage();
  const otherCsrf = other.waitForResponse((r) => new URL(r.url()).pathname === "/api/csrf");
  await other.goto("/assessment/process", { waitUntil: "domcontentloaded", timeout: 60_000 });
  await otherCsrf;
  await other.close();

  page.on("dialog", (d) => d.accept());
  await emailResults(page);
  await expect
    .poll(() => recorder.bodies("/api/assessment/tool-email").length, { timeout: 10_000 })
    .toBeGreaterThan(0);

  expectAllMatch(checks, [
    "/api/assessment/gate",
    "/api/assessment/tool-submit",
    "/api/assessment/tool-email",
  ]);
});

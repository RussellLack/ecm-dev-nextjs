# Assessment Testing — Implementation Plan

**Date:** 2026-06-12
**Spec:** `docs/superpowers/specs/2026-06-12-assessment-testing-design.md`
**Status:** Ready to implement

This plan turns the approved design into ordered, verifiable steps. Each phase
ends with a check you can run before moving on. Phases 1–5 are local work;
Phase 6 wires CI; Phase 7 verifies the whole thing end-to-end.

---

## Phase 0 — Open items to resolve while coding

Resolve these by reading the components during Phase 2/5 (don't guess):

- **Submit endpoint(s) per flow** for request interception. Candidates seen:
  `app/api/assessment/report/route.ts`, `app/api/assessment/tool-email/route.ts`,
  `app/api/assessment/cms-implementation/send/route.ts`. Confirm which the
  `lead-magnet` flow calls.
- **Required fields** in `LeadCaptureForm.tsx` / `EmailCaptureForm.tsx` (name,
  email, consent checkbox?) so the full-flow test can fill them.
- **Benign console-error allowlist.** Per `KNOWN-ISSUES.md`, GTM `gtag/js` can
  503 transiently and third-party/analytics noise is expected. The console guard
  must allowlist these and fail only on CSP violations, hydration errors, and
  uncaught app exceptions.
- **Discovery exclusions:** the smoke target list must include assessment *entry*
  pages only — exclude `/assessment/*/results`, `/assessment/*/methodology`, and
  `/assessment/cms-implementation/result/*`.

---

## Phase 1 — Playwright tooling

1. Add dev dependency: `@playwright/test`.
2. Create `playwright.config.ts`:
   - `use.baseURL` from `process.env.BASE_URL` (no default — fail loudly if unset).
   - single `chromium` project (desktop). Optionally add a mobile project later.
   - `retries: 2` (absorbs transient network/cron flakiness).
   - `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`,
     `video: 'retain-on-failure'`.
   - reporters: `list` + `html` (report written to `playwright-report/`).
   - `timeout` ~30s per test; `expect.timeout` ~10s.
   - `grep`/project tags so `@full` tests can be excluded on the monitor run.
3. `package.json` scripts:
   - `test:e2e`: `playwright test`
   - `test:e2e:smoke`: `playwright test assessments.smoke`
   - `test:e2e:full`: `playwright test assessments.full`
4. `.gitignore`: add `playwright-report/`, `test-results/`, `/blob-report/`,
   `.playwright/`.

**Check:** `npx playwright --version` works; `npm run test:e2e -- --list` prints
the (empty) project config without error.

---

## Phase 2 — Surgical `data-testid` source changes

Add stable hooks so selectors don't depend on copy. Read each component first to
place them correctly.

- `components/assessment/AssessmentShell.tsx`
  - Start button → `data-testid="assessment-start"`
  - Question container (rendered after start) → `data-testid="assessment-question"`
  - Next/continue control → `data-testid="assessment-next"`
- `components/assessment/QuestionRenderer.tsx`
  - Each answer option/input → `data-testid="assessment-option"` (or an indexed
    variant) so the test can pick the first option generically.
- `components/assessment/ProcessAssessment.tsx` and
  `components/assessment/LeadMagnetAssessment.tsx`
  - Mirror the same `assessment-start` / `assessment-question` testids if these
    bespoke flows don't route through `AssessmentShell`.
- `components/assessment/LeadCaptureForm.tsx`,
  `components/assessment/cms-implementation/EmailCaptureForm.tsx`,
  `components/assessment/cms-implementation/Form.tsx`
  - Email input → `data-testid="assessment-email"`
  - Submit button → `data-testid="assessment-submit"`

Keep edits attribute-only; no behavior change.

**Check:** `npm run build` succeeds; grep confirms the testids render in the
component tree.

---

## Phase 3 — Test helpers

`tests/e2e/helpers/targets.ts`
- `getAssessmentTargets(baseURL): Promise<{ slug: string; url: string }[]>`
  - `fetch(`${baseURL}/sitemap.xml`)`, extract `<loc>` values matching
    `^.*/assessment/[^/]+$` (entry pages only; apply Phase 0 exclusions).
  - Union with the four bespoke routes:
    `lead-magnet`, `process`, `localisation-cost`, `cms-implementation`.
  - De-duplicate by pathname. Throw if the sitemap fetch fails (a broken sitemap
    is itself a signal worth failing on).

`tests/e2e/helpers/hydration.ts`
- `attachConsoleGuard(page): () => string[]`
  - Subscribe to `page.on('console')` (error level), `page.on('pageerror')`,
    and `page.on('requestfailed')`.
  - Capture messages matching: `Refused to (execute|load|apply)` (CSP),
    `Hydration failed` / `did not match` (React), and uncaught exceptions.
  - Apply the Phase 0 benign allowlist (GTM 503, known analytics hosts).
  - Return a getter for collected critical errors so specs can assert empty.

`tests/e2e/helpers/flows.ts`
- `startAssessment(page)`: click `assessment-start`, wait for
  `assessment-question` visible.
- `answerFirstQuestion(page)`: select first `assessment-option`, click
  `assessment-next` if present.
- Small, generic, testid-driven; no per-slug branching unless a flow needs it.

**Check:** unit-run `targets.ts` against production
(`BASE_URL=https://www.ecm.dev`) via a temporary script and print the discovered
list; confirm it includes the bespoke routes + any live Sanity slugs.

---

## Phase 4 — Smoke spec (all assessments, no submit)

`tests/e2e/assessments.smoke.spec.ts`
- At module load, `const targets = await getAssessmentTargets(baseURL)` and
  generate one `test()` per target (Playwright supports dynamic test creation in
  a top-level loop after an async bootstrap; use a `test.describe` with a
  pre-fetched list — fetch in a global-setup file and pass via JSON to keep it
  synchronous at collection time).
- Per target:
  1. `attachConsoleGuard(page)`.
  2. `page.goto(url)`; assert `assessment-start` is visible **and enabled**.
  3. `startAssessment(page)` → assert `assessment-question` appears within
     `expect.timeout` (this is the dead-button catch).
  4. `answerFirstQuestion(page)` → assert progression (question 2 visible or
     progress bar advances).
  5. Assert the console guard collected **zero** critical errors.
  6. Do **not** submit.

> Collection-time discovery: implement `global-setup.ts` that writes the
> discovered targets to `test-results/targets.json`; the spec reads that file
> synchronously to parametrize. Keeps Playwright's test graph static and
> parallelizable.

**Check:** `BASE_URL=https://www.ecm.dev npm run test:e2e:smoke` passes green
against the now-fixed production site.

---

## Phase 5 — Full-flow spec (lead-magnet, submit intercepted)

`tests/e2e/assessments.full.spec.ts` (tag `@full`)
- `lead-magnet` only.
- `page.route('**/api/assessment/**', route => route.fulfill({ status: 200,
  body: JSON.stringify({ ok: true }) }))` — intercept the real submit so no lead
  is written and no email is sent.
- Drive the full flow: start → answer all required questions → fill
  `assessment-email` (+ any required fields from Phase 0) → click
  `assessment-submit`.
- Assert: the intercepted request fired against the expected endpoint with a
  well-formed JSON payload (email present, answers present), and the UI renders
  the success/results state.

**Check:** `BASE_URL=<local prod build> npm run test:e2e:full` passes; confirm
Sanity has **no** new `assessmentSubmission` and no email was sent.

> Local prod build for this check: `npm run build && npm run start`, then point
> `BASE_URL=http://localhost:3000`. (Dev mode won't reproduce prod CSP — always
> verify against a production build or a deploy preview.)

---

## Phase 6 — GitHub Actions workflows

`.github/workflows/assessment-e2e.yml` — deploy-preview gate
- `on: deployment_status`.
- Job guard: run only when `github.event.deployment_status.state == 'success'`
  and the environment is a Netlify preview/production deploy.
- Steps: checkout → `actions/setup-node` (Node 20, npm cache) → `npm ci` →
  `npx playwright install --with-deps chromium` →
  `BASE_URL=${{ github.event.deployment_status.environment_url }} npm run test:e2e`
  (smoke + `@full`).
- `actions/upload-artifact` for `playwright-report/` (always).
- Failure surfaces as a red check on the PR + GitHub email.

`.github/workflows/assessment-monitor.yml` — production monitor
- `on: schedule: - cron: '*/15 * * * *'` and `workflow_dispatch`.
- Steps as above but `BASE_URL=https://www.ecm.dev npm run test:e2e:smoke`
  (smoke only — no `@full`, no submit).
- Upload report artifact on failure.
- Built-in GitHub email on workflow failure (no extra config).
- Add a comment noting cron caveats (5-min floor, delay under load, 60-day
  inactivity auto-disable) from the spec.

**Check:** open a throwaway PR → confirm `assessment-e2e` runs against the
preview and reports a check. Manually `workflow_dispatch` the monitor → confirm
it runs green against production.

---

## Phase 7 — End-to-end verification (acceptance)

1. **Positive:** monitor + gate both green against current production and a
   preview.
2. **Negative (the important one):** on a throwaway branch, reintroduce a CSP
   break (e.g. revert the request-header CSP line in `middleware.ts`), open a PR,
   and confirm the `assessment-e2e` gate **fails** — on both the behavioral
   assertion and the console/CSP guard. Discard the branch.
3. **Discovery:** confirm the smoke run's target count matches bespoke routes +
   live sitemap assessment URLs; (optionally) publish a draft test assessment and
   confirm it appears on the next run, then unpublish.
4. **No side effects:** confirm zero new `assessmentSubmission` docs and no emails
   from any run.

---

## Deliverables checklist

- [ ] `playwright.config.ts`, `package.json` scripts, `.gitignore` entries
- [ ] `data-testid` hooks in assessment components
- [ ] `tests/e2e/helpers/{targets,hydration,flows}.ts` + `global-setup.ts`
- [ ] `tests/e2e/assessments.smoke.spec.ts`
- [ ] `tests/e2e/assessments.full.spec.ts`
- [ ] `.github/workflows/assessment-e2e.yml`
- [ ] `.github/workflows/assessment-monitor.yml`
- [ ] Phase 7 negative test passed and documented

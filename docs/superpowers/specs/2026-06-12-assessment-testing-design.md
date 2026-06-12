# Assessment Testing — Design Spec

**Date:** 2026-06-12
**Repo:** github.com/RussellLack/ecm-dev-nextjs
**Status:** Approved (design) — pending implementation plan

## Problem

The assessment flows on ecm.dev are client-interactive (start button, multi-step
questions, results, lead/email capture). In June 2026 a site-wide React
**hydration failure** (a CSP nonce bug in `middleware.ts`) left every page
rendering correctly but completely non-interactive — the "Start the assessment"
buttons did nothing. Nothing in the pipeline caught it: there were no E2E tests,
and the failure was **production-only** (it did not reproduce under `next dev`,
where the CSP differs).

We want regular automated testing that catches this class of regression — "renders
fine but doesn't work" — both before a deploy goes live and continuously against
production.

## Goals

- Catch interactivity/hydration regressions in the assessment flows **before**
  they reach users (deploy-preview gate).
- Detect breakage in **production** quickly, regardless of cause (infra, env,
  CSP, Sanity outage) — a deploy gate alone cannot catch issues introduced
  outside a deploy.
- Do this without creating junk leads or sending real emails on every run.
- Keep everything version-controlled and in one toolchain; no new SaaS vendor.

## Non-goals

- Broad unit-test coverage of business logic. The motivating failure was an
  interactivity bug, not a scoring bug. The existing scoring-engine unit test is
  retained, but expanding unit coverage is out of scope (YAGNI).
- Visual-regression / pixel testing.
- Load / performance testing.

## Decisions (from brainstorming)

| Question | Decision |
| --- | --- |
| Primary outcome | **Both**: gate deploys **and** monitor production |
| Test depth | **Tiered**: smoke depth on production; full end-to-end (incl. submit) on deploy previews only |
| Infrastructure | **All in GitHub Actions** (Playwright in-repo, no SaaS) |
| Alerting | **Built-in GitHub email** on workflow failure (+ red PR check) |

## Architecture

### Testing layers

| Layer | Tool | Coverage | Runs where |
| --- | --- | --- | --- |
| Unit (keep) | existing `node --experimental-strip-types` | Scoring engine (`lib/assessment/cms-implementation/__tests__/engine.test.ts`) | Local + CI |
| **E2E smoke** | Playwright (Chromium) | All 5 assessment flows become interactive and answerable; **no form submit** | Deploy preview **+** production |
| **E2E full-flow** | Playwright (Chromium) | One representative flow (default: `lead-magnet`) end-to-end **including submit**, with the submission request **intercepted** (no real lead/email) | Deploy preview only |

The 5 assessment flows under test:
`/assessment/[slug]`, `/assessment/lead-magnet`, `/assessment/process`,
`/assessment/localisation-cost`, `/assessment/cms-implementation`.

### Hydration-catch mechanism

A check that only asserts "page renders" would have passed during the outage. The
smoke test asserts three complementary signals per flow:

1. **Behavioral (primary):** click "Start the assessment" → assert the question
   UI appears within a timeout. A dead button → timeout → fail.
2. **Console/error guard:** capture `page.on('console')` and `page.on('pageerror')`;
   fail on any CSP violation (`Refused to execute inline script…`), uncaught
   exception, or React hydration error during load. This would have flagged the
   CSP-nonce bug explicitly.
3. **Progression:** answer 1–2 questions to confirm state actually advances.

Signals 1 and 2 together ensure a silent hydration failure cannot pass.

### Submission safety (full-flow test)

The full-flow test completes one assessment including the lead/email submit, but
Playwright **intercepts the submission network request** (`page.route(...)`) and
fulfills it with a stubbed success response. This asserts the client fires a
well-formed request and renders the success/results state **without** hitting the
real API, so no lead is written and no email is sent — even on preview runs. No
backend changes are required.

> Future option (out of scope): a separate integration test that calls the real
> API route with a test-email allowlist, to exercise report generation / email
> send end-to-end.

### Where it runs — two GitHub Actions workflows

**`assessment-e2e.yml` — deploy-preview gate.**
Triggers on the `deployment_status` event Netlify posts for PR previews. Runs the
smoke suite (all 5 flows) + full-flow suite (1 flow, intercepted) against
`github.event.deployment_status.environment_url`. Failure → red ✗ check on the PR
+ email. Catches bad deploys before they are live.

**`assessment-monitor.yml` — production monitor.**
`schedule:` cron + manual `workflow_dispatch`. Runs the **smoke** suite against
`https://www.ecm.dev`. Failure → workflow fails → GitHub emails repo admins.
Catches anything that bypasses a deploy.

Both reuse one Playwright project; `BASE_URL` selects the target and Playwright
project/tag selects smoke vs full.

### Cron frequency vs Actions minutes

GitHub Actions minutes are unlimited for public repos but ~2,000 min/month free
for private. A smoke run is ~2–3 min.

- Public repo → 15-min cron is fine.
- Private repo → default to **30-min** cron (~1,440 min/mo) to stay within free
  tier; the cron line is a one-liner that is trivially tunable.

Default chosen: **every 30 minutes**, adjustable in the workflow.

## Repo structure

```
playwright.config.ts            # baseURL from env, chromium, retries=2, trace-on-failure
tests/e2e/
  assessments.smoke.spec.ts     # 5 flows × (start + answer + console/CSP guard)
  assessments.full.spec.ts      # 1 flow end-to-end, submit intercepted
  helpers/
    hydration.ts                # console/pageerror capture + CSP-violation assertion
    flows.ts                    # per-assessment selectors & steps
.github/workflows/
  assessment-e2e.yml            # deploy-preview gate
  assessment-monitor.yml        # scheduled prod monitor
```

### Source changes (minimal, surgical)

- Add `data-testid` attributes to the Start button, the question container, and
  the submit button so selectors are robust rather than brittle text matches.
  Touches `AssessmentShell.tsx`, `QuestionRenderer.tsx`, and the lead/email
  capture forms.
- `package.json`: add `@playwright/test` dev dependency and scripts `test:e2e`,
  `test:e2e:smoke`.
- No backend changes.

## Testing the tests (acceptance)

- Temporarily reintroducing a hydration break (e.g. reverting the CSP fix on a
  branch) MUST make the smoke suite fail — both on the behavioral assertion and
  the console/CSP guard.
- A green run MUST create no `assessmentSubmission` documents and send no emails.
- The monitor workflow MUST run on schedule against production and email on
  failure.

## Risks / trade-offs

- **GH Actions cron is coarse** (~5–15 min granularity, can be delayed under
  load) and not a true uptime monitor. Accepted; if a tighter SLA is needed
  later, the same Playwright scripts can be moved to a synthetic-monitoring SaaS
  (e.g. Checkly) without rewrite.
- **Selector brittleness** mitigated via `data-testid`.
- **Netlify `deployment_status` event** must be emitted for previews (default for
  the Netlify GitHub integration); verify during implementation.

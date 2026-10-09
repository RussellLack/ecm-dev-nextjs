# ECM.DEV — notes for Claude

The ecm.dev website: Next.js 16 (App Router), React 19, Tailwind, content in
Sanity (project `0dep7ult`, Studio at ecm-dev.sanity.studio), deployed on
Netlify. See `README.md` for testing details.

## Commands

- `npm run dev` / `npm run build` (prebuild runs `check:sanity`)
- `npm run check:sanity` — guards against Sanity API-quota regressions
- `npm run test:cms-engine`, `npm run test:bot-check` — unit tests
- `npm run test:e2e:smoke` — Playwright; needs `BASE_URL`, no default
  (PowerShell: `$env:BASE_URL="https://ecm.dev"; npm run test:e2e:smoke`)
- `npm run env:pull` / `npm run env:doctor` — local env setup and checks

## Working rules

- Code changes go through a branch and PR, not straight to `main`. PRs are
  gated by the deploy-preview E2E workflow.
- Before diagnosing a bug, read `KNOWN-ISSUES.md` — it records past
  misdiagnoses not to repeat.
- Analytics (GTM/GA4): `ANALYTICS.md` is the source of truth; use the
  `ecm-dev-analytics` skill. Russell prefers import files and automation over
  step-by-step UI instructions.
- Longer design notes and handovers live in `docs/`.

## Things that have bitten us

- **Sanity API quota.** Read client (`lib/sanity.server.ts`) must keep
  `useCdn: true`, and ISR revalidate windows stay long (3600s). Uncached reads
  plus frequent rebuilds exhausted the monthly quota in July 2026 and blocked
  deploys.
- **CSP nonce.** `middleware.ts` must set the same CSP on the request headers
  as on the response, or Next.js can't stamp its hydration nonce and the whole
  site loses interactivity.
- All Sanity clients are server-only with `perspective: "published"`; there is
  no live/preview client.

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
- **Static CSP, no nonce.** The CSP is a static header in `next.config.mjs`
  (`script-src 'self' 'unsafe-inline'` plus listed hosts). Never reintroduce a
  per-request nonce or read `headers()`/`cookies()` in the root layout or a
  shared component: either makes every page render per request, bypassing ISR
  and the CDN, which is what made the site slow until October 2026. There is no
  `middleware.ts`. New external script hosts must be added to `script-src`.
- All Sanity clients are server-only with `perspective: "published"`; there is
  no live/preview client.

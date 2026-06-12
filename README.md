# ecm.dev

The ECM.DEV website — a Next.js 16 (App Router) site deployed on Netlify, with
content managed in Sanity.

## Testing

### Unit

The assessment scoring engine has a standalone unit test:

```bash
npm run test:cms-engine
```

### End-to-end (Playwright)

The E2E suite verifies that every assessment on the site actually **hydrates and
is interactive** — catching the class of "renders fine but every button is dead"
failure that a status-code/uptime check would miss. It covers all assessment
flows, discovered automatically from the live `sitemap.xml` plus the bespoke
routes, so newly published assessments are included with no code change.

First-time setup (downloads the browser):

```bash
npx playwright install --with-deps chromium
```

Every command needs a `BASE_URL` pointing at the origin under test (deploy
preview, production, or a local server) — there is no default, by design.

```bash
# Smoke — all assessments, interactivity + CSP/hydration guard, NO form submit.
# Safe to run against production.
BASE_URL=https://ecm.dev npm run test:e2e:smoke

# Full suite — smoke + the lead-magnet end-to-end flow (submission is
# intercepted, so no real lead is stored and no email is sent).
BASE_URL=https://deploy-preview-123--tangerine-blini-ad1e27.netlify.app npm run test:e2e

# Full-flow only.
BASE_URL=... npm run test:e2e:full

# Limit to specific assessments (skips sitemap discovery).
ASSESSMENT_SLUGS=lead-magnet,process BASE_URL=https://ecm.dev npm run test:e2e:smoke
```

> On Windows PowerShell, set env vars inline instead:
> `$env:BASE_URL="https://ecm.dev"; npm run test:e2e:smoke`

### CI

Two GitHub Actions workflows run the same suite automatically:

- **Deploy-preview gate** (`.github/workflows/assessment-e2e.yml`) — on every PR,
  runs the full suite against that PR's Netlify deploy preview and blocks merge
  on failure.
- **Production monitor** (`.github/workflows/assessment-monitor.yml`) — runs the
  smoke suite against `https://ecm.dev` every 15 minutes and emails on failure.

See [`docs/superpowers/specs/2026-06-12-assessment-testing-design.md`](docs/superpowers/specs/2026-06-12-assessment-testing-design.md)
for the full design.

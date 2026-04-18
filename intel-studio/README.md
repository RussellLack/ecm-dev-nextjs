# ECM.DEV Intel — Sanity Studio

Standalone Sanity Studio for the Content Intelligence Engine. Lives in its
own Sanity project (`ecm-dev-intel`), entirely separate from the main
ECM.DEV website project. Editors pick between the two studios explicitly;
intel schemas never show up in the main Content menu.

## What's here

| File | Purpose |
|---|---|
| `sanity.config.ts` | Studio config — registers intel schemas, desk structure, and custom document actions |
| `sanity.cli.ts` | CLI config for `npx sanity deploy` |
| `schemas/` | 4 document types: `intelSource`, `intelTopic`, `intelVendor`, `intelArticle` |
| `structure.ts` | Desk structure with Raw / Enriched / Published / Rejected queues |
| `actions/publishIntelArticle.ts` | "Publish to feed" + "Reject" document actions |
| `scripts/seed-topics.ts` | One-off seeder for the 12 seed topics |

## One-time project setup

1. Create the Sanity project from https://www.sanity.io/manage:
   - **Name:** `ecm-dev-intel`
   - **Dataset:** `production` (public or private — the Next.js site reads via a token either way)
2. Create two tokens at Project → API → Tokens:
   - **Read token** — for the Next.js site public pages. Scope: Viewer.
   - **Write token** — for the ingester + processor. Scope: Editor.

## Environment variables

Set these locally (e.g. `intel-studio/.env.local`) and in wherever you
deploy Studio from:

```
SANITY_STUDIO_INTEL_PROJECT_ID=...
SANITY_STUDIO_INTEL_DATASET=production
SANITY_INTEL_API_WRITE_TOKEN=...           # for the seeder only
SANITY_STUDIO_INTEL_HOST=ecm-dev-intel     # optional; defaults in sanity.cli.ts
```

The Next.js site in the parent repo needs these (distinct names because
they run in a different environment):

```
NEXT_PUBLIC_SANITY_INTEL_PROJECT_ID=...
NEXT_PUBLIC_SANITY_INTEL_DATASET=production
SANITY_INTEL_API_READ_TOKEN=...
SANITY_INTEL_API_WRITE_TOKEN=...
SANITY_INTEL_WEBHOOK_SECRET=...
```

## Install & deploy

This directory has its own `package.json` and `node_modules` — it does
**not** share dependencies with the parent Next.js repo. That's
deliberate: Sanity 5.x peer-requires React 19, which the parent still
pins to React 18.

First run:

```bash
cd intel-studio
npm install
SANITY_STUDIO_INTEL_PROJECT_ID=<project-id> npx sanity deploy
```

The first `sanity deploy` will prompt for login and a studio hostname.
Subsequent deploys reuse both. The studio lands at
`<studioHost>.sanity.studio` (defaults to `ecm-dev-intel.sanity.studio`
via `sanity.cli.ts`).

## Seed the taxonomy (once, after first deploy)

```bash
cd intel-studio
SANITY_STUDIO_INTEL_PROJECT_ID=<id> \
SANITY_INTEL_API_WRITE_TOKEN=<editor-token> \
npm run seed
```

Idempotent — re-running prints `✓ X (exists)` for already-seeded topics.

## Extracting to its own repo

When you're ready to decouple entirely:

1. Copy this directory to a fresh repo (or use `git filter-repo --path intel-studio/ --path-rename intel-studio/:`).
2. Everything needed is already here — `package.json`, schemas, structure,
   actions, CLI config. No parent-repo dependencies.
3. Deploys keep working — the project ID is driven by env vars, not
   hard-coded.

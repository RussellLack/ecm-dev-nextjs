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

## Deploy

From this directory:

```bash
cd intel-studio
npx sanity deploy
```

First deploy pushes the schema and puts the studio at
`<studioHost>.sanity.studio` (defaults to `ecm-dev-intel.sanity.studio`).

## Seed the taxonomy (once, after first deploy)

```bash
cd intel-studio
npx tsx scripts/seed-topics.ts
```

## Extracting to its own repo

When you're ready to decouple entirely:

1. `git filter-repo --path intel-studio/ --path-rename intel-studio/:` (or
   copy the directory) into a fresh repo.
2. Add a `package.json` with `sanity`, `@sanity/client` as dependencies.
3. Add `@sanity/assist` and `@sanity/scheduled-publishing` if you want the
   same plugins as the main studio.
4. Deploys stay the same — the schema is identical and the project ID is
   driven by env vars.

Until extracted, this directory piggy-backs on the parent repo's
`node_modules/sanity` install.

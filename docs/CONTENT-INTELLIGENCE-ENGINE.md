# Content Intelligence Engine

The intel pipeline (RSS ingestion, AI enrichment, editorial queue) now
lives in the standalone **ecm-dev-intel-studio** repo — see its README
for architecture, worker code, and the GitHub Actions cron.

## What's left in this repo

Only the **public reader** side. The pipeline writes enriched articles to
the `ecm-dev-intel` Sanity project; this repo reads from it.

| Path | Purpose |
|---|---|
| `app/intel/` | Public pages: `/intel`, `/intel/topic/[slug]`, `/intel/vendor/[slug]` |
| `app/api/intel/feed/` | RSS feed of published articles |
| `app/api/intel/newsletter/` | Weekly newsletter digest |
| `app/api/intel/ai/` | NDJSON feed for downstream LLM/RAG use |
| `lib/intel/queries.ts` | GROQ queries for the reader |
| `lib/intel/sanity.ts` | Read-only Sanity client (uses `SANITY_INTEL_API_READ_TOKEN`) |

## Required env vars (reader-only)

```
NEXT_PUBLIC_SANITY_INTEL_PROJECT_ID=...
NEXT_PUBLIC_SANITY_INTEL_DATASET=production
SANITY_INTEL_API_READ_TOKEN=...
```

Write token, Anthropic key, and webhook secret are no longer used here —
they live in the studio repo's environment now.

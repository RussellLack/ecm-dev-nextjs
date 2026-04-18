# Content Intelligence Engine — Design & Implementation Spec

**Status:** implemented; intel content lives in a separate Sanity project
**Stack fit:** Next.js 16 + two Sanity projects + Netlify
**LLM:** Anthropic Claude (claude-sonnet-4-6 for processing; claude-haiku-4-5 for dedup/classification)

Replaces Feedly as a content-intake system and emits AI-enriched, structured
articles that can drive the website feed, newsletter generation, and
downstream AI workflows.

## Project boundary

Intel content is deliberately isolated in its **own Sanity project**
(`ecm-dev-intel`) with its own Studio (`intel-studio/` in this repo, or
extracted to a separate repo later). The main ECM.DEV website Sanity
project (`ecm-dev`) never sees intel schemas or documents — editors pick
between the two studios explicitly. The Next.js site in this repo reads
from both projects via different clients: `lib/sanity.server.ts` for the
main site, `lib/intel/sanity.ts` for intel.

---

## 1. Goals & non-goals

**Goals**
- Pull articles from N RSS feeds on a schedule.
- Enrich each article with AI-generated summary, insights, tags, vendors,
  content angle, and a LinkedIn draft.
- Store everything in Sanity as queryable structured content.
- Expose JSON APIs for the website, newsletter tooling, and external
  automation (Zapier/Make).

**Non-goals (phase 1)**
- Full-text search across enriched content (use Sanity GROQ `match` for now;
  add embeddings later if needed).
- Multi-tenant / per-user feeds. System is single-tenant for ECM.DEV.
- Auto-publishing to LinkedIn. The LinkedIn draft is human-reviewed.

---

## 2. System architecture (text diagram)

```
                  ┌────────────────────────────────────────────────┐
                  │                  SANITY CMS                    │
                  │  intelSource  intelTopic  intelVendor          │
                  │  intelArticle (draft ↔ published)              │
                  └───────▲─────────────────────────▲──────────────┘
                          │                         │
                (3) write enriched          (6) publish → webhook
                          │                         │
┌──────────────┐   ┌──────┴───────────┐    ┌────────┴─────────┐
│ RSS feeds    │   │   PROCESSOR      │    │  DISTRIBUTION    │
│ (many URLs)  │   │  Netlify Fn      │    │  Next.js routes  │
└──────▲───────┘   │  claude-sonnet-4 │    │  /api/intel/*    │
       │           └──────▲───────────┘    └────────▲─────────┘
       │ (1) fetch        │ (2) enqueue             │
       │                  │                         │ (7) JSON
┌──────┴───────────┐      │                         │
│  INGESTER        │──────┘                  ┌──────┴─────────┐
│  Netlify Sched   │                         │ Web / Newsletter│
│  Fn  (cron /30m) │                         │ Zapier / Make   │
│  + dedup cache   │                         └────────────────┘
│  (Netlify Blobs) │
└──────────────────┘

(1) Ingester pulls RSS feeds listed in Sanity (intelSource docs).
(2) For each new item, it creates a draft intelArticle in Sanity
    (status="raw") and enqueues a processing job via webhook.
(3) Processor reads the draft, calls Claude, writes enriched fields back,
    sets status="enriched".
(4) (Optional) A human reviews; or auto-publish rule in Sanity flips
    status="published".
(5) Sanity webhook on publish → fans out to downstream consumers.
(6) Public Next.js API routes serve the data; Zapier/Make subscribe to
    webhook events.
```

Key properties:
- **Dedup** is a cheap URL-hash check against Netlify Blobs before any
  Sanity write — no round trip to Sanity for known items.
- **Processing is idempotent**: the processor can be re-run on a doc; it
  overwrites enriched fields only.
- **No queue infra** required for phase 1. Netlify Background Functions give
  ~15-min execution headroom; one function per article keeps each run short.
- **Webhooks are the automation fabric** — Zapier/Make just subscribe to
  Sanity's publish webhook.

---

## 3. Data model

### 3.1 `intelSource` — a subscribed feed

Fields: `title`, `feedUrl` (unique), `homepageUrl`, `defaultTopics` (refs to
`intelTopic`), `active` (bool), `lastFetchedAt`, `lastError`.

### 3.2 `intelTopic` — taxonomy

Fields: `title`, `slug`. Seeded with: ContentOps, AI, CMS, Governance, DAM,
PIM, Workflow, Personalization, Analytics, Search, Compliance.

### 3.3 `intelVendor` — companies/tools mentioned

Fields: `name`, `slug`, `category` (CMS / DAM / PIM / AI / other), `website`.
Auto-created by processor when a new vendor is detected (as draft, for
human merge).

### 3.4 `intelArticle` — the core document

See schema in §5. Status lifecycle: `raw → enriched → published` (or
`rejected`).

---

## 4. JSON contract (external representation)

Every distribution endpoint returns this shape:

```json
{
  "id": "a3f2...",
  "title": "How Contentful is re-pricing the composable stack",
  "source": { "title": "CMS Wire", "url": "https://..." },
  "url": "https://original-article-url",
  "published_date": "2026-04-17T09:12:00Z",
  "summary": "Two-to-three sentence neutral summary.",
  "key_insight": "One sentence — the 'so what' for an ECM buyer.",
  "topics": ["CMS", "ContentOps", "Pricing"],
  "vendors": ["Contentful", "Storyblok"],
  "content_angle": "ECM.DEV perspective: pricing pressure validates the headless thesis but raises switching-cost questions for mid-market buyers.",
  "linkedin_post": "Three-paragraph draft, first-person, ≤1300 chars, ends with an open question."
}
```

---

## 5. Sanity schema (drop-in files)

All four schema files live in `intel-studio/schemas/` and are registered
in `intel-studio/schemas/index.ts`. They are deployed to the
`ecm-dev-intel` Sanity project only — never to the main website project.

### `sanity/schemas/intelTopic.ts`

```ts
import { defineType, defineField } from "sanity";

export default defineType({
  name: "intelTopic",
  title: "Intel — Topic",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 64 },
      validation: (r) => r.required(),
    }),
  ],
  preview: { select: { title: "title", subtitle: "slug.current" } },
});
```

### `sanity/schemas/intelVendor.ts`

```ts
import { defineType, defineField } from "sanity";

export default defineType({
  name: "intelVendor",
  title: "Intel — Vendor",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "name", maxLength: 64 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      type: "string",
      options: {
        list: ["CMS", "DAM", "PIM", "DXP", "AI", "Analytics", "Other"],
      },
    }),
    defineField({ name: "website", type: "url" }),
  ],
  preview: { select: { title: "name", subtitle: "category" } },
});
```

### `sanity/schemas/intelSource.ts`

```ts
import { defineType, defineField } from "sanity";

export default defineType({
  name: "intelSource",
  title: "Intel — Source (RSS feed)",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "feedUrl",
      type: "url",
      validation: (r) =>
        r.required().uri({ scheme: ["http", "https"] }),
    }),
    defineField({ name: "homepageUrl", type: "url" }),
    defineField({
      name: "defaultTopics",
      type: "array",
      of: [{ type: "reference", to: [{ type: "intelTopic" }] }],
    }),
    defineField({
      name: "active",
      type: "boolean",
      initialValue: true,
    }),
    defineField({ name: "lastFetchedAt", type: "datetime", readOnly: true }),
    defineField({ name: "lastError", type: "string", readOnly: true }),
  ],
  preview: {
    select: { title: "title", subtitle: "feedUrl", active: "active" },
    prepare: ({ title, subtitle, active }) => ({
      title: `${active ? "✓" : "⏸"} ${title}`,
      subtitle,
    }),
  },
});
```

### `sanity/schemas/intelArticle.ts`

```ts
import { defineType, defineField } from "sanity";

export default defineType({
  name: "intelArticle",
  title: "Intel — Article",
  type: "document",
  fields: [
    // Identity
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "url",
      type: "url",
      validation: (r) => r.required().uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "urlHash",
      type: "string",
      description: "SHA-1 of normalised url. Unique index in application.",
      readOnly: true,
    }),
    defineField({
      name: "source",
      type: "reference",
      to: [{ type: "intelSource" }],
      validation: (r) => r.required(),
    }),
    defineField({ name: "publishedDate", type: "datetime" }),
    defineField({ name: "ingestedAt", type: "datetime", readOnly: true }),

    // Raw content
    defineField({
      name: "rawContent",
      title: "Raw content (from feed)",
      type: "text",
      rows: 10,
      readOnly: true,
    }),

    // AI enrichment
    defineField({
      name: "status",
      type: "string",
      options: {
        list: ["raw", "enriched", "published", "rejected"],
        layout: "radio",
      },
      initialValue: "raw",
    }),
    defineField({ name: "summary", type: "text", rows: 3 }),
    defineField({ name: "keyInsight", type: "text", rows: 2 }),
    defineField({
      name: "topics",
      type: "array",
      of: [{ type: "reference", to: [{ type: "intelTopic" }] }],
    }),
    defineField({
      name: "vendors",
      type: "array",
      of: [{ type: "reference", to: [{ type: "intelVendor" }] }],
    }),
    defineField({ name: "contentAngle", type: "text", rows: 3 }),
    defineField({ name: "linkedinPost", type: "text", rows: 8 }),

    // Observability
    defineField({
      name: "processingLog",
      type: "array",
      of: [{ type: "string" }],
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: "title",
      status: "status",
      source: "source.title",
      date: "publishedDate",
    },
    prepare: ({ title, status, source, date }) => ({
      title: `[${status}] ${title}`,
      subtitle: `${source ?? "?"} · ${
        date ? new Date(date).toLocaleDateString("en-GB") : "—"
      }`,
    }),
  },
});
```

### Registration — `sanity/schemas/index.ts`

Append:

```ts
import intelSource from "./intelSource";
import intelTopic from "./intelTopic";
import intelVendor from "./intelVendor";
import intelArticle from "./intelArticle";

export const schemaTypes = [
  // ...existing...
  intelSource,
  intelTopic,
  intelVendor,
  intelArticle,
];
```

---

## 6. Code

All code is TypeScript, runs on Netlify Functions or Next.js routes.

Dependencies to add:

```bash
npm i rss-parser @anthropic-ai/sdk @netlify/blobs
```

### 6.1 `lib/intel/ingest.ts` — RSS → Sanity

```ts
import Parser from "rss-parser";
import { createHash } from "node:crypto";
import { getStore } from "@netlify/blobs";
import { sanityWriteClient } from "@/lib/sanity.write"; // token-bearing client

const parser = new Parser({ timeout: 15_000 });

type SourceDoc = {
  _id: string;
  title: string;
  feedUrl: string;
  defaultTopics?: { _ref: string }[];
};

function normaliseUrl(u: string) {
  try {
    const x = new URL(u);
    x.hash = "";
    // Strip common tracking params
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]
      .forEach((p) => x.searchParams.delete(p));
    return x.toString();
  } catch {
    return u;
  }
}
const urlHash = (u: string) =>
  createHash("sha1").update(normaliseUrl(u)).digest("hex");

export async function ingestAllSources() {
  const sources = await sanityWriteClient.fetch<SourceDoc[]>(
    `*[_type == "intelSource" && active == true]{ _id, title, feedUrl, defaultTopics }`
  );
  const seen = getStore("intel-seen");
  const results: { source: string; added: number; errors: string[] }[] = [];

  for (const src of sources) {
    const r = { source: src.title, added: 0, errors: [] as string[] };
    try {
      const feed = await parser.parseURL(src.feedUrl);
      for (const item of feed.items ?? []) {
        if (!item.link || !item.title) continue;
        const hash = urlHash(item.link);
        if (await seen.get(hash)) continue; // dedup

        await sanityWriteClient.create({
          _type: "intelArticle",
          title: item.title,
          url: normaliseUrl(item.link),
          urlHash: hash,
          source: { _type: "reference", _ref: src._id },
          publishedDate: item.isoDate ?? item.pubDate ?? null,
          ingestedAt: new Date().toISOString(),
          rawContent:
            item.contentSnippet ?? item.content ?? item.summary ?? "",
          status: "raw",
          topics: src.defaultTopics ?? [],
        });

        await seen.set(hash, "1"); // cache dedup marker
        r.added++;
      }
      await sanityWriteClient
        .patch(src._id)
        .set({ lastFetchedAt: new Date().toISOString(), lastError: null })
        .commit();
    } catch (e: any) {
      r.errors.push(e.message ?? String(e));
      await sanityWriteClient
        .patch(src._id)
        .set({ lastError: e.message?.slice(0, 500) ?? "unknown" })
        .commit();
    }
    results.push(r);
  }
  return results;
}
```

### 6.2 `lib/sanity.write.ts` — write client

```ts
import { createClient } from "@sanity/client";

export const sanityWriteClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID!,
  dataset: process.env.SANITY_DATASET ?? "production",
  apiVersion: "2024-10-01",
  token: process.env.SANITY_WRITE_TOKEN!, // Editor token
  useCdn: false,
});
```

### 6.3 `lib/intel/process.ts` — AI enrichment

```ts
import Anthropic from "@anthropic-ai/sdk";
import { sanityWriteClient } from "@/lib/sanity.write";

const anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY

const SYSTEM = `You are ECM.DEV's content intelligence analyst.
You read industry articles about Enterprise Content Management, CMS,
ContentOps, DAM, PIM, and AI-for-content. You produce concise, neutral,
decision-useful output. Never invent facts not present in the source.`;

const USER_TEMPLATE = (title: string, body: string, url: string) => `
Analyse the article below and respond with STRICT JSON matching this schema:

{
  "summary": string,           // 2-3 sentences, neutral, no editorialising
  "key_insight": string,       // 1 sentence: the "so what" for an ECM buyer
  "topics": string[],          // from: ContentOps, AI, CMS, Governance, DAM, PIM, DXP, Workflow, Personalization, Analytics, Search, Compliance
  "vendors": string[],         // company or product names explicitly mentioned
  "content_angle": string,     // 1-2 sentences: ECM.DEV's point of view
  "linkedin_post": string      // first-person draft, ≤1300 chars, ends with a question
}

TITLE: ${title}
URL: ${url}
BODY:
${body.slice(0, 8000)}
`;

export async function enrichArticle(docId: string) {
  const doc = await sanityWriteClient.getDocument(docId);
  if (!doc || doc._type !== "intelArticle") throw new Error("not found");

  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: USER_TEMPLATE(doc.title, doc.rawContent ?? "", doc.url),
      },
    ],
  });

  const text = msg.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");
  const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));

  // Resolve topic + vendor refs
  const topicRefs = await resolveTopics(parsed.topics ?? []);
  const vendorRefs = await resolveVendors(parsed.vendors ?? []);

  await sanityWriteClient
    .patch(docId)
    .set({
      summary: parsed.summary,
      keyInsight: parsed.key_insight,
      contentAngle: parsed.content_angle,
      linkedinPost: parsed.linkedin_post,
      topics: topicRefs,
      vendors: vendorRefs,
      status: "enriched",
    })
    .append("processingLog", [`enriched ${new Date().toISOString()}`])
    .commit();
}

async function resolveTopics(names: string[]) {
  if (!names.length) return [];
  const existing = await sanityWriteClient.fetch<{ _id: string; title: string }[]>(
    `*[_type == "intelTopic" && title in $names]{ _id, title }`,
    { names }
  );
  return existing.map((t) => ({ _type: "reference", _ref: t._id }));
}

async function resolveVendors(names: string[]) {
  if (!names.length) return [];
  const lowered = names.map((n) => n.trim()).filter(Boolean);
  const existing = await sanityWriteClient.fetch<{ _id: string; name: string }[]>(
    `*[_type == "intelVendor" && lower(name) in $names]{ _id, name }`,
    { names: lowered.map((n) => n.toLowerCase()) }
  );
  const known = new Map(existing.map((v) => [v.name.toLowerCase(), v._id]));
  const refs: { _type: "reference"; _ref: string }[] = [];

  for (const name of lowered) {
    let id = known.get(name.toLowerCase());
    if (!id) {
      // Create as draft so humans can review/merge
      const created = await sanityWriteClient.create({
        _type: "intelVendor",
        _id: `drafts.intelVendor-${crypto.randomUUID()}`,
        name,
        slug: { current: name.toLowerCase().replace(/[^a-z0-9]+/g, "-") },
      });
      id = created._id;
    }
    refs.push({ _type: "reference", _ref: id });
  }
  return refs;
}
```

### 6.4 Netlify scheduled function — `netlify/functions/intel-ingest.ts`

```ts
import type { Config } from "@netlify/functions";
import { ingestAllSources } from "../../lib/intel/ingest";

export default async () => {
  const results = await ingestAllSources();
  // Trigger processing for newly ingested items
  for (const r of results) {
    // (Optional) fan out via internal webhook — see §7
  }
  return new Response(JSON.stringify(results), {
    headers: { "content-type": "application/json" },
  });
};

export const config: Config = {
  schedule: "*/30 * * * *", // every 30 min
};
```

### 6.5 Next.js API routes — distribution

**`app/api/intel/feed/route.ts`** — public website feed

```ts
import { NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity.client";

export const revalidate = 300;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 100);
  const topic = searchParams.get("topic");

  const query = `*[_type == "intelArticle" && status == "published"
    ${topic ? "&& $topic in topics[]->slug.current" : ""}
  ] | order(publishedDate desc) [0...$limit] {
    "id": _id,
    title,
    url,
    "source": source->{ "title": title, "url": homepageUrl },
    "published_date": publishedDate,
    summary,
    "key_insight": keyInsight,
    "topics": topics[]->title,
    "vendors": vendors[]->name,
    "content_angle": contentAngle,
    "linkedin_post": linkedinPost
  }`;

  const data = await sanityClient.fetch(query, { limit, topic });
  return NextResponse.json({ items: data });
}
```

**`app/api/intel/newsletter/route.ts`** — curated newsletter digest

```ts
import { NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity.client";

export async function GET(req: Request) {
  const since = new URL(req.url).searchParams.get("since") ??
    new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

  const items = await sanityClient.fetch(
    `*[_type == "intelArticle" && status == "published" && publishedDate > $since]
     | order(publishedDate desc) {
       title, url, "source": source->title, summary, "key_insight": keyInsight,
       "topics": topics[]->title
     }`,
    { since }
  );
  return NextResponse.json({ since, items });
}
```

**`app/api/intel/ai/route.ts`** — LLM-optimised feed (JSONL-style)

```ts
import { sanityClient } from "@/lib/sanity.client";

export async function GET() {
  const items = await sanityClient.fetch(
    `*[_type == "intelArticle" && status == "published"]
     | order(publishedDate desc)[0...500]{
       "id": _id, title, url, "published_date": publishedDate,
       summary, "key_insight": keyInsight,
       "topics": topics[]->title, "vendors": vendors[]->name,
       "content_angle": contentAngle
     }`
  );
  return new Response(items.map((i: unknown) => JSON.stringify(i)).join("\n"), {
    headers: { "content-type": "application/x-ndjson" },
  });
}
```

### 6.6 Webhook endpoint — Sanity → processor / external

**`app/api/intel/hook/route.ts`**

```ts
import { NextResponse } from "next/server";
import { enrichArticle } from "@/lib/intel/process";
import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get(SIGNATURE_HEADER_NAME) ?? "";
  const valid = await isValidSignature(body, sig, process.env.SANITY_WEBHOOK_SECRET!);
  if (!valid) return NextResponse.json({ error: "bad sig" }, { status: 401 });

  const payload = JSON.parse(body) as { _id: string; _type: string; status: string };
  if (payload._type !== "intelArticle") return NextResponse.json({ ok: true });

  // Trigger AI enrichment on newly-created raw articles
  if (payload.status === "raw") {
    // Fire-and-forget — for long jobs move to a queue / bg function
    enrichArticle(payload._id).catch(console.error);
  }
  return NextResponse.json({ ok: true });
}
```

---

## 7. Automation & webhooks

Configure **two** webhooks in Sanity (`Manage → API → Webhooks`):

1. **Enrichment trigger**
   - Trigger: document created, type = `intelArticle`, filter `status == "raw"`
   - URL: `https://ecm.dev/api/intel/hook`
   - Secret: `SANITY_WEBHOOK_SECRET`

2. **External fanout (Zapier / Make / Notion / Slack)**
   - Trigger: document updated, type = `intelArticle`, filter `status == "published"`
   - URL: the Zapier / Make hook URL
   - Projection:
     ```groq
     {
       _id, title, url, "source": source->title,
       summary, "key_insight": keyInsight,
       "topics": topics[]->title,
       "linkedin_post": linkedinPost
     }
     ```

No custom queue is required for phase 1. If processor latency becomes a
problem, migrate the enrichment call to a Netlify Background Function (same
code, different declaration) and return `202` immediately from the webhook.

---

## 8. Environment variables

All intel-specific vars use the `INTEL_` prefix so they can never be
confused with the main-site equivalents.

### Next.js site (Netlify — scope: all contexts)

```
ANTHROPIC_API_KEY=sk-ant-...

# ECM-DEV-INTEL Sanity project — read + write tokens
NEXT_PUBLIC_SANITY_INTEL_PROJECT_ID=xxxxxxxx
NEXT_PUBLIC_SANITY_INTEL_DATASET=production
SANITY_INTEL_API_READ_TOKEN=...           # Viewer scope
SANITY_INTEL_API_WRITE_TOKEN=...          # Editor scope
SANITY_INTEL_WEBHOOK_SECRET=...           # any 32+ char random string
```

The main website vars (`NEXT_PUBLIC_SANITY_PROJECT_ID`,
`SANITY_API_READ_TOKEN`, etc.) are unchanged — intel does not touch them.

### Intel Studio (`intel-studio/`)

```
SANITY_STUDIO_INTEL_PROJECT_ID=xxxxxxxx   # same as above
SANITY_STUDIO_INTEL_DATASET=production
SANITY_STUDIO_INTEL_HOST=ecm-dev-intel    # optional, used by sanity.cli.ts
SANITY_INTEL_API_WRITE_TOKEN=...          # only needed for scripts/seed-topics.ts
```

None of the write tokens or the webhook secret are exposed to the
browser — they're only referenced in server-only code (`lib/intel/*`,
API routes, the Netlify scheduled function, and the Studio seeder).

---

## 9. Deployment steps

1. **Create the Sanity project** at https://www.sanity.io/manage:
   - Name: `ecm-dev-intel`
   - Dataset: `production`
   - Create two tokens (Project → API → Tokens):
     a. Viewer-scoped (read) — becomes `SANITY_INTEL_API_READ_TOKEN`
     b. Editor-scoped (write) — becomes `SANITY_INTEL_API_WRITE_TOKEN`
2. **Deploy the intel Studio**:
   ```bash
   cd intel-studio
   SANITY_STUDIO_INTEL_PROJECT_ID=<project-id> npx sanity deploy
   ```
   First deploy hosts it at `ecm-dev-intel.sanity.studio` (overridable
   via `SANITY_STUDIO_INTEL_HOST`).
3. **Seed the taxonomy** (once):
   ```bash
   cd intel-studio
   SANITY_STUDIO_INTEL_PROJECT_ID=<id> \
   SANITY_INTEL_API_WRITE_TOKEN=<token> \
   npx tsx scripts/seed-topics.ts
   ```
4. **Add sources** — in the intel Studio, create `intelSource` docs
   with the RSS URLs you want to track. Toggle `autoPublish` on trusted
   feeds to skip the review queue.
5. **Configure Netlify env vars** — see §8 for the full list. Scope
   "all contexts" so they're available to both the build and the
   scheduled function at runtime.
6. **Deploy the Next.js site** — push; Netlify will:
   - build Next.js (routes under `app/api/intel/*` and the `/intel`
     page become live)
   - register the scheduled function (`netlify/functions/intel-ingest.ts`)
   - register the Netlify Blobs store `intel-seen` on first write
7. **Create Sanity webhooks** — in the `ecm-dev-intel` project (not the
   main one). See §7 for the trigger definitions and target URL.
8. **Smoke test**
   - Trigger the scheduled function manually:
     `curl -X POST https://<site>.netlify.app/.netlify/functions/intel-ingest`
   - Open the intel Studio: new `intelArticle` docs with `status="raw"` appear.
   - Confirm the webhook fires and the processor patches to `status="enriched"`.
   - Publish one manually; hit `/api/intel/feed` and `/intel` and verify.

---

## 10. Operational notes

- **Cost control**: Sonnet 4.6 at ~1.5k output tokens per article, @ ~50
  articles/day ≈ low-double-digit dollars/month. Swap to `claude-haiku-4-5`
  for the processor if volume grows.
- **Failure modes**:
  - RSS parse failure → `lastError` on the source; next run retries.
  - LLM JSON malformed → `processingLog` records the failure; article
    remains `status="raw"` and is picked up on the next processor retry.
  - Dedup drift (Netlify Blobs lost) → the `urlHash` field in
    `intelArticle` lets you rebuild the cache with a one-off script.
- **Rate limit**: cap `ingestAllSources` to e.g. 25 new items per run in
  phase 2 if any single feed is chatty.
- **Human-in-the-loop**: Studio shows `status` as a radio — editors review
  `enriched` items and flip to `published`. To bypass, add a Sanity Action
  that auto-publishes when `status → enriched` for trusted sources.

---

## 11. Extending later

- **Embeddings + semantic search** — add a Sanity embeddings index on
  `summary + keyInsight` (the `mcp__sanity__semantic_search` surface is
  already available) for similarity-based "related articles".
- **Scoring** — add `impactScore` (0-100) to `intelArticle`; prompt Claude
  to rate buyer-relevance. Drive newsletter curation off the score.
- **De-duplication of near-duplicates across sources** — cluster by
  embedding similarity in a nightly job; mark all but one as
  `status="rejected"` with a reference to the canonical.
- **Auto-post** — once trust is high, a LinkedIn API integration behind a
  feature flag and explicit per-article approval.

import { NextResponse } from "next/server";
import { createClient } from "@sanity/client";
import { randomUUID } from "node:crypto";

/**
 * Bridge from an enriched intelArticle (ecm-dev-intel project) to a draft
 * blog post (main ecm-dev project). The intel Studio's "Send to blog"
 * document action POSTs here with { articleId }; we create a draft post
 * with everything except mainImage. Editor opens the draft in the
 * ecm-dev Studio, uses AI Assist to generate the cover, publishes there.
 *
 * The Studio action flips intelArticle.status to "published" itself once
 * this endpoint returns 200 — cleaner than us doing a cross-project
 * status flip from here.
 *
 * Auth: shared secret via the `x-intel-secret` header. Editors set the
 * same value in their Studio env as SANITY_STUDIO_INTEL_TO_BLOG_SECRET.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// CORS: return `*` for the Origin header. The Sanity Studio runs
// inside a sandboxed iframe on sanity.io hosting which sends the
// literal string "null" as its Origin — echoing "null" back as
// Access-Control-Allow-Origin is treated as invalid by Chrome and
// blocks the request. Wildcard is safe here because we don't use
// credentials (the shared secret x-intel-secret authenticates the
// request, not cookies), and wildcard is universally accepted.
function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, x-intel-secret",
    "Access-Control-Max-Age": "300",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

const intelReadClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_INTEL_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_INTEL_DATASET || "production",
  apiVersion: "2026-04-01",
  useCdn: false,
  token: process.env.SANITY_INTEL_API_READ_TOKEN,
  perspective: "published",
});

const mainWriteClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2026-04-01",
  useCdn: false,
  token: process.env.SANITY_MAIN_WRITE_TOKEN,
});

type IntelArticle = {
  _id: string;
  title: string;
  url: string;
  publishedDate: string | null;
  summary: string | null;
  keyInsight: string | null;
  contentAngle: string | null;
  topics: { title: string; slug: string }[];
  sourceTitle: string | null;
};

const INTEL_QUERY = `*[_type == "intelArticle" && _id == $id][0]{
  _id,
  title,
  url,
  publishedDate,
  summary,
  keyInsight,
  contentAngle,
  "topics": topics[]->{ "title": title, "slug": slug.current },
  "sourceTitle": source->title
}`;

// Which service pillar each topic aligns to. Absent topics → no pillar.
const TOPIC_TO_PILLAR: Record<string, "technology" | "services"> = {
  CMS: "technology",
  DXP: "technology",
  DAM: "technology",
  PIM: "technology",
  AI: "technology",
  Analytics: "technology",
  Search: "technology",
  Personalization: "technology",
  ContentOps: "services",
  Workflow: "services",
  Governance: "services",
  Compliance: "services",
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 96);
}

function paragraph(text: string) {
  return {
    _type: "block",
    _key: randomUUID(),
    style: "normal",
    markDefs: [],
    children: [
      { _type: "span", _key: randomUUID(), text, marks: [] },
    ],
  };
}

function sourceLinkParagraph(sourceTitle: string | null, url: string) {
  const linkKey = randomUUID();
  const prefix = "Read the full analysis at ";
  const linkText = sourceTitle ?? new URL(url).hostname;
  return {
    _type: "block",
    _key: randomUUID(),
    style: "normal",
    markDefs: [{ _type: "link", _key: linkKey, href: url }],
    children: [
      { _type: "span", _key: randomUUID(), text: prefix, marks: [] },
      { _type: "span", _key: randomUUID(), text: linkText, marks: [linkKey] },
      { _type: "span", _key: randomUUID(), text: ".", marks: [] },
    ],
  };
}

function buildBody(a: IntelArticle) {
  const blocks: unknown[] = [];
  if (a.keyInsight) blocks.push(paragraph(a.keyInsight));
  if (a.contentAngle) blocks.push(paragraph(a.contentAngle));
  blocks.push(sourceLinkParagraph(a.sourceTitle, a.url));
  return blocks;
}

function pillarsFor(topics: { title: string }[]): string[] {
  const set = new Set<string>();
  for (const t of topics) {
    const p = TOPIC_TO_PILLAR[t.title];
    if (p) set.add(p);
  }
  return [...set];
}

export async function POST(req: Request) {
  const headers = corsHeaders();

  try {
    const secret = process.env.INTEL_TO_BLOG_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "Endpoint not configured (missing INTEL_TO_BLOG_SECRET)" },
        { status: 500, headers }
      );
    }
    if (req.headers.get("x-intel-secret") !== secret) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers }
      );
    }

    let payload: { articleId?: string };
    try {
      payload = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers });
    }
    const articleId = payload.articleId?.trim();
    if (!articleId) {
      return NextResponse.json(
        { error: "articleId required" },
        { status: 400, headers }
      );
    }

    // Preflight: surface obvious env-var misconfigurations as clear errors
    // instead of letting the Sanity client throw a cryptic auth failure.
    if (!process.env.NEXT_PUBLIC_SANITY_INTEL_PROJECT_ID) {
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_SANITY_INTEL_PROJECT_ID" },
        { status: 500, headers }
      );
    }
    if (!process.env.SANITY_INTEL_API_READ_TOKEN) {
      return NextResponse.json(
        { error: "Missing SANITY_INTEL_API_READ_TOKEN" },
        { status: 500, headers }
      );
    }
    if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_SANITY_PROJECT_ID (main ecm-dev project id)" },
        { status: 500, headers }
      );
    }
    if (!process.env.SANITY_MAIN_WRITE_TOKEN) {
      return NextResponse.json(
        { error: "Missing SANITY_MAIN_WRITE_TOKEN (ecm-dev editor token)" },
        { status: 500, headers }
      );
    }

    let article: IntelArticle | null;
    try {
      article = (await intelReadClient.fetch(INTEL_QUERY, {
        id: articleId,
      })) as IntelArticle | null;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return NextResponse.json(
        {
          error: `intel_read failed (project=${process.env.NEXT_PUBLIC_SANITY_INTEL_PROJECT_ID}): ${msg}`,
        },
        { status: 500, headers }
      );
    }
    if (!article) {
      return NextResponse.json(
        { error: `Article not found: ${articleId}` },
        { status: 404, headers }
      );
    }
    if (!article.title) {
      return NextResponse.json(
        { error: "Article has no title" },
        { status: 422, headers }
      );
    }

    const slug = slugify(article.title);
    const draftId = `drafts.post-intel-${slug}-${randomUUID().slice(0, 8)}`;

    const doc = {
      _id: draftId,
      _type: "post",
      title: article.title,
      slug: { _type: "slug", current: slug },
      publishedAt: new Date().toISOString(),
      excerpt: article.summary ?? "",
      tags: article.topics.map((t) => t.title),
      pillars: pillarsFor(article.topics),
      body: buildBody(article),
      seo: {
        // Cap at 70 chars (schema's soft-warning limit is 60, hard limit 70).
        metaTitle: article.title.slice(0, 70),
        // Cap at 170 chars (schema's soft-warning limit is 160, hard limit 170).
        metaDescription: (article.summary ?? "").slice(0, 170),
        // ogImage left unset — editor either uploads a social-specific
        // image or the site falls back to mainImage in OG rendering.
      },
    };

    let created;
    try {
      created = await mainWriteClient.create(doc);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return NextResponse.json(
        {
          error: `main_write failed (project=${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}): ${msg}`,
        },
        { status: 500, headers }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        draftId: created._id,
        studioUrl: `https://ecm-dev.sanity.studio/desk/post;${created._id}`,
      },
      { headers }
    );
  } catch (e) {
    // Any unhandled throw from Sanity clients (auth failure, invalid schema,
    // network) — return with CORS headers so the browser toast shows the
    // actual message instead of reporting a fake CORS block.
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: `Internal error: ${msg}` },
      { status: 500, headers }
    );
  }
}

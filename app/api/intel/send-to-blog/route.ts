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
  useCdn: false, // sanity-economy: allow-no-cdn write client
  token: process.env.SANITY_INTEL_API_READ_TOKEN,
  perspective: "published",
});

const mainWriteClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2026-04-01",
  useCdn: false, // sanity-economy: allow-no-cdn write client
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
  visualConcept: string | null;
  topics: { title: string; slug: string }[];
  vendors: { name: string }[];
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
  visualConcept,
  "topics": topics[]->{ "title": title, "slug": slug.current },
  "vendors": vendors[]->{ "name": name },
  "sourceTitle": source->title
}`;

// Emergency fallback SVG cover — used only if gpt-image-1 generation
// fails or times out. Every draft otherwise gets a unique per-article
// illustration generated below. To swap the fallback: edit
// assets/blog-cover-fallback.svg in the ecm-dev-intel-studio repo, re-run
// `npm run set-blog-fallback` (idempotent), and paste the new ID here.
const FALLBACK_COVER_ASSET_ID =
  "image-28546d1ac2630d56f59271c5be27e8c5673ac4d1-1536x1024-svg";

// ECM.DEV house-style prompt template. The two brand greens are fixed
// (extracted from ecm.dev's --ecm-green / --ecm-lime CSS vars). The
// background color is now picked per-article from BACKGROUND_TINTS so
// consecutive covers on the blog listing don't visually blur together.
const STYLE_TEMPLATE = `
Minimalist diagrammatic cover illustration in flat vector style.
Extremely sparse — 3-5 elements maximum with generous whitespace and
empty margins around the composition.

Line-art palette: ONLY two colors — bright neon lime green (#aaf870)
for accents (dots, connection lines, key strokes) and a deep forest
green (#316148) for structural lines (lanes, rectangle outlines,
arrow tails). No other colors in the line art. No gradients, no
shadows, no depth effects.

No text, no labels, no logos, no photorealism. Abstract technical
infographic feel — like an engineering RFC diagram or a whitepaper
figure, not decorative illustration.
`.trim();

// Compositional grammars. Picked in cyclic order per send (index mod
// length), where the index is the count of existing intel-derived posts
// in the main dataset — so consecutive sends land on consecutive frames
// and the blog listing never shows two identical grammars back to back.
// Add new grammars freely; the modulo just widens the cycle.
const COMPOSITION_FRAMES: { name: string; guidance: string }[] = [
  {
    name: "network-mesh",
    guidance:
      "Composition: a network of 4-6 small circular nodes connected by straight lines forming a mesh or graph. Nodes sit at asymmetric positions across the canvas. One or two connection lines use the lime accent; the rest are forest-green. No central focal point — the whole graph is the subject.",
  },
  {
    name: "isometric-stack",
    guidance:
      "Composition: 3-4 rectangular slabs stacked as isometric layers (viewed from ~30° above), with thin arrows connecting adjacent layers. Slabs are outlined in forest green, transparent inside. One arrow or one small marker uses the lime accent. Centered composition with the stack occupying the middle third.",
  },
  {
    name: "hero-motif",
    guidance:
      "Composition: one large central iconic object (occupying ~50% of the canvas) with 2-3 small satellite elements orbiting it at the edges. The central object is drawn in forest-green outline; one satellite uses the lime accent. Strong asymmetry — this is a single-subject illustration, not a diagram.",
  },
  {
    name: "flow-lane",
    guidance:
      "Composition: horizontal left-to-right flow of 3-4 shapes (rectangles, circles, hexagons) connected by arrows, with one branching or looping arrow returning backward. Whole flow occupies the horizontal middle band; top and bottom margins are empty. Arrows are forest-green; the branching arrow and one node use the lime accent.",
  },
];

// Background tints. Kept close enough in value that any two consecutive
// posts on the blog listing still look like siblings, but distinguishable
// enough that a scan of six thumbnails doesn't read as "same picture".
// Ordering matters: warm → mint → sage → bone → cool cycles through the
// warm-cool spectrum so adjacent picks are always visually distinct.
const BACKGROUND_TINTS: { name: string; hex: string }[] = [
  { name: "cream off-white", hex: "#f5f0e6" },
  { name: "pale mint", hex: "#eaf1e8" },
  { name: "pale sage grey", hex: "#eef0ea" },
  { name: "pale bone", hex: "#f2ebd9" },
  { name: "cool paper", hex: "#eef1f2" },
];

function pickForIndex(index: number): {
  frame: (typeof COMPOSITION_FRAMES)[number];
  bg: (typeof BACKGROUND_TINTS)[number];
} {
  // 4 frames × 5 tints = 20-post cycle before the exact pair repeats.
  return {
    frame: COMPOSITION_FRAMES[index % COMPOSITION_FRAMES.length],
    bg: BACKGROUND_TINTS[index % BACKGROUND_TINTS.length],
  };
}

// Count of intel-derived posts (drafts + published) already in the main
// dataset. Used as the cycle index so the Nth send gets the Nth frame/tint.
// Falls back to 0 on any error — worst case we don't advance the cycle
// for one article; still gives distinct visuals via the STYLE_TEMPLATE.
async function nextPickIndex(
  client: ReturnType<typeof createClient>
): Promise<number> {
  try {
    const n = (await client.fetch<number>(
      `count(*[_type=="post" && (string::startsWith(_id, "post-intel-") || string::startsWith(_id, "drafts.post-intel-"))])`
    )) as number;
    return typeof n === "number" && n >= 0 ? n : 0;
  } catch (e) {
    console.warn(
      `[send-to-blog] pick-index count failed, defaulting to 0: ${e instanceof Error ? e.message : String(e)}`
    );
    return 0;
  }
}

// Hard timeout for gpt-image-1. Requires the Netlify Pro tier (26s
// function timeout); the AbortSignal keeps us safely under it while
// leaving budget for the Sanity read + write around this call. On
// timeout or any generation error the endpoint falls back to the
// emergency SVG so send-to-blog never breaks on OpenAI hiccups.
const IMAGE_GEN_TIMEOUT_MS = 24_000;

/**
 * Generate a per-article cover via gpt-image-1 and upload it to Sanity.
 * Returns the new asset ID on success, or null on any failure — caller
 * uses the SVG fallback when this returns null.
 */
async function generateAndUploadCover(
  concept: string,
  filename: string,
  index: number
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("[send-to-blog] OPENAI_API_KEY not set — using SVG fallback");
    return null;
  }

  const { frame, bg } = pickForIndex(index);
  const prompt = `${STYLE_TEMPLATE}

Background: solid ${bg.name} (${bg.hex}) filling the entire canvas edge-to-edge. Keep the two-green line-art palette exactly as specified above.

${frame.guidance}

Concept for this specific illustration:
${concept}`;
  console.log(
    `[send-to-blog] gpt-image-1 pick index=${index} frame=${frame.name} bg=${bg.name}`
  );
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), IMAGE_GEN_TIMEOUT_MS);
  try {
    const openaiResp = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt,
          n: 1,
          size: "1536x1024",
          // Was "medium" briefly — but by 2026-07-21 every request was
          // hitting the 24s abort and falling back to the SVG (see the
          // "cover generation failed: This operation was aborted" line
          // in Netlify function logs). "low" reliably completes in
          // ~8-12s inside the 24s budget. We lose some line detail vs.
          // medium but keep frame+tint cycling, so covers still read as
          // distinct on the blog listing. Revisit if OpenAI's medium
          // latency drops back under ~20s.
          quality: "low",
          output_format: "png",
        }),
        signal: controller.signal,
      }
    );
    if (!openaiResp.ok) {
      const errBody = await openaiResp.text().catch(() => "");
      console.error(
        `[send-to-blog] gpt-image-1 ${openaiResp.status}: ${errBody.slice(0, 300)}`
      );
      return null;
    }
    const openaiData = (await openaiResp.json()) as {
      data: Array<{ b64_json?: string; url?: string }>;
    };
    const item = openaiData.data[0];
    if (!item) {
      console.error("[send-to-blog] gpt-image-1 returned no image");
      return null;
    }
    let buffer: Buffer;
    if (item.b64_json) {
      buffer = Buffer.from(item.b64_json, "base64");
    } else if (item.url) {
      const dlResp = await fetch(item.url, { signal: controller.signal });
      if (!dlResp.ok) {
        console.error(
          `[send-to-blog] failed to download generated image (${dlResp.status})`
        );
        return null;
      }
      buffer = Buffer.from(await dlResp.arrayBuffer());
    } else {
      console.error(
        "[send-to-blog] gpt-image-1 returned neither b64_json nor url"
      );
      return null;
    }
    const uploaded = await mainWriteClient.assets.upload("image", buffer, {
      filename,
      contentType: "image/png",
    });
    return uploaded._id;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[send-to-blog] cover generation failed: ${msg}`);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

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

    // Per-article cover generation: prefer the enricher's visualConcept
    // (concrete objects meant for image gen), fall back to title +
    // truncated summary if it's empty. Emergency SVG fallback if
    // gpt-image-1 fails or times out.
    const conceptRaw = (article.visualConcept ?? "").trim();
    const pickIndex = await nextPickIndex(mainWriteClient);
    const cover = await generateAndUploadCover(
      conceptRaw ||
        `${article.title}. ${(article.summary ?? "").slice(0, 200)}`,
      `intel-cover-${slug.slice(0, 32)}.png`,
      pickIndex
    );
    const coverAssetRef = cover ?? FALLBACK_COVER_ASSET_ID;

    const doc = {
      _id: draftId,
      _type: "post",
      title: article.title,
      slug: { _type: "slug", current: slug },
      publishedAt: new Date().toISOString(),
      excerpt: article.summary ?? "",
      visualConcept: article.visualConcept ?? "",
      // Two-field tag storage: canonical topics (12-item enum) and
      // platform / product / vendor names (free-form). Frontend
      // queries stitch them back into a single `tags` list for display
      // via a GROQ projection in lib/queries.ts (POST_TAGS).
      // NOTE: `article.vendors` on the RIGHT is intelArticle.vendors[]->
      // references from the ecm-dev-intel dataset, unrelated to the
      // post.platforms field being written on the LEFT.
      topics: article.topics.map((t) => t.title),
      platforms: (article.vendors ?? []).map((v) => v.name),
      pillars: pillarsFor(article.topics),
      body: buildBody(article),
      // Per-article cover in the house style. Editor overrides by
      // uploading a custom mainImage in Studio; their upload wins.
      mainImage: {
        _type: "image",
        asset: { _type: "reference", _ref: coverAssetRef },
      },
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

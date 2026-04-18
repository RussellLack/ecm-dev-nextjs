import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { randomUUID } from "node:crypto";
import { sanityWriteClient } from "@/lib/sanity.write";

/**
 * Content Intelligence Engine — processing layer.
 *
 * Given an `intelArticle` in status="raw", call Claude to produce:
 *   - summary
 *   - key_insight
 *   - topics[]
 *   - vendors[]
 *   - content_angle
 *   - linkedin_post
 *
 * Then patch those fields onto the article, resolve topic/vendor
 * references, and flip status to "enriched" for human review.
 *
 * This is idempotent: running it twice just overwrites the enriched
 * fields. The `processingLog` array accumulates timestamps so you can
 * see every run.
 */

const anthropic = new Anthropic();

const MODEL = "claude-sonnet-4-6";
const MAX_BODY_CHARS = 8000;

const SYSTEM = `You are ECM.DEV's content intelligence analyst.
You read industry articles about Enterprise Content Management, CMS,
ContentOps, DAM, PIM, DXP, and AI-for-content. You produce concise,
neutral, decision-useful output for an audience of content and marketing
operations leaders. Never invent facts not present in the source article.`;

const ALLOWED_TOPICS = [
  "ContentOps",
  "AI",
  "CMS",
  "Governance",
  "DAM",
  "PIM",
  "DXP",
  "Workflow",
  "Personalization",
  "Analytics",
  "Search",
  "Compliance",
];

function userPrompt(title: string, body: string, url: string): string {
  return `Analyse the article below and respond with STRICT JSON (no prose outside the JSON object, no markdown fences) matching this schema:

{
  "summary": string,          // 2-3 sentences, neutral, no editorialising
  "key_insight": string,      // 1 sentence: the "so what" for an ECM buyer
  "topics": string[],         // choose only from: ${ALLOWED_TOPICS.join(", ")}
  "vendors": string[],        // company or product names explicitly mentioned
  "content_angle": string,    // 1-2 sentences: ECM.DEV's point of view
  "linkedin_post": string     // first-person draft, <=1300 chars, ends with a question
}

TITLE: ${title}
URL: ${url}
BODY:
${body.slice(0, MAX_BODY_CHARS)}`;
}

type EnrichmentPayload = {
  summary: string;
  key_insight: string;
  topics: string[];
  vendors: string[];
  content_angle: string;
  linkedin_post: string;
};

type IntelArticleDoc = {
  _id: string;
  _type: "intelArticle";
  title: string;
  url: string;
  rawContent?: string;
  source?: { _ref?: string };
};

type IntelSourceSnapshot = { autoPublish?: boolean } | null;

function extractJson(text: string): EnrichmentPayload {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("No JSON object found in model response");
  }
  return JSON.parse(text.slice(start, end + 1));
}

export async function enrichArticle(docId: string): Promise<void> {
  const doc = (await sanityWriteClient.getDocument(docId)) as
    | IntelArticleDoc
    | null;
  if (!doc) throw new Error(`Article ${docId} not found`);
  if (doc._type !== "intelArticle") {
    throw new Error(`Document ${docId} is not an intelArticle`);
  }

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: userPrompt(doc.title, doc.rawContent ?? "", doc.url),
      },
    ],
  });

  const text = message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  let parsed: EnrichmentPayload;
  try {
    parsed = extractJson(text);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await sanityWriteClient
      .patch(docId)
      .setIfMissing({ processingLog: [] })
      .append("processingLog", [
        `${new Date().toISOString()} parse_error: ${msg}`,
      ])
      .commit();
    throw e;
  }

  // Clamp topics to the allowed list; drop anything else.
  const topics = (parsed.topics ?? []).filter((t) =>
    ALLOWED_TOPICS.includes(t)
  );
  const topicRefs = await resolveTopics(topics);
  const vendorRefs = await resolveVendors(parsed.vendors ?? []);

  // If the source is whitelisted for auto-publish, skip the human review
  // queue and go straight to status="published".
  const source = doc.source?._ref
    ? ((await sanityWriteClient.fetch(
        `*[_id == $id][0]{ autoPublish }`,
        { id: doc.source._ref }
      )) as IntelSourceSnapshot)
    : null;
  const nextStatus = source?.autoPublish ? "published" : "enriched";

  await sanityWriteClient
    .patch(docId)
    .setIfMissing({ processingLog: [] })
    .set({
      summary: parsed.summary,
      keyInsight: parsed.key_insight,
      contentAngle: parsed.content_angle,
      linkedinPost: parsed.linkedin_post,
      topics: topicRefs,
      vendors: vendorRefs,
      status: nextStatus,
    })
    .append("processingLog", [
      `${new Date().toISOString()} enriched via ${MODEL}${
        nextStatus === "published" ? " (auto-published)" : ""
      }`,
    ])
    .commit();
}

async function resolveTopics(
  names: string[]
): Promise<{ _type: "reference"; _ref: string; _key: string }[]> {
  if (!names.length) return [];
  const existing = await sanityWriteClient.fetch<
    { _id: string; title: string }[]
  >(`*[_type == "intelTopic" && title in $names]{ _id, title }`, {
    names,
  });
  // Only reference topics that already exist. Unknowns are dropped — the
  // allowed-topic clamp upstream makes this path hard to hit.
  return existing.map((t) => ({
    _type: "reference",
    _ref: t._id,
    _key: randomUUID(),
  }));
}

async function resolveVendors(
  names: string[]
): Promise<{ _type: "reference"; _ref: string; _key: string }[]> {
  const cleaned = (names ?? [])
    .map((n) => n.trim())
    .filter((n) => n.length > 0 && n.length < 120);
  if (!cleaned.length) return [];

  const lowered = cleaned.map((n) => n.toLowerCase());
  const existing = await sanityWriteClient.fetch<
    { _id: string; name: string }[]
  >(
    `*[_type == "intelVendor" && lower(name) in $names]{ _id, name }`,
    { names: lowered }
  );
  const knownByLower = new Map(
    existing.map((v) => [v.name.toLowerCase(), v._id])
  );

  const refs: { _type: "reference"; _ref: string; _key: string }[] = [];
  const seen = new Set<string>();

  for (const name of cleaned) {
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    let id = knownByLower.get(key);
    if (!id) {
      // Create as a DRAFT so editors review/merge new vendors in Studio.
      const draftId = `drafts.intelVendor-${randomUUID()}`;
      const created = await sanityWriteClient.create({
        _id: draftId,
        _type: "intelVendor",
        name,
        slug: {
          _type: "slug",
          current: key.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        },
      });
      // Reference the *published* id (strip drafts. prefix) so that when the
      // editor publishes the vendor, this article's reference resolves.
      id = created._id.replace(/^drafts\./, "");
    }
    refs.push({ _type: "reference", _ref: id, _key: randomUUID() });
  }

  return refs;
}

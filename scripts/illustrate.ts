/**
 * Generate an ECM.DEV-style cover illustration via OpenAI gpt-image-1.
 *
 * The house style is very specific and easy to drift from — an extremely
 * sparse diagrammatic vector illustration, only bright neon lime green
 * and darker olive-green on an off-white background, 3-5 elements
 * maximum with generous whitespace, no text or logos. This script bakes
 * that style template in so you only have to type the metaphorical
 * concept.
 *
 * Usage:
 *   npm run illustrate -- "two vertical lanes branching downward with connection dots"
 *   npm run illustrate -- "concept" --attach drafts.post-intel-...
 *   npm run illustrate -- "concept" --square           # 1024x1024 (default is 3:2 landscape 1536x1024)
 *   npm run illustrate -- "concept" --quality medium   # cheaper than default high
 *
 * Env prereqs (all in the ecm-dev-intel LastPass note; `npm run env:pull`):
 *   OPENAI_API_KEY               (mandatory)
 *   SANITY_MAIN_WRITE_TOKEN      (only needed with --attach)
 *
 * gpt-image-1 quality tiers (approximate per-image cost):
 *   low     ~$0.011
 *   medium  ~$0.042   (--quality medium)
 *   high    ~$0.167   (default)
 *
 * Output PNG is saved to ./scratch/illustrations/ with a timestamped
 * filename. With --attach the image is also uploaded to the main
 * ecm-dev Sanity project as an asset and wired onto the draft's
 * mainImage field.
 */

import "dotenv/config";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@sanity/client";

const MAIN_PROJECT_ID = "0dep7ult";
const MAIN_DATASET = "production";

// The house style, baked in. Colors extracted from ecm.dev's CSS
// custom properties (--ecm-green, --ecm-lime, --ecm-gray-light) so
// generated covers sit natively alongside the site's other imagery.
// Concept text is appended AFTER this so the model treats the style
// as the setting and the concept as the subject.
const STYLE_TEMPLATE = `
Minimalist diagrammatic cover illustration in flat vector style.
Extremely sparse — 3-5 elements maximum with generous whitespace and
empty margins around the composition.

Colors: ONLY two colors — bright neon lime green (#aaf870) for accents
(dots, connection lines, key strokes) and a deep forest green
(#316148) for structural lines (lanes, rectangle outlines, arrow
tails). Everything else on a clean off-white background (#f5f5f5).
Absolutely no other colors. No gradients, no shadows, no depth effects.

No text, no labels, no logos, no photorealism. Abstract technical
infographic feel — like an engineering RFC diagram or a whitepaper
figure, not decorative illustration.
`.trim();

type ImageSize = "1024x1024" | "1536x1024" | "1024x1536";
type ImageQuality = "low" | "medium" | "high";

type CliOptions = {
  concept: string;
  size: ImageSize;
  quality: ImageQuality;
  attachToDocId: string | null;
};

function parseArgs(argv: string[]): CliOptions {
  const rest: string[] = [];
  // 3:2 landscape is the closest supported ratio to a typical blog
  // cover — gpt-image-1 doesn't offer 16:9.
  let size: ImageSize = "1536x1024";
  let quality: ImageQuality = "high";
  let attachToDocId: string | null = null;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--square") size = "1024x1024";
    else if (a === "--wide") size = "1536x1024";
    else if (a === "--portrait") size = "1024x1536";
    else if (a === "--quality") {
      const v = argv[++i];
      if (v !== "low" && v !== "medium" && v !== "high") {
        console.error(`--quality must be "low", "medium", or "high", got "${v}"`);
        process.exit(2);
      }
      quality = v;
    } else if (a === "--attach") {
      attachToDocId = argv[++i] ?? null;
      if (!attachToDocId) {
        console.error("--attach requires a document ID");
        process.exit(2);
      }
    } else {
      rest.push(a);
    }
  }

  const concept = rest.join(" ").trim();
  if (!concept) {
    console.error(
      `Usage: npm run illustrate -- "your concept" [--square|--wide|--portrait] [--quality low|medium|high] [--attach <docId>]`
    );
    process.exit(2);
  }

  return { concept, size, quality, attachToDocId };
}

async function generateImage(opts: CliOptions): Promise<Buffer> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error(
      "Missing OPENAI_API_KEY. Add it to the ecm-dev-intel LastPass note and run `npm run env:pull`."
    );
    process.exit(1);
  }

  const prompt = `${STYLE_TEMPLATE}\n\nConcept for this specific illustration:\n${opts.concept}`;
  console.log(`Requesting gpt-image-1: ${opts.size} ${opts.quality}`);
  console.log(`Concept: ${opts.concept}`);

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      n: 1,
      size: opts.size,
      quality: opts.quality,
      output_format: "png",
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "(no body)");
    throw new Error(`OpenAI API ${response.status}: ${body}`);
  }

  const data = (await response.json()) as {
    data: Array<{ url?: string; b64_json?: string; revised_prompt?: string }>;
  };
  const item = data.data[0];
  if (!item) throw new Error("OpenAI returned no image");
  if (item.revised_prompt) {
    console.log(`DALL-E revised prompt to:\n  ${item.revised_prompt}`);
  }

  // OpenAI's newer images endpoint returns a signed URL by default.
  // It also (undocumented but observed) still accepts b64_json for
  // some model tiers, so handle both shapes.
  if (item.b64_json) {
    return Buffer.from(item.b64_json, "base64");
  }
  if (!item.url) {
    throw new Error("OpenAI response had neither b64_json nor url");
  }
  console.log("Downloading generated image…");
  const dl = await fetch(item.url);
  if (!dl.ok) {
    throw new Error(`Failed to fetch generated image (${dl.status})`);
  }
  return Buffer.from(new Uint8Array(await dl.arrayBuffer()));
}

async function attachToSanity(image: Buffer, docId: string): Promise<string> {
  const token = process.env.SANITY_MAIN_WRITE_TOKEN;
  if (!token) {
    throw new Error(
      "Missing SANITY_MAIN_WRITE_TOKEN. Add it to the ecm-dev-intel LastPass note and run `npm run env:pull`."
    );
  }

  const client = createClient({
    projectId: MAIN_PROJECT_ID,
    dataset: MAIN_DATASET,
    apiVersion: "2024-01-01",
    token,
    useCdn: false,
  });

  console.log("Uploading asset to Sanity…");
  const asset = await client.assets.upload("image", image, {
    filename: `illustration-${Date.now()}.png`,
  });

  const draftId = docId.startsWith("drafts.") ? docId : `drafts.${docId}`;
  console.log(`Wiring asset ${asset._id} onto ${draftId} mainImage…`);
  await client
    .patch(draftId)
    .setIfMissing({ mainImage: {} })
    .set({
      mainImage: { _type: "image", asset: { _type: "reference", _ref: asset._id } },
    })
    .commit();

  return asset._id;
}

async function main(): Promise<void> {
  const opts = parseArgs(process.argv.slice(2));

  const image = await generateImage(opts);

  const outDir = join(process.cwd(), "scratch", "illustrations");
  mkdirSync(outDir, { recursive: true });
  const slug = opts.concept
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  const filename = `${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}-${slug}.png`;
  const outPath = join(outDir, filename);
  writeFileSync(outPath, image);
  console.log(`\nSaved: ${outPath}`);

  if (opts.attachToDocId) {
    const assetId = await attachToSanity(image, opts.attachToDocId);
    console.log(`\n✓ Attached to ${opts.attachToDocId} as asset ${assetId}.`);
    console.log(`  Open the draft in ecm-dev Studio to preview — publish when happy.`);
  } else {
    console.log(`\nTo attach to a Sanity post:`);
    console.log(`  npm run illustrate -- "${opts.concept}" --attach <post-doc-id>`);
    console.log(`Or drag the PNG into the mainImage field in Studio.`);
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
});

/**
 * One-off seed script for the Content Intelligence Engine taxonomy.
 *
 * Usage (from the repo root):
 *   SANITY_API_WRITE_TOKEN=... \
 *   NEXT_PUBLIC_SANITY_PROJECT_ID=... \
 *   NEXT_PUBLIC_SANITY_DATASET=production \
 *   npx tsx scripts/seed-intel-topics.ts
 *
 * Idempotent: if a topic with the given slug already exists it is left
 * alone.
 */

import { createClient } from "@sanity/client";

const TOPICS = [
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

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2026-04-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function main() {
  for (const title of TOPICS) {
    const slug = toSlug(title);
    const id = `intelTopic-${slug}`;
    const existing = await client.fetch(
      `*[_type == "intelTopic" && slug.current == $slug][0]._id`,
      { slug }
    );
    if (existing) {
      console.log(`✓ ${title} (exists)`);
      continue;
    }
    await client.createOrReplace({
      _id: id,
      _type: "intelTopic",
      title,
      slug: { _type: "slug", current: slug },
    });
    console.log(`+ ${title}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

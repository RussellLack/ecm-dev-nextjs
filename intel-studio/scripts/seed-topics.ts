/**
 * One-off seed script for the Content Intelligence Engine taxonomy.
 *
 * Run against the ECM-DEV-INTEL Sanity project (separate from the main
 * website project). Usage from the intel-studio directory:
 *
 *   SANITY_STUDIO_INTEL_PROJECT_ID=... \
 *   SANITY_STUDIO_INTEL_DATASET=production \
 *   SANITY_INTEL_API_WRITE_TOKEN=... \
 *   npx tsx scripts/seed-topics.ts
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
  projectId: process.env.SANITY_STUDIO_INTEL_PROJECT_ID || "",
  dataset: process.env.SANITY_STUDIO_INTEL_DATASET || "production",
  apiVersion: "2026-04-01",
  token: process.env.SANITY_INTEL_API_WRITE_TOKEN,
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

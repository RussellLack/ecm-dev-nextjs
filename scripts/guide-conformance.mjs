#!/usr/bin/env node
// Guide conformance sweep.
//
// GROQ-queries every `guide` document and reports per-doc issues split into
// errors (missing slug or title — these break the site) and warnings (missing
// seo.ogImage and mainImage — these degrade social sharing). Exits non-zero
// when any errors are found; warnings alone exit 0.
//
// Requires NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, and
// SANITY_API_READ_TOKEN to be present in the environment (e.g. via
// `.env.local`). Run with: `node scripts/guide-conformance.mjs`.

import { createClient } from "@sanity/client";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// Tiny .env.local loader so this script works without next dev / next build.
const envPath = join(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const [, k, raw] = m;
    if (process.env[k]) continue;
    process.env[k] = raw.replace(/^["']|["']$/g, "");
  }
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_READ_TOKEN;

if (!projectId) {
  console.error(
    "✗ NEXT_PUBLIC_SANITY_PROJECT_ID is not set. Add it to .env.local."
  );
  process.exit(2);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2026-04-01",
  useCdn: false,
  token,
  perspective: "published",
});

const guides = await client.fetch(
  `*[_type == "guide"] | order(seriesNumber asc, guideNumber asc){
    _id,
    title,
    "slug": slug.current,
    series,
    guideNumber,
    "hasMainImage": defined(mainImage.asset),
    "hasOgImage": defined(seo.ogImage.asset)
  }`
);

let errors = 0;
let warnings = 0;
const issues = [];

for (const g of guides) {
  const id = g.slug || g._id;
  if (!g.title) {
    errors++;
    issues.push(`✗ ${id}: missing title`);
  }
  if (!g.slug) {
    errors++;
    issues.push(`✗ ${g._id}: missing slug`);
  }
  if (!g.hasOgImage) {
    warnings++;
    issues.push(`⚠ ${id}: missing seo.ogImage`);
  }
  if (!g.hasMainImage) {
    warnings++;
    issues.push(`⚠ ${id}: missing mainImage`);
  }
}

for (const line of issues) console.log(line);

console.log("");
console.log(`Guides scanned: ${guides.length}`);
console.log(`Errors:   ${errors}`);
console.log(`Warnings: ${warnings}`);

process.exit(errors > 0 ? 1 : 0);

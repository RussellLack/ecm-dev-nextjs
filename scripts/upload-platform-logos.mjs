/**
 * Fetch monochrome platform logos from Simple Icons and upload them to
 * Sanity, patching each `drafts.platform-<slug>` doc to reference the
 * uploaded asset.
 *
 * Usage:
 *   node scripts/upload-platform-logos.mjs            # apply
 *   node scripts/upload-platform-logos.mjs --dry-run  # preview, no writes
 *   node scripts/upload-platform-logos.mjs --force    # overwrite an existing logo
 *
 * Coverage (verified against simple-icons/master at the time of writing):
 *   ✓ sitecore, sanity, kentico, contentful  → fetched + uploaded
 *   ✗ optimizely, ibexa, hyland              → not in Simple Icons; you
 *                                              upload these manually in
 *                                              Studio (see notes below)
 *
 * Visual treatment:
 *   Simple Icons SVGs have no `fill` attribute on the path, so they render
 *   black by default. Black logos work on the /platforms index card
 *   (bg-gray-50) and on the detail-page hero once that container is
 *   solid `bg-white` rather than `bg-white/10` — the matching CSS tweak
 *   ships in the same PR as this script.
 *
 * Idempotent:
 *   By default this script skips a platform whose draft already has a
 *   logo set, so re-runs don't churn assets. Pass `--force` to overwrite.
 *
 * Loads SANITY_WRITE_TOKEN, NEXT_PUBLIC_SANITY_PROJECT_ID and
 * NEXT_PUBLIC_SANITY_DATASET from .env.local the same way
 * scripts/seed-assessment.mjs and scripts/apply-pillars.mjs do.
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const dryRun = process.argv.includes("--dry-run");
const force = process.argv.includes("--force");

// ─── .env.local ──────────────────────────────────────────────────────
try {
  const envPath = resolve(__dirname, "../.env.local");
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
} catch {
  // OK — env vars may already be in shell
}

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "0dep7ult";
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const TOKEN = process.env.SANITY_WRITE_TOKEN;

if (!TOKEN) {
  console.error(
    "SANITY_WRITE_TOKEN is not set. Add it to .env.local or export in the shell."
  );
  process.exit(1);
}

const API_VERSION = "2026-04-01";
const ASSETS_URL = (filename) =>
  `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/assets/images/${DATASET}?filename=${encodeURIComponent(filename)}`;
const MUTATE_URL = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/mutate/${DATASET}`;
const QUERY_URL = (groq) =>
  `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}?query=${encodeURIComponent(groq)}`;

const SIMPLE_ICONS_BASE =
  "https://raw.githubusercontent.com/simple-icons/simple-icons/master/icons";

const config = JSON.parse(
  readFileSync(resolve(__dirname, "pillars.json"), "utf-8")
);

console.log(
  `Target: ${PROJECT_ID}/${DATASET}` +
    (dryRun ? "  [DRY RUN — no writes]" : "") +
    (force ? "  [FORCE overwrite]" : "")
);

let fetched = 0;
let uploaded = 0;
let patched = 0;
let skipped = 0;
let missing = 0;
let errors = 0;
const missingList = [];

for (const platform of config.platforms) {
  const slug = platform.slug;
  const draftId = `drafts.platform-${slug}`;
  const iconUrl = `${SIMPLE_ICONS_BASE}/${slug}.svg`;

  // Probe Simple Icons availability
  let svgText;
  try {
    const res = await fetch(iconUrl);
    if (res.status === 404) {
      console.log(`✗ ${slug.padEnd(12)}  not in Simple Icons — upload manually in Studio`);
      missing++;
      missingList.push(slug);
      continue;
    }
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} fetching ${iconUrl}`);
    }
    svgText = await res.text();
    fetched++;
  } catch (e) {
    console.error(`✗ ${slug.padEnd(12)}  fetch failed: ${e.message}`);
    errors++;
    continue;
  }

  // Idempotency: skip if logo already set unless --force
  if (!force) {
    try {
      const groq = `*[_id == "${draftId}"][0]{ logo }`;
      const res = await fetch(QUERY_URL(groq), {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      const body = await res.json();
      if (body?.result?.logo?.asset?._ref) {
        console.log(`- ${slug.padEnd(12)}  already has logo, skipping (use --force to overwrite)`);
        skipped++;
        continue;
      }
    } catch {
      // ignore probe errors and proceed
    }
  }

  if (dryRun) {
    console.log(`[dry] ${slug.padEnd(12)}  would upload ${svgText.length}-byte SVG and patch ${draftId}.logo`);
    continue;
  }

  // Upload SVG as Sanity image asset
  let assetId;
  try {
    const filename = `${slug}.svg`;
    const res = await fetch(ASSETS_URL(filename), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "image/svg+xml",
      },
      body: svgText,
    });
    const body = await res.json();
    if (!res.ok || !body?.document?._id) {
      throw new Error(
        body?.error?.description || `HTTP ${res.status} on asset upload`
      );
    }
    assetId = body.document._id;
    uploaded++;
  } catch (e) {
    console.error(`✗ ${slug.padEnd(12)}  upload failed: ${e.message}`);
    errors++;
    continue;
  }

  // Patch the platform draft to reference the new asset
  try {
    const patch = {
      id: draftId,
      set: {
        logo: {
          _type: "image",
          asset: { _type: "reference", _ref: assetId },
        },
      },
    };
    const res = await fetch(MUTATE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mutations: [{ patch }] }),
    });
    const body = await res.json();
    if (!res.ok) {
      throw new Error(
        body?.error?.description || `HTTP ${res.status} on patch`
      );
    }
    console.log(`✓ ${slug.padEnd(12)}  uploaded + patched ${draftId}`);
    patched++;
  } catch (e) {
    console.error(`✗ ${slug.padEnd(12)}  patch failed: ${e.message}`);
    errors++;
  }
}

console.log(
  `\nSummary` +
    `\n  fetched from Simple Icons:  ${fetched}` +
    `\n  uploaded to Sanity:         ${uploaded}` +
    `\n  drafts patched:             ${patched}` +
    `\n  skipped (already had logo): ${skipped}` +
    `\n  missing from Simple Icons:  ${missing}` +
    `\n  errors:                     ${errors}`
);

if (missingList.length > 0) {
  console.log(
    `\nManual upload needed for: ${missingList.join(", ")}` +
      `\n  Studio → Platform → <vendor> draft → Logo field → Upload.` +
      `\n  Source SVGs from each vendor's brand/press page; aim for a` +
      `\n  monochrome black-on-transparent treatment to match the others.`
  );
}

if (errors > 0) process.exit(1);

/**
 * Apply approved pillar mappings to existing posts and seed the seven
 * platform docs.
 *
 * Used as a fallback for the Sanity MCP server when its origin is
 * unavailable. Talks to the Sanity HTTP API directly using the
 * project's SANITY_WRITE_TOKEN.
 *
 * Usage:
 *   node scripts/apply-pillars.mjs            # apply
 *   node scripts/apply-pillars.mjs --dry-run  # preview, no writes
 *
 * Loads SANITY_WRITE_TOKEN, NEXT_PUBLIC_SANITY_PROJECT_ID, and
 * NEXT_PUBLIC_SANITY_DATASET from .env.local at the repo root, the
 * same way scripts/seed-assessment.mjs does.
 *
 * Behaviour:
 * - Posts: patches the published doc and any existing draft so pillars
 *   stick regardless of which copy gets published next. Patches go
 *   live immediately (no separate publish step needed).
 * - Platforms: creates DRAFT docs (drafts.platform-<slug>) so the
 *   editor can fill in summary / heroDescription / body / logo before
 *   publishing.
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dryRun = process.argv.includes("--dry-run");

// ─── Load .env.local ──────────────────────────────────────────────────
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
  // .env.local missing is fine if the env vars are already in the shell
}

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "0dep7ult";
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const TOKEN = process.env.SANITY_WRITE_TOKEN;

if (!TOKEN) {
  console.error(
    "SANITY_WRITE_TOKEN is not set. Add it to .env.local or export it in the shell."
  );
  process.exit(1);
}

// Sanity HTTP API: https://<project>.api.sanity.io/v<api>/data/mutate/<dataset>
const API_VERSION = "2026-04-01";
const MUTATE_URL = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/mutate/${DATASET}`;

const config = JSON.parse(
  readFileSync(resolve(__dirname, "pillars.json"), "utf-8")
);

console.log(
  `Target: ${PROJECT_ID}/${DATASET}${dryRun ? "  [DRY RUN — no writes]" : ""}`
);

// ─── Mutate helper ────────────────────────────────────────────────────
async function mutate(mutations) {
  if (dryRun) return { dryRun: true };
  const res = await fetch(MUTATE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ mutations }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(
      body?.error?.description || body?.message || `HTTP ${res.status}`
    );
    err.statusCode = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

// ─── Posts: patch published + draft (if exists) ───────────────────────
let postsPatched = 0;
let postsSkipped = 0;
let postsErrored = 0;

for (const post of config.postPatches) {
  for (const id of [post.id, `drafts.${post.id}`]) {
    if (dryRun) {
      console.log(
        `[dry] patch ${id.padEnd(20)} pillars=${JSON.stringify(post.pillars)}`
      );
      continue;
    }
    try {
      // ifRevisionID is omitted → unconditional. patch.set on a non-existent
      // doc throws 404 from Sanity; we catch and treat as "no draft to patch".
      await mutate([{ patch: { id, set: { pillars: post.pillars } } }]);
      console.log(`✓ patched ${id.padEnd(20)}  ${post.title}`);
      postsPatched++;
    } catch (e) {
      const msg = String(e.message || "").toLowerCase();
      const notFound =
        e.statusCode === 404 ||
        msg.includes("not found") ||
        msg.includes("does not exist");
      if (notFound) {
        // No draft (or no published) for this id — fine
        postsSkipped++;
      } else {
        console.error(`✗ ${id}: ${e.message}`);
        postsErrored++;
      }
    }
  }
}

// ─── Platforms: createIfNotExists each draft ──────────────────────────
let platformsCreated = 0;
let platformsSkipped = 0;
let platformsErrored = 0;

for (const p of config.platforms) {
  const draftId = `drafts.platform-${p.slug}`;
  const doc = {
    _id: draftId,
    _type: "platform",
    name: p.name,
    slug: { _type: "slug", current: p.slug },
    category: p.category,
    pillars: p.pillars,
    tagAliases: p.tagAliases,
    ...(p.intelVendorSlug ? { intelVendorSlug: p.intelVendorSlug } : {}),
    ...(typeof p.order === "number" ? { order: p.order } : {}),
  };

  if (dryRun) {
    console.log(`[dry] createIfNotExists ${draftId}`);
    continue;
  }

  try {
    await mutate([{ createIfNotExists: doc }]);
    console.log(`✓ ensured ${draftId}`);
    platformsCreated++;
  } catch (e) {
    console.error(`✗ ${draftId}: ${e.message}`);
    platformsErrored++;
  }
}

// ─── Summary ──────────────────────────────────────────────────────────
console.log(
  `\nSummary` +
    `\n  posts patched:           ${postsPatched}` +
    `\n  posts skipped (no doc):  ${postsSkipped}` +
    `\n  post errors:             ${postsErrored}` +
    `\n  platforms ensured:       ${platformsCreated}` +
    `\n  platforms skipped:       ${platformsSkipped}` +
    `\n  platform errors:         ${platformsErrored}`
);

const totalErrors = postsErrored + platformsErrored;
if (totalErrors > 0) process.exit(1);

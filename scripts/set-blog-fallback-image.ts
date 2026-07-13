/**
 * One-time seed: upload assets/blog-cover-fallback.svg to the main
 * ecm-dev Sanity project and set it as `mainImage` on every draft
 * post that doesn't already have one.
 *
 * This gives every intel-sourced blog draft a house-style cover
 * illustration without any per-post generation cost. Editors override
 * on individual drafts by uploading a custom image via the mainImage
 * field — the mainImage they set wins.
 *
 * For the fallback to also apply to FUTURE drafts created by the
 * send-to-blog endpoint, add a one-line asset ref to that endpoint
 * — this script prints the exact snippet + asset ID at the end.
 *
 * Idempotent: re-running detects the previously-uploaded asset by
 * filename and reuses it instead of creating a duplicate. Existing
 * posts that already reference this asset are left alone. Existing
 * posts with a custom mainImage are NEVER touched.
 *
 * Run:
 *   npm run set-blog-fallback
 */

import "dotenv/config";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient, type SanityDocument } from "@sanity/client";

const MAIN_PROJECT_ID = "0dep7ult";
const MAIN_DATASET = "production";
const FALLBACK_FILENAME = "blog-cover-fallback.svg";

async function main(): Promise<void> {
  const token = process.env.SANITY_MAIN_WRITE_TOKEN;
  if (!token) {
    console.error(
      "Missing SANITY_MAIN_WRITE_TOKEN. Add it to the ecm-dev-intel LastPass note and run `npm run env:pull`."
    );
    process.exit(1);
  }

  const svgPath = join(process.cwd(), "assets", FALLBACK_FILENAME);
  const svgBuf = readFileSync(svgPath);
  console.log(`Loaded fallback SVG: ${svgPath} (${svgBuf.length} bytes)`);

  const client = createClient({
    projectId: MAIN_PROJECT_ID,
    dataset: MAIN_DATASET,
    apiVersion: "2024-01-01",
    token,
    useCdn: false,
  });

  const force = process.argv.includes("--force");

  // Find any existing upload with the same originalFilename — the
  // asset store deduplicates by content hash internally, but we
  // still want a stable asset ID across re-runs for the send-to-blog
  // integration to reference. Pass --force to skip this and upload
  // fresh (needed when the SVG content itself changed).
  const existing = force
    ? null
    : await client.fetch<{ _id: string; url: string } | null>(
        `*[_type == "sanity.imageAsset" && originalFilename == $filename] | order(_updatedAt desc)[0]{ _id, url }`,
        { filename: FALLBACK_FILENAME }
      );

  let assetId: string;
  let assetUrl: string;
  if (existing) {
    assetId = existing._id;
    assetUrl = existing.url;
    console.log(`Reusing existing asset: ${assetId}`);
  } else {
    console.log(force ? "Force-uploading new asset…" : "Uploading new asset…");
    // Give force uploads a timestamped filename so the previous asset
    // isn't found by the dedup lookup on the NEXT normal run.
    const uploadFilename = force
      ? FALLBACK_FILENAME.replace(
          /\.svg$/,
          `-${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}.svg`
        )
      : FALLBACK_FILENAME;
    const uploaded = await client.assets.upload("image", svgBuf, {
      filename: uploadFilename,
      contentType: "image/svg+xml",
    });
    assetId = uploaded._id;
    assetUrl = uploaded.url;
    console.log(`Uploaded: ${assetId}`);
  }
  console.log(`  URL: ${assetUrl}`);

  // Backfill every post document (draft + published) that has no
  // mainImage. Explicitly skip anything that already has one — never
  // clobber an editor's choice.
  const posts = await client.fetch<
    Pick<SanityDocument, "_id"> & { _id: string }[]
  >(
    `*[_type == "post" && !defined(mainImage)]{ _id }`
  ) as Array<{ _id: string }>;

  console.log(`\nFound ${posts.length} post(s) without mainImage.`);
  let patched = 0;
  const failures: { id: string; error: string }[] = [];
  for (const post of posts) {
    try {
      await client
        .patch(post._id)
        .set({
          mainImage: {
            _type: "image",
            asset: { _type: "reference", _ref: assetId },
          },
        })
        .commit();
      patched++;
    } catch (e) {
      failures.push({
        id: post._id,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  console.log(`  Patched: ${patched}`);
  if (failures.length > 0) {
    console.log(`  Failed:  ${failures.length}`);
    for (const f of failures) console.log(`    ${f.id}: ${f.error}`);
  }

  console.log("");
  console.log("═".repeat(64));
  console.log("For NEW drafts created by the send-to-blog endpoint:");
  console.log("═".repeat(64));
  console.log("");
  console.log(`Edit ecm-dev-nextjs/app/api/intel/send-to-blog/route.ts:`);
  console.log(``);
  console.log(`  const FALLBACK_COVER_ASSET_ID = "${assetId}";`);
  console.log(``);
  console.log(`  // In the draft payload the endpoint builds:`);
  console.log(`  mainImage: {`);
  console.log(`    _type: "image",`);
  console.log(`    asset: { _type: "reference", _ref: FALLBACK_COVER_ASSET_ID },`);
  console.log(`  },`);
  console.log(``);
  console.log(`Once that snippet is deployed, every send-to-blog invocation`);
  console.log(`stamps the fallback on the new draft. Editors can still upload`);
  console.log(`a custom image via the mainImage field to override.`);
  console.log("");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
});

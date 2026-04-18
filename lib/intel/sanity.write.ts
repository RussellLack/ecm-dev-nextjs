import "server-only";
import { createClient } from "@sanity/client";

/**
 * Server-only WRITE client for the ECM-DEV-INTEL Sanity project.
 *
 * Used by the ingester (netlify/functions/intel-ingest.ts) and the
 * processor (lib/intel/process.ts) to create intelArticle drafts and
 * patch them with enriched fields.
 *
 * NEVER import from a client component — the `import "server-only"` guard
 * will fail the build if that happens.
 */
export const sanityIntelWriteClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_INTEL_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_INTEL_DATASET || "production",
  apiVersion: "2026-04-01",
  token: process.env.SANITY_INTEL_API_WRITE_TOKEN,
  useCdn: false,
});

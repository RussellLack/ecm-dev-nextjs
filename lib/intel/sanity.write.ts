import { createClient } from "@sanity/client";

/**
 * WRITE client for the ECM-DEV-INTEL Sanity project.
 *
 * Used by the ingester (netlify/functions/intel-ingest.ts) and the
 * processor (lib/intel/process.ts) to create intelArticle drafts and
 * patch them with enriched fields.
 *
 * This file deliberately does NOT use `import "server-only"` because the
 * ingester runs in a Netlify Lambda (plain Node), not a React Server
 * Component — server-only's runtime check would throw.
 *
 * Safety is maintained by convention: this module must never be imported
 * by a client component. It is currently only imported by:
 *   - lib/intel/ingest.ts  (Netlify function)
 *   - lib/intel/process.ts (Next.js route handler via the webhook receiver)
 * Both paths execute server-side only.
 */
export const sanityIntelWriteClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_INTEL_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_INTEL_DATASET || "production",
  apiVersion: "2026-04-01",
  token: process.env.SANITY_INTEL_API_WRITE_TOKEN,
  useCdn: false,
});

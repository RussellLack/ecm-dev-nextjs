import "server-only";
import { createClient } from "@sanity/client";

/**
 * Server-only Sanity WRITE client.
 *
 * Used exclusively by the Content Intelligence Engine ingester and
 * processor to create/patch `intelArticle` / `intelVendor` documents.
 *
 * NEVER import this file from a client component or a route that a
 * visitor can reach without authentication — the `import "server-only"`
 * guard above will cause a build error if it happens.
 *
 * The token must be a Sanity Editor-scoped token configured as
 * SANITY_API_WRITE_TOKEN in the Netlify site environment. It is distinct
 * from SANITY_API_READ_TOKEN which is used by lib/sanity.server.ts for
 * public GROQ reads.
 */
export const sanityWriteClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2026-04-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

import "server-only";
import { createClient, type QueryParams } from "next-sanity";

/**
 * Server-only Sanity client.
 *
 * All GROQ queries in this codebase go through `sanityFetch` below. The
 * `import "server-only"` at the top will cause a build error if any client
 * component ever tries to import this file, so we can't accidentally ship
 * the read token to the browser.
 *
 * The read token lets us set the Sanity dataset ACL to Private
 * (Project → API → Datasets → Edit → Private) so unauthenticated GROQ
 * requests return 401. When the dataset is public, anyone can introspect
 * the entire schema and dump every document via the Sanity API directly —
 * which is what we're closing off.
 *
 * `useCdn` MUST be `false` when using a token; next-sanity will throw
 * otherwise.
 */
export const serverClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2026-04-01",
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
  perspective: "published",
});

/**
 * Run a GROQ query server-side. Prefer this over touching `serverClient`
 * directly so we have a single choke point if we later want to add caching,
 * logging, or request tagging.
 */
export async function sanityFetch<T = any>(
  query: string,
  params: QueryParams = {},
): Promise<T> {
  return serverClient.fetch<T>(query, params);
}

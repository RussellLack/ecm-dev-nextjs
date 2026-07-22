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
 * The read token lets us keep the Sanity dataset ACL Private
 * (Project, API, Datasets, Edit, Private) so unauthenticated GROQ requests
 * return 401. When the dataset is public, anyone can introspect the entire
 * schema and dump every document via the Sanity API directly, which is what
 * we are closing off.
 *
 * `useCdn: true` serves reads from the CDN endpoint (apicdn.sanity.io), the
 * large end-user request bucket, cached at the edge. This keeps day-to-day
 * traffic and build-time reads off the small, uncached API-request quota,
 * which is what previously exhausted the plan limit. The token is still
 * sent, so the Private dataset ACL is honoured (unauthenticated requests
 * still get 401). @sanity/client 6.x supports a token together with
 * `useCdn: true` and routes to the CDN host. This client is read-only;
 * any writes must use a separate `useCdn: false` client so mutations never
 * touch the CDN.
 */
export const serverClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2026-04-01",
  useCdn: true,
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

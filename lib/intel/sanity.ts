import "server-only";
import { createClient, type QueryParams } from "next-sanity";

/**
 * Server-only READ client for the ECM-DEV-INTEL Sanity project.
 *
 * This is a DIFFERENT Sanity project from the main website. The intel
 * schemas and data live in ecm-dev-intel (managed from the separate
 * intel-studio/ Sanity Studio). The Next.js site queries it for the
 * public /intel page and the /api/intel/{feed,newsletter,ai} routes.
 *
 * Do not confuse with `@/lib/sanity.server` (which points at the main
 * ECM.DEV project and drives every other page on the site).
 */
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_INTEL_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_INTEL_DATASET || "production",
  apiVersion: "2026-04-01",
  useCdn: false,
  token: process.env.SANITY_INTEL_API_READ_TOKEN,
  perspective: "published",
});

export async function sanityIntelFetch<T = unknown>(
  query: string,
  params: QueryParams = {}
): Promise<T> {
  return client.fetch<T>(query, params);
}

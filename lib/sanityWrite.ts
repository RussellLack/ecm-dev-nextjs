import { createClient } from "next-sanity";

/**
 * Write-capable Sanity client for server-side mutations only.
 * Uses SANITY_WRITE_TOKEN which must NEVER be exposed to the browser.
 */
export const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "YOUR_PROJECT_ID",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: false, // mutations need the live API
  token: process.env.SANITY_WRITE_TOKEN,
});

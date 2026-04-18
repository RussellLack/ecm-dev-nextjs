import { defineCliConfig } from "sanity/cli";

/**
 * CLI config for the Intel Sanity studio.
 *
 * Override at invocation time if you're deploying to a different hostname:
 *   SANITY_STUDIO_INTEL_PROJECT_ID=... npx sanity deploy
 *
 * studioHost becomes the subdomain at <host>.sanity.studio.
 */
export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_INTEL_PROJECT_ID || "",
    dataset: process.env.SANITY_STUDIO_INTEL_DATASET || "production",
  },
  studioHost: process.env.SANITY_STUDIO_INTEL_HOST || "ecm-dev-intel",
  deployment: {
    appId: "np6gsmhb2kbd0jr326n5o5ad",
  },
});

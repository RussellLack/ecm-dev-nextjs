import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schemas";
import { structure } from "./structure";
import {
  publishIntelArticleAction,
  rejectIntelArticleAction,
} from "./actions/publishIntelArticle";

/**
 * Standalone Sanity Studio for the Content Intelligence Engine.
 *
 * This is a SEPARATE Sanity project from the main ECM.DEV website
 * (ecm-dev / 0dep7ult). Intel data lives here and never touches the
 * main project. The Next.js website reads from this project via the
 * SANITY_INTEL_* env vars wired into lib/intel/sanity*.ts.
 *
 * Deploy from this directory:
 *   cd intel-studio
 *   npx sanity deploy
 *
 * The studio lives at e.g. ecm-dev-intel.sanity.studio.
 */

export default defineConfig({
  name: "ecm-dev-intel",
  title: "ECM.DEV Intel",
  projectId: process.env.SANITY_STUDIO_INTEL_PROJECT_ID || "",
  dataset: process.env.SANITY_STUDIO_INTEL_DATASET || "production",
  plugins: [structureTool({ structure })],
  schema: { types: schemaTypes },
  document: {
    actions: (prev, context) => {
      if (context.schemaType === "intelArticle") {
        return [...prev, publishIntelArticleAction, rejectIntelArticleAction];
      }
      return prev;
    },
  },
});

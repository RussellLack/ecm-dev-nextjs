import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { dashboardTool } from "@sanity/dashboard";
import { scheduledPublishing } from "@sanity/scheduled-publishing";
import { documentInternationalization } from "@sanity/document-internationalization";
import { assist } from "@sanity/assist";
import { media } from "sanity-plugin-media";
import { taxonomyManager } from "sanity-plugin-taxonomy-manager";
import { schemaTypes } from "./sanity/schemas";
import { structure } from "./sanity/structure";
import {
  publishIntelArticleAction,
  rejectIntelArticleAction,
} from "./sanity/actions/publishIntelArticle";

export default defineConfig({
  name: "ecm-dev",
  title: "ECM.DEV",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "0dep7ult",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  plugins: [
    structureTool({ structure }),
    dashboardTool(),
    scheduledPublishing(),
    documentInternationalization({
      supportedLanguages: [
        { id: "en", title: "English" },
        { id: "fi", title: "Finnish" },
        { id: "sv", title: "Swedish" },
        { id: "nb", title: "Norwegian" },
        { id: "da", title: "Danish" },
      ],
      schemaTypes: ["post", "guide", "assessment"],
    }),
    assist(),
    media(),
    taxonomyManager(),
  ],
  schema: {
    types: schemaTypes,
  },
  document: {
    actions: (prev, context) => {
      if (context.schemaType === "intelArticle") {
        return [...prev, publishIntelArticleAction, rejectIntelArticleAction];
      }
      return prev;
    },
  },
});

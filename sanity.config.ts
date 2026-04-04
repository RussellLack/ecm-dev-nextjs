import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./sanity/schemas";

export default defineConfig({
  name: "ecm-dev",
  title: "ECM.DEV",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "0dep7ult",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  plugins: [structureTool()],
  schema: {
    types: schemaTypes,
  },
});

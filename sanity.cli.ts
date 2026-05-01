import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: "0dep7ult",
    dataset: "production",
  },
  // Canonical studio host. Brand-matched to ecm.dev.
  // Legacy `ecm-assessment.sanity.studio` deployment can be removed via
  // https://www.sanity.io/manage/personal/project/0dep7ult → Studios tab.
  studioHost: "ecm-dev",
  deployment: {
    appId: "tcm2zewrv6hc765ojto1bvlb",
  },
});

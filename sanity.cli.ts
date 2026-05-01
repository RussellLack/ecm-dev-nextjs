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
  // appId removed — the existing kcu99xg51h7woqnvm5t32olp was issued for
  // the ecm-assessment host. The next `sanity deploy` will prompt for a
  // new appId for the ecm-dev host; re-pin it here after that deploy.
});

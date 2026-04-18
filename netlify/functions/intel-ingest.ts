import type { Config } from "@netlify/functions";
import { ingestAllSources } from "../../lib/intel/ingest";

/**
 * Content Intelligence Engine — scheduled ingester.
 *
 * Runs every 30 minutes. Pulls every active `intelSource` feed and
 * creates new `intelArticle` docs in status="raw". The Sanity webhook on
 * `intelArticle` create (configured in the Sanity dashboard) fires the
 * enrichment processor at /api/intel/hook immediately afterwards.
 *
 * Manually invoke locally or in production:
 *   curl -X POST https://<site>.netlify.app/.netlify/functions/intel-ingest
 */

export default async () => {
  const results = await ingestAllSources();
  const totalAdded = results.reduce((n, r) => n + r.added, 0);
  const totalErrors = results.reduce((n, r) => n + r.errors.length, 0);

  return new Response(
    JSON.stringify(
      { ok: true, totalAdded, totalErrors, results },
      null,
      2
    ),
    { headers: { "content-type": "application/json" } }
  );
};

export const config: Config = {
  schedule: "*/30 * * * *",
};

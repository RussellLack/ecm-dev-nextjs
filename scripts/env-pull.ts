/**
 * Pull this project's secrets from the ecm-dev Netlify site into
 * .env.local. Netlify env vars are the single source of truth for
 * local dev + prod — update once in the Netlify UI (or via
 * `netlify env:set`) and every consumer pulls the fresh value.
 *
 * Setup (one-time per machine):
 *   npm install -g netlify-cli
 *   netlify login
 *
 * Run whenever secrets change:
 *   npm run env:pull
 */

import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const NETLIFY_SITE_ID = "f7e70ebb-aad2-4c0f-a0e1-b3b4ef0b6ead"; // ecm.dev

// Which Netlify env vars this repo needs pulled into .env.local. Local
// dev + scripts read these — Netlify runtime reads directly from its
// own env, so this list is for LOCAL use only.
const NEEDED_KEYS = [
  "OPENAI_API_KEY",                 // scripts/illustrate.ts + send-to-blog endpoint
  "SANITY_MAIN_WRITE_TOKEN",        // scripts/set-blog-fallback + send-to-blog + illustrate --attach
  "SANITY_INTEL_API_READ_TOKEN",    // send-to-blog reads intel article
  "NEXT_PUBLIC_SANITY_INTEL_PROJECT_ID",
  "NEXT_PUBLIC_SANITY_INTEL_DATASET",
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
  "NEXT_PUBLIC_SANITY_DATASET",
  "INTEL_TO_BLOG_SECRET",           // send-to-blog auth header
];

const OUT = join(process.cwd(), ".env.local");

function die(msg: string): never {
  console.error(msg);
  process.exit(1);
}

function checkNetlifyCli(): void {
  const r = spawnSync("which", ["netlify"], { stdio: "ignore" });
  if (r.status !== 0) {
    die(
      "netlify CLI not found. Install:\n" +
        "  npm install -g netlify-cli\n" +
        "Then log in (persists across sessions):\n" +
        "  netlify login"
    );
  }
}

type NetlifyEnvEntry = {
  key: string;
  values: Array<{ context: string; value: string }>;
};

function fetchEnv(): Record<string, string> {
  // --context production is required — without it, Netlify CLI returns
  // env var KEYS with empty VALUES. Values set for "all contexts"
  // still appear under production.
  const r = spawnSync(
    "netlify",
    ["env:list", "--json", "--context", "production"],
    {
      stdio: ["ignore", "pipe", "pipe"],
      encoding: "utf8",
      env: { ...process.env, NETLIFY_SITE_ID },
    }
  );
  if (r.status !== 0) {
    const stderr = r.stderr.trim();
    if (/not logged in|Unauthorized/i.test(stderr)) {
      die("Netlify auth expired. Run: netlify login");
    }
    die(`netlify env:list failed:\n${stderr}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(r.stdout);
  } catch {
    die(`Unexpected non-JSON output from netlify env:list:\n${r.stdout.slice(0, 500)}`);
  }

  const out: Record<string, string> = {};
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      let raw: string | undefined;
      if (typeof v === "string") {
        raw = v;
      } else if (v && typeof v === "object" && "values" in v) {
        const entry = v as NetlifyEnvEntry;
        raw =
          entry.values?.find((x) => x.context === "production")?.value ??
          entry.values?.[0]?.value;
      }
      if (typeof raw === "string") {
        // Strip any CR/LF and trim edges — trailing newlines from
        // copy-paste get stored in Netlify verbatim, then break bash
        // `source .env.local` and every downstream env loader.
        out[k] = raw.replace(/[\r\n]+/g, "").trim();
      }
    }
  }
  return out;
}

function main(): void {
  checkNetlifyCli();
  const env = fetchEnv();

  const pairs: [string, string][] = [];
  const missing: string[] = [];

  for (const key of NEEDED_KEYS) {
    const v = env[key];
    if (v) pairs.push([key, v]);
    else missing.push(key);
  }

  if (missing.length) {
    die(
      `Missing keys in Netlify env for site ${NETLIFY_SITE_ID}:\n` +
        missing.map((k) => `  - ${k}`).join("\n") +
        `\n\nAdd them via the Netlify UI or CLI:\n` +
        `  netlify env:set <KEY> "<value>" --force\n` +
        `(after \`export NETLIFY_SITE_ID=${NETLIFY_SITE_ID}\`)`
    );
  }

  const contents = pairs.map(([k, v]) => `${k}=${v}`).join("\n") + "\n";
  writeFileSync(OUT, contents, { mode: 0o600 });

  console.log(`Wrote ${pairs.length} vars to ${OUT} (mode 600):`);
  for (const [k] of pairs) console.log(`  ${k}`);
}

main();

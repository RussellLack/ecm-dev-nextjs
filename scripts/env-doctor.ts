/**
 * Verify this project's secrets are current and not being shadowed by
 * shell exports. See intel-studio/scripts/env-doctor.ts for the same
 * pattern.
 *
 *   1. Warns if any tracked KEY is exported by your shell.
 *   2. Loads .env.local (if present).
 *   3. Curls each provider to verify the token authenticates.
 *
 * Run:
 *   npm run env:doctor
 */

import "dotenv/config";
import { spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const CHECKS: Array<{
  key: string;
  probe: (v: string) => Promise<"ok" | string>;
}> = [
  {
    key: "OPENAI_API_KEY",
    probe: async (v) => {
      const r = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${v}` },
      });
      if (r.status === 401) return "401 invalid key";
      if (!r.ok) return `${r.status}`;
      return "ok";
    },
  },
  {
    key: "SANITY_MAIN_WRITE_TOKEN",
    probe: async (v) => {
      const r = await fetch(
        "https://0dep7ult.api.sanity.io/v2024-01-01/users/me",
        { headers: { Authorization: `Bearer ${v}` } }
      );
      if (r.status === 401) return "401 invalid or wrong-project token";
      if (!r.ok) return `${r.status}`;
      return "ok";
    },
  },
  {
    key: "SANITY_INTEL_API_READ_TOKEN",
    probe: async (v) => {
      const r = await fetch(
        "https://288or5eh.api.sanity.io/v2024-01-01/users/me",
        { headers: { Authorization: `Bearer ${v}` } }
      );
      if (r.status === 401) return "401 invalid or wrong-project token";
      if (!r.ok) return `${r.status}`;
      return "ok";
    },
  },
];

const PRESENCE_ONLY = [
  "NEXT_PUBLIC_SANITY_INTEL_PROJECT_ID",
  "NEXT_PUBLIC_SANITY_INTEL_DATASET",
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
  "NEXT_PUBLIC_SANITY_DATASET",
  "INTEL_TO_BLOG_SECRET",
];

function loadEnvLocal(): Record<string, string> {
  const p = join(process.cwd(), ".env.local");
  if (!existsSync(p)) return {};
  const out: Record<string, string> = {};
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

function shellExports(key: string): boolean {
  const r = spawnSync(
    "zsh",
    ["-ic", `[ -n "\${${key}:-}" ] && echo YES || echo NO`],
    { stdio: ["ignore", "pipe", "pipe"], encoding: "utf8" }
  );
  return r.stdout.trim() === "YES";
}

async function main(): Promise<void> {
  console.log("");
  console.log("── Shell exports (any of these silently override .env.local) ──");
  const localEnv = loadEnvLocal();
  const trackedKeys = [...CHECKS.map((c) => c.key), ...PRESENCE_ONLY];
  const shadowed: string[] = [];
  for (const key of trackedKeys) {
    if (shellExports(key)) {
      console.log(`  ⚠  ${key}  — shell exports it`);
      shadowed.push(key);
    }
  }
  if (shadowed.length === 0) console.log("  ✓  shell clean");

  console.log("");
  console.log("── Token validity (curls each provider) ──");
  for (const { key, probe } of CHECKS) {
    const v = process.env[key] || localEnv[key];
    if (!v) {
      console.log(`  ✗  ${key.padEnd(32)}  missing`);
      continue;
    }
    const result = await probe(v);
    const mark = result === "ok" ? "✓" : "✗";
    console.log(`  ${mark}  ${key.padEnd(32)}  ${result}`);
  }

  console.log("");
  console.log("── Presence only ──");
  for (const key of PRESENCE_ONLY) {
    const v = process.env[key] || localEnv[key];
    const mark = v ? "✓" : "✗";
    console.log(`  ${mark}  ${key.padEnd(40)}  ${v ? "present" : "missing"}`);
  }

  console.log("");
  if (shadowed.length > 0) {
    console.log(
      `Fix: \`unset ${shadowed.join(" ")}\` for this session, then permanent-fix by removing the exports from ~/.zshrc.`
    );
  } else {
    console.log("All secrets look sound.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

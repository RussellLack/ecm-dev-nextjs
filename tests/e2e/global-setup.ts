import fs from "node:fs";
import path from "node:path";
import { getAssessmentTargets } from "./helpers/targets";

/** Where the discovered target list is written for specs to read at collection. */
export const TARGETS_FILE = path.join(process.cwd(), "test-results", "targets.json");

/**
 * Discover the assessment targets once, before the suite runs, and persist them
 * so the smoke spec can parametrize itself synchronously (Playwright builds its
 * test graph synchronously, so async discovery must happen here).
 */
export default async function globalSetup(): Promise<void> {
  const baseURL = process.env.BASE_URL;
  if (!baseURL) throw new Error("BASE_URL is required for global setup.");

  const targets = await getAssessmentTargets(baseURL);
  if (targets.length === 0) {
    throw new Error(`No assessment targets discovered at ${baseURL}.`);
  }

  fs.mkdirSync(path.dirname(TARGETS_FILE), { recursive: true });
  fs.writeFileSync(TARGETS_FILE, JSON.stringify(targets, null, 2));
  console.log(
    `[global-setup] discovered ${targets.length} assessment target(s) at ${baseURL}:`,
  );
  for (const t of targets) console.log(`  - ${t.slug.padEnd(26)} ${t.url}`);
}

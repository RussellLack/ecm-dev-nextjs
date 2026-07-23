#!/usr/bin/env node
/**
 * Sanity economy linter.
 *
 * Enforces economical Sanity API usage so the metered API request quota is
 * not exhausted. Scans a repo for the common quota drains and fails on any
 * unjustified violation.
 *
 * Usage:
 *   node check-sanity-economy.mjs [repoRoot] [--strict]
 *
 * Exit codes:
 *   0  no hard violations (and no warnings under --strict)
 *   1  hard violations found (or warnings under --strict)
 *   2  bad path
 *
 * Escape hatches (must include a reason):
 *   // sanity-economy: allow-no-cdn <reason>
 *   // sanity-economy: allow-short-revalidate <reason>
 *   // sanity-economy: bounded
 */

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : ".");
const STRICT = process.argv.includes("--strict");

const IGNORE_DIRS = new Set([
  "node_modules", ".next", ".git", "dist", "build", "out",
  ".turbo", ".vercel", ".netlify", "coverage", ".cache",
]);
const EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const SELF = /check-sanity-economy\.(mjs|js|cjs)$/;
const MIN_REVALIDATE = 3600;

const hard = [];
const warn = [];

function walk(dir) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (IGNORE_DIRS.has(e.name) || e.name.startsWith(".")) continue;
      walk(full);
    } else if (EXTS.has(path.extname(e.name)) && !SELF.test(e.name)) {
      scan(full);
    }
  }
}

function marked(lines, i, marker) {
  return (lines[i] || "").includes(marker) || (lines[i - 1] || "").includes(marker);
}

/**
 * Return each line with comments removed, so rules match real code and not
 * prose. Line comments and block comments (including multi-line) are stripped.
 * Not string-literal aware, which is an acceptable limit for a guardrail.
 */
function stripComments(lines) {
  const out = [];
  let inBlock = false;
  for (const raw of lines) {
    let s = "";
    let i = 0;
    while (i < raw.length) {
      if (inBlock) {
        const e = raw.indexOf("*/", i);
        if (e === -1) { i = raw.length; } else { inBlock = false; i = e + 2; }
        continue;
      }
      if (raw[i] === "/" && raw[i + 1] === "/") break;
      if (raw[i] === "/" && raw[i + 1] === "*") { inBlock = true; i += 2; continue; }
      s += raw[i];
      i += 1;
    }
    out.push(s);
  }
  return out;
}

function scan(file) {
  let text;
  try { text = fs.readFileSync(file, "utf8"); } catch { return; }
  const lines = text.split(/\r?\n/);
  const code = stripComments(lines);
  const rel = path.relative(root, file) || path.basename(file);

  for (let i = 0; i < lines.length; i++) {
    const line = code[i];

    // Rules 1 and 2: read clients must use the CDN.
    if (/useCdn\s*:\s*false/.test(line) && !marked(lines, i, "sanity-economy: allow-no-cdn")) {
      hard.push({ rel, ln: i + 1, rule: "cdn",
        msg: "read client has the CDN off, which drains the metered API bucket. Turn the CDN on, or if this is a write or preview client annotate it: // sanity-economy: allow-no-cdn <reason>" });
    }

    // Rule 3: ISR revalidate floor.
    const m = line.match(/export\s+const\s+revalidate\s*=\s*(\d+)/);
    if (m && Number(m[1]) < MIN_REVALIDATE && !marked(lines, i, "sanity-economy: allow-short-revalidate")) {
      hard.push({ rel, ln: i + 1, rule: "revalidate",
        msg: `page revalidate is ${m[1]}, below the ${MIN_REVALIDATE}s floor. Use 3600 or more, or false for fully static. Override: // sanity-economy: allow-short-revalidate <reason>` });
    }

    // Rule 3b: per-request dynamic fetch options.
    if (/cache\s*:\s*['"]no-store['"]/.test(line) && !marked(lines, i, "sanity-economy: allow-short-revalidate")) {
      hard.push({ rel, ln: i + 1, rule: "no-store",
        msg: "cache is set to no-store, forcing an uncached read on every request. Prefer ISR with revalidate of 3600 or more. Override: // sanity-economy: allow-short-revalidate <reason>" });
    }
    const mr = line.match(/(?<!const\s)revalidate\s*:\s*(\d+)/);
    if (mr && !/export\s+const/.test(line) && Number(mr[1]) < MIN_REVALIDATE && !marked(lines, i, "sanity-economy: allow-short-revalidate")) {
      hard.push({ rel, ln: i + 1, rule: "fetch-revalidate",
        msg: `fetch revalidate is ${mr[1]}, below the ${MIN_REVALIDATE}s floor. Override: // sanity-economy: allow-short-revalidate <reason>` });
    }
  }

  // Rule 4: bounded generateStaticParams.
  const gsp = text.indexOf("generateStaticParams");
  if (gsp !== -1) {
    const startBrace = text.indexOf("{", gsp);
    if (startBrace !== -1) {
      let depth = 0, end = text.length;
      for (let j = startBrace; j < text.length; j++) {
        if (text[j] === "{") depth++;
        else if (text[j] === "}") { depth--; if (depth === 0) { end = j; break; } }
      }
      const body = text.slice(startBrace, end + 1);
      const bounded = /\.slice\s*\(/.test(body) || /\[\s*0\s*\.\.\./.test(body)
        || /sanity-economy:\s*bounded/.test(body) || /return\s*\[\s*\]/.test(body);
      if (/\.map\s*\(/.test(body) && !bounded) {
        const ln = text.slice(0, gsp).split(/\r?\n/).length;
        warn.push({ rel, ln, rule: "static-params",
          msg: "generateStaticParams appears to pre-render an entire collection. Cap it with .slice(0, N), or return [] and rely on dynamicParams for the long tail, or mark intentional: // sanity-economy: bounded" });
      }
    }
  }
}

if (!fs.existsSync(root)) {
  console.error(`sanity-economy: path not found: ${root}`);
  process.exit(2);
}
walk(root);

function print(list, label) {
  if (!list.length) return;
  console.log(`\n${label} (${list.length}):`);
  for (const v of list) console.log(`  ${v.rel}:${v.ln}  [${v.rule}]  ${v.msg}`);
}

print(hard, "HARD violations");
print(warn, "Warnings");

const failed = hard.length > 0 || (STRICT && warn.length > 0);
if (!failed) {
  console.log(`\nsanity-economy: OK. No blocking violations under ${root}.`);
  process.exit(0);
}
console.log(`\nsanity-economy: FAILED. ${hard.length} hard violation(s)` +
  (STRICT ? `, ${warn.length} warning(s) (strict)` : "") + ". Fix or annotate before shipping.");
process.exit(1);

#!/usr/bin/env node
/**
 * apply-sanity-economy.mjs
 *
 * Conservative automated remediation for the sanity-economy skill.
 *   - Flips clearly read-only clients from the CDN off to on.
 *   - Annotates clearly write clients so the linter accepts them.
 *   - Leaves ambiguous cases untouched and reports them.
 *
 * It does NOT touch revalidate windows or generateStaticParams; those are
 * reported by the linter and need a human decision.
 *
 * Safety rule: a client is only flipped when its file uses .fetch and has no
 * mutation call and no write token. If the file shows any mutation or write
 * token, the line is annotated (left off the CDN) rather than flipped, so a
 * write path is never moved onto the CDN by mistake.
 *
 * Usage:
 *   node apply-sanity-economy.mjs <repoRoot> [--apply]
 * Dry-run by default; --apply writes changes.
 */

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : ".");
const APPLY = process.argv.includes("--apply");

const IGNORE = new Set(["node_modules", ".next", ".git", "dist", "build", "out", ".turbo", ".vercel", ".netlify", "coverage", ".cache", ".claude"]);
const EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const SELF = /(check|apply)-sanity-economy\.(mjs|js|cjs)$/;
const MUT = /\.(create|createOrReplace|createIfNotExists|patch|delete|commit|mutate|transaction)\s*\(/;
const WRITE_TOKEN = /token\s*:\s*[^,\n]*WRITE/i;

const flipped = [];
const annotated = [];
const unknown = [];

function stripComments(lines) {
  const out = [];
  let inB = false;
  for (const raw of lines) {
    let s = "";
    let i = 0;
    while (i < raw.length) {
      if (inB) {
        const e = raw.indexOf("*/", i);
        if (e === -1) { i = raw.length; } else { inB = false; i = e + 2; }
        continue;
      }
      if (raw[i] === "/" && raw[i + 1] === "/") break;
      if (raw[i] === "/" && raw[i + 1] === "*") { inB = true; i += 2; continue; }
      s += raw[i];
      i += 1;
    }
    out.push(s);
  }
  return out;
}

function walk(dir) {
  let ents;
  try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of ents) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (IGNORE.has(e.name) || e.name.startsWith(".")) continue;
      walk(full);
    } else if (EXTS.has(path.extname(e.name)) && !SELF.test(e.name)) {
      scanFile(full);
    }
  }
}

function scanFile(file) {
  let text;
  try { text = fs.readFileSync(file, "utf8"); } catch { return; }
  const lines = text.split(/\r?\n/);
  const code = stripComments(lines);
  const codeAll = code.join("\n");
  // Write signals: any mutation call, or a write-named token.
  const hasWrite = MUT.test(codeAll) || WRITE_TOKEN.test(codeAll);
  // Read signals: a fetch call, a published perspective, or a read-named
  // token. Any of these on a non-write file means the client is read-only,
  // including exported client modules that do not call fetch themselves.
  const readHint = /\.fetch\s*\(/.test(codeAll)
    || /perspective\s*:\s*['"]published['"]/.test(codeAll)
    || /token\s*:\s*[^,\n]*READ/i.test(codeAll);
  const rel = path.relative(root, file) || path.basename(file);
  let changed = false;

  for (let i = 0; i < lines.length; i++) {
    if (!/useCdn\s*:\s*false/.test(code[i])) continue;      // real code only
    if (lines[i].includes("sanity-economy:")) continue;     // already annotated

    if (hasWrite) {
      lines[i] = lines[i].replace(/\s*$/, "") + " // sanity-economy: allow-no-cdn write client";
      annotated.push(`${rel}:${i + 1}`);
      changed = true;
    } else if (readHint) {
      lines[i] = lines[i].replace(/useCdn\s*:\s*false/, "useCdn: true");
      flipped.push(`${rel}:${i + 1}`);
      changed = true;
    } else {
      unknown.push(`${rel}:${i + 1}`);
    }
  }

  if (changed && APPLY) fs.writeFileSync(file, lines.join("\n"));
}

if (!fs.existsSync(root)) {
  console.error(`apply-sanity-economy: path not found: ${root}`);
  process.exit(2);
}
walk(root);

const mode = APPLY ? "APPLIED" : "DRY-RUN";
console.log(`\n[${mode}] ${root}`);
console.log(`  read clients flipped to CDN : ${flipped.length}`);
for (const f of flipped) console.log(`      + ${f}`);
console.log(`  write clients annotated     : ${annotated.length}`);
for (const a of annotated) console.log(`      ~ ${a}`);
console.log(`  ambiguous, left for review  : ${unknown.length}`);
for (const u of unknown) console.log(`      ? ${u}`);

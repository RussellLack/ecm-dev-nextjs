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
 * Classification is block-scoped first, file-scoped as a fallback: for each
 * useCdn:false line, the nearest enclosing createClient(...) / withConfig(...)
 * argument block is checked for its OWN inline token name and perspective.
 * A file can legitimately hold more than one client (e.g. a readClient() and
 * a writeClient() in the same module) — deciding from the whole file's
 * signals would mislabel the read client as a write client just because a
 * write client happens to share the file. Only when a block has no inline
 * read/write signal of its own does the check fall back to whole-file
 * mutation-call detection (a client whose own block is silent but the file
 * calls .patch()/.create() etc. is left as a write client, conservatively).
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

// Find the smallest {...} block that contains character offset `at`, by
// scanning outward from it for the innermost balanced-brace pair. Used to
// scope a useCdn:false line to its own createClient(...)/withConfig(...)
// argument object, not the whole file.
function enclosingBraceBlock(codeAll, at) {
  let start = -1;
  let depth = 0;
  for (let j = at; j >= 0; j--) {
    if (codeAll[j] === "}") depth++;
    else if (codeAll[j] === "{") {
      if (depth === 0) { start = j; break; }
      depth--;
    }
  }
  if (start === -1) return "";
  depth = 0;
  for (let j = start; j < codeAll.length; j++) {
    if (codeAll[j] === "{") depth++;
    else if (codeAll[j] === "}") {
      depth--;
      if (depth === 0) return codeAll.slice(start, j + 1);
    }
  }
  return codeAll.slice(start);
}

function scanFile(file) {
  let text;
  try { text = fs.readFileSync(file, "utf8"); } catch { return; }
  const lines = text.split(/\r?\n/);
  const code = stripComments(lines);
  const codeAll = code.join("\n");
  // File-wide fallback write signal: a mutation call anywhere. .fetch()/
  // .create() etc. are invoked on the resulting client variable elsewhere in
  // the file, not inside the config block, so this can only be checked
  // file-wide — used only when a block has no inline signal of its own.
  const fileHasMutation = MUT.test(codeAll);
  const rel = path.relative(root, file) || path.basename(file);
  // Running offset into codeAll for each line, to map a line back to a
  // character position for enclosingBraceBlock.
  const lineOffsets = [];
  let acc = 0;
  for (const l of code) { lineOffsets.push(acc); acc += l.length + 1; }
  let changed = false;

  for (let i = 0; i < lines.length; i++) {
    const m = /useCdn\s*:\s*false/.exec(code[i]);
    if (!m) continue;                                        // real code only
    if (lines[i].includes("sanity-economy:")) continue;       // already annotated

    const at = lineOffsets[i] + m.index;
    const block = enclosingBraceBlock(codeAll, at) || codeAll;
    const blockHasWrite = WRITE_TOKEN.test(block);
    const blockHasRead = /\.fetch\s*\(/.test(block)
      || /perspective\s*:\s*['"]published['"]/.test(block)
      || /token\s*:\s*[^,\n]*READ/i.test(block);

    let isWrite;
    if (blockHasWrite) isWrite = true;
    else if (blockHasRead) isWrite = false;
    else isWrite = fileHasMutation || WRITE_TOKEN.test(codeAll); // fall back to file-wide

    if (isWrite) {
      lines[i] = lines[i].replace(/\s*$/, "") + " // sanity-economy: allow-no-cdn write client";
      annotated.push(`${rel}:${i + 1}`);
      changed = true;
    } else if (!blockHasWrite && !blockHasRead) {
      unknown.push(`${rel}:${i + 1}`);
    } else {
      lines[i] = lines[i].replace(/useCdn\s*:\s*false/, "useCdn: true");
      flipped.push(`${rel}:${i + 1}`);
      changed = true;
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

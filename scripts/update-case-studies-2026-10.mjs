/**
 * October 2026 case-study content updates:
 * - Rewrite the two Hubster case studies (Conexus, Joh. Johannson Kaffe)
 *   in the same structure as the rest of the case studies, and fix their
 *   "Who This Is For" text, which described unrelated engagements.
 * - Rename "Global Digital Platform" (Wilhelmsen) to
 *   "Global Customer Services Portal".
 * - Unpublish the Vizrt case study (cs-5), which was a proposal rather
 *   than delivered work, and the Veidekke case study (cs-16), which is
 *   not strong enough. Both stay in Studio as drafts.
 *
 * Slugs are unchanged, so existing URLs keep working.
 *
 * Usage:
 *   node scripts/update-case-studies-2026-10.mjs            # apply
 *   node scripts/update-case-studies-2026-10.mjs --dry-run  # preview, no writes
 *
 * Loads SANITY_WRITE_TOKEN, NEXT_PUBLIC_SANITY_PROJECT_ID, and
 * NEXT_PUBLIC_SANITY_DATASET from .env.local, the same way
 * scripts/apply-pillars.mjs does. Patches the published doc and any
 * existing draft, so the change sticks whichever copy is published next.
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dryRun = process.argv.includes("--dry-run");

// ─── Load .env.local ──────────────────────────────────────────────────
try {
  const envPath = resolve(__dirname, "../.env.local");
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
} catch {
  // .env.local missing is fine if the env vars are already in the shell
}

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "0dep7ult";
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const TOKEN = process.env.SANITY_WRITE_TOKEN;

if (!TOKEN && !dryRun) {
  console.error(
    "SANITY_WRITE_TOKEN is not set. Add it to .env.local or export it in the shell."
  );
  process.exit(1);
}

const API_VERSION = "2026-04-01";
const MUTATE_URL = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/mutate/${DATASET}`;

const HUBSTER_ATTRIBUTION =
  "Delivered through Hubster, the content consultancy run by the people now behind ECM.DEV. Any public information referenced here is used for identification and does not imply endorsement.";

// Multi-point sections use the "Heading - text" paragraphs separated by
// blank lines that the other case studies use (rendered with
// whitespace-pre-line).
const paras = (...p) => p.join("\n\n");

// ─── Content ──────────────────────────────────────────────────────────
const updates = [
  {
    id: "casestudy-cms-migration-to-episerver-nordic-training-company",
    label: "Conexus",
    set: {
      title: "Website Copy & Customer Case Studies for a Scandinavian EdTech Company",
      client: "Conexus",
      industry: "technology",
      pillars: ["services"],
      tags: ["Copywriting", "Case Studies", "Customer Research", "Content Strategy", "EdTech"],
      description:
        "Wrote the English website copy and four interview-based customer case studies for Conexus, a Scandinavian adaptive-learning technology company for schools, giving it evidence of real-world outcomes to take into international partner markets.",
      whoThisIsFor: paras(
        "EdTech and learning-technology companies, and other research-led product businesses, preparing to sell into new international markets through partners.",
        "Common traits: institutional or public-sector buyers who need evidence before they commit, a product suite that has to be explained as one offer, and customer success stories that live in the sales team's heads rather than in print."
      ),
      theChallenge: paras(
        "Conexus, founded in 2001 and named a Gartner \"Cool Vendor in Leveraging Data in Education\" in 2015, had a research-backed product suite (Key, Insight, Companion, Engage and VIP24) built with well-known education researchers.",
        "Its website did not yet explain that suite clearly to the school and municipal buyers it sold to, and as it pushed into European, Asian and North American partner markets it needed published proof of what the products achieved in practice."
      ),
      whatWePropose: paras(
        "The team now behind ECM.DEV ran a multi-month content engagement for Conexus through Hubster, their own content consultancy.",
        "Stakeholder Interviews & Personas - Structured interviews with Conexus's sales team and other stakeholders shaped the audience personas and content strategy behind the new copy.",
        "Website Copy - More than five rounds of English copy between May and September 2016, covering the homepage, the About page and the individual product pages.",
        "Customer Case Studies - Four full case studies grounded in real municipal deployments and written from direct interviews with named project stakeholders, including Kristiansand municipality's project manager Øivind Jacobsen on its Conexus Key rollout, alongside Tønsberg, Haugesund and Drammen."
      ),
      whyItMatters: paras(
        "Evidence, not just description - four named, interview-based case studies from Norwegian municipalities gave Conexus concrete proof of real-world outcomes to support its international partner expansion.",
        "A suite explained as one offer - homepage, About and product pages that made a research-backed product suite clear to school and municipal buyers.",
        "Copy grounded in the sales conversation - personas and messaging drawn from the people selling the product, refined with the client over more than five rounds."
      ),
      attribution: HUBSTER_ATTRIBUTION,
    },
  },
  {
    id: "casestudy-corporate-website-nordic-m2m-technology-company",
    label: "Joh. Johannson Kaffe",
    set: {
      title: "SEO & PPC Strategy for a Norwegian Coffee Importer's Multi-Brand Portfolio",
      client: "Joh. Johannson Kaffe",
      industry: "retail",
      pillars: ["services", "technology"],
      tags: ["SEO", "PPC", "Keyword Research", "Content Strategy", "FMCG"],
      description:
        "Ran brand-by-brand keyword research, an SEO and content workshop, and a PPC budget model for Joh. Johannson Kaffe, the Norwegian coffee importer and roaster behind Evergood, Ali Kaffe, Cirkel Kaffe, Farmers Coffee, Greenworld and Coffee of the World.",
      whoThisIsFor: paras(
        "Consumer goods companies running several brands in one market, with digital marketing handled wholly or partly by an external media agency.",
        "Common traits: search spend reported for the portfolio rather than per brand, limited in-house SEO and content skill, and an open question about which work should stay with the agency and which should come in-house."
      ),
      theChallenge:
        "Joh. Johannson Kaffe managed digital marketing for six distinct coffee brands through an incumbent media agency. It wanted a clearer, brand-by-brand view of its keyword landscape and of how efficiently its paid-search budget was being spent, along with stronger in-house SEO and content capability across the portfolio.",
      whatWePropose: paras(
        "The team now behind ECM.DEV delivered the work in 2016 through Hubster, their own content consultancy.",
        "Keyword Research - Detailed keyword research across all six brands, refined through several iterations in April 2016.",
        "SEO & Content Workshop - A workshop for the client's marketing team on search optimisation and writing content for search.",
        "PPC Budget Model - A full paid-search budget model benchmarking a proposed in-house approach against the incumbent agency's spend across all six brands, covering search-term analysis, on-page content optimisation, a technical SEO review and ongoing AdWords management."
      ),
      whyItMatters: paras(
        "A brand-by-brand view of search spend - paid-search economics for each of the six brands side by side, informing how digital marketing budget was allocated across the portfolio, including Evergood and Ali Kaffe.",
        "An in-house foundation - the keyword research and workshop gave the marketing team a practical SEO and content base to work from across the full coffee portfolio.",
        "A costed alternative to the agency - an in-house approach priced against the incumbent agency's spend, so the choice could be made on numbers."
      ),
      attribution: HUBSTER_ATTRIBUTION,
    },
  },
  {
    id: "aa7af2f3-51ac-4926-a7f5-27f13fcf60a3",
    label: "Wilhelmsen",
    set: { title: "Global Customer Services Portal" },
  },
];

// ─── Apply ────────────────────────────────────────────────────────────
async function mutate(mutations) {
  const res = await fetch(MUTATE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ mutations }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(
      json?.error?.description || json?.message || `HTTP ${res.status}`
    );
    err.statusCode = res.status;
    throw err;
  }
  return json;
}

console.log(
  `Target: ${PROJECT_ID}/${DATASET}${dryRun ? "  [DRY RUN — no writes]" : ""}`
);

if (dryRun) {
  console.log(JSON.stringify(updates, null, 2));
  console.log(`[dry] unpublish cs-5 (Vizrt) and cs-16 (Veidekke), keep as drafts`);
  process.exit(0);
}

// ─── Unpublish ────────────────────────────────────────────────────────
// Keep the content as a draft in Studio (so it can be republished) and
// delete the published copy. next.config.mjs redirects each URL to
// /case-study.
const UNPUBLISH = [
  { id: "cs-5", label: "Vizrt" }, // a proposal, not delivered work
  { id: "cs-16", label: "Veidekke" }, // not strong enough
];

async function unpublish({ id, label }) {
  const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/doc/${DATASET}/${id}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  const published = (await res.json().catch(() => ({})))?.documents?.[0];
  if (!published) {
    console.log(`· ${label} (${id}) is not published, skipped`);
    return;
  }
  const { _rev, _createdAt, _updatedAt, ...content } = published;
  try {
    await mutate([
      { createIfNotExists: { ...content, _id: `drafts.${id}` } },
      { delete: { id } },
    ]);
    console.log(`✓ unpublished ${id}  (${label}), kept as drafts.${id}`);
  } catch (e) {
    console.error(`✗ unpublish ${id}: ${e.message}`);
    process.exitCode = 1;
  }
}

for (const u of UNPUBLISH) await unpublish(u);

for (const u of updates) {
  for (const id of [u.id, `drafts.${u.id}`]) {
    try {
      await mutate([{ patch: { id, set: u.set } }]);
      console.log(`✓ patched ${id}  (${u.label})`);
    } catch (e) {
      const msg = String(e.message || "").toLowerCase();
      if (id.startsWith("drafts.") && (e.statusCode === 404 || msg.includes("not found"))) {
        console.log(`· no draft for ${u.label}, skipped`);
      } else {
        console.error(`✗ ${id}: ${e.message}`);
        process.exitCode = 1;
      }
    }
  }
}

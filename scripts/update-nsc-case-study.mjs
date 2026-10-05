/**
 * Rewrite the Norwegian Seafood Council case study (cs-40) and take it
 * off the homepage as a featured card.
 *
 * The slug (content-localization-15-countrieslanguages) is kept so the
 * existing URL and inbound links keep working.
 *
 * Field mapping (see app/case-study/[slug]/page.tsx for render order):
 * - description      -> "Overview" (also the index-card summary)
 * - whoThisIsFor     -> "Who This Is For"
 * - theChallenge     -> "The Challenge"
 * - body             -> "Our Approach" (with subheadings) and "Impact".
 *   These sections need headings and bullet lists, which the plain-text
 *   whatWePropose / whyItMatters fields cannot carry, so those two fields
 *   are unset and the content goes into Portable Text instead.
 * - seo.metaDescription -> <meta name="description">
 *
 * Usage:
 *   node scripts/update-nsc-case-study.mjs            # apply
 *   node scripts/update-nsc-case-study.mjs --dry-run  # preview, no writes
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
const DOC_ID = "cs-40";

// ─── Portable Text helpers ────────────────────────────────────────────
let keyCounter = 0;
const key = () => `nsc${(keyCounter++).toString(36).padStart(4, "0")}`;

const block = (style, text, listItem) => ({
  _type: "block",
  _key: key(),
  style,
  markDefs: [],
  children: [{ _type: "span", _key: key(), text, marks: [] }],
  ...(listItem ? { listItem, level: 1 } : {}),
});
const h2 = (t) => block("h2", t);
const h3 = (t) => block("h3", t);
const p = (t) => block("normal", t);
const li = (t) => block("normal", t, "bullet");

// ─── Content ──────────────────────────────────────────────────────────
const description = [
  "The Norwegian Seafood Council promotes Norwegian seafood in export markets worldwide, through consumer sites in local languages, trade material for importers, and a monthly export report that the international press waits for. We have supported that output continuously since 2012.",
  "The work started as recipe translation. It grew into something closer to an outsourced content desk: writing original English content, moving it into more than a dozen languages, publishing it in the CMS, and turning around time-critical corporate material for the communications team.",
].join("\n\n");

const whoThisIsFor =
  "Export promotion bodies, trade associations and membership organisations that run content in many markets from a small central team. It suits organisations where web content, campaign material, press releases and governance documents all need to exist in several languages, and where no single local agency can hold the standard.";

const theChallenge = [
  "The Council ran separate consumer sites for each market, including Norway, Sweden, Germany, France, Italy, Spain, Portugal, Russia, Japan, China, the UK and the US. Local editors and local agencies produced content independently. The result was duplicated effort, uneven quality, and an ingredients database cluttered with duplicate entries created by editors around the world.",
  "",
  "Three problems sat behind this:",
  "",
  "• No master version. Good content written for one market rarely reached the others.",
  "• Translation stopped at the Word file. Someone still had to build each page in the CMS, with the right metadata, images and links.",
  "• Deadlines differed wildly. A recipe could wait a week. The monthly export figures could not wait a morning.",
].join("\n");

const body = [
  h2("Our Approach"),

  h3("An English master, then local versions"),
  p("We audited twelve national sites, ran content strategy workshops with the Council in Tromsø and Oslo, and proposed an operating model built on an English master version with native-language editors for each market. Roles, responsibilities and an editorial workflow were defined alongside it."),

  h3("Translation and publishing as one job"),
  p("Every web assignment covered the full path from source text to live page. Non-English sources were translated into English first, then into the target language. Each text went through two passes: translation, then a separate quality check. Text was delivered side by side with its source, a web editor built the page in eZ Publish, and a native translator made a final check inside the CMS before publication."),
  p("On that model we handled recipes from Swedish, Italian, French, Portuguese and Chinese into English, built out recipe and article content for the Polish, Czech and Turkish sites, and localised interface strings such as buttons, search labels and navigation."),

  h3("Original content for the relaunch"),
  p("When the Council redesigned its consumer platform in 2015, we wrote the core English content for the new structure: a 31-article fish encyclopedia, the story of sushi, and sections on origin, health and quality. Each went through several dated rounds of client feedback before sign-off."),

  h3("Content migration to the new site structure"),
  p("The relaunch replaced the old site structure with a new information architecture and new page formats. We handled the content side of that move. For the German site, each page in the new structure was mapped back to its source on the old site. German and International English were then published in full as reference sites for other markets to follow, with French next. Progress was tracked article by article across the three languages. B2B training content for the Salmon Academy was rebuilt in the CMS from the design agency's PDF layouts, and the Cod Academy followed in French, interface text included."),

  h3("An overnight English press desk"),
  p("Since October 2014 we have produced the English edition of the Council's monthly seafood export release. The locked Norwegian text arrives the afternoon before publication. The English version is ready for a 06:00 embargo the next morning. The release has grown from around 650 words to around 3,000, covering every major species with market figures and analyst commentary. Quarterly, half-year and full-year editions run on the same cycle."),

  h3("Corporate and regulatory material"),
  p("Departments across the Council now send work directly: communications, HR, risk, market access and the country envoys. Assignments have included:"),
  li("Species strategies, the corporate strategy and annual sustainability reporting."),
  li("Preparedness and crisis plans, most recently in 2024."),
  li("The Fish Export Act, its regulations and the Council's articles of association."),
  li("Anti-corruption policy, ethical guidelines and procurement templates."),
  li("A consultation response on Brazilian salted fish regulation, delivered in Norwegian, English and Brazilian Portuguese with specialist translators."),
  li("Marketing plans for China and Hong Kong."),
  li("Video subtitles, speech manuscripts, press Q&A packs and consumer recipe series."),
  li("English descriptions for around thirty aquaculture visitor centres, and an Italian edition of the Querini story, the 1431 shipwreck behind the stockfish trade with Italy."),

  h2("Impact"),
  li("Continuous delivery since 2012."),
  li("Around 135 monthly export releases since October 2014, each delivered overnight against a 06:00 embargo."),
  li("Content delivered in more than a dozen languages: English, Norwegian, Swedish, German, French, Italian, Spanish, Portuguese, Polish, Czech, Turkish, Chinese and Japanese."),
  li("One process from source text to published page, with a native-speaker check in the CMS as the final step."),
  li("Speed where it matters: four releases totalling 2,912 words in one evening shift; sixteen species fact sheets across two consecutive days; a 200-slide consumer study into French within the week."),
  li("A relationship that widened on its own. What began with one digital team now serves many internal clients across the organisation."),
  p("The lesson for similar organisations: multilingual content fails at the handovers, between writer and translator, translator and web editor, head office and local market. Remove the handovers and quality stops depending on who happens to be available."),
];

const set = {
  title: "Multilingual Content Operations for a National Seafood Trade Body",
  client: "Norwegian Seafood Council",
  // Hero / sidebar "Services": Content Operations, Content Localization,
  // Content Technology (see sanity/schemas/taxonomyOptions.ts).
  pillars: ["services", "localization", "technology"],
  // Footer "Topics".
  tags: [
    "Content Operations",
    "Content Localization",
    "Content Technology",
    "CMS Publishing",
  ],
  description,
  whoThisIsFor,
  theChallenge,
  body,
  "seo.metaDescription":
    "Content operations for the Norwegian Seafood Council since 2012: original content, CMS publishing across market sites, and overnight English export releases.",
  attribution:
    "Assignments from 2014 through 2020 were delivered while employed at Making Waves (later NoA Ignite), and recent assignments have been delivered directly, independent of any employer. Any public information referenced here is used for identification and does not imply endorsement.",
  featured: false,
};

const unset = ["whatWePropose", "whyItMatters", "featuredOrder", "featuredTagline"];

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
  console.log(JSON.stringify({ set, unset }, null, 2));
  process.exit(0);
}

for (const id of [DOC_ID, `drafts.${DOC_ID}`]) {
  try {
    await mutate([
      { patch: { id, setIfMissing: { seo: { _type: "seo" } } } },
      { patch: { id, set, unset } },
    ]);
    console.log(`✓ patched ${id}`);
  } catch (e) {
    const msg = String(e.message || "").toLowerCase();
    if (id.startsWith("drafts.") && (e.statusCode === 404 || msg.includes("not found"))) {
      console.log(`· no draft for ${DOC_ID}, skipped`);
    } else {
      console.error(`✗ ${id}: ${e.message}`);
      process.exitCode = 1;
    }
  }
}

/**
 * Seed script: Content Operations Maturity Assessment
 *
 * Run with:  node scripts/seed-assessment.mjs
 *
 * No external dependencies — uses native fetch + Sanity HTTP API.
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Parse .env.local
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

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const TOKEN = process.env.SANITY_WRITE_TOKEN;

if (!PROJECT_ID || !TOKEN) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_WRITE_TOKEN in .env.local");
  process.exit(1);
}

const API = `https://${PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/${DATASET}`;

async function createDoc(doc) {
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      mutations: [{ create: { ...doc, _id: doc._id || undefined } }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Sanity create failed: ${res.status} ${err}`);
  }

  const result = await res.json();
  const id = result.results?.[0]?.id;
  console.log(`  ✓ ${doc._type}: ${doc.title || id}`);
  return { ...doc, _id: id };
}

async function query(groq) {
  const url = `https://${PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${DATASET}?query=${encodeURIComponent(groq)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  const data = await res.json();
  return data.result;
}

// ─── Helpers ───
let counter = 0;
function uid() {
  return `seed-${Date.now()}-${counter++}`;
}

function dimRef(id) {
  return { _type: "reference", _ref: id };
}

function option(id, label, scores) {
  return {
    _key: uid(),
    _type: "assessmentAnswerOption",
    optionId: id,
    label,
    dimensionScores: scores.map((s) => ({
      _key: uid(),
      _type: "dimensionScore",
      dimension: dimRef(s.dimId),
      points: s.pts,
    })),
  };
}

function question(qId, text, helpText, options) {
  return {
    _key: uid(),
    _type: "assessmentQuestion",
    questionId: qId,
    text,
    helpText,
    inputType: "single",
    options,
  };
}

// ─── Main ───
async function seed() {
  console.log("\n━━━ Seeding Content Operations Maturity Assessment ━━━\n");

  // 1. Create dimensions
  console.log("Creating dimensions...");
  const dimensionData = [
    { title: "Strategy", key: "strategy", description: "How well content is positioned as a strategic business asset — with clear objectives, audience understanding, and alignment to business outcomes.", order: 1 },
    { title: "Governance", key: "governance", description: "The standards, ownership models, lifecycle management, and quality controls that ensure content remains consistent, compliant, and current.", order: 2 },
    { title: "Workflow", key: "workflow", description: "The repeatability and efficiency of content operations — from briefing through production, review, approval, and publication.", order: 3 },
    { title: "Technology", key: "technology", description: "How well the content technology stack (CMS, DAM, analytics, automation) is configured, integrated, and used.", order: 4 },
    { title: "Measurement", key: "measurement", description: "Whether content performance is tracked, reported, and used to inform decisions and investment.", order: 5 },
    { title: "AI Readiness", key: "ai-readiness", description: "How well content is structured, tagged, and governed for use by AI systems — including search, personalisation, and generative AI.", order: 6 },
  ];

  const dims = {};
  for (const d of dimensionData) {
    const doc = await createDoc({
      _type: "maturityDimension",
      title: d.title,
      key: { _type: "slug", current: d.key },
      description: d.description,
      order: d.order,
    });
    dims[d.key] = doc._id;
  }

  // 2. Build sections
  console.log("\nBuilding assessment sections...");
  const sections = [
    // Section 1: Strategy
    {
      _key: uid(), _type: "assessmentSection",
      title: "Strategy",
      description: "How content connects to business objectives.",
      questions: [
        question("q-str-1", "How would you describe your organisation's content strategy?", "Think about whether content objectives exist and how they connect to business goals.", [
          option("q-str-1-a", "We don't have a documented content strategy", [{ dimId: dims.strategy, pts: 0 }]),
          option("q-str-1-b", "We have informal goals but nothing written down", [{ dimId: dims.strategy, pts: 1 }]),
          option("q-str-1-c", "We have a documented strategy but it's not consistently followed", [{ dimId: dims.strategy, pts: 2 }]),
          option("q-str-1-d", "We have a clear, documented strategy aligned to business objectives and reviewed regularly", [{ dimId: dims.strategy, pts: 3 }]),
        ]),
        question("q-str-2", "How well do you understand your content audiences?", "Consider whether you have defined personas, journey maps, or audience segmentation.", [
          option("q-str-2-a", "We create content based on internal assumptions", [{ dimId: dims.strategy, pts: 0 }]),
          option("q-str-2-b", "We have some audience data but don't use it systematically", [{ dimId: dims.strategy, pts: 1 }]),
          option("q-str-2-c", "We have defined personas and use them for planning", [{ dimId: dims.strategy, pts: 2 }]),
          option("q-str-2-d", "We have data-driven personas with journey maps that inform all content decisions", [{ dimId: dims.strategy, pts: 3 }]),
        ]),
        question("q-str-3", "How is content investment prioritised?", "", [
          option("q-str-3-a", "Whoever shouts loudest gets content produced", [{ dimId: dims.strategy, pts: 0 }]),
          option("q-str-3-b", "We have a basic editorial calendar but priorities shift constantly", [{ dimId: dims.strategy, pts: 1 }]),
          option("q-str-3-c", "Content is planned against a calendar aligned to campaigns and business cycles", [{ dimId: dims.strategy, pts: 2 }]),
          option("q-str-3-d", "Content investment is prioritised using performance data, business impact, and strategic alignment", [{ dimId: dims.strategy, pts: 3 }]),
        ]),
      ],
    },
    // Section 2: Governance
    {
      _key: uid(), _type: "assessmentSection",
      title: "Governance",
      description: "Standards, ownership, and lifecycle management.",
      questions: [
        question("q-gov-1", "Who owns content in your organisation?", "Think about whether there are clear roles and accountability.", [
          option("q-gov-1-a", "Nobody specifically — it's everyone's job and nobody's responsibility", [{ dimId: dims.governance, pts: 0 }]),
          option("q-gov-1-b", "Marketing owns most content but other teams create independently", [{ dimId: dims.governance, pts: 1 }]),
          option("q-gov-1-c", "We have designated content owners per channel or business area", [{ dimId: dims.governance, pts: 2 }]),
          option("q-gov-1-d", "Clear ownership model with RACI, editorial governance board, and cross-functional accountability", [{ dimId: dims.governance, pts: 3 }]),
        ]),
        question("q-gov-2", "Do you have content standards and style guides?", "", [
          option("q-gov-2-a", "No formal standards — each team does its own thing", [{ dimId: dims.governance, pts: 0 }]),
          option("q-gov-2-b", "We have brand guidelines but nothing content-specific", [{ dimId: dims.governance, pts: 1 }]),
          option("q-gov-2-c", "We have a style guide that some teams follow", [{ dimId: dims.governance, pts: 2 }]),
          option("q-gov-2-d", "Comprehensive content standards, templates, and quality checklists used consistently across the organisation", [{ dimId: dims.governance, pts: 3 }]),
        ]),
        question("q-gov-3", "How do you manage content lifecycle?", "Consider archiving, review cycles, and expiry.", [
          option("q-gov-3-a", "Content accumulates with no review or retirement process", [{ dimId: dims.governance, pts: 0 }]),
          option("q-gov-3-b", "We occasionally audit and remove outdated content", [{ dimId: dims.governance, pts: 1 }]),
          option("q-gov-3-c", "We have review dates but don't always action them", [{ dimId: dims.governance, pts: 2 }]),
          option("q-gov-3-d", "Systematic lifecycle management with scheduled reviews, archival rules, and expiry workflows", [{ dimId: dims.governance, pts: 3 }]),
        ]),
      ],
    },
    // Section 3: Workflow
    {
      _key: uid(), _type: "assessmentSection",
      title: "Workflow",
      description: "How content gets planned, produced, and published.",
      questions: [
        question("q-wfl-1", "How would you describe your content production process?", "", [
          option("q-wfl-1-a", "Mostly ad hoc — requests come in and we respond", [{ dimId: dims.workflow, pts: 0 }]),
          option("q-wfl-1-b", "We have a basic process but it varies by team or project", [{ dimId: dims.workflow, pts: 1 }]),
          option("q-wfl-1-c", "Defined workflows with clear stages, but some manual handoffs", [{ dimId: dims.workflow, pts: 2 }]),
          option("q-wfl-1-d", "Streamlined, partially automated workflows with clear ownership at each stage", [{ dimId: dims.workflow, pts: 3 }]),
        ]),
        question("q-wfl-2", "How are content approvals handled?", "", [
          option("q-wfl-2-a", "Approvals are informal — often via email or chat", [{ dimId: dims.workflow, pts: 0 }]),
          option("q-wfl-2-b", "We have approval steps but they create bottlenecks", [{ dimId: dims.workflow, pts: 1 }]),
          option("q-wfl-2-c", "Defined approval workflows in our CMS with role-based permissions", [{ dimId: dims.workflow, pts: 2 }]),
          option("q-wfl-2-d", "Tiered approval system with SLAs, automated routing, and escalation paths", [{ dimId: dims.workflow, pts: 3 }]),
        ]),
        question("q-wfl-3", "How efficiently can your team produce content at scale?", "", [
          option("q-wfl-3-a", "We struggle to keep up with demand — everything takes too long", [{ dimId: dims.workflow, pts: 0 }]),
          option("q-wfl-3-b", "We manage, but increasing volume means increasing headcount", [{ dimId: dims.workflow, pts: 1 }]),
          option("q-wfl-3-c", "We use templates and reusable components to improve efficiency", [{ dimId: dims.workflow, pts: 2 }]),
          option("q-wfl-3-d", "Content production scales efficiently through automation, templates, and structured reuse", [{ dimId: dims.workflow, pts: 3 }]),
        ]),
      ],
    },
    // Section 4: Technology
    {
      _key: uid(), _type: "assessmentSection",
      title: "Technology",
      description: "Your content technology stack and how well it's used.",
      questions: [
        question("q-tch-1", "How fit-for-purpose is your CMS?", "", [
          option("q-tch-1-a", "We don't have a CMS, or it's a legacy system nobody wants to use", [{ dimId: dims.technology, pts: 0 }]),
          option("q-tch-1-b", "We have a CMS but it's partially configured and underutilised", [{ dimId: dims.technology, pts: 1 }]),
          option("q-tch-1-c", "Our CMS works well for publishing but lacks integration with other tools", [{ dimId: dims.technology, pts: 2 }]),
          option("q-tch-1-d", "Our CMS is well-configured, integrated with analytics and marketing tools, and actively maintained", [{ dimId: dims.technology, pts: 3 }]),
        ]),
        question("q-tch-2", "How integrated is your content technology stack?", "Consider CMS, DAM, analytics, marketing automation, CRM.", [
          option("q-tch-2-a", "Tools are siloed — no meaningful integration between systems", [{ dimId: dims.technology, pts: 0 }]),
          option("q-tch-2-b", "Some integrations exist but they're fragile or manual", [{ dimId: dims.technology, pts: 1 }]),
          option("q-tch-2-c", "Key systems are integrated but gaps remain", [{ dimId: dims.technology, pts: 2 }]),
          option("q-tch-2-d", "Fully integrated stack with automated data flow between CMS, analytics, DAM, and marketing tools", [{ dimId: dims.technology, pts: 3 }]),
        ]),
        question("q-tch-3", "How is digital asset management handled?", "", [
          option("q-tch-3-a", "Assets live in shared drives, email threads, or wherever people save them", [{ dimId: dims.technology, pts: 0 }]),
          option("q-tch-3-b", "We have a DAM but adoption is inconsistent", [{ dimId: dims.technology, pts: 1 }]),
          option("q-tch-3-c", "Our DAM is used for most assets with basic metadata and search", [{ dimId: dims.technology, pts: 2 }]),
          option("q-tch-3-d", "Centralised DAM with rich metadata, automated tagging, rights management, and CDN delivery", [{ dimId: dims.technology, pts: 3 }]),
        ]),
      ],
    },
    // Section 5: Measurement
    {
      _key: uid(), _type: "assessmentSection",
      title: "Measurement",
      description: "Whether content performance drives decisions.",
      questions: [
        question("q-msr-1", "How do you measure content performance?", "", [
          option("q-msr-1-a", "We don't really measure content performance", [{ dimId: dims.measurement, pts: 0 }]),
          option("q-msr-1-b", "We track page views and basic engagement metrics", [{ dimId: dims.measurement, pts: 1 }]),
          option("q-msr-1-c", "We have dashboards covering traffic, engagement, and some conversion metrics", [{ dimId: dims.measurement, pts: 2 }]),
          option("q-msr-1-d", "Comprehensive measurement framework linking content to pipeline, revenue, and business outcomes", [{ dimId: dims.measurement, pts: 3 }]),
        ]),
        question("q-msr-2", "How does performance data influence content decisions?", "", [
          option("q-msr-2-a", "It doesn't — we create content based on intuition or requests", [{ dimId: dims.measurement, pts: 0 }]),
          option("q-msr-2-b", "We look at data occasionally but it rarely changes what we do", [{ dimId: dims.measurement, pts: 1 }]),
          option("q-msr-2-c", "Data informs our content calendar and helps us stop underperforming content", [{ dimId: dims.measurement, pts: 2 }]),
          option("q-msr-2-d", "Data-driven content optimisation with A/B testing, predictive analytics, and automated recommendations", [{ dimId: dims.measurement, pts: 3 }]),
        ]),
        question("q-msr-3", "Can you attribute business outcomes to specific content?", "", [
          option("q-msr-3-a", "No — we can't connect content to business results", [{ dimId: dims.measurement, pts: 0 }]),
          option("q-msr-3-b", "We can attribute in some cases but it's manual and unreliable", [{ dimId: dims.measurement, pts: 1 }]),
          option("q-msr-3-c", "We have attribution for key content assets and campaigns", [{ dimId: dims.measurement, pts: 2 }]),
          option("q-msr-3-d", "Multi-touch attribution across the full content journey with clear ROI reporting", [{ dimId: dims.measurement, pts: 3 }]),
        ]),
      ],
    },
    // Section 6: AI Readiness
    {
      _key: uid(), _type: "assessmentSection",
      title: "AI Readiness",
      description: "How prepared your content is for AI-powered systems.",
      questions: [
        question("q-air-1", "How structured is your content?", "Think about content models, schemas, and separation of content from presentation.", [
          option("q-air-1-a", "Content is mostly unstructured — created as pages or documents", [{ dimId: dims["ai-readiness"], pts: 0 }]),
          option("q-air-1-b", "Some content uses structured fields but most is free-form", [{ dimId: dims["ai-readiness"], pts: 1 }]),
          option("q-air-1-c", "We use content models with defined fields and types for most content", [{ dimId: dims["ai-readiness"], pts: 2 }]),
          option("q-air-1-d", "Fully modular, structured content with rich schemas, content types, and component-based architecture", [{ dimId: dims["ai-readiness"], pts: 3 }]),
        ]),
        question("q-air-2", "How well is your content tagged and categorised?", "", [
          option("q-air-2-a", "Minimal or no tagging — content is hard to find and filter", [{ dimId: dims["ai-readiness"], pts: 0 }]),
          option("q-air-2-b", "Basic categories exist but tagging is inconsistent", [{ dimId: dims["ai-readiness"], pts: 1 }]),
          option("q-air-2-c", "We have a taxonomy and most content is tagged, but gaps remain", [{ dimId: dims["ai-readiness"], pts: 2 }]),
          option("q-air-2-d", "Comprehensive taxonomy with consistent metadata, automated tagging, and semantic enrichment", [{ dimId: dims["ai-readiness"], pts: 3 }]),
        ]),
        question("q-air-3", "How is your organisation using AI with content today?", "", [
          option("q-air-3-a", "We're not using AI with content in any meaningful way", [{ dimId: dims["ai-readiness"], pts: 0 }]),
          option("q-air-3-b", "Some teams experiment with AI writing tools but there's no strategy", [{ dimId: dims["ai-readiness"], pts: 1 }]),
          option("q-air-3-c", "We use AI for specific tasks (drafting, summarisation, translation) with guidelines", [{ dimId: dims["ai-readiness"], pts: 2 }]),
          option("q-air-3-d", "AI is integrated into content workflows for creation, personalisation, optimisation, and governance", [{ dimId: dims["ai-readiness"], pts: 3 }]),
        ]),
      ],
    },
  ];

  // 3. Create the assessment
  console.log("\nCreating assessment...");
  const assessment = await createDoc({
    _type: "assessment",
    title: "Content Operations Maturity Assessment",
    slug: { _type: "slug", current: "content-operations-maturity" },
    subtitle: "Discover where your content operations stand — and where they need to go.",
    introText: "This assessment evaluates six dimensions of content operations maturity: Strategy, Governance, Workflow, Technology, Measurement, and AI Readiness. Your personalised results will identify specific gaps and map them to practical next steps. It takes about 5 minutes.",
    estimatedMinutes: 5,
    resultsIntro: "Your Content Operations Maturity Report",
    resultsCtaHeading: "Ready to close the gaps?",
    resultsCtaBody: "Our team designs the systems, workflows, and governance frameworks that move organisations from reactive content to strategic infrastructure. Let's talk about what your results mean in practice.",
    sections,
  });

  // 4. Create maturity bands
  console.log("\nCreating maturity bands...");
  const bandData = [
    { title: "Ad Hoc", level: 1, minScore: 0, maxScore: 25, headline: "Your content operations are largely reactive.", description: "Content is created on demand without clear processes, ownership, or standards. Teams compensate through individual effort rather than repeatable systems. AI adoption is blocked by unstructured, ungoverned content. This is a common starting point — and a solvable one.", color: "#EF4444" },
    { title: "Developing", level: 2, minScore: 26, maxScore: 50, headline: "Foundations exist but aren't consistently applied.", description: "Some processes and standards are in place, but they vary across teams and channels. Technology is partially configured but underutilised. Content performance is tracked in pockets, not systematically. AI projects are starting but face data quality issues.", color: "#F59E0B" },
    { title: "Structured", level: 3, minScore: 51, maxScore: 75, headline: "Content operations are defined and repeatable.", description: "Clear workflows, governance, and technology are in place across most teams. Content is planned strategically and measured consistently. The organisation is ready to leverage AI for personalisation and automation — though gaps remain in content structure and metadata.", color: "#3B82F6" },
    { title: "Optimised", level: 4, minScore: 76, maxScore: 100, headline: "Content operates as strategic infrastructure.", description: "Content is treated as a core business asset with mature governance, efficient workflows, and fully integrated technology. Performance data drives decisions. Content is AI-ready: well-structured, richly tagged, and continuously optimised. You are operating at the frontier.", color: "#AAF870" },
  ];

  for (const b of bandData) {
    await createDoc({
      _type: "maturityBand",
      ...b,
      assessment: { _type: "reference", _ref: assessment._id },
    });
  }

  // 5. Create service recommendations
  console.log("\nCreating service recommendations...");
  const services = await query(`*[_type == "service"]{_id, category}`);
  const serviceMap = {};
  for (const s of (services || [])) {
    serviceMap[s.category] = s._id;
  }

  const recData = [
    { title: "Content Strategy Development", dimension: "strategy", summary: "Define content objectives, audience segments, and a roadmap that connects content activity to business outcomes.", priority: 1, minBandLevel: 3, svcCat: "services" },
    { title: "Content Audit & Gap Analysis", dimension: "strategy", summary: "Audit existing content against business goals to identify what's missing, what's redundant, and what needs restructuring.", priority: 2, minBandLevel: 4, svcCat: "services" },
    { title: "Content Governance Framework", dimension: "governance", summary: "Establish roles, standards, approval workflows, and lifecycle rules that keep content consistent, compliant, and current.", priority: 1, minBandLevel: 3, svcCat: "services" },
    { title: "Content Quality Standards", dimension: "governance", summary: "Create practical style guides, templates, and quality checklists that teams can actually use day-to-day.", priority: 2, minBandLevel: 4, svcCat: "services" },
    { title: "Workflow Design & Optimisation", dimension: "workflow", summary: "Map, redesign, and automate content workflows from briefing through publication to reduce bottlenecks and turnaround time.", priority: 1, minBandLevel: 3, svcCat: "services" },
    { title: "Content Operations Training", dimension: "workflow", summary: "Upskill teams on efficient content production practices, tool usage, and cross-functional collaboration.", priority: 2, minBandLevel: 4, svcCat: "services" },
    { title: "CMS Optimisation & Configuration", dimension: "technology", summary: "Audit and optimise your CMS setup — templates, workflows, permissions, and integrations — so the platform works for you, not against you.", priority: 1, minBandLevel: 3, svcCat: "technology" },
    { title: "Content Platform Selection", dimension: "technology", summary: "Evaluate CMS, DAM, and DXP options against your real requirements, cutting through vendor noise to find the right fit.", priority: 2, minBandLevel: 4, svcCat: "technology" },
    { title: "Content Performance Dashboard", dimension: "measurement", summary: "Set up reporting that connects content activity to business outcomes — so you know what's working and what to cut.", priority: 1, minBandLevel: 3, svcCat: "services" },
    { title: "Content KPI Framework", dimension: "measurement", summary: "Define meaningful content KPIs aligned to business goals, moving beyond vanity metrics to actionable insight.", priority: 2, minBandLevel: 4, svcCat: "services" },
    { title: "AI-Ready Content Architecture", dimension: "ai-readiness", summary: "Structure, tag, and model your content so AI systems can reliably find, understand, and surface the right information.", priority: 1, minBandLevel: 3, svcCat: "technology" },
    { title: "Content Metadata & Taxonomy Design", dimension: "ai-readiness", summary: "Design and implement taxonomies, metadata schemas, and content models that make content machine-readable and AI-ready.", priority: 2, minBandLevel: 4, svcCat: "technology" },
  ];

  for (const r of recData) {
    await createDoc({
      _type: "serviceRecommendation",
      title: r.title,
      dimension: { _type: "reference", _ref: dims[r.dimension] },
      summary: r.summary,
      priority: r.priority,
      minBandLevel: r.minBandLevel,
      ...(serviceMap[r.svcCat] ? { service: { _type: "reference", _ref: serviceMap[r.svcCat] } } : {}),
    });
  }

  console.log("\n━━━ Seed complete! ━━━");
  console.log(`\nAssessment ID: ${assessment._id}`);
  console.log(`URL: /assessment/content-operations-maturity\n`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

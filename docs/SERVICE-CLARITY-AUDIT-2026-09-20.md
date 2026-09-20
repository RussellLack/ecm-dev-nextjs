# Service Clarity and Audience Alignment Audit

Status: analysis, requested 2026-09-20. Read-only, no copy, pricing, code, or CMS
content was changed to produce this file. Everything below "Priority fix list" is
a recommendation requiring an explicit go-ahead before implementation, the same
discipline `CONTENT-PILLARS-POSITIONING.md` used for its own open items.

## Method

Read directly: `app/page.tsx`, `app/about/page.tsx`, `app/build/page.tsx`,
`components/Header.tsx`, `app/content-technology`, `app/content-services`,
`app/content-localization`, `components/ContentAuditTiers.tsx`,
`app/assessments/page.tsx`, `app/assessment/*`, `docs/ASSESSMENT-ARCHITECTURE.md`,
`docs/CMS-IMPLEMENTATION-ASSESSMENT-FORM.md`, `docs/CONTENT-PILLARS-POSITIONING.md`,
`app/methodology`, `app/case-study`, `app/problems`, `app/solutions`, plus git
history for the pages above. Cross-checked against the `ecm-dev-business-analysis`
and `icp-framework` skills for the canonical, already-agreed facts about pricing,
territory, and target buyer. A subagent inventoried the remaining Sanity-driven
pages (`/platforms`, `/industries`, `/solutions`, `/problems`, `llms.txt`, footer)
to confirm the pattern held site-wide, not just on the pages read directly.

## Headline finding

The live site runs three positioning narratives at once, and they describe three
different businesses, not three phrasings of one business.

1. **"Pipeline infrastructure for B2B marketing teams"** (homepage hero, `/about`,
   `/build`). Code comments call this "the outbound-stack repositioning brief."
   It sells prospect lists, qualification tools, landing flows, and CRM-connected
   workflows, three tiers: free assessment, fixed-scope build from EUR 1,500,
   monthly retainer. `/about` explicitly disclaims the categories the rest of the
   site uses: "Not an agency. Not a RevOps consultancy. Not a content shop."
2. **"AI Content Readiness Audit"** (a strip embedded in the homepage, feeding
   into `/content-services`). Sells a scan of a content estate against AI
   answer-engine retrievability, live since early September, still being
   polished today (layout and dark-mode commits this morning).
3. **Three-pillar content infrastructure model** (Content Technology, Content
   Operations, Content Localisation). This is what `components/Header.tsx`,
   `Footer.tsx`, `/content-technology`, `/content-services`, `/content-localization`,
   `/platforms/[slug]`, `/industries/[slug]`, `/case-study`, and `app/llms.txt`
   all speak. `docs/CONTENT-PILLARS-POSITIONING.md`, added this morning at 09:06
   UTC, writes this narrative up formally and flags "homepage/component
   implementation, explicitly deferred" as an open item, without noting that the
   homepage was already running narrative 1, not a blank page waiting for this
   one.

Git history shows narrative 1 is not a stray draft: `app/page.tsx` was committed
to four times today (09:19 through 10:22 UTC) refining the existing outbound-stack
homepage, in parallel with the pillars doc landing at 09:06. Nobody has yet
decided which of these three is the business, and a visitor can hit direct
contradictions between them inside a single session (below).

## 1. Contradictions a visitor can actually hit

- **Price and currency disagree with themselves.** The canonical, already-agreed
  figures (`ecm-dev-business-analysis` skill) are USD: Snapshot $2,000 to $3,000,
  Full Audit $12,000 to $15,000. `components/ContentAuditTiers.tsx` (shown on
  all three pillar pages) shows EUR, single points not ranges: "From EUR 2,000"
  and "From EUR 12,000." The homepage's separate three-step offer ladder shows a
  third figure, "From EUR 1,500," for something else again (a fixed-scope
  build). None of these are GBP, despite the ICP being UK-primary with Ireland
  approved-adjacent and the Nordics under a hard non-compete wall.
- **The free offer and the paid tiers contradict each other live, today.** The
  homepage audit strip currently reads "Free for audits requested before 30
  September" (`AUDIT_OFFER_ENDS`, ten days from now), with a code comment
  explaining the paid framing should only render after that date. `ContentAuditTiers`,
  the pricing block embedded on all three pillar pages, has no such date check:
  it always shows the paid EUR 2,000 / EUR 12,000 tiers. A visitor who reads the
  homepage strip, then clicks through to `/content-technology`, sees a paid price
  for what was just offered free.
- **A homepage claim about the flagship assessment is false against the tool it
  points to.** The offer ladder's step 1 copy says the free assessment scores
  "six dimensions... Not a maturity model, a practical order of work." The tool
  it links to (`content-operations-maturity`) is explicitly built as a four-band
  maturity model (Ad Hoc, Developing, Structured, Optimised) per
  `docs/ASSESSMENT-ARCHITECTURE.md` and its own Sanity schema.
- **The same pillar has three names.** Nav and footer call it "Content
  Operations." The page it links to lives at `/content-services`. The Projects
  page (`/case-study`) metadata calls it "content services." The assessment tied
  to it is the "Content Operations Maturity Assessment" in the nav copy but the
  "Content Infrastructure Maturity Assessment" in the architecture doc. Small
  individually, but it means there is no one term a visitor, or a search engine,
  can learn to associate with this offer.
- **`/methodology` is not what its URL promises.** It reads as the site's general
  "how we work" page, a plausible next click from `/about`, but is scoped
  entirely to the Localisation Cost Estimator's coefficient sources. It is also
  not linked from the nav at all, so it is only reachable from inside that one
  assessment.

## 2. Audience clarity

The actual ICP is specific and already written down (`icp-framework` skill,
worked example for this exact business): content-heavy organisations on a
non-Microsoft or mixed AI stack, GBP 5M to GBP 250M revenue or 50 to 2,000
employees (a ceiling as much as a floor, to keep the sale a single-signature
decision), UK primary with Ireland adjacent, actively mid-AI-rollout rather than
"considering AI," and an explicit decline list: Copilot-first buyers, estates too
small to produce defensible findings, buyers who actually want unbounded
consulting, buyers who want a certification or warranty this offer was never
designed to give.

None of that reaches the site as written:

- The clearest audience phrase anywhere is "enterprise marketing teams"
  (`/problems`, `/solutions` metadata), repeated site-wide. That is close to the
  opposite of the documented ICP, which explicitly avoids enterprise-scale
  buyers because a procurement committee stalls or kills the sale.
- The CMS Implementation Cost Estimator, the single richest piece of
  segmentation logic on the site (company size, industry, region, current
  platform), goes all the way up to "global enterprise, 10,000+ employees," with
  no signal anywhere that this segment is outside the fit the rest of the
  business is built for.
- There is no "who this is for" or "who this isn't for" statement on the whole
  site. A Copilot-first buyer, a five-page brochure site, or a 10,000-person
  enterprise gets no signal to self-select out before filling in a form, which
  is exactly the tempting-but-wrong deal the ICP framework's decline list exists
  to head off.
- The territorial wall (never the Nordics, UK primary, Ireland adjacent) is
  nowhere on the site. A Finnish or Swedish visitor has no way to know they are
  out of scope before submitting a contact form.
- `/about`, the one page whose job is "who is behind this," never says. It is
  written entirely in company voice ("we," "ECM.DEV"), no name, no bio, no
  credential. That is a real mismatch: the actual sales model
  (`ecm-dev-business-analysis`) is a solo-operator practice where "Russell's
  judgment, delivered as a written report and a live readout, is the thing being
  sold," explicitly not sub-contracted, explicitly not an anonymous team. The
  page reads like agency boilerplate for a business whose entire pitch is one
  named person's judgment.

## 3. Assessments and onboarding against the services actually being sold

| Tool | Gated | What it actually measures | Maps to a pillar? |
| --- | --- | --- | --- |
| `content-operations-maturity` (flagship, "Start here," every CTA points here) | No | Six dimensions: Strategy, Governance, Workflow, Technology, Measurement, AI Readiness | No single pillar. Spans all three by design, so the site's one universal front door does not lead cleanly to any one priced offer. |
| `cms-implementation` | Yes (email) | Full CMS/DXP/ECM replatform TCO, 12 inputs including company size, industry, current and target platform | Content Technology, cleanly. Best pillar fit on the site, and its firmographic fields are the richest ICP-relevant data collected anywhere, but that data never surfaces as site copy. |
| `process` | Yes (email) | A generic six-stage process diagnostic across 10 business domains (Finance, Sales/RevOps, HR, IT, Supply Chain, Compliance, Marketing & Content Ops is one of ten, General Ops, Other) | Not content-specific as built. `CONTENT-PILLARS-POSITIONING.md` proposes this as Content Operations' onboarding deliverable, calling it "close," but as shipped a visitor can run the whole thing on an HR or supply-chain process and never touch content at all. |
| `localisation-cost` | Yes (email) | Six-layer multilingual content-ops cost model, published methodology, quarterly-refreshed coefficients | Content Localisation, cleanly. Best-documented tool on the site (its own methodology page, changelog, confidence bands). |
| `lead-magnet` | Yes (email) | 13 questions on market position, authority, and capability, for choosing a lead-magnet content format | None of the three pillars. Belongs to narrative 1's world (content-marketing tactics for outbound), orphaned relative to the pillar model, and not something any of the priced tiers in the business skill actually delivers. |

Two structural problems fall out of this table:

- **The universal CTA does not lead anywhere specific.** Every homepage,
  header, and about-page CTA points at one ungated assessment that is
  deliberately broader than any single priced service. A visitor who finishes
  it and wants to buy has to work out for themselves which of Content
  Technology, Content Operations, or Content Localisation their weak areas
  actually belong to, the tool's own service-recommendation logic aside.
- **The tool proposed to carry the Content Operations pillar is not yet built
  for that job**, while the tool actually built for a different department's
  process mapping (Process Assessment) is the one on offer, and a genuinely
  orphaned marketing tool (Lead Magnet Ideation) sits on the same listing page
  with equal visual weight, priced the same in attention even though it is not
  part of what the business, per its own canonical positioning, sells.

## 4. Recommendation

Pick the three-pillar content infrastructure model (narrative 3) as the site's
single spine, and retire or fold narrative 1 (pipeline infrastructure for B2B
marketing teams) rather than trying to run both. Reasoning:

- Nav, footer, the CMS schema, `/platforms`, `/industries`, `/case-study`, and
  `llms.txt` are already built on it. Narrative 1 exists on three pages
  (home, about, build) and nowhere else, so more of the site would need to
  change to keep narrative 1 consistent than to retire it.
- It is the narrative closest to what the business actually, already sells
  (`ecm-dev-business-analysis`): a content AI-readiness audit and ongoing
  content-systems stewardship, not prospect lists, landing flows, or CRM
  workflows. Narrative 1 is a different offer with a different competitive set,
  the one `/about` itself disclaims ("not an agency, not a RevOps consultancy").
- It carries an ICP signal narrative 1 cannot: content-heavy organisations,
  named platforms, named industries. Narrative 1's audience is "B2B marketing
  teams," which fits almost anyone and therefore filters nobody.

This is a call for Russell to confirm, not something to implement unprompted:
it touches the homepage, `/about`, and `/build`, all recently and deliberately
written, and reversing that requires knowing whether the outbound-stack brief
still reflects live commercial intent or has simply not been reconciled with
yesterday's pillars work yet.

## 5. Priority fix list, if the direction above is confirmed

Not implemented. Ordered by dependency, not just size.

1. **Rewrite the homepage hero, `/about`, and `/build` off the pillar model.**
   (Large; everything else reads as half-finished while this is unresolved.)
2. **Reconcile audit pricing to one currency and one set of figures.**
   Recommend GBP, matching the UK-primary ICP, and apply the same date-gated
   free/paid logic everywhere the price appears, not just the homepage strip.
   (Small, and time-sensitive: the current free-offer copy expires in ten
   days.)
3. **Add an explicit "who this is for, and who it isn't" statement**, using the
   ICP's segment lens, size band, and decline list directly, probably on
   `/about` and echoed on the homepage. (Small to write, meaningful to have.)
4. **Fix the nav-label to URL drift**: either rename `/content-services` to
   `/content-operations` with a redirect, or standardise every surface on
   "Content Services." Pick one string and use it everywhere the pillar is
   named. (Small, mind the SEO redirect.)
5. **Rescope the Process Assessment to be content/governance-specific**, or
   stop describing it as the Content Operations onboarding deliverable until
   it is. (Medium.)
6. **Decide the flagship assessment's job.** Either narrow
   `content-operations-maturity` to genuinely serve one pillar, or keep it
   cross-pillar but present it explicitly as a router ("which of the three do
   you need") rather than as a maturity model competing with the pillar-specific
   tools it should be feeding. (Medium to large: this is a scoring-model
   decision, not just copy.)
7. **Decide whether the Lead Magnet Ideation Tool stays.** It fits none of the
   three pillars as currently defined. Cut it, or name a fourth service line it
   belongs to. (Small decision, the harder question is which.)
8. **Rename or nav-place `/methodology`** so its scope (the localisation
   estimator specifically) is clear before a visitor opens it expecting a
   general practice page.
9. **Give `/about` a founder-identity element** consistent with the actual
   sales model: one named person's judgment, not an anonymous team.

## Open items for a follow-up session

- A decision on narrative 1 versus narrative 3 (section 4), which everything
  else here depends on.
- Whether "Content Audit" (the shared `ContentAuditTiers` component) should be
  the same product as the "AI Content Readiness Audit" strip, or a formally
  separate one; today they overlap in substance but not in name or price.
- Pricing/packaging structure for the two other pillars' managed packages,
  already flagged as open in `CONTENT-PILLARS-POSITIONING.md` and unaffected by
  this audit.
- Whether the outbound-stack tools (prospect lists, landing flows, CRM
  workflows) described in narrative 1 should survive as a fourth, clearly
  separate service line rather than being cut outright, if there is live
  client demand for them today.

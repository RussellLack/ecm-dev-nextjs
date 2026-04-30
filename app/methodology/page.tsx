import type { Metadata } from "next";
import Link from "next/link";
import { MODEL_VERSION, MODEL_LAST_REVIEWED } from "@/lib/estimator/coefficients";
import AssessmentNextSteps from "@/components/assessment/AssessmentNextSteps";

export const metadata: Metadata = {
  title: "Methodology — Localisation Cost Estimator | ECM.DEV",
  description:
    "The working paper behind the Localisation Cost Estimator. Every coefficient, every source, every known limitation.",
  openGraph: {
    title: "Methodology — Localisation Cost Estimator",
    description:
      "The working paper behind the Localisation Cost Estimator. Every coefficient, every source, every known limitation.",
    type: "website",
  },
};

export default async function MethodologyPage() {
  return (
    <>
      {/* Hero — matches Assessments landing page style */}
      <section className="relative overflow-hidden bg-ecm-green py-14 pb-24 sm:py-20 sm:pb-28 lg:py-28 lg:pb-36">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="mb-3 font-barlow text-xs font-bold uppercase tracking-[0.14em] text-ecm-lime/80">
            ECM.DEV · Methodology
          </div>
          <h1 className="mb-4 font-barlow text-3xl font-bold text-ecm-lime sm:text-4xl lg:text-5xl">
            How the Localisation Cost Estimator works
          </h1>
          <p className="mx-auto max-w-2xl font-barlow text-lg text-white/80">
            Every coefficient the model uses, where each one comes from, and why we think it is
            roughly right. Where we are not sure, we say so.
          </p>
          <div className="mt-5 inline-block rounded-full border border-ecm-lime/40 bg-ecm-green-dark/40 px-4 py-1.5 font-barlow text-xs text-white/80">
            Model version <strong className="text-ecm-lime">{MODEL_VERSION}</strong> · Last
            reviewed {MODEL_LAST_REVIEWED} · Next scheduled review July 2026
          </div>
        </div>
        <div className="wave-divider wave-divider-bottom">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="#ffffff" />
          </svg>
        </div>
      </section>

      {/* Body */}
      <section className="bg-white py-12 sm:py-16">
        <article className="mx-auto max-w-3xl px-6 font-barlow text-base leading-relaxed text-ecm-gray-dark">
          <H2>What this page is</H2>
          <P>
            This is not a brochure. It is the working paper that underlies the Localisation Cost
            Estimator at{" "}
            <Link href="/assessment/localisation-cost" className="text-ecm-green underline hover:text-ecm-green-dark">
              ecm.dev/assessment/localisation-cost
            </Link>
            . It sets out every coefficient the model uses, where each one comes from, and why we
            think it is roughly right. Where we are not sure, we say so.
          </P>
          <P>
            The estimator is a research preview. That status is not a disclaimer — it is the truth
            about where the model sits today. Version 0.2 of the model was built from public
            benchmarks, published LLM pricing, and informed estimates based on ECM.dev&apos;s own
            work with content operations. It has not yet been pressure-tested against a large
            dataset of real organisational spend, which is why every output carries a ±30%
            confidence band and why every user is invited to tell us whether the number they see
            feels right.
          </P>
          <P>
            The model will be refined quarterly. Each refresh will appear as a dated entry in the{" "}
            <a href="#changelog" className="text-ecm-green underline hover:text-ecm-green-dark">
              changelog
            </a>{" "}
            at the bottom of this page, showing what changed and why. Where user feedback has
            pulled a coefficient in a particular direction, the changelog will say so.
          </P>
          <P>
            We publish all of this because we think it is the only honest way to do it. A cost
            estimator that hides its assumptions is not a cost estimator; it is a rhetorical
            device.
          </P>

          <H2>Why six layers</H2>
          <P>
            Most localisation cost calculators model two things: the number of words, and the cost
            per word. That approach describes a supply chain built in 2005. It is not wrong,
            exactly; it is just radically incomplete.
          </P>
          <P>
            Real content operations carry five kinds of cost beyond per-word translation. The tool
            surfaces all six:
          </P>
          <Dl>
            <Dt>Translation</Dt>
            <Dd>
              The per-word layer that traditional models show. Human rates, machine translation
              with post-edit, AI translation with evaluation — blended into a single effective rate
              that depends on the organisation&apos;s AI maturity.
            </Dd>
            <Dt>Production</Dt>
            <Dd>
              Project management, linguistic quality assurance, in-country review, desktop
              publishing, multimedia adaptation, engineering integration. Typically 25–50% on top
              of translation in an AI-augmented operation, 30–60% in a traditional one. Usually
              invisible in vendor quotes because it is buried inside a per-word rate.
            </Dd>
            <Dt>Channel adaptation</Dt>
            <Dd>
              The same translated asset costs more to finish for video than for a knowledge base
              than for a UI string than for a voice assistant. AI compresses this curve for
              text-heavy channels and is starting to do the same for audio, but raises it for
              brand-sensitive channels like marketing.
            </Dd>
            <Dt>System and governance</Dt>
            <Dd>
              TMS subscriptions, connectors, glossary management, brand governance, vendor
              management overhead, internal review cycles. Persistent and hidden.
            </Dd>
            <Dt>AI operations</Dt>
            <Dd>
              The cost centres introduced by AI-in-the-loop: LLM API spend, prompt library
              maintenance, evaluation infrastructure, AI governance, human-in-the-loop review of AI
              output, regulatory compliance overhead where it applies. In mature operations this is
              8–18% of total spend; in immature operations where AI is bolted onto legacy
              workflows, it can be higher and deliver less value.
            </Dd>
            <Dt>Friction</Dt>
            <Dd>
              Rework, version drift, missed reuse, fragmented vendor brief-back, duplicate AI spend
              across teams, brand voice erosion from unreviewed AI output. Usually 15–25% of total
              spend, almost never measured.
            </Dd>
          </Dl>
          <P>
            The friction layer is why the model exists. It is the category of cost that legacy
            calculators cannot see and that operators know is there but cannot quantify.
          </P>

          <H2>The coefficients, layer by layer</H2>
          <P>
            All monetary values are USD at a 1M-word reference scale. Volume-sensitive coefficients
            are multiplied by a scale factor explained further down. User-facing display converts
            to EUR via a snapshot FX rate (refreshed weekly in production).
          </P>

          <H3>Translation layer</H3>
          <P>
            The translation unit rate is a blended portfolio rate across the language pairs English
            to French, German, Spanish, Italian, Dutch, Japanese, Chinese (simplified), Korean,
            Polish, Portuguese, and Swedish — the language set covered by most European-enterprise
            localisation operations. The blend weights are approximately equal, with slight
            emphasis on the major European languages.
          </P>
          <P>Three unit rates underlie the translation layer:</P>
          <Ul>
            <Li>
              <strong>Human translation: $0.16 per source word.</strong> Source: CSA Research 2024
              Rate Survey (as reported in Slator&apos;s 2024 LSP Pricing Review); cross-referenced
              with Nimdzi Insights 2024 rate benchmarks. Refreshes expected to pull this slightly
              upward in 2026 based on tightening linguist supply in some language pairs.
            </Li>
            <Li>
              <strong>Machine translation with human post-edit: $0.06 per source word.</strong>{" "}
              Source: Slator 2024 MT Pricing Report, blended across major LSP tiers. This figure
              has been falling steadily as MT quality improves and post-edit effort per word
              declines; the 2026 refresh will likely adjust downward.
            </Li>
            <Li>
              <strong>AI translation with evaluation pass: $0.03 per source word.</strong> Source:
              ECM.dev estimate, calibrated against published LLM API pricing and typical
              prompt-plus-eval workflow cost. This is the least well-anchored unit rate in the
              model because public benchmarks for production-grade AI translation pricing remain
              thin. User feedback is especially valuable here.
            </Li>
          </Ul>
          <P>
            The effective translation rate is a weighted blend of these three unit rates, with
            weights determined by the organisation&apos;s AI maturity level (see &ldquo;How AI
            maturity reshapes cost&rdquo; below).
          </P>
          <P>
            Translation memory leverage is applied as a discount on the blended rate, ranging from
            10% for rare or one-off content to 40% for continuously updated content. Source:
            CSA/Nimdzi TM-leverage benchmarks and ECM.dev project experience.
          </P>

          <H3>Production layer</H3>
          <P>
            Production adds a multiplier on top of translation, depending on content type. The
            model carries two values per content type — a base multiplier for a traditional
            operation and an AI-mature multiplier for an operation where AI has compressed part of
            the production work. The effective multiplier interpolates between the two, weighted by
            AI maturity level.
          </P>
          <Ul>
            <Li>
              <strong>Marketing: 1.60 base, 1.35 AI-mature.</strong> Transcreation and brand review
              resist automation. Source: CSA project-premium survey plus ECM.dev estimate.
            </Li>
            <Li>
              <strong>Product and UI: 1.40 base, 1.20 AI-mature.</strong> String management,
              engineering integration, contextual QA. Source: Slator tech-localisation benchmarks.
            </Li>
            <Li>
              <strong>Support and knowledge base: 1.30 base, 1.10 AI-mature.</strong> Among the
              highest AI compression because review is lighter. Source: ECM.dev estimate.
            </Li>
            <Li>
              <strong>Legal and regulatory: 1.80 base, 1.65 AI-mature.</strong> In-country legal
              review remains substantially human. Source: ECM.dev estimate; limited public
              benchmarks.
            </Li>
            <Li>
              <strong>Video: 3.20 base, 2.60 AI-mature.</strong> Subtitling, dubbing, sync, audio
              QA. Source: Slator 2024 Media Localisation Report.
            </Li>
            <Li>
              <strong>Training and learning: 1.60 base, 1.35 AI-mature.</strong> Multimedia plus
              pedagogical review. Source: Nimdzi LMS benchmarks.
            </Li>
          </Ul>

          <H3>Channel adaptation layer</H3>
          <P>
            Channel factors are multipliers applied to translated volume. The web channel is the
            baseline at 1.0x. Factors range from 0.95x for email (the most AI-compressible channel)
            to 2.60x for video/audio. Each channel carries a base and AI-mature factor; the model
            interpolates by maturity, as with production.
          </P>
          <P>
            Channel factors and sources: web 1.00/1.00 (baseline); mobile app 1.10/1.05 (UI
            constraints); in-product strings 1.20/1.10 (engineering integration); video/audio
            2.60/2.10 (Slator media-loc 2024); print 1.30/1.20 (DTP, proofing); email 1.00/0.95
            (most compressible); social 1.10/0.95 (short-form, AI-adaptable); voice and chat
            1.40/1.15 (emerging benchmarks).
          </P>
          <P>
            The in-product, voice/chat, and social factors carry the most uncertainty because
            public benchmarks are thin for these channels in a post-AI operating model.
          </P>

          <H3>System and governance layer</H3>
          <P>Four components:</P>
          <P>
            The base tooling cost is <strong>$30,000/year at the 1M-word reference scale</strong>,
            scaled by the volume scale factor. This represents a typical mid-market TMS
            subscription plus connectors, glossary tooling, and integration maintenance. Source:
            Slator TMS pricing 2024 plus ECM.dev estimate. The scale factor ensures a 100,000-word
            operation is not charged enterprise-level tooling cost; a 10M-word operation carries
            tooling commensurate with its scale.
          </P>
          <P>
            Glossary management runs at <strong>3% of translation cost</strong> — a CSA governance
            benchmark for well-maintained operations. Poorly-maintained glossaries cost more in
            rework, which the friction layer captures.
          </P>
          <P>
            Vendor management overhead runs at <strong>7% of translation cost</strong>. Source: CSA
            2024 vendor-management survey. Single-LSP operations sit lower; multi-LSP or in-house
            operations sit higher.
          </P>
          <P>
            Internal review runs at <strong>12% of translation cost</strong>. This is an ECM.dev
            estimate based on client patterns; the figure varies widely in practice (from 5% in
            streamlined ops to 25% in review-heavy cultures), which is why the layer carries
            significant uncertainty.
          </P>

          <H3>AI Operations layer</H3>
          <P>
            This layer is the newest and the weakest-anchored — the one where user feedback will
            move coefficients most.
          </P>
          <P>
            <strong>LLM API spend</strong> runs at $0.80 per 1,000 translated words at full AI
            intensity. This is a blend of Claude, GPT-4-class, and smaller models at typical
            loc-workflow prompting patterns. Source: published LLM API pricing at May 2025. This
            coefficient is almost certainly stale at the time of any given refresh; LLM pricing has
            historically dropped roughly 10× every 18–24 months. The quarterly refresh cadence
            exists primarily to address this coefficient.
          </P>
          <P>
            <strong>Prompt library and evaluation infrastructure:</strong> $25,000/year at 1M-word
            reference scale, scaled by volume and modulated by AI intensity. This covers
            maintaining prompt sets, writing and running evaluation suites, debugging drift, and
            keeping the AI layer honest. Source: ECM.dev estimate.
          </P>
          <P>
            <strong>AI governance baseline:</strong> $35,000/year at 1M-word reference scale. Brand
            guardrails, safety review, model operations. Scales with volume and AI intensity.
            Source: ECM.dev estimate.
          </P>
          <P>
            <strong>Regulated-industry governance uplift:</strong> $80,000/year at 1M-word
            reference scale, applied only when the user indicates a regulated-industry context.
            Covers EU AI Act obligations, financial services sectoral compliance, healthcare data
            governance, and similar. Scales sub-linearly with volume because compliance cost has a
            large fixed component — a 100,000-word regulated operation still needs most of the
            same compliance infrastructure as a 1M-word one. Source: ECM.dev estimate; limited
            public benchmarks exist for AI-specific compliance overhead.
          </P>
          <P>
            <strong>Human-in-the-loop AI review:</strong> 22% uplift on AI-touched translation
            work. Hallucination detection, brand voice verification, contextual spot-checks. Scales
            with translation cost and AI intensity. Source: ECM.dev estimate based on client
            patterns; genuinely varies from 10% to 40% depending on content sensitivity.
          </P>
          <P>
            <strong>AI intensity by maturity level</strong> modulates all of the above: Level 0 =
            0.0 (no AI, no AI ops cost), Level 1 = 0.3 (ad-hoc AI), Level 2 = 0.7 (systematic
            MT+PE), Level 3 = 1.2 (AI in creation and translation), Level 4 = 1.6 (fully AI-native).
            The intensity curve reflects that AI-native operations spend materially <em>more</em>{" "}
            on the AI operations layer than partially-adopted ones, even as they spend less on
            translation — because sophisticated AI workflows require serious investment in
            evaluation, governance, and prompt infrastructure.
          </P>

          <H3>Friction layer</H3>
          <P>The friction coefficient is derived from three inputs the user provides directly:</P>
          <Equation>
            Friction = min(30%, 5% base + rework × 4% + fragmentation × 3% + AI coordination gap ×
            5%)
          </Equation>
          <P>
            The base coefficient of 5% represents a well-run, integrated operation. Each additional
            point on the rework scale (0–3) adds 4%; each point on the tooling fragmentation scale
            (0–3) adds 3%; each point on the AI coordination gap (0–3) adds 5%. The highest weight
            sits on AI coordination because this is the single most predictive signal of an
            organisation that has bought AI tools but not redesigned the operating model to absorb
            them. The coefficient is capped at 30% — past that, the organisation is probably not
            running a functional operation and the model&apos;s other assumptions start to break
            down.
          </P>
          <P>
            Friction cost applies to the sum of translation, production, channel adaptation, and AI
            operations. It does not apply to system and governance, which are largely fixed
            regardless of how well or badly the operation runs.
          </P>

          <H2>How AI maturity reshapes cost</H2>
          <P>
            The model carries a single AI maturity dial from Level 0 to Level 4. It does three
            things simultaneously:
          </P>
          <P>
            It <strong>reshapes the translation rate blend</strong>. At Level 0, the blend is 100%
            human translation. At Level 2, it is 50% human, 40% machine translation with post-edit,
            10% AI with evaluation. At Level 4, it is 10% human, 20% MT+PE, 70% AI+eval. The
            blended unit rate drops from $0.16 per word at Level 0 to $0.05 per word at Level 4 —
            a 3× compression on the translation layer alone.
          </P>
          <P>
            It <strong>changes the production and channel multipliers</strong>. Each multiplier
            interpolates between its &ldquo;base&rdquo; (traditional) value and its
            &ldquo;AI-mature&rdquo; value, with the weight equal to maturity_level ÷ 4. A fully
            traditional operation uses base multipliers; a fully AI-native one uses mature
            multipliers; everywhere in between is a linear blend. The interpolation is linear for
            simplicity; in reality it is probably non-linear, and this is a known simplification
            the refresh cycle may address.
          </P>
          <P>
            It <strong>scales the AI Operations layer</strong>. As maturity rises, AI operations
            cost rises materially — more LLM API spend, more eval infrastructure, more governance.
            This is why the tool shows the AI Operations layer growing (not shrinking) as
            organisations become more AI-mature. Mature AI-native operations pay for
            sophistication; they get it back in the other layers.
          </P>
          <P>
            This three-way interaction is the core insight the model wants to make visible. Moving
            up one maturity level is not a one-dimensional improvement. It redistributes cost
            across layers rather than eliminating it — and in some cases (small operations,
            operations with high friction) the redistribution is not net-positive unless the
            underlying operating model is fixed first.
          </P>

          <H2>Volume scaling — why fixed costs are not fixed</H2>
          <P>
            An earlier version of this model treated base tooling, AI governance, and prompt
            infrastructure as flat per-year costs. That worked for 1M-word operations and larger
            but produced absurd results at smaller scales — a 100,000-word operation was charged
            the same $60,000 base tooling as a 10M-word enterprise.
          </P>
          <P>Version 0.2 applies a scale factor to all nominally-fixed costs:</P>
          <Equation>scale_factor = max(0.15, (volume ÷ 1,000,000)^0.6)</Equation>
          <P>
            The 0.6 exponent produces genuine sub-linear scaling: a 10× increase in volume produces
            roughly a 4× increase in fixed costs, reflecting the real economics of content
            operations tooling. The 0.15 floor prevents the fixed-cost layers collapsing to
            near-zero for very small operations, which would overstate how efficiently they can be
            run.
          </P>
          <P>
            The regulated-industry uplift uses a gentler blend:{" "}
            <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm">
              reg_scale = 0.5 + 0.5 × scale_factor
            </code>
            . Compliance cost has a large genuinely-fixed component — a regulated operation needs
            the same basic AI Act documentation, audit trails, and governance framework whether it
            translates 100,000 or 10 million words per year. The fixed share of the regulated
            uplift is roughly half; the other half scales with volume.
          </P>

          <H2>Confidence band</H2>
          <P>All outputs carry a ±30% confidence band. That is wide. It is wide deliberately.</P>
          <P>
            At version 0.2, the model has not been pressure-tested against a large dataset of real
            organisational spend. Our coefficients are sourced from public benchmarks where those
            exist and ECM.dev estimates where they do not. For some coefficients — notably the AI
            maturity rate blends at Levels 3 and 4, the AI governance figures, and the friction
            weights — public benchmark data is genuinely thin and our estimates carry real
            uncertainty.
          </P>
          <P>
            A ±30% band is consistent with the practice in early-stage industry cost models where
            the direction of the number is defensible but the precise value depends on
            organisational specifics we cannot capture in a 25-input web form. As user feedback
            accumulates and coefficient drift is identified, the band will narrow. The target is
            ±20% by the end of the first 90 days post-launch, and ±15% by the end of the first
            year.
          </P>

          <H2>Refresh cadence and changelog commitment</H2>
          <P>
            The model is refreshed on a quarterly cadence. Each refresh is dated, documented, and
            justified in this page&apos;s changelog. Refreshes may include: updated public
            benchmark data (CSA, Slator, Nimdzi), updated LLM API pricing snapshots, revised
            coefficients informed by user feedback signals, and structural changes to the model
            itself where evidence warrants them.
          </P>
          <P>
            During the first 90 days — the research preview phase — we will refresh coefficients
            more frequently than quarterly, informally, as user feedback accumulates. The first
            public quarterly refresh will consolidate those informal updates and establish the
            rhythm going forward.
          </P>
          <P>
            If we make a material change that would shift a user&apos;s prior estimate by more than
            15%, we will say so explicitly in the changelog and explain why. Users who provided
            email addresses when using the tool will be notified of significant changes.
          </P>

          <H2>Known limitations</H2>
          <P>
            The model has real limitations. We list them here because the alternative is pretending
            they do not exist, which is a more expensive kind of dishonesty.
          </P>
          <P>
            <strong>Language-portfolio assumption.</strong> The translation rate blend assumes a
            roughly European-enterprise language portfolio. Organisations with heavily Asian,
            Middle Eastern, or emerging-market language mixes may see outputs that are 10–20% off
            in either direction. Version 0.3 is planned to address this by adding a
            language-portfolio weighting input.
          </P>
          <P>
            <strong>Single maturity dial.</strong> The AI maturity model treats
            &ldquo;maturity&rdquo; as a single dial. In reality, organisations often sit at
            different maturity levels across different parts of their operation (sophisticated AI
            in support content, legacy workflow in legal, for example). Version 0.3 may introduce a
            per-content-type maturity input to capture this.
          </P>
          <P>
            <strong>Friction weights.</strong> Friction weights are ECM.dev estimates and will move
            most as feedback accumulates. We think the direction of the weights is right (AI
            coordination is the highest-signal dimension, rework second, fragmentation third) but
            the absolute magnitudes carry real uncertainty.
          </P>
          <P>
            <strong>Delivery-model assumption.</strong> The model assumes a blended supply of LSP
            and internal-team delivery. Organisations that have fully in-sourced localisation or
            fully AI-automated translation without any LSP relationship may see the model under-
            or over-counting vendor management overhead.
          </P>
          <P>
            <strong>LLM pricing timescale.</strong> LLM pricing moves on a different timescale than
            localisation rates. Our quarterly refresh cadence is likely too slow to track LLM API
            pricing precisely. The model compensates by carrying the LLM coefficient as a
            clearly-flagged item with a visible &ldquo;last updated&rdquo; date.
          </P>
          <P>
            <strong>Binary regulated flag.</strong> The regulated-industry input is binary.
            Real regulation is a spectrum — EU AI Act obligations differ from FDA 21 CFR Part 11,
            which differ from GDPR cross-border transfer requirements. Future versions may
            introduce regulation-type-specific uplifts.
          </P>

          <H2 id="feedback-loop">How user feedback feeds back into the model</H2>
          <P>
            Every estimate the tool produces invites a response: does this feel right? Users can
            answer &ldquo;too low,&rdquo; &ldquo;about right,&rdquo; &ldquo;too high,&rdquo; or
            &ldquo;not sure,&rdquo; with an optional one-line field for &ldquo;where we missed
            it.&rdquo;
          </P>
          <P>
            Feedback is captured alongside the hashed, anonymised input profile that produced it —
            not the user&apos;s identity, not the organisation&apos;s identity, just the pattern of
            inputs that led to a particular output. Over time, systematic patterns in the feedback
            (a particular profile consistently producing &ldquo;too high&rdquo; estimates, for
            example) tell us where coefficients need to move.
          </P>
          <P>
            We do not treat user feedback as ground truth — a user who expected a lower number may
            be feeding their preference rather than their reality. But we do treat it as signal,
            especially when it is consistent across many users with similar profiles. Coefficient
            adjustments informed by user feedback will be flagged in the changelog.
          </P>
          <P>
            If you work in content operations and want to go deeper than the feedback form allows —
            for example if you want to walk us through your actual spend to help pressure-test
            specific coefficients — we would be grateful. There is a link at the bottom of the
            estimator output page to book 25 minutes.
          </P>

          <H2 id="changelog">Changelog</H2>
          <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 px-5 py-4">
            <div className="mb-1 font-barlow text-sm font-bold text-ecm-green">
              22 April 2026 — v0.2 (research preview launch)
            </div>
            <p className="mb-2 text-sm leading-relaxed text-ecm-gray-dark">
              Fixed-cost layers (base tooling, AI governance, prompt library, regulated uplift) now
              scale sub-linearly with volume using{" "}
              <code className="rounded bg-white px-1 py-0.5 font-mono text-[13px]">
                scale_factor = max(0.15, (volume/1M)^0.6)
              </code>
              . Previous v0.1 treated these as flat and produced implausibly high costs for small
              operations.
            </p>
            <p className="mb-2 text-sm leading-relaxed text-ecm-gray-dark">
              Default scenario lowered from 1M words / 8 languages to 250k / 6 languages,
              representative of a mid-sized international firm rather than a global enterprise.
            </p>
            <p className="text-sm leading-relaxed text-ecm-gray-dark">
              Base tooling baseline reduced from $60,000 (v0.1) to $30,000 (v0.2) at the 1M-word
              reference scale; AI governance baseline reduced from $50,000 to $35,000; prompt
              library baseline reduced from $40,000 to $25,000; regulated uplift reduced from
              $120,000 to $80,000. All four of these reductions reflect a more realistic picture of
              what a 1M-word operation actually spends when tooling and governance are not
              gold-plated.
            </p>
          </div>
          <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 px-5 py-4">
            <div className="mb-1 font-barlow text-sm font-bold text-ecm-gray">Earlier versions</div>
            <p className="text-sm leading-relaxed text-ecm-gray-dark">
              v0.1 was internal only; not publicly released.
            </p>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-4 border-t border-gray-200 pt-8">
            <Link
              href="/assessment/localisation-cost"
              className="inline-flex items-center gap-2 rounded-full bg-ecm-green px-6 py-3 font-barlow text-sm font-semibold text-white transition-colors hover:bg-ecm-green-dark"
            >
              ← Back to the estimator
            </Link>
            <span className="text-xs text-ecm-gray">
              Corrections, challenges, and suggestions:{" "}
              <Link href="/contact" className="text-ecm-green underline hover:text-ecm-green-dark">
                contact us
              </Link>
              .
            </span>
          </div>
        </article>
      </section>

      {/* Connectors: this methodology underlies the localisation pillar,
          so surface the matching pillar / guides / case studies / next
          assessments. Reuses the same component as the estimator results
          page for visual consistency. */}
      <AssessmentNextSteps
        pillars={["localization"]}
        currentSlug="localisation-cost"
        heading="Where to take this next"
      />
    </>
  );
}

// ───────── prose primitives ─────────

function H2({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2
      id={id}
      className="mb-4 mt-10 scroll-mt-24 border-b border-gray-200 pb-2 font-barlow text-2xl font-bold text-ecm-green sm:text-3xl"
    >
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 mt-6 font-barlow text-lg font-bold text-ecm-green-dark sm:text-xl">
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 leading-relaxed">{children}</p>;
}

function Ul({ children }: { children: React.ReactNode }) {
  return <ul className="mb-4 list-disc space-y-2 pl-6">{children}</ul>;
}
function Li({ children }: { children: React.ReactNode }) {
  return <li className="leading-relaxed">{children}</li>;
}

function Dl({ children }: { children: React.ReactNode }) {
  return <dl className="mb-4 space-y-3">{children}</dl>;
}
function Dt({ children }: { children: React.ReactNode }) {
  return <dt className="font-bold text-ecm-green-dark">{children}</dt>;
}
function Dd({ children }: { children: React.ReactNode }) {
  return <dd className="mb-2 pl-4 leading-relaxed">{children}</dd>;
}

function Equation({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 rounded-md border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm text-ecm-gray-dark">
      {children}
    </div>
  );
}

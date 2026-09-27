import Link from "next/link";
import {
  AUDIT_OFFER_COPY,
  CONTENT_AUDIT,
  TOOLS,
  UNGATED_ASSESSMENT_SLUGS,
  enquiryHref,
} from "@/lib/offers";
import { isAuditOfferOpen } from "@/lib/auditOffer";
import OfferViewTracker from "@/components/analytics/OfferViewTracker";
import { JOURNEY_OFFER } from "@/lib/analytics";
import { getAllAssessments } from "@/lib/assessment/queries";
import ShareLinkButton from "@/components/assessments/ShareLinkButton";
import PreviewButton from "@/components/assessments/PreviewButton";

export const revalidate = 3600;

export const metadata = {
  title: "Assessments | ECM.DEV",
  description:
    "Free self-checks and expert-led audits, grouped by what each one asks of you: no email, an email address, or a fixed-fee engagement.",
};

/**
 * Demo videos shown behind the "Preview" button on each card. Keyed by
 * assessment slug/id. Add an entry here when a new assessment gets a demo clip;
 * Sanity-authored assessments only show a preview if their slug is listed.
 */
const PREVIEW_VIDEOS: Record<string, { src: string; dur: string }> = {
  process: { src: "/assessment-previews/process.mp4", dur: "71s" },
  "lead-magnet": { src: "/assessment-previews/lead-magnet.mp4", dur: "34s" },
  "localisation-cost": {
    src: "/assessment-previews/localisation-cost.mp4",
    dur: "35s",
  },
  "cms-implementation": {
    src: "/assessment-previews/cms-implementation.mp4",
    dur: "35s",
  },
  "content-operations-maturity": {
    src: "/assessment-previews/content-operations-maturity.mp4",
    dur: "64s",
  },
};

/* ─── Icons (shared by every card) ─── */

function ClockIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

/* ─── One tool card. `id` is the share-link anchor: keep it stable. ─── */

type ToolCardProps = {
  id: string;
  title: string;
  subtitle?: string;
  intro?: string;
  duration?: string;
  detail?: string;
  href: string;
  ctaLabel: string;
  ungated: boolean;
  featured?: boolean;
};

function ToolCard({ id, title, subtitle, intro, duration, detail, href, ctaLabel, ungated, featured }: ToolCardProps) {
  const preview = PREVIEW_VIDEOS[id];
  return (
    <div
      id={id}
      className={`group relative rounded-2xl overflow-hidden transition-all scroll-mt-24 ${
        featured
          ? "bg-surface border-2 border-ecm-lime shadow-lg"
          : "bg-surface-alt border border-surface-border hover:shadow-lg"
      }`}
    >
      {featured && (
        <div className="absolute top-0 left-0 bg-ecm-lime text-ecm-green font-barlow font-bold text-xs uppercase tracking-wider px-4 py-1.5 rounded-br-xl">
          Start here
        </div>
      )}
      <div className={`p-8 sm:p-10 lg:p-12 ${featured ? "pt-14 sm:pt-16" : ""}`}>
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            <h3 className="text-heading font-barlow font-bold text-xl sm:text-2xl lg:text-3xl mb-3 group-hover:text-heading-dark transition-colors">
              {title}
            </h3>
            {subtitle && <p className="text-ink-muted font-barlow text-base mb-4">{subtitle}</p>}
            {intro && (
              <p className="text-gray-500 font-barlow text-sm leading-relaxed mb-6 max-w-2xl">{intro}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-gray-400 font-barlow text-sm">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  ungated ? "bg-ecm-lime/20 text-heading" : "bg-surface border border-surface-border text-ink"
                }`}
              >
                {ungated ? "No email needed" : "Email to open"}
              </span>
              {duration && (
                <div className="flex items-center gap-1.5">
                  <ClockIcon />
                  {duration}
                </div>
              )}
              {detail && (
                <div className="flex items-center gap-1.5">
                  <ListIcon />
                  {detail}
                </div>
              )}
              <ShareLinkButton anchor={id} />
            </div>
          </div>
          <div className="flex-shrink-0 lg:pt-2 flex flex-col gap-3">
            {preview && (
              <PreviewButton slug={id} title={title} src={preview.src} durationLabel={preview.dur} />
            )}
            <Link
              href={href}
              className={`inline-flex items-center gap-2 font-barlow text-sm px-8 py-3.5 rounded-full transition-colors ${
                featured
                  ? "bg-ecm-lime text-ecm-green font-bold hover:bg-ecm-lime-hover"
                  : "bg-ecm-green text-white font-semibold hover:bg-ecm-green-dark"
              }`}
            >
              {ctaLabel}
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </div>
      {!featured && <div className="h-1 bg-ecm-lime w-0 group-hover:w-full transition-all duration-500" />}
    </div>
  );
}

function GroupHeading({ id, step, title, body }: { id: string; step: string; title: string; body: string }) {
  return (
    <div id={id} className="scroll-mt-24 mb-6">
      <p className="text-heading/60 font-barlow font-bold text-xs tracking-[0.2em] uppercase mb-2">{step}</p>
      <h2 className="text-heading font-barlow font-bold text-2xl sm:text-3xl mb-2">{title}</h2>
      <p className="text-ink text-base leading-relaxed max-w-3xl">{body}</p>
    </div>
  );
}

/* The four bespoke tools, in the order a buyer is most likely to need them.
   Copy is unchanged from the previous flat list. None is in
   UNGATED_ASSESSMENT_SLUGS, so all register an email before opening. */
const GATED_TOOLS: ToolCardProps[] = [
  {
    id: "process",
    title: TOOLS.process.name,
    subtitle: "Map a key process, surface blockers and ownership gaps, and generate a pre-diagnostic brief.",
    intro:
      "Work through 6 focused sections covering process type, current state, ownership, pain points, and automation readiness. Your responses generate a structured brief your consultant reviews before your first call, so there is no need to repeat yourself.",
    duration: TOOLS.process.duration,
    detail: "6 sections",
    href: TOOLS.process.href,
    ctaLabel: "Take assessment",
    ungated: false,
  },
  {
    id: "cms-implementation",
    title: TOOLS["cms-estimator"].name,
    subtitle:
      "Build a defensible business case for your CMS / DXP / ECM project. Twelve plain inputs in, a 3- or 5-year TCO band out.",
    intro:
      "Coefficient ranges drawn from public analyst sources (Forrester TEI studies, Real Story Group, ContractorUK, vendor pricing pages) calibrated by ECM.dev consulting work. Surfaces the cost lines traditional calculators miss: out-year enhancement, contingency, sales-gated DXP variance, and the productivity benefits Forrester quantifies for headless replatforms.",
    duration: TOOLS["cms-estimator"].duration,
    detail: "TCO model",
    href: TOOLS["cms-estimator"].href,
    ctaLabel: "Open estimator",
    ungated: false,
  },
  {
    id: "localisation-cost",
    title: TOOLS["localisation-estimator"].name,
    subtitle:
      "See where your multilingual content operations are really spending, and what an AI-native operating model could recover.",
    intro:
      "A six-layer cost model for content operations in multilingual, multichannel environments. Drag the sliders to match your footprint, content mix, maturity, and friction signals. The tool surfaces the layers traditional calculators miss and the annual recovery available at the next AI maturity level.",
    duration: TOOLS["localisation-estimator"].duration,
    detail: "Interactive model",
    href: TOOLS["localisation-estimator"].href,
    ctaLabel: "Open estimator",
    ungated: false,
  },
  {
    id: "lead-magnet",
    title: TOOLS["lead-magnet"].name,
    subtitle: "Find your best-fit lead magnet format and close the capability gaps holding you back.",
    intro:
      "Answer 13 questions about your market position, authority, and capabilities. Get three ranked lead magnet recommendations with specific topic ideas, a capability radar chart, and targeted gap-closing actions.",
    duration: TOOLS["lead-magnet"].duration,
    detail: "13 questions",
    href: TOOLS["lead-magnet"].href,
    ctaLabel: "Take assessment",
    ungated: false,
  },
];

function sanityCard(a: any, featured = false): ToolCardProps {
  const slug: string = a.slug?.current ?? a._id;
  return {
    id: slug,
    title: a.title,
    subtitle: a.subtitle,
    intro: a.introText,
    duration: a.estimatedMinutes ? `${a.estimatedMinutes} min` : undefined,
    detail: a.questionCount > 0 ? `${a.questionCount} questions` : undefined,
    href: `/assessment/${slug}`,
    ctaLabel: "Take assessment",
    ungated: UNGATED_ASSESSMENT_SLUGS.has(slug),
    featured,
  };
}

export default async function AssessmentsPage() {
  const allAssessments = await getAllAssessments().catch(() => []);
  const offerOpen = isAuditOfferOpen();
  const snap = CONTENT_AUDIT.snapshot;
  const full = CONTENT_AUDIT.full;

  // Grouped by what each tool asks of the visitor, not by topic: nothing,
  // an email address, or a fixed fee. The Content Operations Maturity
  // Assessment stays the featured "Start here" card at the top of the
  // no-email group, as the homepage hero promises. Any other ungated Sanity
  // assessment joins it; everything else is gated by default.
  const FEATURED_SLUG = "content-operations-maturity";
  const featured = allAssessments.find((a: any) => a.slug?.current === FEATURED_SLUG);
  const others = allAssessments.filter((a: any) => a.slug?.current !== FEATURED_SLUG);
  const ungatedOthers = others.filter((a: any) => UNGATED_ASSESSMENT_SLUGS.has(a.slug?.current));
  const gatedOthers = others.filter((a: any) => !UNGATED_ASSESSMENT_SLUGS.has(a.slug?.current));

  // Only show editor controls in local development
  const showEditorControls = process.env.NODE_ENV === "development";
  const studioUrl =
    process.env.NEXT_PUBLIC_SANITY_STUDIO_URL ||
    "https://ecm-dev.sanity.studio";

  const jumpLinks = [
    { href: "#no-email", label: "Free, no email" },
    { href: "#email", label: "Free, with an email" },
    { href: "#expert", label: "Expert-led, fixed fee" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative bg-ecm-green py-14 sm:py-20 lg:py-28 pb-24 sm:pb-28 lg:pb-36 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-ecm-lime font-barlow font-bold text-3xl sm:text-4xl lg:text-5xl mb-4">
            Assessments
          </h1>
          <p className="text-white/80 font-barlow text-lg max-w-2xl mx-auto mb-8">
            Grouped by what each one asks of you. Start free, and bring in an
            expert only when you need evidence from your own content.
          </p>
          <nav aria-label="Assessment groups" className="flex flex-wrap justify-center gap-3">
            {jumpLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="inline-flex items-center rounded-full border border-ecm-lime/50 px-4 py-2 text-ecm-lime font-barlow font-semibold text-sm hover:bg-ecm-lime hover:text-ecm-green transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>
        {/* Wave divider: green → white */}
        <div className="wave-divider wave-divider-bottom">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="var(--color-surface)" />
          </svg>
        </div>
      </section>

      <section className="py-20 bg-surface">
        <div className="max-w-5xl mx-auto px-6">
          {/* ── 1. Free, no email ── */}
          <GroupHeading
            id="no-email"
            step="1 · Free · no email needed"
            title="Check your position in a few minutes"
            body="Answer questions about how you work and see your result on screen straight away. Indicative, based on your own answers, not a review of your content."
          />
          <div className="space-y-6">
            {featured && <ToolCard {...sanityCard(featured, true)} />}
            {!featured && ungatedOthers.length === 0 && (
              <p className="rounded-2xl border border-dashed border-surface-border px-6 py-8 text-ink text-sm">
                This self-check is temporarily unavailable. The tools below
                still work, or{" "}
                <Link href={enquiryHref("first-project")} className="underline hover:text-heading">
                  tell us what you are trying to fix
                </Link>
                .
              </p>
            )}
            {ungatedOthers.map((a: any) => (
              <ToolCard key={a._id} {...sanityCard(a)} />
            ))}
          </div>

          {/* ── 2. Free, email to open ── */}
          <div className="mt-20">
            <GroupHeading
              id="email"
              step="2 · Free · your email to open"
              title="Go deeper on one question"
              body="Specialist estimators and assessments. Each asks for your email address before it opens, so we can send your results. Indicative, based on the inputs you declare: not a quotation or a promise of savings."
            />
            <div className="space-y-6">
              {GATED_TOOLS.map((t) => (
                <ToolCard key={t.id} {...t} />
              ))}
              {gatedOthers.map((a: any) => (
                <ToolCard key={a._id} {...sanityCard(a)} />
              ))}
            </div>
          </div>

          {/* ── 3. Expert-led, fixed fee ── */}
          <div className="mt-20">
            <GroupHeading
              id="expert"
              step="3 · Expert-led · fixed fee"
              title="Evidence from your own content"
              body={`When you need findings from your actual content estate rather than your own answers, the ${CONTENT_AUDIT.name} reviews it for you and a person writes up what it found.`}
            />
            {offerOpen && (
              <p className="mb-6 text-sm text-heading bg-ecm-lime/10 border border-ecm-lime/30 rounded-2xl px-5 py-3 max-w-3xl">
                Audits requested by {AUDIT_OFFER_COPY.deadlineLabel} are free, in
                exchange for a recommendation if the findings are useful.{" "}
                {AUDIT_OFFER_COPY.capacity}
              </p>
            )}
            <OfferViewTracker offer={JOURNEY_OFFER.auditTiers} />
            <div id="content-audit" className="grid md:grid-cols-2 gap-6 scroll-mt-24">
              {[
                { tier: snap, note: snap.credit },
                { tier: full, note: undefined as string | undefined },
              ].map(({ tier, note }) => (
                <div key={tier.key} className="bg-ecm-green rounded-2xl p-6 sm:p-8 border border-ecm-lime/20 flex flex-col">
                  <p className="text-ecm-lime/70 font-barlow font-semibold text-xs uppercase tracking-wide mb-1">
                    {CONTENT_AUDIT.name}
                  </p>
                  <h3 className="text-ecm-lime font-barlow font-bold text-xl mb-1">{tier.name}</h3>
                  <p className="text-white font-barlow font-bold text-2xl mb-1">{tier.price}</p>
                  <p className="text-white/60 text-xs mb-4">
                    {tier.duration} · {tier.scope}
                  </p>
                  <ul className="text-white/85 text-sm leading-relaxed mb-4 flex-1 space-y-1 list-disc list-inside">
                    {tier.outputs.map((o) => (
                      <li key={o}>{o}</li>
                    ))}
                  </ul>
                  {note && <p className="text-ecm-lime/80 text-xs italic mb-4">{note}</p>}
                  <Link
                    href={enquiryHref(tier.key)}
                    className="inline-flex items-center justify-center bg-ecm-lime text-ecm-green font-barlow font-semibold text-sm px-6 py-3 rounded-full hover:bg-ecm-lime-hover transition-colors mt-auto"
                  >
                    Discuss a {tier.name}
                  </Link>
                </div>
              ))}
            </div>
            <p className="text-ink text-sm mt-6 flex flex-wrap gap-x-6 gap-y-2">
              <Link href={CONTENT_AUDIT.samplePath} className="underline hover:text-heading">
                See a sample Snapshot report
              </Link>
              <span className="text-ink-muted">{CONTENT_AUDIT.vatNote}</span>
            </p>
          </div>

          {/* Editor: Create New Assessment — only visible in dev/admin environments */}
          {showEditorControls && (
            <div className="mt-16 text-center">
              <div className="inline-flex flex-col items-center gap-3 px-8 py-6 bg-surface-alt border border-dashed border-surface-border rounded-2xl">
                <p className="text-gray-400 font-barlow text-sm">
                  Want to add a new assessment?
                </p>
                <a
                  href={`${studioUrl}/structure/assessment`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-ecm-lime text-ecm-green font-barlow font-bold text-sm px-6 py-2.5 rounded-full hover:bg-ecm-lime-hover transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                  Create New Assessment
                </a>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

import React from "react";

/**
 * Line illustrations for the self-assessment tools, used as the thumbnail
 * wherever an assessment card renders (pillar-page clusters, "Try another
 * assessment" on results pages, mixed related-content cards). Before this,
 * those cards fell back to a bare "ECM" placeholder.
 *
 * Each tool gets one motif that shows what the tool actually does:
 *   content-operations-maturity  six-dimension radar with a scored shape
 *   process                      a process flow with one blocked step
 *   lead-magnet                  three ranked format cards
 *   localisation-cost            stacked cost layers, the hidden ones marked
 *   cms-implementation           a multi-year cost band chart
 * Anything else (future Sanity-authored assessments) gets a questionnaire
 * motif.
 *
 * Style invariants, shared with GuideIllustration and CaseStudyIllustration:
 *   viewBox 0 0 280 144, primary #316148 (ECM green), accent #AAF870 (lime),
 *   strokes 1.0 to 1.5, low-alpha fills. Line, paper and fill colours are CSS
 *   variables, lightened for dark mode.
 */

// Colours come from CSS variables (app/globals.css) so the motifs stay
// legible in dark mode; the fallbacks are the light-mode values.
const G = "var(--illus-line, #316148)";
const PAPER = "var(--illus-paper, #ffffff)";
// Text drawn on a lime shape stays dark green in both themes.
const ON_LIME = "#316148";
const L = "#AAF870";
const FILL_G = "var(--illus-fill, rgba(49,97,72,0.06))";
const FILL_L = "rgba(170,248,112,0.14)";

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 280 144" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      {children}
    </svg>
  );
}

// Six-axis radar: the maturity assessment scores six dimensions.
function MaturityMotif() {
  const cx = 140;
  const cy = 72;
  const axes = 6;
  const point = (i: number, r: number) => {
    const a = (Math.PI * 2 * i) / axes - Math.PI / 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
  };
  const ring = (r: number) =>
    Array.from({ length: axes }, (_, i) => point(i, r).join(",")).join(" ");
  const scores = [0.85, 0.55, 0.7, 0.4, 0.6, 0.75];
  const shape = scores.map((s, i) => point(i, 52 * s).join(",")).join(" ");
  return (
    <Frame>
      {[18, 35, 52].map((r) => (
        <polygon key={r} points={ring(r)} stroke={G} strokeWidth="1" strokeOpacity="0.35" fill="none" />
      ))}
      {Array.from({ length: axes }, (_, i) => {
        const [x, y] = point(i, 52);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={G} strokeWidth="1" strokeOpacity="0.35" />;
      })}
      <polygon points={shape} stroke={G} strokeWidth="1.5" fill={FILL_L} />
      {scores.map((s, i) => {
        const [x, y] = point(i, 52 * s);
        return <circle key={i} cx={x} cy={y} r="3" fill={i === 3 ? L : PAPER} stroke={G} strokeWidth="1.2" />;
      })}
    </Frame>
  );
}

// Process flow with one blocked step: the Process Assessment surfaces
// blockers and ownership gaps.
function ProcessMotif() {
  const xs = [28, 88, 148, 208];
  return (
    <Frame>
      {xs.map((x, i) => (
        <g key={x}>
          <rect
            x={x}
            y={56}
            width="44"
            height="32"
            rx="5"
            stroke={G}
            strokeWidth="1.2"
            fill={i === 2 ? FILL_L : FILL_G}
          />
          <line x1={x + 9} y1={68} x2={x + 35} y2={68} stroke={G} strokeWidth="1" strokeOpacity="0.5" />
          <line x1={x + 9} y1={76} x2={x + 27} y2={76} stroke={G} strokeWidth="1" strokeOpacity="0.5" />
          {i < xs.length - 1 && (
            <line
              x1={x + 44}
              y1={72}
              x2={x + 60}
              y2={72}
              stroke={G}
              strokeWidth="1.2"
              strokeDasharray={i === 1 ? "3 3" : undefined}
            />
          )}
        </g>
      ))}
      {/* the blocker, and the owner question mark above it */}
      <circle cx={170} cy={36} r="10" fill={L} stroke={G} strokeWidth="1.2" />
      <text x={170} y={40} textAnchor="middle" fontSize="12" fontFamily="sans-serif" fill={ON_LIME}>
        ?
      </text>
      <line x1={170} y1={46} x2={170} y2={56} stroke={G} strokeWidth="1" strokeDasharray="2 2" />
      {/* swimlane rule */}
      <line x1={20} y1={108} x2={260} y2={108} stroke={G} strokeWidth="1" strokeOpacity="0.3" />
    </Frame>
  );
}

// Three ranked format cards: the Lead Magnet tool returns three ranked
// recommendations.
function LeadMagnetMotif() {
  const cards = [
    { x: 40, y: 34, h: 76, rank: "1" },
    { x: 112, y: 46, h: 64, rank: "2" },
    { x: 184, y: 58, h: 52, rank: "3" },
  ];
  return (
    <Frame>
      {cards.map((c, i) => (
        <g key={c.rank}>
          <rect
            x={c.x}
            y={c.y}
            width="56"
            height={c.h}
            rx="5"
            stroke={G}
            strokeWidth="1.2"
            fill={i === 0 ? FILL_L : FILL_G}
          />
          <circle cx={c.x + 14} cy={c.y + 14} r="7" fill={i === 0 ? L : PAPER} stroke={G} strokeWidth="1.1" />
          <text x={c.x + 14} y={c.y + 17.5} textAnchor="middle" fontSize="9" fontFamily="sans-serif" fill={i === 0 ? ON_LIME : G}>
            {c.rank}
          </text>
          <line x1={c.x + 10} y1={c.y + 32} x2={c.x + 46} y2={c.y + 32} stroke={G} strokeWidth="1" strokeOpacity="0.5" />
          <line x1={c.x + 10} y1={c.y + 40} x2={c.x + 38} y2={c.y + 40} stroke={G} strokeWidth="1" strokeOpacity="0.5" />
        </g>
      ))}
      <line x1={30} y1={116} x2={250} y2={116} stroke={G} strokeWidth="1" strokeOpacity="0.3" />
    </Frame>
  );
}

// Stacked cost layers, the lower ones dashed and marked: the Localisation
// Cost Estimator surfaces the layers traditional calculators miss.
function LocalisationMotif() {
  const layers = [
    { w: 150, hidden: false },
    { w: 130, hidden: false },
    { w: 170, hidden: true },
    { w: 120, hidden: true },
    { w: 160, hidden: true },
    { w: 110, hidden: true },
  ];
  return (
    <Frame>
      {layers.map((layer, i) => (
        <rect
          key={i}
          x={140 - layer.w / 2}
          y={22 + i * 17}
          width={layer.w}
          height="12"
          rx="3"
          stroke={G}
          strokeWidth="1.1"
          strokeDasharray={layer.hidden ? "4 3" : undefined}
          fill={i === 2 ? FILL_L : layer.hidden ? PAPER : FILL_G}
        />
      ))}
      {/* language tags on the left */}
      {["EN", "DE", "FR"].map((t, i) => (
        <g key={t}>
          <rect x={16} y={30 + i * 26} width="26" height="16" rx="3" stroke={G} strokeWidth="1" fill={PAPER} />
          <text x={29} y={41 + i * 26} textAnchor="middle" fontSize="8" fontFamily="sans-serif" fill={G}>
            {t}
          </text>
        </g>
      ))}
      <circle cx={236} cy={62} r="6" fill={L} stroke={G} strokeWidth="1.1" />
      <line x1={230} y1={62} x2={226} y2={62} stroke={G} strokeWidth="1" />
    </Frame>
  );
}

// Multi-year cost band: the CMS estimator returns a 3 or 5 year TCO band.
function CmsMotif() {
  const bars = [
    { lo: 44, hi: 62 },
    { lo: 30, hi: 44 },
    { lo: 26, hi: 38 },
    { lo: 24, hi: 36 },
    { lo: 24, hi: 34 },
  ];
  const base = 112;
  return (
    <Frame>
      <line x1={36} y1={base} x2={252} y2={base} stroke={G} strokeWidth="1.2" />
      <line x1={36} y1={24} x2={36} y2={base} stroke={G} strokeWidth="1" strokeOpacity="0.4" />
      {bars.map((b, i) => {
        const x = 56 + i * 40;
        return (
          <g key={i}>
            <rect x={x} y={base - b.lo} width="22" height={b.lo} rx="2" stroke={G} strokeWidth="1.1" fill={FILL_G} />
            <rect
              x={x}
              y={base - b.hi}
              width="22"
              height={b.hi - b.lo}
              rx="2"
              stroke={G}
              strokeWidth="1"
              strokeDasharray="3 2"
              fill={i === 0 ? FILL_L : PAPER}
            />
          </g>
        );
      })}
      <path d="M67 44 C 107 66, 147 72, 227 76" stroke={G} strokeWidth="1.3" fill="none" />
      <circle cx={67} cy={44} r="3.5" fill={L} stroke={G} strokeWidth="1.1" />
    </Frame>
  );
}

// Fallback: a short questionnaire with one answer selected.
function QuestionnaireMotif() {
  return (
    <Frame>
      <rect x={80} y={18} width="120" height="108" rx="6" stroke={G} strokeWidth="1.2" fill={FILL_G} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <circle cx={98} cy={42 + i * 22} r="5" stroke={G} strokeWidth="1.1" fill={i === 1 ? L : PAPER} />
          <line x1={110} y1={42 + i * 22} x2={i % 2 ? 170 : 182} y2={42 + i * 22} stroke={G} strokeWidth="1" strokeOpacity="0.5" />
        </g>
      ))}
    </Frame>
  );
}

const SLUG_TO_MOTIF: Record<string, () => React.ReactElement> = {
  "content-operations-maturity": MaturityMotif,
  process: ProcessMotif,
  "lead-magnet": LeadMagnetMotif,
  "localisation-cost": LocalisationMotif,
  "cms-implementation": CmsMotif,
};

/** Accepts a slug or an assessment href such as "/assessment/process". */
export default function AssessmentIllustration({ slug }: { slug?: string }) {
  const key = (slug ?? "").split("/").filter(Boolean).pop() ?? "";
  const Motif = SLUG_TO_MOTIF[key] ?? QuestionnaireMotif;
  return <Motif />;
}

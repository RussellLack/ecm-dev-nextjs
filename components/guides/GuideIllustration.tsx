import React from "react";

const G = "#316148";
const L = "#AAF870";
// const GF = "rgba(49,97,72,0.05)";
// const LF = "rgba(170,248,112,0.12)";
const W10 = "rgba(255,255,255,0.10)";
const W20 = "rgba(255,255,255,0.20)";
const G10 = "rgba(49,97,72,0.10)";
const G20 = "rgba(49,97,72,0.20)";
const G30 = "rgba(49,97,72,0.30)";

function Illus({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 280 144"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {children}
    </svg>
  );
}

// ─── Series 1: Foundations ────────────────────────────────────────────────────

const ContentInfrastructureImperative = () => (
  <Illus>
    {/* Stacked infrastructure layers, bottom cracked */}
    {[0, 1, 2, 3].map((i) => (
      <rect
        key={i}
        x={50}
        y={30 + i * 20}
        width={180}
        height={14}
        rx={3}
        stroke={i === 3 ? L : G}
        strokeWidth={1.2}
        fill={i === 3 ? "rgba(170,248,112,0.08)" : G10}
      />
    ))}
    {/* layer labels */}
    {["Delivery", "Processing", "Storage", "Foundation"].map((label, i) => (
      <text key={label} x={140} y={40 + i * 20} textAnchor="middle" fill={i === 3 ? L : G} fontSize={8} fontFamily="sans-serif" opacity={0.7}>{label}</text>
    ))}
    {/* Crack in bottom layer */}
    <polyline points="90,101 102,107 112,100 124,108" stroke={L} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    {/* Arrows going up */}
    {[80, 140, 200].map((x) => (
      <line key={x} x1={x} y1={118} x2={x} y2={108} stroke={G} strokeWidth={1} markerEnd="url(#arr)" opacity={0.4} />
    ))}
    <defs>
      <marker id="arr" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
        <path d="M0,0 L4,2 L0,4 Z" fill={G} opacity={0.5} />
      </marker>
    </defs>
  </Illus>
);

const ContentGovernanceAgeOfAI = () => (
  <Illus>
    {/* Shield */}
    <path
      d="M140,22 L172,36 L172,74 C172,94 140,108 140,108 C140,108 108,94 108,74 L108,36 Z"
      stroke={G}
      strokeWidth={1.5}
      fill={G10}
    />
    {/* Neural nodes inside shield */}
    {[
      [140, 58], [124, 70], [156, 70], [132, 84], [148, 84],
    ].map(([cx, cy], i) => (
      <circle key={i} cx={cx} cy={cy} r={4} stroke={L} strokeWidth={1.2} fill="rgba(170,248,112,0.15)" />
    ))}
    {/* Neural connections */}
    <line x1={140} y1={58} x2={124} y2={70} stroke={L} strokeWidth={0.8} opacity={0.6} />
    <line x1={140} y1={58} x2={156} y2={70} stroke={L} strokeWidth={0.8} opacity={0.6} />
    <line x1={124} y1={70} x2={132} y2={84} stroke={L} strokeWidth={0.8} opacity={0.6} />
    <line x1={156} y1={70} x2={148} y2={84} stroke={L} strokeWidth={0.8} opacity={0.6} />
    <line x1={124} y1={70} x2={148} y2={84} stroke={G} strokeWidth={0.6} opacity={0.3} />
  </Illus>
);

const ContentLifecycleRedesigned = () => (
  <Illus>
    {/* Circular lifecycle with 4 phase nodes */}
    <circle cx={140} cy={72} r={36} stroke={G20} strokeWidth={1} fill="none" strokeDasharray="4 3" />
    {[
      [140, 36, "Plan"],
      [176, 72, "Create"],
      [140, 108, "Deliver"],
      [104, 72, "Optimise"],
    ].map(([cx, cy, label], i) => (
      <g key={i}>
        <circle cx={cx as number} cy={cy as number} r={10} stroke={i === 0 ? L : G} strokeWidth={1.2} fill={i === 0 ? "rgba(170,248,112,0.15)" : G10} />
        <text x={cx as number} y={(cy as number) + (i === 0 ? -15 : i === 2 ? 20 : 0)} textAnchor={i === 1 ? "start" : i === 3 ? "end" : "middle"} dx={i === 1 ? 14 : i === 3 ? -14 : 0} dy={i === 1 || i === 3 ? 4 : 0} fill={G} fontSize={7.5} fontFamily="sans-serif" opacity={0.7}>{label as string}</text>
      </g>
    ))}
    {/* Curved arrows between nodes */}
    <path d="M150,38 A40,40 0 0,1 174,62" stroke={G} strokeWidth={1} fill="none" markerEnd="url(#arrG)" opacity={0.5} />
    <path d="M174,82 A40,40 0 0,1 150,106" stroke={G} strokeWidth={1} fill="none" markerEnd="url(#arrG)" opacity={0.5} />
    <path d="M130,106 A40,40 0 0,1 106,82" stroke={G} strokeWidth={1} fill="none" markerEnd="url(#arrG)" opacity={0.5} />
    <path d="M106,62 A40,40 0 0,1 130,38" stroke={G} strokeWidth={1} fill="none" markerEnd="url(#arrG)" opacity={0.5} />
    <defs>
      <marker id="arrG" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
        <path d="M0,0 L5,2.5 L0,5 Z" fill={G} opacity={0.5} />
      </marker>
    </defs>
  </Illus>
);

const ContentAsOrganisationalIntelligence = () => (
  <Illus>
    {/* Head silhouette */}
    <path
      d="M140,28 C120,28 108,42 108,58 C108,70 113,78 122,84 L122,96 L158,96 L158,84 C167,78 172,70 172,58 C172,42 160,28 140,28 Z"
      stroke={G}
      strokeWidth={1.2}
      fill={G10}
    />
    {/* Radiating data nodes */}
    {[
      [140, 52], [128, 60], [152, 60], [134, 72], [146, 72],
    ].map(([cx, cy], i) => (
      <circle key={i} cx={cx} cy={cy} r={3.5} stroke={L} strokeWidth={1} fill="rgba(170,248,112,0.2)" />
    ))}
    {/* Connections between nodes */}
    <line x1={140} y1={52} x2={128} y2={60} stroke={L} strokeWidth={0.8} opacity={0.5} />
    <line x1={140} y1={52} x2={152} y2={60} stroke={L} strokeWidth={0.8} opacity={0.5} />
    <line x1={128} y1={60} x2={134} y2={72} stroke={L} strokeWidth={0.8} opacity={0.5} />
    <line x1={152} y1={60} x2={146} y2={72} stroke={L} strokeWidth={0.8} opacity={0.5} />
    {/* External radiating lines */}
    {[[-28, -20], [28, -20], [-36, 0], [36, 0], [-20, 20], [20, 20]].map(([dx, dy], i) => (
      <line key={i} x1={140} y1={60} x2={140 + (dx as number)} y2={60 + (dy as number)} stroke={G} strokeWidth={0.7} opacity={0.25} strokeDasharray="2 2" />
    ))}
  </Illus>
);

const BuildingBusinessCaseContentInfrastructure = () => (
  <Illus>
    {/* Bar chart */}
    {[
      [72, 90, 28, false],
      [100, 72, 46, false],
      [128, 54, 64, false],
      [156, 42, 76, true],
      [184, 32, 86, true],
    ].map(([x, y, h, highlight], i) => (
      <rect key={i} x={x as number} y={y as number} width={20} height={h as number} rx={2} stroke={highlight ? L : G} strokeWidth={1} fill={highlight ? "rgba(170,248,112,0.15)" : G10} />
    ))}
    {/* ROI threshold line */}
    <line x1={56} y1={54} x2={212} y2={54} stroke={L} strokeWidth={1.2} strokeDasharray="5 3" />
    <text x={214} y={57} fill={L} fontSize={7.5} fontFamily="sans-serif">ROI</text>
    {/* Baseline */}
    <line x1={56} y1={118} x2={212} y2={118} stroke={G} strokeWidth={0.8} opacity={0.3} />
    <text x={57} y={128} fill={G} fontSize={7} fontFamily="sans-serif" opacity={0.5}>Year 1</text>
    <text x={185} y={128} fill={G} fontSize={7} fontFamily="sans-serif" opacity={0.5}>Year 5</text>
  </Illus>
);

// ─── Series 2: Process Architecture ──────────────────────────────────────────

const ProcessArchitectureContentOperations = () => (
  <Illus>
    {/* 2×3 process module grid with arrows */}
    {[
      [50, 40], [120, 40], [190, 40],
      [50, 88], [120, 88], [190, 88],
    ].map(([x, y], i) => (
      <rect key={i} x={x as number} y={y as number} width={60} height={30} rx={4} stroke={i === 0 ? L : G} strokeWidth={1.2} fill={i === 0 ? "rgba(170,248,112,0.1)" : G10} />
    ))}
    {/* Horizontal arrows row 1 */}
    <line x1={110} y1={55} x2={120} y2={55} stroke={G} strokeWidth={1} markerEnd="url(#arrS)" opacity={0.5} />
    <line x1={180} y1={55} x2={190} y2={55} stroke={G} strokeWidth={1} markerEnd="url(#arrS)" opacity={0.5} />
    {/* Horizontal arrows row 2 */}
    <line x1={110} y1={103} x2={120} y2={103} stroke={G} strokeWidth={1} markerEnd="url(#arrS)" opacity={0.5} />
    <line x1={180} y1={103} x2={190} y2={103} stroke={G} strokeWidth={1} markerEnd="url(#arrS)" opacity={0.5} />
    {/* Vertical arrow col 1 */}
    <line x1={80} y1={70} x2={80} y2={88} stroke={G} strokeWidth={1} markerEnd="url(#arrS)" opacity={0.4} />
    <defs>
      <marker id="arrS" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
        <path d="M0,0 L4,2 L0,4 Z" fill={G} opacity={0.5} />
      </marker>
    </defs>
  </Illus>
);

const ContentBriefAsSystemInput = () => (
  <Illus>
    {/* Document → gear → output pipeline */}
    {/* Document */}
    <rect x={30} y={50} width={52} height={44} rx={3} stroke={G} strokeWidth={1.2} fill={G10} />
    <line x1={40} y1={63} x2={72} y2={63} stroke={G} strokeWidth={0.8} opacity={0.4} />
    <line x1={40} y1={70} x2={72} y2={70} stroke={G} strokeWidth={0.8} opacity={0.4} />
    <line x1={40} y1={77} x2={62} y2={77} stroke={G} strokeWidth={0.8} opacity={0.4} />
    <text x={56} y={47} textAnchor="middle" fill={G} fontSize={7.5} fontFamily="sans-serif" opacity={0.6}>Brief</text>
    {/* Arrow */}
    <line x1={82} y1={72} x2={108} y2={72} stroke={G} strokeWidth={1} markerEnd="url(#arrP)" opacity={0.5} />
    {/* Gear */}
    <circle cx={124} cy={72} r={14} stroke={G} strokeWidth={1.2} fill={G10} />
    <circle cx={124} cy={72} r={6} stroke={G} strokeWidth={1} fill="none" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
      const rad = (deg * Math.PI) / 180;
      const x1 = 124 + 10 * Math.cos(rad);
      const y1 = 72 + 10 * Math.sin(rad);
      const x2 = 124 + 14 * Math.cos(rad);
      const y2 = 72 + 14 * Math.sin(rad);
      return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke={G} strokeWidth={2} strokeLinecap="round" />;
    })}
    {/* Arrow */}
    <line x1={138} y1={72} x2={164} y2={72} stroke={G} strokeWidth={1} markerEnd="url(#arrP)" opacity={0.5} />
    {/* Output document */}
    <rect x={164} y={50} width={52} height={44} rx={3} stroke={L} strokeWidth={1.2} fill="rgba(170,248,112,0.1)" />
    <line x1={174} y1={63} x2={206} y2={63} stroke={L} strokeWidth={0.8} opacity={0.4} />
    <line x1={174} y1={70} x2={206} y2={70} stroke={L} strokeWidth={0.8} opacity={0.4} />
    <line x1={174} y1={77} x2={196} y2={77} stroke={L} strokeWidth={0.8} opacity={0.4} />
    <text x={190} y={47} textAnchor="middle" fill={L} fontSize={7.5} fontFamily="sans-serif" opacity={0.7}>Output</text>
    <defs>
      <marker id="arrP" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
        <path d="M0,0 L5,2.5 L0,5 Z" fill={G} opacity={0.5} />
      </marker>
    </defs>
  </Illus>
);

const WorkflowAutomationContentTeams = () => (
  <Illus>
    {/* Pipeline with automated gear nodes */}
    {/* Pipeline line */}
    <line x1={34} y1={72} x2={246} y2={72} stroke={G20} strokeWidth={1.5} />
    {/* Nodes: mix of manual (rect) and automated (gear/circle) */}
    {[
      [44, false], [90, true], [140, false], [190, true], [236, false],
    ].map(([cx, auto], i) => (
      <g key={i}>
        {auto ? (
          <>
            <circle cx={cx as number} cy={72} r={14} stroke={L} strokeWidth={1.2} fill="rgba(170,248,112,0.12)" />
            <circle cx={cx as number} cy={72} r={6} stroke={L} strokeWidth={1} fill="none" />
            {[0, 60, 120, 180, 240, 300].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              return <line key={deg} x1={(cx as number) + 8 * Math.cos(rad)} y1={72 + 8 * Math.sin(rad)} x2={(cx as number) + 13 * Math.cos(rad)} y2={72 + 13 * Math.sin(rad)} stroke={L} strokeWidth={2} strokeLinecap="round" />;
            })}
          </>
        ) : (
          <rect x={(cx as number) - 11} y={61} width={22} height={22} rx={3} stroke={G} strokeWidth={1.2} fill={G10} />
        )}
      </g>
    ))}
  </Illus>
);

const ApprovalFlowsThatDontKillMomentum = () => (
  <Illus>
    {/* Fast arrow path through thin gates */}
    <path d="M30,72 C60,72 72,56 90,72 C108,88 120,72 140,72 C160,72 172,56 190,72 C208,88 220,72 250,72" stroke={L} strokeWidth={2} fill="none" strokeLinecap="round" />
    {/* Thin gate bars */}
    {[90, 140, 190].map((x) => (
      <g key={x}>
        <line x1={x} y1={48} x2={x} y2={96} stroke={G} strokeWidth={1.5} opacity={0.5} />
        <circle cx={x} cy={72} r={5} stroke={G} strokeWidth={1} fill="white" />
        <text x={x} y={75} textAnchor="middle" fill={G} fontSize={7} fontFamily="sans-serif">✓</text>
      </g>
    ))}
    {/* Speed lines at end */}
    {[60, 68, 76].map((y) => (
      <line key={y} x1={232} y1={y} x2={248} y2={y} stroke={L} strokeWidth={0.8} opacity={0.4} />
    ))}
  </Illus>
);

const CrossFunctionalContentOperations = () => (
  <Illus>
    {/* 3 overlapping circles connected at central node */}
    <circle cx={140} cy={54} r={30} stroke={G} strokeWidth={1.2} fill={G10} opacity={0.7} />
    <circle cx={112} cy={100} r={30} stroke={G} strokeWidth={1.2} fill={G10} opacity={0.7} />
    <circle cx={168} cy={100} r={30} stroke={G} strokeWidth={1.2} fill={G10} opacity={0.7} />
    {/* Labels */}
    <text x={140} y={42} textAnchor="middle" fill={G} fontSize={8} fontFamily="sans-serif" opacity={0.7}>Editorial</text>
    <text x={88} y={108} textAnchor="middle" fill={G} fontSize={8} fontFamily="sans-serif" opacity={0.7}>Product</text>
    <text x={192} y={108} textAnchor="middle" fill={G} fontSize={8} fontFamily="sans-serif" opacity={0.7}>Marketing</text>
    {/* Central node */}
    <circle cx={140} cy={80} r={8} stroke={L} strokeWidth={1.5} fill="rgba(170,248,112,0.2)" />
  </Illus>
);

const ContentOperationsMetricsThatMatter = () => (
  <Illus>
    {/* Mini dashboard with 3 chart types */}
    {/* Dashboard frame */}
    <rect x={30} y={28} width={220} height={88} rx={5} stroke={G} strokeWidth={1} fill={G10} />
    {/* Bar chart (left) */}
    <rect x={44} y={68} width={8} height={32} rx={1} stroke={G} strokeWidth={0.8} fill={G20} />
    <rect x={55} y={52} width={8} height={48} rx={1} stroke={G} strokeWidth={0.8} fill={G20} />
    <rect x={66} y={60} width={8} height={40} rx={1} stroke={L} strokeWidth={0.8} fill="rgba(170,248,112,0.2)" />
    {/* Line chart (centre) */}
    <polyline points="100,90 114,72 128,80 142,58 156,66" stroke={L} strokeWidth={1.5} fill="none" strokeLinecap="round" />
    {[100, 114, 128, 142, 156].map((x, i) => {
      const ys = [90, 72, 80, 58, 66];
      return <circle key={i} cx={x} cy={ys[i]} r={2.5} fill={L} />;
    })}
    {/* Donut chart (right) */}
    <circle cx={192} cy={72} r={18} stroke={G} strokeWidth={1} fill="none" />
    <path d="M192,54 A18,18 0 0,1 209,80" stroke={L} strokeWidth={4} fill="none" strokeLinecap="round" />
    <circle cx={192} cy={72} r={10} stroke="white" strokeWidth={2} fill="white" />
  </Illus>
);

const ContentOperationsRegulatedIndustries = () => (
  <Illus>
    {/* Document path with compliance locks */}
    <path d="M36,72 L76,72" stroke={G} strokeWidth={1} opacity={0.4} />
    <path d="M108,72 L148,72" stroke={G} strokeWidth={1} opacity={0.4} />
    <path d="M180,72 L220,72" stroke={G} strokeWidth={1} opacity={0.4} />
    {/* Document */}
    <rect x={22} y={58} width={28} height={28} rx={3} stroke={G} strokeWidth={1.2} fill={G10} />
    <line x1={29} y1={66} x2={43} y2={66} stroke={G} strokeWidth={0.8} opacity={0.4} />
    <line x1={29} y1={71} x2={43} y2={71} stroke={G} strokeWidth={0.8} opacity={0.4} />
    <line x1={29} y1={76} x2={39} y2={76} stroke={G} strokeWidth={0.8} opacity={0.4} />
    {/* Lock 1 */}
    <rect x={82} y={62} width={20} height={18} rx={2} stroke={G} strokeWidth={1.2} fill={G10} />
    <path d="M86,62 A6,6 0 0,1 98,62" stroke={G} strokeWidth={1.2} fill="none" />
    <circle cx={92} cy={71} r={3} stroke={G} strokeWidth={1} fill="white" />
    {/* Lock 2 (lime = compliant) */}
    <rect x={154} y={62} width={20} height={18} rx={2} stroke={L} strokeWidth={1.2} fill="rgba(170,248,112,0.12)" />
    <path d="M158,62 A6,6 0 0,1 170,62" stroke={L} strokeWidth={1.2} fill="none" />
    <circle cx={164} cy={71} r={3} stroke={L} strokeWidth={1} fill="rgba(170,248,112,0.3)" />
    {/* Output */}
    <rect x={220} y={58} width={28} height={28} rx={3} stroke={L} strokeWidth={1.2} fill="rgba(170,248,112,0.1)" />
  </Illus>
);

const ContentOperationsMaturityModel = () => (
  <Illus>
    {/* Ascending 5-step staircase */}
    {[0, 1, 2, 3, 4].map((i) => (
      <rect
        key={i}
        x={46 + i * 38}
        y={90 - i * 14}
        width={36}
        height={14 + i * 14}
        rx={2}
        stroke={i === 4 ? L : G}
        strokeWidth={1.2}
        fill={i === 4 ? "rgba(170,248,112,0.12)" : G10}
      />
    ))}
    {/* Step labels */}
    {["Ad hoc", "Aware", "Defined", "Managed", "Optimised"].map((label, i) => (
      <text key={label} x={64 + i * 38} y={106 + (4 - i) * 14 - 4} textAnchor="middle" fill={i === 4 ? L : G} fontSize={6.5} fontFamily="sans-serif" opacity={0.7}>{label}</text>
    ))}
    {/* Rising arrow */}
    <path d="M46,90 L84,76 L122,62 L160,48 L198,34" stroke={G} strokeWidth={0.8} strokeDasharray="3 2" fill="none" opacity={0.3} />
  </Illus>
);

const OperalisingContentStrategy = () => (
  <Illus>
    {/* Strategy triangle */}
    <polygon points="140,28 94,90 186,90" stroke={G} strokeWidth={1.5} fill={G10} />
    <text x={140} y={54} textAnchor="middle" fill={G} fontSize={8} fontFamily="sans-serif" opacity={0.6}>Strategy</text>
    {/* Arrow down */}
    <line x1={140} y1={94} x2={140} y2={108} stroke={G} strokeWidth={1.2} markerEnd="url(#arrO)" opacity={0.5} />
    {/* Execution grid */}
    {[
      [104, 112], [140, 112], [176, 112],
    ].map(([x, y], i) => (
      <rect key={i} x={(x as number) - 14} y={y as number} width={28} height={16} rx={2} stroke={i === 1 ? L : G} strokeWidth={1} fill={i === 1 ? "rgba(170,248,112,0.1)" : G10} />
    ))}
    <defs>
      <marker id="arrO" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
        <path d="M0,0 L5,2.5 L0,5 Z" fill={G} opacity={0.5} />
      </marker>
    </defs>
  </Illus>
);

// ─── Series 3: Information Architecture ──────────────────────────────────────

const InformationArchitectureAiSystems = () => (
  <Illus>
    {/* IA tree with AI neural nodes interspersed */}
    <line x1={140} y1={28} x2={140} y2={50} stroke={G} strokeWidth={1} opacity={0.5} />
    <circle cx={140} cy={28} r={7} stroke={G} strokeWidth={1.2} fill={G10} />
    {/* Level 1 branches */}
    <line x1={140} y1={50} x2={90} y2={74} stroke={G} strokeWidth={1} opacity={0.5} />
    <line x1={140} y1={50} x2={190} y2={74} stroke={G} strokeWidth={1} opacity={0.5} />
    <circle cx={90} cy={74} r={7} stroke={G} strokeWidth={1.2} fill={G10} />
    <circle cx={190} cy={74} r={7} stroke={G} strokeWidth={1.2} fill={G10} />
    {/* AI neural nodes */}
    <circle cx={140} cy={62} r={6} stroke={L} strokeWidth={1.2} fill="rgba(170,248,112,0.15)" />
    {/* Level 2 */}
    {[60, 90, 120, 160, 190, 220].map((x, i) => (
      <g key={x}>
        <line x1={i < 3 ? 90 : 190} y1={74} x2={x} y2={100} stroke={G} strokeWidth={0.8} opacity={0.4} />
        <circle cx={x} cy={100} r={5} stroke={i % 2 === 0 ? L : G} strokeWidth={1} fill={i % 2 === 0 ? "rgba(170,248,112,0.12)" : G10} />
      </g>
    ))}
  </Illus>
);

const TaxonomyDesignScalableContentSystems = () => (
  <Illus>
    {/* Clean branching taxonomy tree */}
    <circle cx={140} cy={30} r={8} stroke={L} strokeWidth={1.5} fill="rgba(170,248,112,0.15)" />
    <text x={140} y={50} textAnchor="middle" fill={G} fontSize={7.5} fontFamily="sans-serif" opacity={0.6}>Root</text>
    {/* Branches */}
    {[96, 140, 184].map((x) => (
      <g key={x}>
        <line x1={140} y1={38} x2={x} y2={62} stroke={G} strokeWidth={1} opacity={0.5} />
        <circle cx={x} cy={62} r={6} stroke={G} strokeWidth={1.2} fill={G10} />
      </g>
    ))}
    {/* Sub-branches */}
    {[72, 96, 120, 132, 148, 160, 172, 196].map((x, i) => {
      const parents = [96, 96, 140, 140, 140, 184, 184, 184];
      return (
        <g key={x}>
          <line x1={parents[i]} y1={68} x2={x} y2={90} stroke={G} strokeWidth={0.8} opacity={0.35} />
          <circle cx={x} cy={90} r={4} stroke={G} strokeWidth={1} fill={G10} />
        </g>
      );
    })}
  </Illus>
);

const MetadataStrategyAiPoweredEnterprises = () => (
  <Illus>
    {/* Hub-and-spoke with pill tag shapes */}
    <circle cx={140} cy={72} r={18} stroke={L} strokeWidth={1.5} fill="rgba(170,248,112,0.12)" />
    <text x={140} y={76} textAnchor="middle" fill={G} fontSize={8} fontFamily="sans-serif" fontWeight="bold">Meta</text>
    {/* Spokes to tag pills */}
    {[
      [140, 28, "type"],
      [184, 44, "topic"],
      [196, 88, "locale"],
      [160, 118, "status"],
      [104, 118, "owner"],
      [82, 84, "date"],
      [84, 44, "format"],
    ].map(([x, y, label], i) => (
      <g key={i}>
        <line x1={140} y1={72} x2={x as number} y2={y as number} stroke={G} strokeWidth={0.8} opacity={0.3} />
        <rect x={(x as number) - 16} y={(y as number) - 7} width={32} height={14} rx={7} stroke={G} strokeWidth={1} fill={G10} />
        <text x={x as number} y={(y as number) + 4} textAnchor="middle" fill={G} fontSize={7} fontFamily="sans-serif" opacity={0.7}>{label as string}</text>
      </g>
    ))}
  </Illus>
);

const ContentModellingEnterpriseAI = () => (
  <Illus>
    {/* Schema card with typed fields and brackets */}
    <rect x={52} y={28} width={176} height={88} rx={4} stroke={G} strokeWidth={1.2} fill={G10} />
    <text x={64} y={44} fill={L} fontSize={9} fontFamily="monospace" fontWeight="bold">ContentType &#123;</text>
    {[
      ["  title", "String"],
      ["  slug", "Slug"],
      ["  body", "Block[]"],
      ["  tags", "String[]"],
      ["  author", "Ref"],
    ].map(([field, type], i) => (
      <g key={field}>
        <text x={64} y={58 + i * 11} fill={G} fontSize={8} fontFamily="monospace" opacity={0.7}>{field as string}</text>
        <text x={148} y={58 + i * 11} fill={L} fontSize={8} fontFamily="monospace" opacity={0.6}>{type as string}</text>
      </g>
    ))}
    <text x={64} y={112} fill={G} fontSize={9} fontFamily="monospace" opacity={0.5}>&#125;</text>
  </Illus>
);

const StructuredAuthoringAtScale = () => (
  <Illus>
    {/* Document with clearly labelled structural zones */}
    <rect x={60} y={24} width={160} height={96} rx={4} stroke={G} strokeWidth={1.2} fill={G10} />
    {/* Title zone */}
    <rect x={68} y={32} width={144} height={14} rx={2} stroke={L} strokeWidth={1} fill="rgba(170,248,112,0.1)" />
    <text x={140} y={42} textAnchor="middle" fill={G} fontSize={7} fontFamily="sans-serif" opacity={0.6}>Title</text>
    {/* Intro zone */}
    <rect x={68} y={50} width={144} height={18} rx={2} stroke={G} strokeWidth={0.8} fill={G10} />
    <line x1={72} y1={57} x2={204} y2={57} stroke={G} strokeWidth={0.7} opacity={0.3} />
    <line x1={72} y1={63} x2={184} y2={63} stroke={G} strokeWidth={0.7} opacity={0.3} />
    <text x={74} y={49} fill={G} fontSize={6.5} fontFamily="sans-serif" opacity={0.5}>Intro</text>
    {/* Body zone */}
    <rect x={68} y={72} width={144} height={22} rx={2} stroke={G} strokeWidth={0.8} fill={G10} />
    {[78, 84, 90].map((y) => (
      <line key={y} x1={72} y1={y} x2={204} y2={y} stroke={G} strokeWidth={0.7} opacity={0.25} />
    ))}
    <text x={74} y={71} fill={G} fontSize={6.5} fontFamily="sans-serif" opacity={0.5}>Body</text>
    {/* CTA zone */}
    <rect x={68} y={98} width={144} height={14} rx={2} stroke={L} strokeWidth={1} fill="rgba(170,248,112,0.08)" />
    <text x={140} y={108} textAnchor="middle" fill={G} fontSize={7} fontFamily="sans-serif" opacity={0.6}>CTA</text>
  </Illus>
);

const KnowledgeArchitectureAIEnterprises = () => (
  <Illus>
    {/* Knowledge graph with varied node sizes */}
    {[
      [140, 60, 14, true],
      [96, 48, 8, false],
      [180, 52, 10, false],
      [100, 90, 9, false],
      [176, 92, 7, false],
      [140, 102, 11, false],
      [68, 68, 6, false],
      [208, 72, 6, false],
    ].map(([cx, cy, r, highlight], i) => (
      <circle key={i} cx={cx as number} cy={cy as number} r={r as number} stroke={highlight ? L : G} strokeWidth={highlight ? 1.5 : 1} fill={highlight ? "rgba(170,248,112,0.15)" : G10} />
    ))}
    {/* Edges */}
    {[
      [140, 60, 96, 48],
      [140, 60, 180, 52],
      [140, 60, 100, 90],
      [140, 60, 176, 92],
      [140, 60, 140, 102],
      [96, 48, 68, 68],
      [180, 52, 208, 72],
      [100, 90, 140, 102],
      [176, 92, 140, 102],
    ].map(([x1, y1, x2, y2], i) => (
      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={G} strokeWidth={0.8} opacity={0.3} />
    ))}
  </Illus>
);

const SemanticStructureAIContentSystems = () => (
  <Illus>
    {/* Nodes with labelled relationship arrows */}
    {[
      [72, 72, "Doc A"],
      [140, 44, "Topic"],
      [208, 72, "Doc B"],
      [140, 100, "Entity"],
    ].map(([x, y, label], i) => (
      <g key={i}>
        <circle cx={x as number} cy={y as number} r={16} stroke={i === 1 ? L : G} strokeWidth={1.2} fill={i === 1 ? "rgba(170,248,112,0.12)" : G10} />
        <text x={x as number} y={(y as number) + 4} textAnchor="middle" fill={G} fontSize={7} fontFamily="sans-serif" opacity={0.7}>{label as string}</text>
      </g>
    ))}
    {/* Labelled arrows */}
    {[
      [88, 65, 124, 50, "relates"],
      [156, 50, 192, 65, "describes"],
      [88, 79, 124, 94, "mentions"],
      [156, 94, 192, 79, "classifies"],
    ].map(([x1, y1, x2, y2, label], i) => (
      <g key={i}>
        <line x1={x1 as number} y1={y1 as number} x2={x2 as number} y2={y2 as number} stroke={G} strokeWidth={0.9} opacity={0.45} />
        <text x={((x1 as number) + (x2 as number)) / 2} y={((y1 as number) + (y2 as number)) / 2 - 3} textAnchor="middle" fill={G} fontSize={6.5} fontFamily="sans-serif" opacity={0.5}>{label as string}</text>
      </g>
    ))}
  </Illus>
);

const CmsArchitectureAIDrivenEnterprises = () => (
  <Illus>
    {/* Horizontal architecture layer stack */}
    {[
      ["Delivery Layer", L, "rgba(170,248,112,0.1)"],
      ["API / CDN Layer", G, G10],
      ["CMS Core", G, G10],
      ["Data / Storage", G, G10],
    ].map(([label, stroke, fill], i) => (
      <g key={label as string}>
        <rect x={40} y={32 + i * 22} width={200} height={18} rx={3} stroke={stroke as string} strokeWidth={1.2} fill={fill as string} />
        <text x={140} y={32 + i * 22 + 12} textAnchor="middle" fill={G} fontSize={8} fontFamily="sans-serif" opacity={0.7}>{label as string}</text>
      </g>
    ))}
    {/* Vertical arrows between layers */}
    {[42, 64, 86].map((y) => (
      <line key={y} x1={140} y1={y + 10} x2={140} y2={y + 18} stroke={G} strokeWidth={0.8} opacity={0.3} markerEnd="url(#arrCMS)" />
    ))}
    <defs>
      <marker id="arrCMS" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
        <path d="M0,0 L4,2 L0,4 Z" fill={G} opacity={0.4} />
      </marker>
    </defs>
  </Illus>
);

const ContentFindabilitySystemCapability = () => (
  <Illus>
    {/* Search bar with branching result paths */}
    <rect x={50} y={52} width={180} height={22} rx={11} stroke={G} strokeWidth={1.2} fill={G10} />
    <circle cx={72} cy={63} r={6} stroke={G} strokeWidth={1} fill="none" />
    <line x1={76} y1={67} x2={80} y2={71} stroke={G} strokeWidth={1} strokeLinecap="round" />
    <line x1={88} y1={63} x2={212} y2={63} stroke={G} strokeWidth={0.6} opacity={0.2} />
    {/* Branching results */}
    {[100, 140, 180].map((x, i) => (
      <g key={x}>
        <line x1={140} y1={74} x2={x} y2={92} stroke={G} strokeWidth={0.9} opacity={0.4} />
        <rect x={x - 22} y={92} width={44} height={14} rx={2} stroke={i === 0 ? L : G} strokeWidth={1} fill={i === 0 ? "rgba(170,248,112,0.1)" : G10} />
        <line x1={x - 16} y1={99} x2={x + 16} y2={99} stroke={G} strokeWidth={0.6} opacity={0.3} />
      </g>
    ))}
  </Illus>
);

// ─── Series 4: AI-Driven Content Systems ─────────────────────────────────────

const DesigningAIContentOperatingSystem = () => (
  <Illus>
    {/* Central AI hexagon with 6 subsystem nodes */}
    <polygon points="140,46 158,56 158,76 140,86 122,76 122,56" stroke={L} strokeWidth={1.5} fill="rgba(170,248,112,0.12)" />
    <text x={140} y={68} textAnchor="middle" fill={G} fontSize={8} fontFamily="sans-serif" fontWeight="bold">AI OS</text>
    {/* 6 satellite nodes */}
    {[0, 60, 120, 180, 240, 300].map((deg, i) => {
      const rad = (deg * Math.PI) / 180;
      const cx = 140 + 44 * Math.cos(rad);
      const cy = 66 + 44 * Math.sin(rad);
      return (
        <g key={deg}>
          <line x1={140} y1={66} x2={cx} y2={cy} stroke={G} strokeWidth={0.8} opacity={0.35} />
          <circle cx={cx} cy={cy} r={9} stroke={G} strokeWidth={1} fill={G10} />
        </g>
      );
    })}
  </Illus>
);

const PromptArchitectureContentTeams = () => (
  <Illus>
    {/* Prompt box divided into 4 labelled sections */}
    <rect x={44} y={30} width={192} height={84} rx={4} stroke={G} strokeWidth={1.2} fill={G10} />
    {/* Dividers */}
    <line x1={140} y1={30} x2={140} y2={114} stroke={G} strokeWidth={0.8} opacity={0.4} />
    <line x1={44} y1={72} x2={236} y2={72} stroke={G} strokeWidth={0.8} opacity={0.4} />
    {/* Labels */}
    <text x={92} y={54} textAnchor="middle" fill={G} fontSize={8} fontFamily="sans-serif" opacity={0.6}>Role</text>
    <text x={188} y={54} textAnchor="middle" fill={G} fontSize={8} fontFamily="sans-serif" opacity={0.6}>Context</text>
    <text x={92} y={96} textAnchor="middle" fill={L} fontSize={8} fontFamily="sans-serif" opacity={0.8}>Task</text>
    <text x={188} y={96} textAnchor="middle" fill={G} fontSize={8} fontFamily="sans-serif" opacity={0.6}>Format</text>
    {/* Accent on Task cell */}
    <rect x={44} y={72} width={96} height={42} rx={0} stroke={L} strokeWidth={1} fill="rgba(170,248,112,0.08)" />
  </Illus>
);

const AiQualityAssuranceContentOperations = () => (
  <Illus>
    {/* Pipeline with quality gates */}
    <line x1={28} y1={72} x2={252} y2={72} stroke={G20} strokeWidth={1.5} />
    {[60, 110, 160, 210].map((x, i) => (
      <g key={x}>
        <rect x={x - 12} y={60} width={24} height={24} rx={3} stroke={i % 2 === 0 ? G : L} strokeWidth={1.2} fill={i % 2 === 0 ? G10 : "rgba(170,248,112,0.1)"} />
        <text x={x} y={75} textAnchor="middle" fill={i % 2 === 0 ? G : L} fontSize={10} fontFamily="sans-serif">{i % 2 === 0 ? "✗" : "✓"}</text>
      </g>
    ))}
    {/* Input/output labels */}
    <text x={34} y={67} fill={G} fontSize={7} fontFamily="sans-serif" opacity={0.5}>In</text>
    <text x={238} y={67} fill={L} fontSize={7} fontFamily="sans-serif" opacity={0.7}>Out</text>
  </Illus>
);

const AiContentRiskManagement = () => (
  <Illus>
    {/* 2×2 risk matrix */}
    <rect x={50} y={28} width={180} height={88} rx={4} stroke={G} strokeWidth={1} fill={G10} />
    {/* Quadrant dividers */}
    <line x1={140} y1={28} x2={140} y2={116} stroke={G} strokeWidth={0.8} opacity={0.4} />
    <line x1={50} y1={72} x2={230} y2={72} stroke={G} strokeWidth={0.8} opacity={0.4} />
    {/* Axis labels */}
    <text x={95} y={122} textAnchor="middle" fill={G} fontSize={7} fontFamily="sans-serif" opacity={0.5}>Low Impact</text>
    <text x={185} y={122} textAnchor="middle" fill={G} fontSize={7} fontFamily="sans-serif" opacity={0.5}>High Impact</text>
    <text x={44} y={75} textAnchor="middle" fill={G} fontSize={6.5} fontFamily="sans-serif" opacity={0.5} transform="rotate(-90,44,75)">Likelihood</text>
    {/* Quadrant colours */}
    <rect x={141} y={29} width={88} height={42} rx={2} fill="rgba(170,248,112,0.08)" />
    <text x={185} y={52} textAnchor="middle" fill={L} fontSize={7} fontFamily="sans-serif" opacity={0.7}>Monitor</text>
    <rect x={141} y={73} width={88} height={42} rx={2} fill="rgba(170,248,112,0.2)" />
    <text x={185} y={96} textAnchor="middle" fill={G} fontSize={7} fontFamily="sans-serif" fontWeight="bold" opacity={0.8}>Critical</text>
    <text x={95} y={52} textAnchor="middle" fill={G} fontSize={7} fontFamily="sans-serif" opacity={0.5}>Low</text>
    <text x={95} y={96} textAnchor="middle" fill={G} fontSize={7} fontFamily="sans-serif" opacity={0.5}>Review</text>
  </Illus>
);

const ContentVelocityManagingSpeedQuality = () => (
  <Illus>
    {/* Speedometer with optimal zone */}
    <path d="M60,100 A80,80 0 0,1 220,100" stroke={G20} strokeWidth={12} fill="none" strokeLinecap="round" />
    {/* Optimal zone arc */}
    <path d="M118,48 A80,80 0 0,1 185,62" stroke={L} strokeWidth={12} fill="none" strokeLinecap="round" opacity={0.4} />
    {/* Speed zones */}
    <path d="M60,100 A80,80 0 0,1 90,55" stroke={G} strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.3} />
    <path d="M190,55 A80,80 0 0,1 220,100" stroke={G} strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.3} />
    {/* Needle */}
    <line x1={140} y1={100} x2={155} y2={55} stroke={G} strokeWidth={2} strokeLinecap="round" />
    <circle cx={140} cy={100} r={5} stroke={G} strokeWidth={1.2} fill="white" />
    <text x={140} y={115} textAnchor="middle" fill={G} fontSize={7.5} fontFamily="sans-serif" opacity={0.6}>Velocity</text>
    <text x={100} y={110} textAnchor="middle" fill={G} fontSize={7} fontFamily="sans-serif" opacity={0.4}>Slow</text>
    <text x={178} y={110} textAnchor="middle" fill={G} fontSize={7} fontFamily="sans-serif" opacity={0.4}>Fast</text>
  </Illus>
);

const RetrievalAugmentedContentSystems = () => (
  <Illus>
    {/* RAG 4-step pipeline with knowledge base */}
    {["Query", "Retrieve", "Augment", "Generate"].map((label, i) => (
      <g key={label}>
        <rect x={20 + i * 58} y={54} width={48} height={24} rx={3} stroke={i === 3 ? L : G} strokeWidth={1.2} fill={i === 3 ? "rgba(170,248,112,0.1)" : G10} />
        <text x={44 + i * 58} y={69} textAnchor="middle" fill={i === 3 ? L : G} fontSize={7.5} fontFamily="sans-serif" opacity={0.8}>{label}</text>
        {i < 3 && <line x1={68 + i * 58} y1={66} x2={78 + i * 58} y2={66} stroke={G} strokeWidth={1} opacity={0.4} markerEnd="url(#arrR)" />}
      </g>
    ))}
    {/* Knowledge base feed */}
    <rect x={60} y={96} width={100} height={20} rx={3} stroke={G} strokeWidth={1} fill={G10} />
    <text x={110} y={109} textAnchor="middle" fill={G} fontSize={7.5} fontFamily="sans-serif" opacity={0.6}>Knowledge Base</text>
    <line x1={110} y1={96} x2={110} y2={78} stroke={G} strokeWidth={0.8} strokeDasharray="3 2" opacity={0.4} />
    <defs>
      <marker id="arrR" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
        <path d="M0,0 L4,2 L0,4 Z" fill={G} opacity={0.5} />
      </marker>
    </defs>
  </Illus>
);

const AiPoweredContentAuditing = () => (
  <Illus>
    {/* Document grid with horizontal scan beam */}
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <rect
        key={i}
        x={30 + (i % 3) * 74}
        y={30 + Math.floor(i / 3) * 50}
        width={62}
        height={38}
        rx={3}
        stroke={G}
        strokeWidth={1}
        fill={G10}
      />
    ))}
    {/* Doc lines */}
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <g key={`l${i}`}>
        {[10, 17, 24].map((dy) => (
          <line key={dy} x1={38 + (i % 3) * 74} y1={30 + Math.floor(i / 3) * 50 + dy} x2={84 + (i % 3) * 74} y2={30 + Math.floor(i / 3) * 50 + dy} stroke={G} strokeWidth={0.5} opacity={0.3} />
        ))}
      </g>
    ))}
    {/* Scan beam */}
    <rect x={28} y={66} width={224} height={4} fill={L} opacity={0.25} rx={1} />
    <line x1={28} y1={68} x2={252} y2={68} stroke={L} strokeWidth={1.2} opacity={0.6} />
  </Illus>
);

const ContentIntelligencePlatforms = () => (
  <Illus>
    {/* Platform box with multiple inputs and intelligence outputs */}
    <rect x={88} y={46} width={104} height={52} rx={5} stroke={L} strokeWidth={1.5} fill="rgba(170,248,112,0.1)" />
    <text x={140} y={75} textAnchor="middle" fill={G} fontSize={8} fontFamily="sans-serif" fontWeight="bold">Platform</text>
    {/* Input arrows */}
    {[36, 60, 84].map((y, i) => (
      <g key={y}>
        <rect x={20} y={y + 28} width={44} height={14} rx={2} stroke={G} strokeWidth={0.8} fill={G10} />
        <text x={42} y={y + 37} textAnchor="middle" fill={G} fontSize={6.5} fontFamily="sans-serif" opacity={0.6}>{["CMS", "Analytics", "CRM"][i]}</text>
        <line x1={64} y1={y + 35} x2={88} y2={72} stroke={G} strokeWidth={0.8} opacity={0.35} />
      </g>
    ))}
    {/* Output arrows */}
    {[36, 60, 84].map((y, i) => (
      <g key={y + 200}>
        <line x1={192} y1={72} x2={216} y2={y + 35} stroke={G} strokeWidth={0.8} opacity={0.35} />
        <rect x={216} y={y + 28} width={44} height={14} rx={2} stroke={i === 1 ? L : G} strokeWidth={0.8} fill={i === 1 ? "rgba(170,248,112,0.1)" : G10} />
        <text x={238} y={y + 37} textAnchor="middle" fill={i === 1 ? L : G} fontSize={6.5} fontFamily="sans-serif" opacity={0.7}>{["Insight", "Action", "Report"][i]}</text>
      </g>
    ))}
  </Illus>
);

const OperalisingLlmsContentTeams = () => (
  <Illus>
    {/* LLM box with role nodes arranged around it */}
    <rect x={104} y={46} width={72} height={52} rx={5} stroke={L} strokeWidth={1.5} fill="rgba(170,248,112,0.1)" />
    <text x={140} y={72} textAnchor="middle" fill={G} fontSize={8} fontFamily="sans-serif" fontWeight="bold">LLM</text>
    <text x={140} y={83} textAnchor="middle" fill={G} fontSize={6.5} fontFamily="sans-serif" opacity={0.5}>Core</text>
    {/* Role nodes */}
    {[
      [54, 40, "Writer"],
      [54, 90, "Editor"],
      [226, 40, "Strategist"],
      [226, 90, "Analyst"],
      [140, 18, "Orchestrator"],
    ].map(([x, y, label], i) => (
      <g key={i}>
        <circle cx={x as number} cy={y as number} r={14} stroke={G} strokeWidth={1} fill={G10} />
        <text x={x as number} y={(y as number) + 4} textAnchor="middle" fill={G} fontSize={6.5} fontFamily="sans-serif" opacity={0.7}>{label as string}</text>
        <line x1={x as number < 100 ? (x as number) + 14 : x as number > 180 ? (x as number) - 14 : x as number} y1={y as number < 46 ? (y as number) + 14 : y as number} x2={x as number < 100 ? 104 : x as number > 180 ? 176 : 140} y2={y as number < 46 ? 46 : 72} stroke={G} strokeWidth={0.8} opacity={0.3} />
      </g>
    ))}
  </Illus>
);

const AiContentFeedbackLoop = () => (
  <Illus>
    {/* Circular 4-stage feedback loop */}
    <circle cx={140} cy={72} r={44} stroke={G20} strokeWidth={1} fill="none" strokeDasharray="4 3" />
    {[
      [140, 28, "Generate"],
      [184, 72, "Distribute"],
      [140, 116, "Measure"],
      [96, 72, "Optimise"],
    ].map(([cx, cy, label], i) => (
      <g key={i}>
        <circle cx={cx as number} cy={cy as number} r={12} stroke={i === 0 ? L : G} strokeWidth={1.2} fill={i === 0 ? "rgba(170,248,112,0.15)" : G10} />
        <text
          x={(cx as number)}
          y={(cy as number) + (i === 0 ? -16 : i === 2 ? 24 : 4)}
          dx={i === 1 ? 16 : i === 3 ? -16 : 0}
          dy={i === 1 || i === 3 ? -4 : 0}
          textAnchor={i === 1 ? "start" : i === 3 ? "end" : "middle"}
          fill={G} fontSize={7.5} fontFamily="sans-serif" opacity={0.7}
        >{label as string}</text>
      </g>
    ))}
    {/* Curved arrows */}
    <path d="M152,30 A44,44 0 0,1 182,60" stroke={G} strokeWidth={1} fill="none" opacity={0.4} markerEnd="url(#arrFB)" />
    <path d="M182,84 A44,44 0 0,1 152,114" stroke={G} strokeWidth={1} fill="none" opacity={0.4} markerEnd="url(#arrFB)" />
    <path d="M128,114 A44,44 0 0,1 98,84" stroke={G} strokeWidth={1} fill="none" opacity={0.4} markerEnd="url(#arrFB)" />
    <path d="M98,60 A44,44 0 0,1 128,30" stroke={G} strokeWidth={1} fill="none" opacity={0.4} markerEnd="url(#arrFB)" />
    <defs>
      <marker id="arrFB" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
        <path d="M0,0 L5,2.5 L0,5 Z" fill={G} opacity={0.5} />
      </marker>
    </defs>
  </Illus>
);

// ─── Series 5: Personalisation at Scale ──────────────────────────────────────

const PersonalisationArchitectureAIEnterprises = () => (
  <Illus>
    {/* 3 stacked layers: Data / AI / Delivery */}
    {[
      ["Data Layer", G, G10, 34],
      ["AI Layer", L, "rgba(170,248,112,0.12)", 62],
      ["Delivery Layer", G, G10, 90],
    ].map(([label, stroke, fill, y]) => (
      <g key={label as string}>
        <rect x={44} y={y as number} width={192} height={22} rx={4} stroke={stroke as string} strokeWidth={1.2} fill={fill as string} />
        <text x={140} y={(y as number) + 14} textAnchor="middle" fill={G} fontSize={8} fontFamily="sans-serif" opacity={0.7}>{label as string}</text>
      </g>
    ))}
    {/* Connecting arrows */}
    {[56, 84].map((y) => (
      <line key={y} x1={140} y1={y} x2={140} y2={y + 6} stroke={G} strokeWidth={0.9} opacity={0.3} markerEnd="url(#arrPA)" />
    ))}
    {/* Input feeds left */}
    {[40, 56, 72].map((y) => (
      <line key={y} x1={24} y1={y} x2={44} y2={y} stroke={G} strokeWidth={0.7} strokeDasharray="2 2" opacity={0.35} />
    ))}
    {/* Output feeds right */}
    {[96, 104, 112].map((y) => (
      <line key={y} x1={236} y1={y} x2={256} y2={y} stroke={L} strokeWidth={0.7} opacity={0.35} />
    ))}
    <defs>
      <marker id="arrPA" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
        <path d="M0,0 L4,2 L0,4 Z" fill={G} opacity={0.4} />
      </marker>
    </defs>
  </Illus>
);

const ContentModellingPersonalisation = () => (
  <Illus>
    {/* Root content branching into 3 audience variants */}
    <rect x={108} y={28} width={64} height={26} rx={3} stroke={G} strokeWidth={1.2} fill={G10} />
    <text x={140} y={44} textAnchor="middle" fill={G} fontSize={7.5} fontFamily="sans-serif" opacity={0.7}>Content</text>
    {/* Branches */}
    {[72, 140, 208].map((x, i) => (
      <g key={x}>
        <line x1={140} y1={54} x2={x} y2={80} stroke={G} strokeWidth={1} opacity={0.4} />
        <rect x={x - 28} y={80} width={56} height={26} rx={3} stroke={i === 1 ? L : G} strokeWidth={1.2} fill={i === 1 ? "rgba(170,248,112,0.1)" : G10} />
        <text x={x} y={96} textAnchor="middle" fill={G} fontSize={7} fontFamily="sans-serif" opacity={0.7}>{["Segment A", "Segment B", "Segment C"][i]}</text>
      </g>
    ))}
    {/* Sub-branches from each */}
    {[72, 140, 208].map((x) => (
      <g key={`sub${x}`}>
        {[-16, 16].map((dx) => (
          <g key={dx}>
            <line x1={x} y1={106} x2={x + dx} y2={118} stroke={G} strokeWidth={0.7} opacity={0.25} />
            <circle cx={x + dx} cy={118} r={4} stroke={G} strokeWidth={0.8} fill={G10} />
          </g>
        ))}
      </g>
    ))}
  </Illus>
);

const AudienceArchitectureDesigningSegments = () => (
  <Illus>
    {/* 3-circle Venn diagram */}
    <circle cx={116} cy={58} r={36} stroke={G} strokeWidth={1.2} fill={G10} opacity={0.65} />
    <circle cx={164} cy={58} r={36} stroke={G} strokeWidth={1.2} fill={G10} opacity={0.65} />
    <circle cx={140} cy={96} r={36} stroke={G} strokeWidth={1.2} fill={G10} opacity={0.65} />
    {/* Labels */}
    <text x={102} y={50} textAnchor="middle" fill={G} fontSize={8} fontFamily="sans-serif" opacity={0.7}>B2B</text>
    <text x={178} y={50} textAnchor="middle" fill={G} fontSize={8} fontFamily="sans-serif" opacity={0.7}>SMB</text>
    <text x={140} y={114} textAnchor="middle" fill={G} fontSize={8} fontFamily="sans-serif" opacity={0.7}>Enterprise</text>
    {/* Centre intersection */}
    <circle cx={140} cy={72} r={10} stroke={L} strokeWidth={1.2} fill="rgba(170,248,112,0.25)" />
  </Illus>
);

const DecisioningLogicContentPersonalisation = () => (
  <Illus>
    {/* Decision tree with diamond nodes */}
    {/* Root diamond */}
    <polygon points="140,28 160,48 140,68 120,48" stroke={L} strokeWidth={1.5} fill="rgba(170,248,112,0.12)" />
    <text x={140} y={51} textAnchor="middle" fill={G} fontSize={7} fontFamily="sans-serif">Segment?</text>
    {/* Branches */}
    <line x1={120} y1={48} x2={88} y2={72} stroke={G} strokeWidth={1} opacity={0.4} />
    <line x1={160} y1={48} x2={192} y2={72} stroke={G} strokeWidth={1} opacity={0.4} />
    {/* Level 2 diamonds */}
    {[88, 192].map((cx, i) => (
      <g key={cx}>
        <polygon points={`${cx},72 ${cx + 16},88 ${cx},104 ${cx - 16},88`} stroke={G} strokeWidth={1.2} fill={G10} />
        <text x={cx} y={91} textAnchor="middle" fill={G} fontSize={6.5} fontFamily="sans-serif">{["Stage?", "Intent?"][i]}</text>
      </g>
    ))}
    {/* Leaf outputs */}
    {[60, 116, 164, 220].map((x, i) => (
      <g key={x}>
        <line x1={i < 2 ? 88 : 192} y1={104} x2={x} y2={116} stroke={G} strokeWidth={0.8} opacity={0.35} />
        <rect x={x - 18} y={116} width={36} height={14} rx={2} stroke={i % 2 === 0 ? L : G} strokeWidth={0.9} fill={i % 2 === 0 ? "rgba(170,248,112,0.1)" : G10} />
      </g>
    ))}
  </Illus>
);

const PersonalisationScaleB2bEnterprises = () => (
  <Illus>
    {/* Buying committee icons with targeted content arrows */}
    {[68, 140, 212].map((x, i) => (
      <g key={x}>
        {/* Person icon */}
        <circle cx={x} cy={48} r={10} stroke={G} strokeWidth={1} fill={G10} />
        <path d={`M${x - 14},78 Q${x - 14},62 ${x},62 Q${x + 14},62 ${x + 14},78`} stroke={G} strokeWidth={1} fill={G10} />
        {/* Arrow down to content */}
        <line x1={x} y1={80} x2={x} y2={92} stroke={i === 1 ? L : G} strokeWidth={1} opacity={0.5} markerEnd="url(#arrBC)" />
        {/* Content block */}
        <rect x={x - 22} y={92} width={44} height={18} rx={2} stroke={i === 1 ? L : G} strokeWidth={1} fill={i === 1 ? "rgba(170,248,112,0.1)" : G10} />
        <line x1={x - 14} y1={100} x2={x + 14} y2={100} stroke={G} strokeWidth={0.7} opacity={0.3} />
        <line x1={x - 14} y1={105} x2={x + 6} y2={105} stroke={G} strokeWidth={0.7} opacity={0.3} />
      </g>
    ))}
    <defs>
      <marker id="arrBC" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
        <path d="M0,0 L4,2 L0,4 Z" fill={G} opacity={0.5} />
      </marker>
    </defs>
  </Illus>
);

const RealTimePersonalisationArchitecture = () => (
  <Illus>
    {/* Timeline with event spikes and lightning bolt */}
    <line x1={28} y1={90} x2={252} y2={90} stroke={G} strokeWidth={1.2} opacity={0.4} />
    {/* Event spikes */}
    {[68, 112, 156, 200].map((x, i) => (
      <g key={x}>
        <line x1={x} y1={90} x2={x} y2={50 - i * 6} stroke={G} strokeWidth={1} opacity={0.35} />
        <circle cx={x} cy={50 - i * 6} r={3} fill={G} opacity={0.3} />
      </g>
    ))}
    {/* Trigger event highlighted */}
    <line x1={156} y1={90} x2={156} y2={32} stroke={L} strokeWidth={1.5} opacity={0.7} />
    <circle cx={156} cy={32} r={4} fill={L} opacity={0.7} />
    {/* Lightning bolt */}
    <path d="M172,24 L162,44 L170,44 L158,64 L172,44 L164,44 Z" stroke={L} strokeWidth={1} fill="rgba(170,248,112,0.2)" />
    {/* Response block */}
    <rect x={174} y={50} width={56} height={22} rx={3} stroke={L} strokeWidth={1} fill="rgba(170,248,112,0.1)" />
    <text x={202} y={64} textAnchor="middle" fill={G} fontSize={7.5} fontFamily="sans-serif" opacity={0.7}>Response</text>
  </Illus>
);

const PrivacyFirstPersonalisation = () => (
  <Illus>
    {/* Shield with data/targeting lines coming from behind */}
    {/* Data lines behind */}
    {[-28, -14, 0, 14, 28].map((dx, i) => (
      <line key={dx} x1={140 + dx} y1={28} x2={140 + dx} y2={48 + i * 4} stroke={G} strokeWidth={0.8} opacity={0.2} />
    ))}
    {/* Shield */}
    <path
      d="M140,38 L168,50 L168,82 C168,100 140,114 140,114 C140,114 112,100 112,82 L112,50 Z"
      stroke={G}
      strokeWidth={1.5}
      fill="white"
    />
    <path
      d="M140,38 L168,50 L168,82 C168,100 140,114 140,114 C140,114 112,100 112,82 L112,50 Z"
      stroke={G}
      strokeWidth={1.5}
      fill={G10}
    />
    {/* Lock icon inside shield */}
    <rect x={130} y={68} width={20} height={16} rx={2} stroke={L} strokeWidth={1.2} fill="rgba(170,248,112,0.15)" />
    <path d="M134,68 A6,6 0 0,1 146,68" stroke={L} strokeWidth={1.2} fill="none" />
    <circle cx={140} cy={76} r={2.5} stroke={L} strokeWidth={1} fill="rgba(170,248,112,0.4)" />
    {/* Personalisation arrows emerging from sides */}
    {[-1, 1].map((dir) => (
      <line key={dir} x1={140 + dir * 56} y1={76} x2={140 + dir * 26} y2={76} stroke={G} strokeWidth={0.8} strokeDasharray="2 2" opacity={0.35} markerEnd="url(#arrPP)" />
    ))}
    <defs>
      <marker id="arrPP" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
        <path d="M0,0 L4,2 L0,4 Z" fill={G} opacity={0.4} />
      </marker>
    </defs>
  </Illus>
);

const PersonalisationOperations = () => (
  <Illus>
    {/* Control panel with sliders, toggles, dial */}
    <rect x={36} y={28} width={208} height={88} rx={5} stroke={G} strokeWidth={1.2} fill={G10} />
    {/* Sliders */}
    {[50, 66, 82].map((y, i) => (
      <g key={y}>
        <line x1={52} y1={y} x2={168} y2={y} stroke={G} strokeWidth={1} opacity={0.3} />
        <circle cx={90 + i * 24} cy={y} r={5} stroke={i === 1 ? L : G} strokeWidth={1.2} fill={i === 1 ? "rgba(170,248,112,0.3)" : "white"} />
        <text x={175} y={y + 4} fill={G} fontSize={7} fontFamily="sans-serif" opacity={0.5}>{["Freq", "Tone", "Format"][i]}</text>
      </g>
    ))}
    {/* Toggles */}
    {[100, 116].map((y, i) => (
      <g key={y}>
        <rect x={52} y={y - 6} width={24} height={12} rx={6} stroke={G} strokeWidth={1} fill={i === 0 ? "rgba(170,248,112,0.2)" : G10} />
        <circle cx={i === 0 ? 70 : 58} cy={y} r={5} stroke={i === 0 ? L : G} strokeWidth={1} fill="white" />
        <text x={82} y={y + 4} fill={G} fontSize={7} fontFamily="sans-serif" opacity={0.5}>{["AI On", "A/B Test"][i]}</text>
      </g>
    ))}
    {/* Dial */}
    <circle cx={210} cy={75} r={20} stroke={G} strokeWidth={1} fill="white" />
    <circle cx={210} cy={75} r={20} stroke={G} strokeWidth={1} fill={G10} />
    <line x1={210} y1={75} x2={210} y2={58} stroke={L} strokeWidth={1.5} strokeLinecap="round" />
    <circle cx={210} cy={75} r={4} fill={G} />
  </Illus>
);

const MeasuringPersonalisationEffectiveness = () => (
  <Illus>
    {/* A/B bars with lift measurement arrow */}
    {/* A bar */}
    <rect x={72} y={50} width={40} height={60} rx={2} stroke={G} strokeWidth={1.2} fill={G10} />
    <text x={92} y={125} textAnchor="middle" fill={G} fontSize={8} fontFamily="sans-serif" opacity={0.6}>A</text>
    {/* B bar (taller = better) */}
    <rect x={132} y={30} width={40} height={80} rx={2} stroke={L} strokeWidth={1.5} fill="rgba(170,248,112,0.15)" />
    <text x={152} y={125} textAnchor="middle" fill={L} fontSize={8} fontFamily="sans-serif" opacity={0.8}>B</text>
    {/* Lift arrow */}
    <line x1={186} y1={110} x2={186} y2={30} stroke={G} strokeWidth={1} strokeDasharray="3 2" opacity={0.4} />
    <line x1={178} y1={50} x2={186} y2={30} stroke={G} strokeWidth={0.9} opacity={0.4} />
    <line x1={194} y1={50} x2={186} y2={30} stroke={G} strokeWidth={0.9} opacity={0.4} />
    <text x={196} y={68} fill={G} fontSize={7.5} fontFamily="sans-serif" opacity={0.6}>+lift</text>
    {/* Baseline */}
    <line x1={56} y1={110} x2={220} y2={110} stroke={G} strokeWidth={0.8} opacity={0.3} />
  </Illus>
);

// ─── Series 6: Localisation ───────────────────────────────────────────────────

const LocalisationContentOperationsDiscipline = () => (
  <Illus>
    {/* Globe with workflow nodes orbiting */}
    <circle cx={140} cy={72} r={36} stroke={G} strokeWidth={1.2} fill={G10} />
    {/* Globe lines */}
    <ellipse cx={140} cy={72} rx={18} ry={36} stroke={G} strokeWidth={0.7} fill="none" opacity={0.35} />
    <ellipse cx={140} cy={72} rx={36} ry={14} stroke={G} strokeWidth={0.7} fill="none" opacity={0.35} />
    <line x1={140} y1={36} x2={140} y2={108} stroke={G} strokeWidth={0.7} opacity={0.3} />
    {/* Orbit path */}
    <circle cx={140} cy={72} r={54} stroke={G20} strokeWidth={0.8} fill="none" strokeDasharray="4 3" />
    {/* Workflow nodes on orbit */}
    {[0, 90, 180, 270].map((deg) => {
      const rad = (deg * Math.PI) / 180;
      const cx = 140 + 54 * Math.cos(rad);
      const cy = 72 + 54 * Math.sin(rad);
      return <circle key={deg} cx={cx} cy={cy} r={7} stroke={L} strokeWidth={1.2} fill="rgba(170,248,112,0.15)" />;
    })}
  </Illus>
);

const AiPoweredTranslationOperations = () => (
  <Illus>
    {/* Neural network with language characters at input/output */}
    {/* Input chars */}
    {["EN", "DE", "FR"].map((lang, i) => (
      <g key={lang}>
        <rect x={22} y={36 + i * 28} width={28} height={18} rx={2} stroke={G} strokeWidth={1} fill={G10} />
        <text x={36} y={48 + i * 28} textAnchor="middle" fill={G} fontSize={8} fontFamily="sans-serif" opacity={0.7}>{lang}</text>
      </g>
    ))}
    {/* Neural network nodes */}
    {[
      [90, 45], [90, 72], [90, 99],
      [140, 36], [140, 60], [140, 84], [140, 108],
      [190, 45], [190, 72], [190, 99],
    ].map(([cx, cy], i) => (
      <circle key={i} cx={cx} cy={cy} r={5} stroke={i >= 7 ? L : G} strokeWidth={1} fill={i >= 7 ? "rgba(170,248,112,0.12)" : G10} />
    ))}
    {/* Output chars */}
    {["JA", "ZH", "ES"].map((lang, i) => (
      <g key={lang}>
        <rect x={210} y={36 + i * 28} width={28} height={18} rx={2} stroke={L} strokeWidth={1} fill="rgba(170,248,112,0.1)" />
        <text x={224} y={48 + i * 28} textAnchor="middle" fill={L} fontSize={8} fontFamily="sans-serif" opacity={0.8}>{lang}</text>
      </g>
    ))}
    {/* Some connections */}
    <line x1={50} y1={45} x2={85} y2={45} stroke={G} strokeWidth={0.7} opacity={0.3} />
    <line x1={50} y1={73} x2={85} y2={72} stroke={G} strokeWidth={0.7} opacity={0.3} />
    <line x1={50} y1={101} x2={85} y2={99} stroke={G} strokeWidth={0.7} opacity={0.3} />
    <line x1={195} y1={45} x2={210} y2={45} stroke={L} strokeWidth={0.7} opacity={0.4} />
    <line x1={195} y1={72} x2={210} y2={73} stroke={L} strokeWidth={0.7} opacity={0.4} />
    <line x1={195} y1={99} x2={210} y2={101} stroke={L} strokeWidth={0.7} opacity={0.4} />
  </Illus>
);

const ContentArchitectureMultilingualDelivery = () => (
  <Illus>
    {/* Content tree with language-labelled branches */}
    <rect x={110} y={24} width={60} height={22} rx={3} stroke={G} strokeWidth={1.2} fill={G10} />
    <text x={140} y={38} textAnchor="middle" fill={G} fontSize={8} fontFamily="sans-serif" opacity={0.7}>Master</text>
    {/* Branches */}
    {[56, 108, 172, 224].map((x, i) => (
      <g key={x}>
        <line x1={140} y1={46} x2={x} y2={72} stroke={G} strokeWidth={1} opacity={0.4} />
        <rect x={x - 22} y={72} width={44} height={20} rx={3} stroke={i === 0 ? L : G} strokeWidth={1.2} fill={i === 0 ? "rgba(170,248,112,0.1)" : G10} />
        <text x={x} y={85} textAnchor="middle" fill={G} fontSize={8} fontFamily="sans-serif" opacity={0.7}>{["EN", "DE", "JA", "ES"][i]}</text>
        {/* Sub-locale */}
        {i === 0 && (
          <g>
            <line x1={x} y1={92} x2={x - 12} y2={108} stroke={G} strokeWidth={0.8} opacity={0.3} />
            <line x1={x} y1={92} x2={x + 12} y2={108} stroke={G} strokeWidth={0.8} opacity={0.3} />
            <rect x={x - 22} y={108} width={22} height={14} rx={2} stroke={G} strokeWidth={0.7} fill={G10} />
            <rect x={x + 2} y={108} width={22} height={14} rx={2} stroke={G} strokeWidth={0.7} fill={G10} />
            <text x={x - 11} y={118} textAnchor="middle" fill={G} fontSize={6.5} fontFamily="sans-serif" opacity={0.5}>en-US</text>
            <text x={x + 13} y={118} textAnchor="middle" fill={G} fontSize={6.5} fontFamily="sans-serif" opacity={0.5}>en-GB</text>
          </g>
        )}
      </g>
    ))}
  </Illus>
);

const LocalisationWorkflowDesign = () => (
  <Illus>
    {/* Source docs → TMS box → target docs */}
    {/* Source docs */}
    {[44, 64].map((y) => (
      <rect key={y} x={22} y={y} width={44} height={28} rx={2} stroke={G} strokeWidth={1} fill={G10} />
    ))}
    <line x1={29} y1={52} x2={58} y2={52} stroke={G} strokeWidth={0.7} opacity={0.3} />
    <line x1={29} y1={58} x2={54} y2={58} stroke={G} strokeWidth={0.7} opacity={0.3} />
    {/* Arrow */}
    <line x1={66} y1={72} x2={88} y2={72} stroke={G} strokeWidth={1} opacity={0.4} markerEnd="url(#arrLW)" />
    {/* TMS box */}
    <rect x={88} y={50} width={104} height={44} rx={4} stroke={L} strokeWidth={1.5} fill="rgba(170,248,112,0.1)" />
    <text x={140} y={70} textAnchor="middle" fill={G} fontSize={8.5} fontFamily="sans-serif" fontWeight="bold">TMS</text>
    <text x={140} y={82} textAnchor="middle" fill={G} fontSize={7} fontFamily="sans-serif" opacity={0.5}>Translation Memory</text>
    {/* Arrow */}
    <line x1={192} y1={72} x2={214} y2={72} stroke={G} strokeWidth={1} opacity={0.4} markerEnd="url(#arrLW)" />
    {/* Target docs */}
    {[44, 64].map((y) => (
      <rect key={y} x={214} y={y} width={44} height={28} rx={2} stroke={L} strokeWidth={1} fill="rgba(170,248,112,0.1)" />
    ))}
    <defs>
      <marker id="arrLW" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
        <path d="M0,0 L5,2.5 L0,5 Z" fill={G} opacity={0.5} />
      </marker>
    </defs>
  </Illus>
);

const TerminologyManagementGlobalContent = () => (
  <Illus>
    {/* Two-column term table with cross-language connection lines */}
    {/* EN column */}
    <rect x={30} y={28} width={90} height={88} rx={3} stroke={G} strokeWidth={1.2} fill={G10} />
    <text x={75} y={42} textAnchor="middle" fill={L} fontSize={8} fontFamily="sans-serif" fontWeight="bold">EN</text>
    {["Content", "Workflow", "Taxonomy", "Metadata"].map((term, i) => (
      <g key={term}>
        <line x1={38} y1={52 + i * 18} x2={112} y2={52 + i * 18} stroke={G} strokeWidth={0.6} opacity={0.2} />
        <text x={40} y={50 + i * 18} fill={G} fontSize={7.5} fontFamily="sans-serif" opacity={0.7}>{term}</text>
      </g>
    ))}
    {/* DE column */}
    <rect x={160} y={28} width={90} height={88} rx={3} stroke={G} strokeWidth={1.2} fill={G10} />
    <text x={205} y={42} textAnchor="middle" fill={L} fontSize={8} fontFamily="sans-serif" fontWeight="bold">DE</text>
    {["Inhalt", "Workflow", "Taxonomie", "Metadaten"].map((term, i) => (
      <g key={term}>
        <line x1={168} y1={52 + i * 18} x2={242} y2={52 + i * 18} stroke={G} strokeWidth={0.6} opacity={0.2} />
        <text x={170} y={50 + i * 18} fill={G} fontSize={7.5} fontFamily="sans-serif" opacity={0.7}>{term}</text>
      </g>
    ))}
    {/* Cross-language lines */}
    {[50, 68, 86, 104].map((y, i) => (
      <line key={y} x1={120} y1={y} x2={160} y2={y} stroke={i === 0 ? L : G} strokeWidth={i === 0 ? 1 : 0.7} opacity={i === 0 ? 0.6 : 0.3} strokeDasharray={i === 0 ? "" : "2 2"} />
    ))}
  </Illus>
);

const GlobalContentStrategyAIEnterprises = () => (
  <Illus>
    {/* Simplified world map outline with market nodes */}
    {/* Continents as rough shapes */}
    <path d="M40,56 Q54,44 72,48 Q84,44 88,56 Q84,68 72,70 Q54,72 40,56 Z" stroke={G} strokeWidth={1} fill={G10} opacity={0.6} />
    <path d="M96,52 Q108,42 124,46 Q138,42 148,52 Q148,64 136,70 Q120,76 100,68 Q90,62 96,52 Z" stroke={G} strokeWidth={1} fill={G10} opacity={0.6} />
    <path d="M156,46 Q176,38 200,42 Q220,40 232,50 Q236,62 220,70 Q200,76 180,74 Q158,68 152,58 Z" stroke={G} strokeWidth={1} fill={G10} opacity={0.6} />
    <path d="M100,84 Q116,78 128,84 Q132,96 120,104 Q104,104 96,96 Z" stroke={G} strokeWidth={0.8} fill={G10} opacity={0.5} />
    <path d="M164,80 Q180,76 196,82 Q200,94 188,100 Q170,102 160,94 Z" stroke={G} strokeWidth={0.8} fill={G10} opacity={0.5} />
    {/* Market nodes */}
    {[
      [64, 56], [120, 56], [192, 54], [112, 94], [180, 90],
    ].map(([cx, cy], i) => (
      <circle key={i} cx={cx} cy={cy} r={i === 0 ? 8 : 6} stroke={i === 0 ? L : G} strokeWidth={i === 0 ? 1.5 : 1} fill={i === 0 ? "rgba(170,248,112,0.2)" : "white"} />
    ))}
    {/* Connection lines between markets */}
    <line x1={72} y1={56} x2={114} y2={56} stroke={G} strokeWidth={0.8} strokeDasharray="3 2" opacity={0.35} />
    <line x1={126} y1={56} x2={186} y2={54} stroke={G} strokeWidth={0.8} strokeDasharray="3 2" opacity={0.35} />
    <line x1={64} y1={64} x2={112} y2={88} stroke={G} strokeWidth={0.8} strokeDasharray="3 2" opacity={0.25} />
  </Illus>
);

const FutureOfContentInfrastructure = () => (
  <Illus>
    {/* Horizon line with emerging architecture shapes */}
    {/* Sky gradient effect */}
    <rect x={24} y={28} width={232} height={60} rx={0} fill={G10} opacity={0.4} />
    {/* Horizon line */}
    <line x1={24} y1={88} x2={256} y2={88} stroke={G} strokeWidth={1.5} opacity={0.5} />
    {/* Ground */}
    <rect x={24} y={88} width={232} height={28} rx={0} fill={G10} opacity={0.3} />
    {/* Emerging shapes above horizon */}
    {[56, 100, 140, 180, 224].map((x, i) => {
      const h = [32, 44, 56, 38, 28][i];
      return (
        <rect key={x} x={x - 12} y={88 - h} width={24} height={h} rx={2} stroke={i === 2 ? L : G} strokeWidth={i === 2 ? 1.5 : 1} fill={i === 2 ? "rgba(170,248,112,0.1)" : G10} opacity={0.8} />
      );
    })}
    {/* Connection nodes at tops */}
    {[56, 100, 140, 180, 224].map((x, i) => {
      const h = [32, 44, 56, 38, 28][i];
      return <circle key={x} cx={x} cy={88 - h} r={4} stroke={i === 2 ? L : G} strokeWidth={1} fill="white" />;
    })}
    {/* Connection lines between tops */}
    {[[56, 56, 100, 44], [100, 44, 140, 32], [140, 32, 180, 50], [180, 50, 224, 60]].map(([x1, h1, x2, h2], i) => (
      <line key={i} x1={x1} y1={88 - h1} x2={x2} y2={88 - h2} stroke={G} strokeWidth={0.8} strokeDasharray="3 2" opacity={0.35} />
    ))}
  </Illus>
);

// ─── Default fallback ─────────────────────────────────────────────────────────

function DefaultIllustration({ n }: { n: number }) {
  return (
    <Illus>
      <text
        x={140}
        y={82}
        textAnchor="middle"
        fill={G}
        fontSize={52}
        fontFamily="sans-serif"
        fontWeight="bold"
        opacity={0.12}
      >
        {String(n).padStart(2, "0")}
      </text>
    </Illus>
  );
}

// ─── Slug → illustration map ──────────────────────────────────────────────────

const ILLUSTRATIONS: Record<string, React.ReactElement> = {
  // Series 1
  "content-infrastructure-imperative": <ContentInfrastructureImperative />,
  "content-governance-age-of-ai": <ContentGovernanceAgeOfAI />,
  "content-lifecycle-redesigned": <ContentLifecycleRedesigned />,
  "content-as-organisational-intelligence": <ContentAsOrganisationalIntelligence />,
  "building-business-case-content-infrastructure": <BuildingBusinessCaseContentInfrastructure />,
  // Series 2
  "process-architecture-content-operations": <ProcessArchitectureContentOperations />,
  "content-brief-as-system-input": <ContentBriefAsSystemInput />,
  "workflow-automation-content-teams": <WorkflowAutomationContentTeams />,
  "approval-flows-that-dont-kill-momentum": <ApprovalFlowsThatDontKillMomentum />,
  "cross-functional-content-operations": <CrossFunctionalContentOperations />,
  "content-operations-metrics-that-matter": <ContentOperationsMetricsThatMatter />,
  "content-operations-regulated-industries": <ContentOperationsRegulatedIndustries />,
  "content-operations-maturity-model": <ContentOperationsMaturityModel />,
  "operationalising-content-strategy": <OperalisingContentStrategy />,
  // Series 3
  "information-architecture-ai-systems": <InformationArchitectureAiSystems />,
  "taxonomy-design-scalable-content-systems": <TaxonomyDesignScalableContentSystems />,
  "metadata-strategy-ai-powered-enterprises": <MetadataStrategyAiPoweredEnterprises />,
  "content-modelling-enterprise-ai": <ContentModellingEnterpriseAI />,
  "structured-authoring-at-scale": <StructuredAuthoringAtScale />,
  "knowledge-architecture-ai-enterprises": <KnowledgeArchitectureAIEnterprises />,
  "semantic-structure-ai-content-systems": <SemanticStructureAIContentSystems />,
  "cms-architecture-ai-driven-enterprises": <CmsArchitectureAIDrivenEnterprises />,
  "content-findability-system-capability": <ContentFindabilitySystemCapability />,
  // Series 4
  "designing-ai-content-operating-system": <DesigningAIContentOperatingSystem />,
  "prompt-architecture-content-teams": <PromptArchitectureContentTeams />,
  "ai-quality-assurance-content-operations": <AiQualityAssuranceContentOperations />,
  "ai-content-risk-management": <AiContentRiskManagement />,
  "content-velocity-managing-speed-quality": <ContentVelocityManagingSpeedQuality />,
  "retrieval-augmented-content-systems": <RetrievalAugmentedContentSystems />,
  "ai-powered-content-auditing": <AiPoweredContentAuditing />,
  "content-intelligence-platforms": <ContentIntelligencePlatforms />,
  "operationalising-llms-content-teams": <OperalisingLlmsContentTeams />,
  "ai-content-feedback-loop": <AiContentFeedbackLoop />,
  // Series 5
  "personalisation-architecture-ai-enterprises": <PersonalisationArchitectureAIEnterprises />,
  "content-modelling-personalisation": <ContentModellingPersonalisation />,
  "audience-architecture-designing-segments": <AudienceArchitectureDesigningSegments />,
  "decisioning-logic-content-personalisation": <DecisioningLogicContentPersonalisation />,
  "personalisation-scale-b2b-enterprises": <PersonalisationScaleB2bEnterprises />,
  "real-time-personalisation-architecture": <RealTimePersonalisationArchitecture />,
  "privacy-first-personalisation": <PrivacyFirstPersonalisation />,
  "personalisation-operations": <PersonalisationOperations />,
  "measuring-personalisation-effectiveness": <MeasuringPersonalisationEffectiveness />,
  // Series 6
  "localisation-content-operations-discipline": <LocalisationContentOperationsDiscipline />,
  "ai-powered-translation-operations": <AiPoweredTranslationOperations />,
  "content-architecture-multilingual-delivery": <ContentArchitectureMultilingualDelivery />,
  "localisation-workflow-design": <LocalisationWorkflowDesign />,
  "terminology-management-global-content": <TerminologyManagementGlobalContent />,
  "global-content-strategy-ai-enterprises": <GlobalContentStrategyAIEnterprises />,
  "future-of-content-infrastructure": <FutureOfContentInfrastructure />,
};

// ─── Exported component ───────────────────────────────────────────────────────

export default function GuideIllustration({
  slug,
  guideNumber = 0,
}: {
  slug: string;
  guideNumber?: number;
}) {
  return ILLUSTRATIONS[slug] ?? <DefaultIllustration n={guideNumber} />;
}

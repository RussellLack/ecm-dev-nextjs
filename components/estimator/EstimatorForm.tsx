"use client";

import type {
  EstimatorInputs,
  MaturityLevel,
  CadenceLevel,
  FrictionScore,
  RegulatedFlag,
  DisplayCurrency,
  ContentMix,
  ChannelMix,
} from "@/lib/estimator/types";

interface Props {
  inputs: EstimatorInputs;
  onChange: (patch: Partial<EstimatorInputs>) => void;
  onReset: () => void;
}

export default function EstimatorForm({ inputs, onChange, onReset }: Props) {
  const contentSum = sum(Object.values(inputs.contentMix));
  const channelSum = sum(Object.values(inputs.channelMix));

  const updateContentMix = (key: keyof ContentMix, value: number) => {
    onChange({ contentMix: { ...inputs.contentMix, [key]: value } });
  };
  const updateChannelMix = (key: keyof ChannelMix, value: number) => {
    onChange({ channelMix: { ...inputs.channelMix, [key]: value } });
  };

  return (
    <div className="font-barlow">
      <Group title="Footprint">
        <RangeRow
          label="Annual source words"
          value={inputs.volume}
          min={50_000}
          max={20_000_000}
          step={25_000}
          onChange={(v) => onChange({ volume: v })}
          format={(v) => v.toLocaleString("en-US")}
        />
        <RangeRow
          label="% of source AI-assisted"
          value={inputs.aiShare}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => onChange({ aiShare: v })}
          format={pct}
        />
        <NumberRow
          label="Target languages"
          value={inputs.languages}
          min={1}
          max={50}
          onChange={(v) => onChange({ languages: v })}
        />
      </Group>

      <Group title="Content mix (must sum to 100%)">
        {contentMixKeys.map((key) => (
          <RangeRow
            key={key}
            label={contentMixLabels[key]}
            value={inputs.contentMix[key]}
            min={0}
            max={1}
            step={0.05}
            onChange={(v) => updateContentMix(key, v)}
            format={pct}
          />
        ))}
        <SumCheck total={contentSum} />
      </Group>

      <Group title="Operating model">
        <SelectRow
          label="AI maturity"
          value={inputs.maturity}
          options={[
            { value: 0, label: "L0 — no AI" },
            { value: 1, label: "L1 — ad-hoc AI" },
            { value: 2, label: "L2 — systematic MT+PE" },
            { value: 3, label: "L3 — AI creation + translation" },
            { value: 4, label: "L4 — fully AI-native" },
          ]}
          onChange={(v) => onChange({ maturity: v as MaturityLevel })}
        />
        <SelectRow
          label="Update cadence"
          value={inputs.cadence}
          options={[
            { value: 1, label: "Rare / one-off" },
            { value: 2, label: "Annual" },
            { value: 3, label: "Quarterly" },
            { value: 4, label: "Monthly" },
            { value: 5, label: "Continuous" },
          ]}
          onChange={(v) => onChange({ cadence: v as CadenceLevel })}
        />
      </Group>

      <Group title="Friction signals (0–3)">
        <RangeRow
          label="Rework frequency"
          value={inputs.rework}
          min={0}
          max={3}
          step={1}
          onChange={(v) => onChange({ rework: v as FrictionScore })}
          format={String}
        />
        <RangeRow
          label="Tooling fragmentation"
          value={inputs.fragmentation}
          min={0}
          max={3}
          step={1}
          onChange={(v) => onChange({ fragmentation: v as FrictionScore })}
          format={String}
        />
        <RangeRow
          label="AI coordination gap"
          value={inputs.aiCoordGap}
          min={0}
          max={3}
          step={1}
          onChange={(v) => onChange({ aiCoordGap: v as FrictionScore })}
          format={String}
        />
      </Group>

      <Group title="Channel mix (must sum to 100%)">
        {channelMixKeys.map((key) => (
          <RangeRow
            key={key}
            label={channelMixLabels[key]}
            value={inputs.channelMix[key]}
            min={0}
            max={1}
            step={0.05}
            onChange={(v) => updateChannelMix(key, v)}
            format={pct}
          />
        ))}
        <SumCheck total={channelSum} />
      </Group>

      <Group title="Other">
        <SelectRow
          label="Regulated industry"
          value={inputs.regulated}
          options={[
            { value: 0, label: "No" },
            { value: 1, label: "Yes (AI Act / fin-serv / health / life sciences)" },
          ]}
          onChange={(v) => onChange({ regulated: v as RegulatedFlag })}
        />
        <SelectRow
          label="Display currency"
          value={inputs.displayCurrency}
          options={[
            { value: "EUR", label: "EUR" },
            { value: "USD", label: "USD" },
          ]}
          onChange={(v) => onChange({ displayCurrency: v as DisplayCurrency })}
        />
      </Group>

      <button
        type="button"
        onClick={onReset}
        className="mt-5 w-full rounded-full border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-ecm-gray transition-colors hover:border-ecm-green hover:text-ecm-green"
      >
        Reset to defaults
      </button>
    </div>
  );
}

// ───────── small helpers ─────────

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5 last:mb-0">
      <h2 className="mb-3 border-b border-gray-200 pb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-ecm-gray">
        {title}
      </h2>
      {children}
    </section>
  );
}

interface RangeRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
}

function RangeRow({ label, value, min, max, step, onChange, format }: RangeRowProps) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
      <label className="flex-1 text-ecm-gray-dark">{label}</label>
      <div className="flex items-center gap-2.5">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-[140px] accent-ecm-green"
        />
        <span className="min-w-[80px] text-right text-[13px] tabular-nums text-ecm-gray-dark">
          {format(value)}
        </span>
      </div>
    </div>
  );
}

function NumberRow({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
      <label className="flex-1 text-ecm-gray-dark">{label}</label>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
        className="w-[100px] rounded-md border border-gray-200 bg-white px-2 py-1 text-right text-sm text-ecm-gray-dark focus:border-ecm-green focus:outline-none"
      />
    </div>
  );
}

interface SelectRowProps<T extends string | number> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}

function SelectRow<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: SelectRowProps<T>) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
      <label className="flex-1 text-ecm-gray-dark">{label}</label>
      <select
        value={value}
        onChange={(e) => {
          const raw = e.target.value;
          const first = options[0].value;
          onChange((typeof first === "number" ? parseInt(raw, 10) : raw) as T);
        }}
        className="w-[220px] rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-ecm-gray-dark focus:border-ecm-green focus:outline-none"
      >
        {options.map((opt) => (
          <option key={String(opt.value)} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function SumCheck({ total }: { total: number }) {
  const ok = Math.abs(total - 1) < 0.01;
  return (
    <div
      className={`mt-2.5 border-t border-dashed border-gray-200 pt-1.5 text-xs ${
        ok ? "text-ecm-gray" : "text-red-600"
      }`}
    >
      Total: {pct(total)}
      {!ok && " (should be 100%)"}
    </div>
  );
}

// ───────── constants ─────────

const contentMixKeys: (keyof ContentMix)[] = [
  "marketing",
  "product",
  "support",
  "legal",
  "video",
  "training",
];
const contentMixLabels: Record<keyof ContentMix, string> = {
  marketing: "Marketing",
  product: "Product / UI",
  support: "Support / KB",
  legal: "Legal / regulatory",
  video: "Video",
  training: "Training / learning",
};
const channelMixKeys: (keyof ChannelMix)[] = [
  "web",
  "mobile",
  "inproduct",
  "video",
  "print",
  "email",
  "social",
  "voice",
];
const channelMixLabels: Record<keyof ChannelMix, string> = {
  web: "Web",
  mobile: "Mobile app",
  inproduct: "In-product strings",
  video: "Video / audio",
  print: "Print",
  email: "Email",
  social: "Social",
  voice: "Voice / chat",
};

function sum(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0);
}
function pct(v: number): string {
  return Math.round(v * 100) + "%";
}

"use client";

import type {
  CmsImplementationInputs,
  OrgSize,
  Region,
  Currency,
  CurrentPlatformBucket,
  YearsOnPlatform,
  TargetTier,
  Deployment,
  PageBucket,
  Personalisation,
  UpdateFreq,
  TeamSize,
} from "@/lib/assessment/cms-implementation/types";

interface Props {
  inputs: CmsImplementationInputs;
  onChange: (patch: DeepPartial<CmsImplementationInputs>) => void;
  onReset: () => void;
}

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

export default function CmsImplementationForm({ inputs, onChange, onReset }: Props) {
  const update = <K extends keyof CmsImplementationInputs>(
    section: K,
    patch: DeepPartial<CmsImplementationInputs[K]>,
  ) => onChange({ [section]: patch } as DeepPartial<CmsImplementationInputs>);

  const toggleArray = (current: string[], value: string): string[] =>
    current.includes(value) ? current.filter((v) => v !== value) : [...current, value];

  return (
    <div className="font-barlow">
      {/* Step 1 — Organisation */}
      <Group title="1. Your organisation">
        <SelectRow
          label="Organisation size"
          value={inputs.org.size}
          options={ORG_SIZE_OPTIONS}
          onChange={(v) => update("org", { size: v as OrgSize })}
        />
        <SelectRow
          label="Industry"
          value={inputs.org.industry}
          options={INDUSTRY_OPTIONS}
          onChange={(v) => update("org", { industry: v })}
        />
        <SelectRow
          label="Region (HQ)"
          value={inputs.org.region}
          options={REGION_OPTIONS}
          onChange={(v) => {
            const region = v as Region;
            // Auto-default the currency on region change.
            const currency: Currency =
              region === "UK" ? "GBP" : region === "EU" ? "EUR" : "USD";
            update("org", { region, currency });
          }}
        />
        <SelectRow
          label="Display currency"
          value={inputs.org.currency}
          options={CURRENCY_OPTIONS}
          onChange={(v) => update("org", { currency: v as Currency })}
        />
      </Group>

      {/* Step 2 — Current platform */}
      <Group title="2. Current platform">
        <SelectRow
          label="Current platform"
          value={inputs.current.platform}
          options={CURRENT_PLATFORM_OPTIONS}
          onChange={(v) =>
            update("current", { platform: v as CurrentPlatformBucket })
          }
        />
        <SelectRow
          label="Years on current platform"
          value={inputs.current.yearsOnPlatform}
          options={YEARS_OPTIONS}
          onChange={(v) =>
            update("current", { yearsOnPlatform: v as YearsOnPlatform })
          }
        />
        <CheckRow
          label="Pain points"
          options={PAIN_POINT_OPTIONS}
          values={inputs.current.painPoints}
          onToggle={(v) =>
            update("current", {
              painPoints: toggleArray(inputs.current.painPoints, v),
            })
          }
        />
      </Group>

      {/* Step 3 — Target platform */}
      <Group title="3. Target platform">
        <SelectRow
          label="Target tier"
          value={inputs.target.tier}
          options={TARGET_TIER_OPTIONS}
          onChange={(v) => {
            // Tier change resets vendor — they're tier-scoped.
            update("target", { tier: v as TargetTier, vendor: undefined });
          }}
        />
        <SelectRow
          label="Specific vendor (optional)"
          value={inputs.target.vendor ?? ""}
          options={vendorOptionsForTier(inputs.target.tier)}
          onChange={(v) =>
            update("target", { vendor: v === "" ? undefined : v })
          }
        />
        <SelectRow
          label="Deployment model"
          value={inputs.target.deployment}
          options={DEPLOYMENT_OPTIONS}
          onChange={(v) => update("target", { deployment: v as Deployment })}
        />
      </Group>

      {/* Step 4 — Scope */}
      <Group title="4. Scope & complexity">
        <NumberRow
          label="Number of brands / sites"
          value={inputs.scope.sites}
          min={1}
          max={50}
          onChange={(v) => update("scope", { sites: v })}
        />
        <NumberRow
          label="Locales / languages"
          value={inputs.scope.locales}
          min={1}
          max={40}
          onChange={(v) => update("scope", { locales: v })}
        />
        <SelectRow
          label="Approx. page / asset count"
          value={inputs.scope.pageBucket}
          options={PAGE_BUCKET_OPTIONS}
          onChange={(v) => update("scope", { pageBucket: v as PageBucket })}
        />
        <CheckRow
          label="Required integrations"
          options={INTEGRATION_OPTIONS}
          values={inputs.scope.integrations}
          onToggle={(v) =>
            update("scope", {
              integrations: toggleArray(inputs.scope.integrations, v),
            })
          }
        />
        <SelectRow
          label="Personalisation / AI"
          value={inputs.scope.personalisation}
          options={PERSONALISATION_OPTIONS}
          onChange={(v) =>
            update("scope", { personalisation: v as Personalisation })
          }
        />
        <CheckRow
          label="Compliance constraints"
          options={COMPLIANCE_OPTIONS}
          values={inputs.scope.compliance}
          onToggle={(v) =>
            update("scope", {
              compliance: toggleArray(inputs.scope.compliance, v),
            })
          }
        />
      </Group>

      {/* Step 5 — Runtime */}
      <Group title="5. Run-time profile">
        <NumberRow
          label="Editor / content-author count"
          value={inputs.runtime.editors}
          min={1}
          max={500}
          onChange={(v) => update("runtime", { editors: v })}
        />
        <SelectRow
          label="Content updates per week"
          value={inputs.runtime.updateFreq}
          options={UPDATE_FREQ_OPTIONS}
          onChange={(v) => update("runtime", { updateFreq: v as UpdateFreq })}
        />
        <SelectRow
          label="Internal platform team"
          value={inputs.runtime.teamSize}
          options={TEAM_SIZE_OPTIONS}
          onChange={(v) => update("runtime", { teamSize: v as TeamSize })}
        />
        <NumberRow
          label="Annual online revenue (optional)"
          value={inputs.runtime.revenue ?? 0}
          min={0}
          max={1_000_000_000}
          step={100_000}
          onChange={(v) => update("runtime", { revenue: v || undefined })}
          hint="Leave blank to skip the revenue-uplift benefit row"
        />
        <SelectRow
          label="TCO horizon"
          value={String(inputs.runtime.horizon)}
          options={HORIZON_OPTIONS}
          onChange={(v) =>
            update("runtime", { horizon: parseInt(v, 10) as 3 | 5 })
          }
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

/* ── Layout helpers ────────────────────────────────────────────────────── */

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6 last:mb-0">
      <h2 className="mb-3 border-b border-gray-200 pb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-ecm-gray">
        {title}
      </h2>
      {children}
    </section>
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
    <div className="mb-2 flex items-start justify-between gap-3 text-sm">
      <label className="flex-1 pt-1 text-ecm-gray-dark">{label}</label>
      <select
        value={value}
        onChange={(e) => {
          const raw = e.target.value;
          const first = options[0]?.value;
          onChange(
            (typeof first === "number" ? parseInt(raw, 10) : raw) as T,
          );
        }}
        className="w-[260px] max-w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm text-ecm-gray-dark focus:border-ecm-green focus:outline-none"
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

function NumberRow({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <div className="mb-2 text-sm">
      <div className="flex items-center justify-between gap-3">
        <label className="flex-1 text-ecm-gray-dark">{label}</label>
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
          className="w-[140px] rounded-md border border-gray-200 bg-white px-2 py-1.5 text-right text-sm text-ecm-gray-dark focus:border-ecm-green focus:outline-none"
        />
      </div>
      {hint && (
        <p className="mt-0.5 text-right text-[11px] text-ecm-gray">{hint}</p>
      )}
    </div>
  );
}

function CheckRow({
  label,
  options,
  values,
  onToggle,
}: {
  label: string;
  options: { value: string; label: string }[];
  values: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="mb-3 text-sm">
      <p className="mb-2 text-ecm-gray-dark">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = values.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onToggle(opt.value)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                active
                  ? "border-ecm-green bg-ecm-green text-white"
                  : "border-gray-200 bg-white text-ecm-gray-dark hover:border-ecm-green hover:text-ecm-green"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Option lists ──────────────────────────────────────────────────────── */

const ORG_SIZE_OPTIONS = [
  { value: "small", label: "Small (<200 employees)" },
  { value: "mid", label: "Mid-market (200–2,000)" },
  { value: "enterprise", label: "Enterprise (2,000+)" },
  { value: "global", label: "Global enterprise (10,000+)" },
];

const INDUSTRY_OPTIONS = [
  { value: "financial-services", label: "Financial services" },
  { value: "healthcare", label: "Healthcare" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "retail", label: "Retail" },
  { value: "technology", label: "Technology" },
  { value: "public-sector", label: "Public sector" },
  { value: "energy", label: "Energy" },
  { value: "professional-services", label: "Professional services" },
  { value: "other", label: "Other" },
];

const REGION_OPTIONS = [
  { value: "UK", label: "UK" },
  { value: "EU", label: "EU" },
  { value: "US", label: "US" },
  { value: "Other", label: "Other / Offshore" },
];

const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD ($)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "EUR", label: "EUR (€)" },
];

const CURRENT_PLATFORM_OPTIONS = [
  { value: "greenfield", label: "Greenfield (no existing platform)" },
  { value: "wordpress", label: "WordPress" },
  { value: "sitecore-on-prem", label: "Sitecore (on-prem)" },
  { value: "sitecore-xm-cloud", label: "Sitecore XM Cloud" },
  { value: "optimizely", label: "Optimizely" },
  { value: "adobe-aem", label: "Adobe AEM" },
  { value: "drupal-acquia", label: "Drupal / Acquia" },
  { value: "kentico", label: "Kentico" },
  { value: "umbraco", label: "Umbraco" },
  { value: "sitefinity", label: "Sitefinity" },
  { value: "custom", label: "Custom / in-house" },
  { value: "opentext", label: "OpenText" },
  { value: "hyland-onbase", label: "Hyland OnBase" },
  { value: "other-ecm", label: "Other ECM" },
  { value: "headless", label: "Headless (Sanity / Contentful / etc.)" },
];

const YEARS_OPTIONS = [
  { value: "<3", label: "<3 years" },
  { value: "3-6", label: "3–6 years" },
  { value: "6-10", label: "6–10 years" },
  { value: "10+", label: "10+ years" },
];

const PAIN_POINT_OPTIONS = [
  { value: "slow-publish", label: "Slow to publish" },
  { value: "dev-bottleneck", label: "Dev bottleneck" },
  { value: "no-localisation", label: "No localisation" },
  { value: "poor-omnichannel", label: "Poor mobile / omnichannel" },
  { value: "expensive", label: "Expensive to run" },
  { value: "vendor-eol", label: "Vendor exiting / EOL" },
  { value: "compliance", label: "Security / compliance gaps" },
  { value: "no-ai", label: "Cannot integrate AI" },
];

const TARGET_TIER_OPTIONS = [
  { value: "headless", label: "Headless / composable" },
  { value: "midMarket", label: "Mid-market CMS" },
  { value: "dxp", label: "DXP / enterprise platform" },
  { value: "ecm", label: "ECM (document-centric)" },
  { value: "unsure", label: "Not sure — show me a comparison" },
];

const VENDOR_OPTIONS_BY_TIER: Record<string, { value: string; label: string }[]> = {
  headless: [
    { value: "", label: "Don't know yet" },
    { value: "sanity", label: "Sanity" },
    { value: "contentful", label: "Contentful" },
    { value: "storyblok", label: "Storyblok" },
    { value: "strapi", label: "Strapi" },
    { value: "kontent-ai", label: "Kontent.ai" },
    { value: "hygraph", label: "Hygraph" },
    { value: "payload", label: "Payload" },
  ],
  midMarket: [
    { value: "", label: "Don't know yet" },
    { value: "kentico", label: "Kentico Xperience" },
    { value: "umbraco", label: "Umbraco" },
    { value: "sitefinity", label: "Sitefinity" },
    { value: "drupal", label: "Drupal" },
  ],
  dxp: [
    { value: "", label: "Don't know yet" },
    { value: "sitecore-on-prem", label: "Sitecore (on-prem)" },
    { value: "sitecore-xm-cloud", label: "Sitecore XM Cloud" },
    { value: "optimizely", label: "Optimizely" },
    { value: "adobe-aem", label: "Adobe AEM" },
    { value: "acquia", label: "Acquia" },
    { value: "bloomreach", label: "Bloomreach" },
  ],
  ecm: [
    { value: "", label: "Don't know yet" },
    { value: "hyland-onbase", label: "Hyland OnBase" },
    { value: "opentext", label: "OpenText" },
    { value: "ibm-filenet", label: "IBM FileNet" },
    { value: "m-files", label: "M-Files" },
    { value: "alfresco", label: "Alfresco" },
  ],
  unsure: [{ value: "", label: "—" }],
};

function vendorOptionsForTier(tier: TargetTier) {
  return VENDOR_OPTIONS_BY_TIER[tier] ?? [{ value: "", label: "—" }];
}

const DEPLOYMENT_OPTIONS = [
  { value: "saas", label: "SaaS (vendor-managed)" },
  { value: "paas", label: "PaaS / managed cloud" },
  { value: "self-hosted", label: "Self-hosted" },
  { value: "unsure", label: "Don't know yet" },
];

const PAGE_BUCKET_OPTIONS = [
  { value: "<500", label: "<500" },
  { value: "500-5k", label: "500–5,000" },
  { value: "5k-50k", label: "5,000–50,000" },
  { value: "50k+", label: "50,000+" },
];

const INTEGRATION_OPTIONS = [
  { value: "crm", label: "CRM" },
  { value: "erp", label: "ERP" },
  { value: "pim-dam", label: "PIM / DAM" },
  { value: "marketing", label: "Marketing automation" },
  { value: "commerce", label: "Commerce / cart" },
  { value: "sso", label: "Identity / SSO" },
  { value: "analytics", label: "Analytics" },
  { value: "personalisation", label: "Personalisation engine" },
  { value: "ai", label: "AI / agents" },
];

const PERSONALISATION_OPTIONS = [
  { value: "none", label: "No personalisation" },
  { value: "light", label: "Light (rules-based)" },
  { value: "heavy", label: "Heavy (AI / ML)" },
];

const COMPLIANCE_OPTIONS = [
  { value: "gdpr", label: "GDPR / UK-GDPR" },
  { value: "wcag", label: "WCAG 2.2 AA" },
  { value: "iso", label: "ISO 27001" },
  { value: "soc2", label: "SOC 2" },
  { value: "public-sector", label: "Public-sector procurement" },
  { value: "sector", label: "Sector-specific" },
];

const UPDATE_FREQ_OPTIONS = [
  { value: "<10", label: "<10 / week" },
  { value: "10-50", label: "10–50 / week" },
  { value: "50-200", label: "50–200 / week" },
  { value: "200+", label: "200+ / week" },
];

const TEAM_SIZE_OPTIONS = [
  { value: "0", label: "0 (fully agency-led)" },
  { value: "1-2", label: "1–2" },
  { value: "3-5", label: "3–5" },
  { value: "6+", label: "6+" },
];

const HORIZON_OPTIONS = [
  { value: "3", label: "3 years" },
  { value: "5", label: "5 years" },
];

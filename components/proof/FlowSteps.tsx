/* A workflow as an ordered list of steps. Stacks vertically with downward
   arrows on phones and wraps horizontally with rightward arrows from `sm`,
   so long flows stay readable at any width. Each arrow sits inside its
   step's <li> and is aria-hidden, so screen readers hear only the steps,
   in order. */
export default function FlowSteps({
  steps,
  tone = "after",
  label,
}: {
  steps: string[];
  /** "before": muted, the broken flow. "after": brand, the redesigned flow. */
  tone?: "before" | "after";
  /** Accessible name for the list, e.g. "Before" or "Where the workflow breaks". */
  label: string;
}) {
  const chip =
    tone === "after"
      ? "bg-ecm-green text-white border-ecm-green"
      : "bg-surface text-ink border-surface-border";
  const arrow = tone === "after" ? "text-heading" : "text-ink-muted";
  return (
    <ol
      aria-label={label}
      className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-1.5 sm:gap-2"
    >
      {steps.map((s, i) => (
        <li key={`${i}-${s}`} className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
          <span className={`rounded-lg border px-3 py-2 text-sm leading-snug font-barlow ${chip}`}>{s}</span>
          {i < steps.length - 1 && (
            <span aria-hidden="true" className={`${arrow} text-sm leading-none pl-4 sm:pl-0`}>
              <span className="sm:hidden">↓</span>
              <span className="hidden sm:inline">→</span>
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

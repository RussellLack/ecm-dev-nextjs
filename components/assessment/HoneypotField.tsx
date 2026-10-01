import type { LeadVerification } from "@/lib/assessment/useLeadVerification";

/**
 * Hidden `website` field for the assessment bot check. Real visitors never see
 * or reach it (off-screen, not focusable, hidden from screen readers); naive
 * form-filling bots fill it, and the server then quietly declines to count
 * the completion as a lead.
 */
export function HoneypotField({ honeypot }: { honeypot: LeadVerification["honeypot"] }) {
  return (
    <div className="offscreen-trap" aria-hidden="true">
      <label>
        Website
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={honeypot.value}
          onChange={honeypot.onChange}
        />
      </label>
    </div>
  );
}

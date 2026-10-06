import { CONTENT_AUDIT } from "@/lib/offers";

/* How a Content Audit fee is fixed within its range. Every figure is read
   from lib/offers.ts so the assessments hub and the pillar pages cannot
   drift apart. */
export default function AuditFeeTable() {
  const { pricing, snapshot, full } = CONTENT_AUDIT;
  return (
    <div className="mt-8 rounded-2xl border border-surface-border px-5 py-5 sm:px-6 text-sm text-ink">
      <h3 className="text-heading font-barlow font-bold text-lg mb-2">How the fee is set</h3>
      <p className="mb-2">{pricing.intro}</p>
      <ol className="list-decimal list-inside space-y-1 mb-4">
        {pricing.questions.map((q) => (
          <li key={q}>{q}</li>
        ))}
      </ol>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <caption className="sr-only">
            Content Audit fee by number of questions answered yes
          </caption>
          <thead>
            <tr className="border-b border-surface-border text-heading font-barlow">
              <th scope="col" className="py-2 pr-4 font-semibold">Answers of yes</th>
              <th scope="col" className="py-2 pr-4 font-semibold">{snapshot.name}</th>
              <th scope="col" className="py-2 font-semibold">{full.name}</th>
            </tr>
          </thead>
          <tbody>
            {pricing.rows.map((r) => (
              <tr key={r.answers} className="border-b border-surface-border last:border-b-0">
                <th scope="row" className="py-2 pr-4 font-normal">{r.answers}</th>
                <td className="py-2 pr-4">{r.snapshot}</td>
                <td className="py-2">{r.full}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4">{pricing.limits}</p>
    </div>
  );
}

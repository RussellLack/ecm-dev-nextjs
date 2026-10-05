/* Renders **marked** phrases in record copy as <strong>. Copy comes from
   lib/representativeEngagements.ts, never from visitors. */
export default function Emph({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-heading">
            {p}
          </strong>
        ) : (
          p
        )
      )}
    </>
  );
}

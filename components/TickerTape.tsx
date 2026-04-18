type TickerTapeProps = {
  phrases: string[];
  separator?: string;
};

export default function TickerTape({ phrases, separator = "✦" }: TickerTapeProps) {
  if (!phrases || phrases.length === 0) return null;

  const line = phrases.join(` ${separator} `) + ` ${separator} `;

  return (
    <section className="py-4 bg-ecm-green overflow-hidden" aria-label="Ticker">
      <div className="animate-marquee whitespace-nowrap flex">
        <span className="text-ecm-lime font-barlow font-bold text-2xl lg:text-4xl px-4">
          {line}
        </span>
        <span
          className="text-ecm-lime font-barlow font-bold text-2xl lg:text-4xl px-4"
          aria-hidden="true"
        >
          {line}
        </span>
      </div>
    </section>
  );
}

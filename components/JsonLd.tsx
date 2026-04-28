import { headers } from "next/headers";

/**
 * Server component that renders a Schema.org JSON-LD <script> with the
 * per-request CSP nonce. The site uses strict-dynamic CSP (see
 * middleware.ts) — without the nonce the browser would refuse to parse
 * the script element. Note: type="application/ld+json" is non-executable
 * data, but strict-dynamic still gates the <script> element itself.
 */
export default async function JsonLd({ data }: { data: unknown }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      // JSON.stringify is safe here — the data comes from our own typed
      // builders in lib/structuredData.ts, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

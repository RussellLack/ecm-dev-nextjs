/**
 * Server component that renders a Schema.org JSON-LD <script>.
 * type="application/ld+json" is non-executable data, so the CSP's
 * script-src does not block it and no nonce is needed. (Reading a nonce via
 * headers() here would also force every page into per-request rendering.)
 */
export default function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify is safe here — the data comes from our own typed
      // builders in lib/structuredData.ts, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

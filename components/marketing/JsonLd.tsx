/**
 * Renders a JSON-LD structured-data block. A plain <script> tag (not next/script)
 * is the recommended approach for JSON-LD in the App Router — it ships in the
 * server-rendered HTML and is visible in page source.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

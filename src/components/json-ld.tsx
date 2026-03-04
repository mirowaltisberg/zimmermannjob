// SEO-DECISION: Reusable JSON-LD component for all structured data types.
// Renders a <script type="application/ld+json"> tag with validated JSON.
// Used across layout, job detail, and landing pages.

interface JsonLdProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
}

/**
 * Renders a JSON-LD structured data script tag.
 * Server component — works in both server and client contexts.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

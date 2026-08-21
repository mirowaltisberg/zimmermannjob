import {
  assertSafeJobPostingSchema,
  type JobPostingSchema,
} from "@/lib/job-schema";

export function JobPostingJsonLd({ data }: { data: JobPostingSchema }) {
  assertSafeJobPostingSchema(data);
  const serialized = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialized }}
    />
  );
}

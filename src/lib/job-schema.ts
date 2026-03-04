import type { JobListing } from "@/lib/job-types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zimmermannjob.ch";

/**
 * Build a Google-compatible JobPosting structured data object.
 * Used on both the homepage and landing pages for Rich Results.
 */
export function buildJobPostingSchema(job: JobListing) {
  const datePosted = job.datePosted || new Date().toISOString().split("T")[0];
  const validThrough = new Date(
    new Date(datePosted).getTime() + 90 * 24 * 60 * 60 * 1000
  )
    .toISOString()
    .split("T")[0];

  const city = job.location.split(",")[0]?.trim() || job.location;

  return {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted,
    validThrough,
    employmentType: "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: job.company,
      sameAs: job.companyUrl || SITE_URL,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: city,
        addressCountry: "CH",
      },
    },
  };
}

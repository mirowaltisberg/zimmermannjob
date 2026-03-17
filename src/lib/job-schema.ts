import type { JobListing } from "@/lib/job-types";
import { estimateSalary } from "@/lib/salary-estimates";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.zimmermannjob.ch";

function mapEmploymentType(type: string): string {
  const lower = type.toLowerCase();
  if (lower.includes("vollzeit") || lower === "full-time") return "FULL_TIME";
  if (lower.includes("teilzeit") || lower === "part-time") return "PART_TIME";
  if (lower.includes("temporär") || lower.includes("temp")) return "TEMPORARY";
  if (lower.includes("praktikum") || lower.includes("intern")) return "INTERN";
  if (lower.includes("freelance") || lower.includes("freiberuf")) return "CONTRACTOR";
  return "FULL_TIME";
}

/**
 * Build a Google-compatible JobPosting structured data object.
 * Used on both the homepage and landing pages for Rich Results.
 */
export function buildJobPostingSchema(job: JobListing) {
  const datePosted = job.datePosted || new Date().toISOString().split("T")[0];
  const validThrough = new Date(
    new Date(datePosted).getTime() + 60 * 24 * 60 * 60 * 1000
  )
    .toISOString()
    .split("T")[0];

  const locationParts = job.location.split(",").map((p) => p.trim());
  const city = locationParts[0] || job.location;
  const region = locationParts[1] || "";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schema: Record<string, any> = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted,
    validThrough,
    employmentType: mapEmploymentType(job.type),
    directApply: true,
    industry: "Holzbau & Zimmerei",
    hiringOrganization: {
      "@type": "Organization",
      name: job.company?.trim() || "Arbeitgeber auf zimmermannjob.ch",
      ...(job.companyUrl ? { sameAs: job.companyUrl } : {}),
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: city,
        ...(region ? { addressRegion: region } : {}),
        addressCountry: "CH",
      },
    },
    url: `${SITE_URL}/jobs/${job.id}`,
  };

  // Add salary if available
  const salaryEstimate = estimateSalary(job.title);
  if (job.salary) {
    const numbers = job.salary.match(/[\d']+/g);
    if (numbers && numbers.length >= 2) {
      const min = parseInt(numbers[0].replace(/'/g, ""), 10);
      const max = parseInt(numbers[1].replace(/'/g, ""), 10);
      if (min > 0 && max > 0) {
        schema.baseSalary = {
          "@type": "MonetaryAmount",
          currency: "CHF",
          value: { "@type": "QuantitativeValue", minValue: min, maxValue: max, unitText: "YEAR" },
        };
      }
    }
  } else if (salaryEstimate) {
    schema.baseSalary = {
      "@type": "MonetaryAmount",
      currency: "CHF",
      value: { "@type": "QuantitativeValue", minValue: salaryEstimate.min, maxValue: salaryEstimate.max, unitText: "YEAR" },
    };
  }

  if (job.isRemote === true) {
    schema.jobLocationType = "TELECOMMUTE";
  }

  if (job.workload) {
    schema.workHours = job.workload;
  }

  return schema;
}

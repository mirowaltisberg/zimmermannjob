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
    description: job.fullDescription || job.description,
    identifier: {
      "@type": "PropertyValue",
      name: "zimmermannjob.ch",
      value: job.id,
    },
    datePosted,
    validThrough,
    employmentType: mapEmploymentType(job.type),
    directApply: false,
    industry: "Holzbau & Zimmerei",
    hiringOrganization: {
      "@type": "Organization",
      name: "Arbeitgeber via zimmermannjob.ch",
      logo: `${SITE_URL}/logo.png`,
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
  } else {
    const salaryEstimate = estimateSalary(job.title);
    if (salaryEstimate) {
      const median = Math.round((salaryEstimate.min + salaryEstimate.max) / 2);
      schema.estimatedSalary = {
        "@type": "MonetaryAmountDistribution",
        name: "base",
        currency: "CHF",
        duration: "P1Y",
        percentile10: salaryEstimate.min,
        median,
        percentile90: salaryEstimate.max,
      };
    }
  }

  if (job.isRemote === true) {
    schema.jobLocationType = "TELECOMMUTE";
  }

  if (job.workload) {
    schema.workHours = job.workload;
  }

  return schema;
}

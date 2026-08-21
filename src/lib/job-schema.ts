import type { JobListing } from "@/lib/job-types";
import { SWISS_POSTAL_CODES } from "@/lib/swiss-postal-codes";

interface JobPostingSchemaOptions {
  siteName: string;
  siteUrl: string;
  directApply: boolean;
}

interface PostalAddressSchema {
  "@type": "PostalAddress";
  addressCountry: "CH";
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
  streetAddress?: string;
}

export interface JobPostingSchema {
  "@context": "https://schema.org";
  "@type": "JobPosting";
  title: string;
  description: string;
  datePosted: string;
  hiringOrganization: {
    "@type": "Organization";
    name: "confidential";
  };
  jobLocation: {
    "@type": "Place";
    address: PostalAddressSchema;
  };
  identifier: {
    "@type": "PropertyValue";
    name: string;
    value: string;
  };
  url: string;
  directApply: boolean;
  employmentType?: string;
  workHours?: string;
  baseSalary?: {
    "@type": "MonetaryAmount";
    currency: "CHF";
    value: {
      "@type": "QuantitativeValue";
      unitText: "HOUR" | "MONTH" | "YEAR";
      value?: number;
      minValue?: number;
      maxValue?: number;
    };
  };
}

const COUNTRY_WIDE = new Set([
  "ch",
  "schweiz",
  "schweizweit",
  "ganze schweiz",
  "switzerland",
]);

const CANTON_ALIASES: Record<string, string> = {
  ag: "AG", aargau: "AG",
  ai: "AI", "appenzell innerrhoden": "AI",
  ar: "AR", "appenzell ausserrhoden": "AR", "appenzell auserrhoden": "AR",
  be: "BE", bern: "BE", berne: "BE",
  bl: "BL", "basel landschaft": "BL", "basel country": "BL",
  bs: "BS", "basel stadt": "BS", "basel city": "BS",
  fr: "FR", freiburg: "FR", fribourg: "FR",
  ge: "GE", genf: "GE", geneva: "GE", geneve: "GE",
  gl: "GL", glarus: "GL",
  gr: "GR", graubunden: "GR", grisons: "GR",
  ju: "JU", jura: "JU",
  lu: "LU", luzern: "LU", lucerne: "LU",
  ne: "NE", neuenburg: "NE", neuchatel: "NE",
  nw: "NW", nidwalden: "NW",
  ow: "OW", obwalden: "OW",
  sg: "SG", "st gallen": "SG", "saint gallen": "SG",
  sh: "SH", schaffhausen: "SH",
  so: "SO", solothurn: "SO",
  sz: "SZ", schwyz: "SZ",
  tg: "TG", thurgau: "TG",
  ti: "TI", tessin: "TI", ticino: "TI",
  ur: "UR", uri: "UR",
  vd: "VD", waadt: "VD", vaud: "VD",
  vs: "VS", wallis: "VS", valais: "VS",
  zg: "ZG", zug: "ZG",
  zh: "ZH", zurich: "ZH",
};

function normalizeLookup(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();
}

function cantonCode(value: string): string | undefined {
  return CANTON_ALIASES[normalizeLookup(value)];
}

const MUNICIPALITY_CANTONS = new Map<string, string | null>();

for (const entry of Object.values(SWISS_POSTAL_CODES)) {
  const code = cantonCode(entry.canton);
  if (!code) continue;

  for (const rawMunicipality of entry.municipality.split(",")) {
    const municipality = normalizeLookup(rawMunicipality.replace(/\([^)]*\)/g, ""));
    if (!municipality) continue;

    const existing = MUNICIPALITY_CANTONS.get(municipality);
    MUNICIPALITY_CANTONS.set(municipality, existing === undefined || existing === code ? code : null);
  }
}

function municipalityCanton(value: string): string | undefined {
  const normalized = normalizeLookup(value.replace(/\s+[A-Z]{2}$/u, ""));
  return MUNICIPALITY_CANTONS.get(normalized) ?? undefined;
}

function cleanLocationPart(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
}

export function parseSwissJobAddress(location: string): PostalAddressSchema {
  const cleaned = cleanLocationPart(location).slice(0, 240);
  const parts = cleaned.split(",").map(cleanLocationPart).filter(Boolean);
  const postalCode = cleaned.match(/(?:^|\D)([1-9]\d{3})(?:\D|$)/)?.[1];
  const postalEntry = postalCode ? SWISS_POSTAL_CODES[postalCode] : undefined;

  let streetAddress: string | undefined;
  let localityPart = parts[0] ?? cleaned;

  const exactStreet = parts.length > 1 && /\p{L}[\p{L}\p{M} .'-]{2,}\s+\d+[a-zA-Z]?$/u.test(parts[0] ?? "");
  if (exactStreet) {
    streetAddress = parts[0];
    localityPart = parts[1] ?? "";
  }

  let addressLocality = cleanLocationPart(localityPart.replace(/\b[1-9]\d{3}\b/g, ""));
  const localityCantonSuffix = addressLocality.match(/\s+([A-Z]{2})$/u)?.[1];
  if (localityCantonSuffix && CANTON_ALIASES[localityCantonSuffix.toLowerCase()]) {
    addressLocality = addressLocality.slice(0, -localityCantonSuffix.length).trim();
  }

  const regionFromParts = parts
    .map(cantonCode)
    .find((candidate): candidate is string => Boolean(candidate));
  const addressRegion =
    (postalEntry ? cantonCode(postalEntry.canton) : undefined) ??
    (localityCantonSuffix ? cantonCode(localityCantonSuffix) : undefined) ??
    regionFromParts ??
    municipalityCanton(addressLocality);

  const normalizedLocality = normalizeLookup(addressLocality);
  if (
    !addressLocality ||
    COUNTRY_WIDE.has(normalizedLocality) ||
    (parts.length <= 2 && Boolean(cantonCode(addressLocality)) && parts.some((part) => COUNTRY_WIDE.has(normalizeLookup(part))))
  ) {
    addressLocality = "";
  }

  return {
    "@type": "PostalAddress",
    addressCountry: "CH",
    ...(addressLocality ? { addressLocality } : {}),
    ...(addressRegion ? { addressRegion } : {}),
    ...(postalCode ? { postalCode } : {}),
    ...(streetAddress ? { streetAddress } : {}),
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function listHtml(items: string[]): string {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function buildDescription(job: JobListing): string {
  const sections = [`<p>${escapeHtml(job.description)}</p>`];

  if (job.responsibilities.length > 0) {
    sections.push("<p>Typische Aufgaben im Berufsbild:</p>", listHtml(job.responsibilities));
  }
  if (job.requirements.length > 0) {
    sections.push("<p>Typisches Berufsprofil:</p>", listHtml(job.requirements));
  }
  if (job.benefits.length > 0) {
    sections.push("<p>Weitere Hinweise:</p>", listHtml(job.benefits));
  }

  return sections.join("");
}

function normalizeDatePosted(value: string): string {
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) {
    throw new Error("JobPosting requires a valid datePosted");
  }
  return value.includes("T") ? parsed.toISOString() : parsed.toISOString().slice(0, 10);
}

function mapEmploymentType(type: string): string | undefined {
  const normalized = normalizeLookup(type);
  if (normalized.includes("vollzeit") || normalized.includes("full time")) return "FULL_TIME";
  if (normalized.includes("teilzeit") || normalized.includes("part time")) return "PART_TIME";
  if (normalized.includes("temporar") || normalized.includes("temporary")) return "TEMPORARY";
  if (normalized.includes("praktikum") || normalized.includes("internship")) return "INTERN";
  if (normalized.includes("freelance") || normalized.includes("contractor")) return "CONTRACTOR";
  return undefined;
}

function buildBaseSalary(job: JobListing): JobPostingSchema["baseSalary"] {
  const salary = job.salaryDetails;
  if (!salary) return undefined;

  const hasExactValue =
    salary.minValue !== undefined &&
    salary.maxValue !== undefined &&
    salary.minValue === salary.maxValue;

  return {
    "@type": "MonetaryAmount",
    currency: "CHF",
    value: {
      "@type": "QuantitativeValue",
      unitText: salary.unitText,
      ...(hasExactValue
        ? { value: salary.minValue }
        : {
            ...(salary.minValue !== undefined ? { minValue: salary.minValue } : {}),
            ...(salary.maxValue !== undefined ? { maxValue: salary.maxValue } : {}),
          }),
    },
  };
}

export function buildJobPostingSchema(
  job: JobListing,
  options: JobPostingSchemaOptions,
): JobPostingSchema {
  if (job.id.startsWith("direct-hire-")) {
    throw new Error("Evergreen direct-hire profiles must never become JobPosting markup");
  }

  const employmentType = mapEmploymentType(job.type);
  const workHours = job.workload.trim();
  const baseSalary = buildBaseSalary(job);
  const siteUrl = options.siteUrl.replace(/\/$/, "");

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: buildDescription(job),
    datePosted: normalizeDatePosted(job.datePosted),
    hiringOrganization: {
      "@type": "Organization",
      name: "confidential",
    },
    jobLocation: {
      "@type": "Place",
      address: parseSwissJobAddress(job.location),
    },
    identifier: {
      "@type": "PropertyValue",
      name: options.siteName,
      value: job.id,
    },
    url: `${siteUrl}/jobs/${encodeURIComponent(job.id)}`,
    directApply: options.directApply,
    ...(employmentType ? { employmentType } : {}),
    ...(workHours && workHours !== "Nicht angegeben" ? { workHours } : {}),
    ...(baseSalary ? { baseSalary } : {}),
  };
}

export function assertSafeJobPostingSchema(schema: JobPostingSchema): void {
  if (schema["@type"] !== "JobPosting" || schema.hiringOrganization.name !== "confidential") {
    throw new Error("Invalid JobPosting boundary");
  }

  const serialized = JSON.stringify(schema);
  if (/companyUrl|sourceUrl|jobUrl|rawTitle|rawEmployer|scrapedSource/i.test(serialized)) {
    throw new Error("JobPosting contains a forbidden source or employer field");
  }
  if (/jobLocationType|applicantLocationRequirements|estimatedSalary/.test(serialized)) {
    throw new Error("JobPosting contains an unverified remote or estimated salary claim");
  }
}

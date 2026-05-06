import type { JobListing } from "@/lib/job-types";

const TRADE = "zimmermann";
const LEGACY_SCRAPED_PATTERN = new RegExp(`^scraped-${TRADE}-([0-9a-f]+)$`, "i");
const TRAILING_HEX_PATTERN = /-([0-9a-f]{8,16})$/i;
const MAX_ROLE_LEN = 40;
const MAX_CITY_LEN = 20;

function slugifySegment(value: string, maxLen: number): string {
  return value
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[éèê]/g, "e")
    .replace(/[àâ]/g, "a")
    .replace(/[îï]/g, "i")
    .replace(/[ôœ]/g, "o")
    .replace(/[ûù]/g, "u")
    .replace(/ç/g, "c")
    .replace(/&/g, "und")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLen)
    .replace(/-+$/g, "");
}

export function isLegacyScrapedId(id: string): boolean {
  return LEGACY_SCRAPED_PATTERN.test(id);
}

export function buildJobSlug(job: Pick<JobListing, "id" | "title" | "location" | "source">): string {
  if (job.source !== "scraped") {
    return job.id;
  }

  const match = LEGACY_SCRAPED_PATTERN.exec(job.id);
  if (!match) {
    return job.id;
  }

  const hash = match[1].toLowerCase();
  const role = slugifySegment(job.title, MAX_ROLE_LEN);
  const cityRaw = job.location.split(",")[0]?.trim() || job.location;
  const city = slugifySegment(cityRaw, MAX_CITY_LEN);

  return [role, city, hash].filter(Boolean).join("-");
}

/**
 * If the slug is a new-format slug `<role>-<city>-<12hex>`, return the
 * underlying legacy scraped ID `scraped-<trade>-<hex>`. Returns null if the
 * slug doesn't end with a hex segment of the expected length.
 */
export function reconstructScrapedIdFromSlug(slug: string): string | null {
  const match = TRAILING_HEX_PATTERN.exec(slug);
  if (!match) {
    return null;
  }
  return `scraped-${TRADE}-${match[1].toLowerCase()}`;
}

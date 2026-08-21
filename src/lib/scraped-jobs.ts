import "server-only";

import { createAdminClient } from "@/lib/supabase";
import { validateRawJobIdentity } from "@/lib/job-safety";
import {
  getPublicJobDateBounds,
  isPublicJobNew,
  validatePublicJobDate,
} from "@/lib/job-freshness";

const TRADE = "zimmermann";

export interface ScrapedJob {
  trade: string;
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  workload: string;
  description: string;
  fullDescription: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  datePosted: string;
  isNew: boolean;
  isUrgent: boolean;
  salary: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  salaryUnit: string | null;
  jobUrl: string;
  source: string;
  isRemote: boolean | null;
  companyUrl: string;
}

/** Listing-friendly version without fullDescription */
export type ScrapedJobListing = Omit<ScrapedJob, "fullDescription">;

// --- TTL cache ---
const CACHE_TTL_MS = 300_000;
let cachedJobs: ScrapedJob[] | null = null;
let cachedAt = 0;

export interface DbRow {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string | null;
  workload: string | null;
  description: string;
  full_description?: string;
  responsibilities?: string[];
  requirements?: string[];
  benefits?: string[];
  date_posted: string | null;
  is_new: boolean;
  is_urgent: boolean;
  salary: string | null;
  salary_min?: number | string | null;
  salary_max?: number | string | null;
  salary_currency?: string | null;
  salary_unit?: string | null;
  job_url?: string;
  source?: string;
  is_remote: boolean | null;
  company_url?: string;
}

export const PUBLICATION_SELECT_FIELDS = [
  "id",
  "title",
  "company",
  "location",
  "type",
  "workload",
  "description",
  "date_posted",
  "is_new",
  "is_urgent",
  "salary",
  "salary_min",
  "salary_max",
  "salary_currency",
  "salary_unit",
  "job_url",
  "source",
  "is_remote",
];

const PUBLICATION_SELECT = PUBLICATION_SELECT_FIELDS.join(",");

function toFiniteNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function mapRowToScrapedJob(row: DbRow): ScrapedJob {
  return {
    trade: TRADE,
    id: row.id,
    title: row.title,
    company: row.company,
    location: row.location,
    type: row.type ?? "",
    workload: row.workload ?? "",
    description: row.description,
    fullDescription: row.full_description ?? "",
    responsibilities: row.responsibilities ?? [],
    requirements: row.requirements ?? [],
    benefits: row.benefits ?? [],
    datePosted: row.date_posted ?? "",
    isNew: isPublicJobNew(row.date_posted),
    isUrgent: false,
    salary: row.salary ?? null,
    salaryMin: toFiniteNumber(row.salary_min),
    salaryMax: toFiniteNumber(row.salary_max),
    salaryCurrency: row.salary_currency ?? null,
    salaryUnit: row.salary_unit ?? null,
    jobUrl: row.job_url ?? "",
    source: row.source ?? "",
    isRemote: row.is_remote,
    companyUrl: row.company_url ?? "",
  };
}

export function mapVerifiedDbRow(row: DbRow): ScrapedJob | null {
  const job = mapRowToScrapedJob(row);
  return validateRawJobIdentity(job) === null && validatePublicJobDate(job.datePosted) === null
    ? job
    : null;
}

const SUPABASE_PAGE_SIZE = 1000;

/**
 * Load all scraped jobs from Supabase (with TTL cache).
 * Paginates through all results since Supabase limits to 1000 rows per request.
 * Fails closed with an empty list if Supabase is unreachable.
 */
export async function loadScrapedJobs(): Promise<ScrapedJob[]> {
  if (cachedJobs && Date.now() - cachedAt < CACHE_TTL_MS) {
    return cachedJobs;
  }

  try {
    const supabase = createAdminClient();
    const { minDate } = getPublicJobDateBounds();
    const allRows: DbRow[] = [];
    let from = 0;

    while (true) {
      const { data, error } = await supabase
        .from("jobs")
        .select(PUBLICATION_SELECT)
        .eq("trade", TRADE)
        .gte("date_posted", minDate)
        .order("date_posted", { ascending: false })
        .range(from, from + SUPABASE_PAGE_SIZE - 1);

      if (error || !data || data.length === 0) {
        break;
      }

      allRows.push(...(data as unknown as DbRow[]));

      if (data.length < SUPABASE_PAGE_SIZE) {
        break;
      }

      from += SUPABASE_PAGE_SIZE;
    }

    if (allRows.length > 0) {
      cachedJobs = allRows.flatMap((row) => {
        const job = mapVerifiedDbRow(row);
        return job ? [job] : [];
      });
      cachedAt = Date.now();
      return cachedJobs;
    }
  } catch {
    // Fail closed.
  }

  return [];
}

/** Get a single job by ID with full description */
export async function getScrapedJobById(id: string): Promise<ScrapedJob | null> {
  try {
    const supabase = createAdminClient();
    const { minDate } = getPublicJobDateBounds();
    const { data, error } = await supabase
      .from("jobs")
      .select(PUBLICATION_SELECT)
      .eq("id", id)
      .eq("trade", TRADE)
      .gte("date_posted", minDate)
      .single();

    if (!error && data) {
      const job = mapVerifiedDbRow(data as unknown as DbRow);
      if (job) {
        return job;
      }
    }
  } catch {
    // Fail closed.
  }

  return null;
}

let cachedMeta: { scrapedAt: string; totalJobs: number } | null = null;
let cachedMetaAt = 0;
const META_CACHE_TTL_MS = 300_000;

export async function getScrapedMeta(): Promise<{ scrapedAt: string; totalJobs: number } | null> {
  if (cachedMeta && Date.now() - cachedMetaAt < META_CACHE_TTL_MS) return cachedMeta;

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("trade_scrape_metadata")
      .select("scraped_at,total_jobs")
      .eq("trade", TRADE)
      .single();

    if (!error && data) {
      cachedMeta = {
        scrapedAt: data.scraped_at as string,
        totalJobs: data.total_jobs as number,
      };
      cachedMetaAt = Date.now();
      return cachedMeta;
    }
  } catch {
    // fall through
  }

  return null;
}

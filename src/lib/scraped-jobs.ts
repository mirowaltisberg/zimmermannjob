import fs from "fs";
import path from "path";
import { supabase } from "@/lib/supabase";

export interface ScrapedJob {
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
  salary: string;
  jobUrl: string;
  source: string;
  isRemote: boolean;
  companyUrl: string;
}

/** Listing-friendly version without fullDescription */
export type ScrapedJobListing = Omit<ScrapedJob, "fullDescription">;

// --- TTL cache ---
const CACHE_TTL_MS = 300_000;
let cachedJobs: ScrapedJob[] | null = null;
let cachedAt = 0;

interface DbRow {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  workload: string;
  description: string;
  full_description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  date_posted: string | null;
  is_new: boolean;
  is_urgent: boolean;
  salary: string;
  job_url: string;
  source: string;
  is_remote: boolean;
  company_url: string;
}

function mapRowToScrapedJob(row: DbRow): ScrapedJob {
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    location: row.location,
    type: row.type,
    workload: row.workload,
    description: row.description,
    fullDescription: row.full_description,
    responsibilities: row.responsibilities ?? [],
    requirements: row.requirements ?? [],
    benefits: row.benefits ?? [],
    datePosted: row.date_posted ?? "",
    isNew: row.is_new,
    isUrgent: row.is_urgent,
    salary: row.salary,
    jobUrl: row.job_url,
    source: row.source,
    isRemote: row.is_remote,
    companyUrl: row.company_url,
  };
}

// --- JSON fallback (resilience if Supabase is unreachable) ---
function loadFromJson(): ScrapedJob[] {
  try {
    const filePath = path.join(process.cwd(), "src", "data", "scraped-jobs.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw) as { jobs: ScrapedJob[] };
    return data.jobs ?? [];
  } catch {
    return [];
  }
}

/**
 * Load all scraped jobs from Supabase (with TTL cache).
 * Falls back to local JSON if Supabase is unreachable.
 */
export async function loadScrapedJobs(): Promise<ScrapedJob[]> {
  if (cachedJobs && Date.now() - cachedAt < CACHE_TTL_MS) {
    return cachedJobs;
  }

  try {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("date_posted", { ascending: false });

    if (!error && data && data.length > 0) {
      cachedJobs = (data as DbRow[]).map(mapRowToScrapedJob);
      cachedAt = Date.now();
      return cachedJobs;
    }
  } catch {
    // fall through to JSON fallback
  }

  return loadFromJson();
}

/** Get a single job by ID with full description.
 *  Checks the in-memory cache first to avoid a DB round-trip
 *  when loadScrapedJobs has already been called recently.
 */
export async function getScrapedJobById(id: string): Promise<ScrapedJob | null> {
  // Fast path: check in-memory cache first (avoids Supabase round-trip)
  if (cachedJobs && Date.now() - cachedAt < CACHE_TTL_MS) {
    const cached = cachedJobs.find((j) => j.id === id);
    if (cached) {
      return cached;
    }
  }

  try {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .single();

    if (!error && data) {
      return mapRowToScrapedJob(data as DbRow);
    }
  } catch {
    // fall through to JSON fallback
  }

  // Fallback: search local JSON
  const jobs = loadFromJson();
  return jobs.find((j) => j.id === id) ?? null;
}

let cachedMeta: { scrapedAt: string; totalJobs: number } | null = null;
let cachedMetaAt = 0;
const META_CACHE_TTL_MS = 300_000;

export async function getScrapedMeta(): Promise<{ scrapedAt: string; totalJobs: number } | null> {
  if (cachedMeta && Date.now() - cachedMetaAt < META_CACHE_TTL_MS) return cachedMeta;

  try {
    const { data, error } = await supabase
      .from("scrape_metadata")
      .select("*")
      .eq("id", 1)
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

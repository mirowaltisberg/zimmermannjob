import "server-only";

import {
  getScrapedJobById,
  getScrapedMeta,
  loadScrapedJobs,
  type ScrapedJob,
} from "@/lib/scraped-jobs";
import { cleanJobText } from "@/lib/job-text-clean";
import { buildPublicJobCopy } from "@/lib/job-public";
import { serializePublicJob } from "@/lib/public-job-boundary";
import { classifyZimmermannTitle, isValidZimmermannJobId } from "@/lib/job-safety";
import { calculateDistanceKm, resolveLocationCoordinate, type Coordinate } from "@/lib/location-distance";
import { buildDirectHireOpportunities } from "@/lib/direct-hire-opportunities";
import type {
  DirectHireOpportunity,
  JobFacets,
  JobListing,
  JobSalaryDetails,
  JobSearchParams,
  JobSort,
  RemoteFilter,
} from "@/lib/job-types";

const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 200;
const MIN_RADIUS_KM = 5;
const MAX_RADIUS_KM = 300;
const SCRAPE_STALE_HOURS = Math.max(1, Number(process.env.SCRAPE_STALE_HOURS ?? 72));
const MIN_RELEVANCE_SCORE = 2;
const NOT_PROVIDED = "Nicht angegeben";
const COUNTRY_WIDE_LOCATIONS = new Set([
  "schweiz",
  "ganze schweiz",
  "schweizweit",
  "switzerland",
  "whole switzerland",
  "ch",
]);
const coordinateCache = new Map<string, Coordinate | null>();

interface NormalizedParams {
  q: string;
  loc: string;
  radiusKm: number | null;
  limit: number;
  offset: number;
  type: string;
  workload: string;
  remote: RemoteFilter;
  postedWithinDays: number | null;
  sort: JobSort;
}

interface SourceBundle {
  scrapedJobs: JobListing[];
  scrapedAt: string | null;
}

export interface JobSearchResult {
  jobs: JobListing[];
  opportunities: DirectHireOpportunity[];
  total: number;
  offset: number;
  limit: number;
  facets: JobFacets;
  scrapedAt: string | null;
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function parseIsoDateMs(value: string | undefined): number {
  if (!value) {
    return 0;
  }

  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function scoreScrapedJob(job: ScrapedJob): number {
  return classifyZimmermannTitle(job.title).disposition === "ACCEPT" ? 10 : -100;
}

function normalizeWorkload(value: string): string {
  return value.replace(/\s+/g, "").trim();
}

function dedupeSignature(job: Pick<ScrapedJob, "title" | "company" | "location">): string {
  return normalizeText(job.title) + "|" + normalizeText(job.company) + "|" + normalizeText(job.location);
}

function toPublicSalary(value: string | null | undefined): string | undefined {
  const cleaned = cleanJobText(value ?? "").trim();
  if (!cleaned || cleaned.length > 40 || !/\d/.test(cleaned)) {
    return undefined;
  }

  return /^[\d\s'’.,\-–—/%]*(?:CHF)?[\d\s'’.,\-–—/%]*$/i.test(cleaned)
    ? cleaned
    : undefined;
}

function toPublicSalaryDetails(job: ScrapedJob): JobSalaryDetails | undefined {
  if (job.salaryCurrency !== "CHF") return undefined;
  if (!["HOUR", "MONTH", "YEAR"].includes(job.salaryUnit ?? "")) return undefined;

  const minValue = job.salaryMin ?? undefined;
  const maxValue = job.salaryMax ?? undefined;
  const limits: Record<JobSalaryDetails["unitText"], [number, number]> = {
    HOUR: [10, 500],
    MONTH: [1_000, 50_000],
    YEAR: [15_000, 500_000],
  };
  const unitText = job.salaryUnit as JobSalaryDetails["unitText"];
  const [lower, upper] = limits[unitText];
  const values = [minValue, maxValue].filter(
    (value): value is number => value !== undefined,
  );
  if (
    values.length === 0 ||
    values.some((value) => !Number.isFinite(value) || value < lower || value > upper) ||
    (minValue !== undefined && maxValue !== undefined && minValue > maxValue)
  ) {
    return undefined;
  }

  return {
    currency: "CHF",
    unitText,
    ...(minValue !== undefined ? { minValue } : {}),
    ...(maxValue !== undefined ? { maxValue } : {}),
  };
}

function toScrapedListing(job: ScrapedJob, relevanceScore: number): JobListing {
  const location = cleanJobText(job.location) || "Schweiz";
  const type = cleanJobText(job.type);
  const workload = cleanJobText(job.workload);
  const publicCopy = buildPublicJobCopy({
    title: job.title,
    company: job.company,
    location,
    type,
    workload,
  });
  const salaryDetails = toPublicSalaryDetails(job);

  return serializePublicJob({
    id: String(job.id),
    title: publicCopy.title,
    location: publicCopy.location,
    type: publicCopy.type,
    workload: publicCopy.workload,
    description: publicCopy.description,
    responsibilities: publicCopy.responsibilities,
    requirements: publicCopy.requirements,
    benefits: publicCopy.benefits,
    datePosted: job.datePosted,
    isNew: Boolean(job.isNew),
    isUrgent: Boolean(job.isUrgent),
    salary: salaryDetails ? toPublicSalary(job.salary) : undefined,
    salaryDetails,
    isRemote: typeof job.isRemote === "boolean" ? job.isRemote : undefined,
    relevanceScore,
  });
}

let cachedCurated: JobListing[] | null = null;
let cachedCuratedAt = 0;
const CURATED_TTL_MS = 120_000;

async function buildCuratedScrapedListings(): Promise<JobListing[]> {
  if (cachedCurated && Date.now() - cachedCuratedAt < CURATED_TTL_MS) return cachedCurated;

  const deduped = new Map<string, JobListing>();

  for (const job of await loadScrapedJobs()) {
    const relevanceScore = scoreScrapedJob(job);
    if (relevanceScore < MIN_RELEVANCE_SCORE) {
      continue;
    }

    const listing = toScrapedListing(job, relevanceScore);
    const signature = dedupeSignature(job);
    if (!listing.description || !listing.description.trim()) {
      continue;
    }
    const existing = deduped.get(signature);

    if (!existing) {
      deduped.set(signature, listing);
      continue;
    }

    const existingScore = existing.relevanceScore ?? 0;
    const existingDate = parseIsoDateMs(existing.datePosted);
    const newDate = parseIsoDateMs(listing.datePosted);

    if (relevanceScore > existingScore || (relevanceScore === existingScore && newDate > existingDate)) {
      deduped.set(signature, listing);
    }
  }

  const result = [...deduped.values()];
  cachedCurated = result;
  cachedCuratedAt = Date.now();
  return result;
}

function isValueInFilter(fieldValue: string, selectedValue: string): boolean {
  const normalizedField = normalizeText(fieldValue);
  const normalizedSelected = normalizeText(selectedValue);

  if (!normalizedSelected || normalizedSelected === "all") {
    return true;
  }

  return normalizedField.includes(normalizedSelected);
}

function matchesQuery(job: JobListing, query: string): boolean {
  if (!query) {
    return true;
  }

  const tokenize = (value: string) =>
    value
      .toLocaleLowerCase("de-CH")
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .split(" ")
      .filter((token) => token.length >= 2);
  const ignoredQueryTokens = new Set(["efz", "job", "jobs", "stelle", "stellen", "spezialist"]);
  const queryTokens = tokenize(query).filter((token) => !ignoredQueryTokens.has(token));
  const publicTokens = tokenize(`${job.title} ${job.description}`);

  const hasPublicMatch = (queryToken: string) => {
    if (queryToken === "zimmermann" || queryToken === "zimmerin") {
      return true;
    }

    return publicTokens.some(
      (publicToken) =>
        publicToken === queryToken ||
        (queryToken.length >= 5 &&
          (publicToken.startsWith(queryToken) || queryToken.startsWith(publicToken)))
    );
  };

  return queryTokens.length > 0 && queryTokens.every(hasPublicMatch);
}

function matchesLocation(job: JobListing, location: string): boolean {
  if (!location) {
    return true;
  }

  return normalizeText(job.location).includes(normalizeText(location));
}

function getCachedCoordinate(location: string): Coordinate | null {
  const normalizedLocation = normalizeText(location);
  if (!normalizedLocation) {
    return null;
  }

  if (coordinateCache.has(normalizedLocation)) {
    return coordinateCache.get(normalizedLocation) ?? null;
  }

  const resolved = resolveLocationCoordinate(location);
  coordinateCache.set(normalizedLocation, resolved);
  return resolved;
}

function matchesLocationWithRadius(
  job: JobListing,
  location: string,
  radiusKm: number | null,
  originCoordinate: Coordinate | null
): boolean {
  if (!location) {
    return true;
  }

  if (!radiusKm || !originCoordinate) {
    return matchesLocation(job, location);
  }

  const jobCoordinate = getCachedCoordinate(job.location);
  if (!jobCoordinate) {
    return matchesLocation(job, location);
  }

  return calculateDistanceKm(originCoordinate, jobCoordinate) <= radiusKm;
}

function matchesRemote(job: JobListing, remote: RemoteFilter): boolean {
  if (remote === "any") {
    return true;
  }

  if (remote === "true") {
    return job.isRemote === true;
  }

  return job.isRemote === false;
}

function matchesPostedWithinDays(job: JobListing, postedWithinDays: number | null): boolean {
  if (!postedWithinDays) {
    return true;
  }

  const dateMs = parseIsoDateMs(job.datePosted);
  if (!dateMs) {
    return false;
  }

  const thresholdMs = Date.now() - postedWithinDays * 24 * 60 * 60 * 1000;
  return dateMs >= thresholdMs;
}

function sortJobs(jobs: JobListing[], sort: JobSort): JobListing[] {
  return [...jobs].sort((a, b) => {
    if (sort === "oldest") {
      return parseIsoDateMs(a.datePosted) - parseIsoDateMs(b.datePosted);
    }

    if (sort === "relevance") {
      const relevanceDelta = (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0);
      if (relevanceDelta !== 0) {
        return relevanceDelta;
      }
    }

    return parseIsoDateMs(b.datePosted) - parseIsoDateMs(a.datePosted);
  });
}

function buildFacets(jobs: JobListing[]): JobFacets {
  const typeCounts = new Map<string, number>();
  const workloadCounts = new Map<string, number>();
  const remote = {
    true: 0,
    false: 0,
    unknown: 0,
  };

  for (const job of jobs) {
    const type = job.type.trim();
    const workload = normalizeWorkload(job.workload);

    if (type && type !== NOT_PROVIDED) {
      typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1);
    }
    if (workload && workload !== normalizeWorkload(NOT_PROVIDED)) {
      workloadCounts.set(workload, (workloadCounts.get(workload) ?? 0) + 1);
    }

    if (job.isRemote === true) {
      remote.true += 1;
    } else if (job.isRemote === false) {
      remote.false += 1;
    } else {
      remote.unknown += 1;
    }
  }

  const mapToSortedArray = (map: Map<string, number>) =>
    [...map.entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value, "de-CH"));

  return {
    types: mapToSortedArray(typeCounts),
    workloads: mapToSortedArray(workloadCounts),
    remote,
  };
}

export function isScrapedDataStale(scrapedAt: string | null): boolean {
  if (!scrapedAt) {
    return true;
  }

  const scrapedAtMs = Date.parse(scrapedAt);
  if (!Number.isFinite(scrapedAtMs)) {
    return true;
  }

  const maxAgeMs = SCRAPE_STALE_HOURS * 60 * 60 * 1000;
  return Date.now() - scrapedAtMs > maxAgeMs;
}

function normalizeLocationFilter(location: string): string {
  const trimmed = location.trim();
  if (!trimmed) {
    return "";
  }

  if (COUNTRY_WIDE_LOCATIONS.has(normalizeText(trimmed))) {
    return "";
  }

  return trimmed;
}

function normalizeSearchParams(params: JobSearchParams): NormalizedParams {
  const limit = Math.min(
    Math.max(Number.isFinite(params.limit) ? Number(params.limit) : DEFAULT_LIMIT, 1),
    MAX_LIMIT
  );
  const offset = Math.max(Number.isFinite(params.offset) ? Number(params.offset) : 0, 0);
  const radiusRaw = Number(params.radiusKm);
  const radiusKm =
    Number.isFinite(radiusRaw) && radiusRaw > 0
      ? Math.min(Math.max(Math.round(radiusRaw), MIN_RADIUS_KM), MAX_RADIUS_KM)
      : null;
  const postedWithinDaysRaw = Number(params.postedWithinDays);
  const postedWithinDays =
    Number.isFinite(postedWithinDaysRaw) && postedWithinDaysRaw > 0 ? postedWithinDaysRaw : null;

  const sort: JobSort = ["newest", "oldest", "relevance"].includes(params.sort ?? "")
    ? (params.sort as JobSort)
    : "newest";

  const remote: RemoteFilter = ["any", "true", "false"].includes(params.remote ?? "")
    ? (params.remote as RemoteFilter)
    : "any";

  return {
    q: (params.q ?? "").trim(),
    loc: normalizeLocationFilter(params.loc ?? ""),
    radiusKm,
    limit,
    offset,
    type: (params.type ?? "").trim(),
    workload: (params.workload ?? "").trim(),
    remote,
    postedWithinDays,
    sort,
  };
}

async function getSourceJobs(): Promise<SourceBundle> {
  const [meta, curatedScraped] = await Promise.all([
    getScrapedMeta(),
    buildCuratedScrapedListings(),
  ]);
  return {
    scrapedJobs: curatedScraped,
    scrapedAt: meta?.scrapedAt ?? null,
  };
}

function applySecondaryFilters(
  jobs: JobListing[],
  normalized: NormalizedParams
): JobListing[] {
  return jobs.filter(
    (job) =>
      isValueInFilter(job.type, normalized.type) &&
      isValueInFilter(normalizeWorkload(job.workload), normalizeWorkload(normalized.workload)) &&
      matchesRemote(job, normalized.remote) &&
      matchesPostedWithinDays(job, normalized.postedWithinDays)
  );
}

export async function searchJobListings(params: JobSearchParams): Promise<JobSearchResult> {
  const normalized = normalizeSearchParams(params);
  const sourceBundle = await getSourceJobs();
  const originCoordinate =
    normalized.loc && normalized.radiusKm ? getCachedCoordinate(normalized.loc) : null;

  const scopedJobs = sourceBundle.scrapedJobs.filter(
    (job) =>
      matchesQuery(job, normalized.q) &&
      matchesLocationWithRadius(job, normalized.loc, normalized.radiusKm, originCoordinate)
  );
  const filteredJobs = applySecondaryFilters(scopedJobs, normalized);
  const facets = buildFacets(scopedJobs);
  const sortedJobs = sortJobs(filteredJobs, normalized.sort);
  const total = sortedJobs.length;
  const paged = sortedJobs.slice(normalized.offset, normalized.offset + normalized.limit);
  const opportunities = buildDirectHireOpportunities({
    visibleRealRows: paged.length,
    offset: normalized.offset,
    preferences: {
      q: normalized.q,
      loc: normalized.loc,
      type: normalized.type,
      workload: normalized.workload,
      remote: normalized.remote,
    },
  });

  return {
    jobs: paged,
    opportunities,
    total,
    offset: normalized.offset,
    limit: normalized.limit,
    facets,
    scrapedAt: sourceBundle.scrapedAt,
  };
}

async function normalizeScrapedById(id: string): Promise<JobListing | null> {
  const scraped = await getScrapedJobById(id);
  if (!scraped) {
    return null;
  }

  const relevanceScore = scoreScrapedJob(scraped);
  if (relevanceScore < MIN_RELEVANCE_SCORE) {
    return null;
  }

  return toScrapedListing(scraped, relevanceScore);
}

export async function getJobListingById(input: {
  id: string;
}): Promise<JobListing | null> {
  if (!isValidZimmermannJobId(input.id)) {
    return null;
  }

  return normalizeScrapedById(input.id);
}

function overlapScore(a: string, b: string): number {
  const wordsA = new Set(
    normalizeText(a)
      .split(" ")
      .filter((word) => word.length >= 4)
  );
  const wordsB = new Set(
    normalizeText(b)
      .split(" ")
      .filter((word) => word.length >= 4)
  );

  let overlap = 0;
  for (const word of wordsA) {
    if (wordsB.has(word)) {
      overlap += 1;
    }
  }

  return overlap;
}

export async function getSimilarJobListings(current: JobListing, limit = 4): Promise<JobListing[]> {
  const candidates = await buildCuratedScrapedListings();

  return candidates
    .filter((candidate) => candidate.id !== current.id)
    .map((candidate) => {
      let score = overlapScore(current.title, candidate.title);

      if (normalizeText(candidate.location) === normalizeText(current.location)) {
        score += 3;
      }
      if (normalizeText(candidate.type) === normalizeText(current.type)) {
        score += 1;
      }

      return { candidate, score };
    })
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return parseIsoDateMs(b.candidate.datePosted) - parseIsoDateMs(a.candidate.datePosted);
    })
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}

export async function getIndexableJobListings(limit = 400): Promise<JobListing[]> {
  const curatedScraped = await buildCuratedScrapedListings();
  return sortJobs(curatedScraped, "newest").slice(0, limit);
}

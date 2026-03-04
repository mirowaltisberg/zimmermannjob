import { generateFakeJobById, generateFakeJobs, normalizeSearchInput } from "@/lib/job-generator";
import { mockJobs, type Job } from "@/lib/mock-data";
import {
  getScrapedJobById,
  getScrapedMeta,
  loadScrapedJobs,
  type ScrapedJob,
} from "@/lib/scraped-jobs";
import { cleanJobList, cleanJobSummary, cleanJobText } from "@/lib/job-text-clean";
import { calculateDistanceKm, resolveLocationCoordinate, type Coordinate } from "@/lib/location-distance";
import type {
  GeneratedJob,
  JobFacets,
  JobListing,
  JobSearchParams,
  JobSort,
  RemoteFilter,
  SearchContext,
} from "@/lib/job-types";

const FALLBACK_GENERATED_COUNT = 150;
const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 200;
const MIN_RADIUS_KM = 5;
const MAX_RADIUS_KM = 300;
const MIN_REAL_RESULTS_FOR_SCRAPED_ONLY = 24;
const SCRAPE_STALE_HOURS = Math.max(1, Number(process.env.SCRAPE_STALE_HOURS ?? 72));
const MIN_RELEVANCE_SCORE = 2;
const COUNTRY_WIDE_LOCATIONS = new Set([
  "schweiz",
  "ganze schweiz",
  "schweizweit",
  "switzerland",
  "whole switzerland",
  "ch",
]);
const coordinateCache = new Map<string, Coordinate | null>();

const POSITIVE_KEYWORDS = [
  "zimmermann",
  "zimmer",
  "holzbau",
  "holz",
  "holzkonstruktion",
  "dachstuhl",
  "dachkonstruktion",
  "abbund",
  "element",
  "elementbau",
  "aufrichtung",
  "monteur",
  "polier",
  "vorarbeiter",
  "dachdecker",
  "schreiner",
  "bauführer",
  "holzbautechniker",
  "holzbauingenieur",
  "innenausbau",
  "fassade",
  "minergie",
  "trockenbau",
  "isolierung",
  "dämmung",
  "brandschutz",
  "installat",
  "wartung",
  "montage",
];

const NEGATIVE_KEYWORDS = [
  "verkäufer",
  "detailhandel",
  "pfleger",
  "pflegefach",
  "jurist",
  "staatsanwalt",
  "küche",
  "koch",
  "reinigung",
  "logistik",
  "marketing",
  "hr manager",
  "data analyst",
  "praktikum data",
];

const CORE_TITLE_KEYWORDS = [
  "zimmermann",
  "zimmer",
  "holzbau",
  "holzkonstruktion",
  "dachstuhl",
  "abbund",
  "element",
  "aufrichtung",
  "polier",
  "vorarbeiter",
  "dachdecker",
  "schreiner",
  "bauführer",
  "techniker",
  "ingenieur",
  "projektleiter",
  "bauleiter",
  "monteur",
  "planer",
  "holz",
  "fassade",
  "minergie",
  "innenausbau",
  "trockenbau",
];

const HARD_NEGATIVE_TITLE_KEYWORDS = [
  "pflege",
  "fage",
  "spitex",
  "gesundheit",
  "notfall",
  "sozial",
  "verkauf",
  "sales",
  "marketing",
  "jurist",
  "anwalt",
  "fahrer",
  "chauffeur",
  "logistik",
  "reinigung",
  "koch",
  "küche",
  "kueche",
  "hauswirtschaft",
  "arzt",
  "medizin",
  "data",
  "hr",
  "human resources",
];

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
  generatedJobs: JobListing[];
  scrapedAt: string | null;
  fallbackUsed: boolean;
}

export interface JobSearchResult {
  jobs: JobListing[];
  total: number;
  offset: number;
  limit: number;
  facets: JobFacets;
  scrapedAt: string | null;
  fallbackUsed: boolean;
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

function countKeywordHits(text: string, keywords: string[]): number {
  let hits = 0;
  for (const keyword of keywords) {
    if (text.includes(keyword)) {
      hits += 1;
    }
  }
  return hits;
}

function scoreScrapedJob(job: ScrapedJob): number {
  const title = normalizeText(job.title);
  const requirements = Array.isArray(job.requirements) ? job.requirements : [];
  const responsibilities = Array.isArray(job.responsibilities) ? job.responsibilities : [];
  const body = normalizeText(
    `${job.description} ${job.fullDescription} ${requirements.join(" ")} ${responsibilities.join(" ")}`
  );

  const titleSignalHits = countKeywordHits(title, CORE_TITLE_KEYWORDS);
  const hardNegativeTitleHits = countKeywordHits(title, HARD_NEGATIVE_TITLE_KEYWORDS);
  const bodySignalHits = countKeywordHits(body, POSITIVE_KEYWORDS);
  const bodyNegativeHits = countKeywordHits(body, NEGATIVE_KEYWORDS);

  if (hardNegativeTitleHits > 0 && titleSignalHits === 0) {
    return -100;
  }

  if (titleSignalHits === 0 && bodySignalHits < 3) {
    return -100;
  }

  if (titleSignalHits === 0 && bodyNegativeHits >= 3) {
    return -100;
  }

  let score = titleSignalHits * 10 + bodySignalHits * 2;
  score -= hardNegativeTitleHits * 8;
  score -= bodyNegativeHits * 4;

  if (title.includes("efz")) {
    score += 2;
  }

  if (titleSignalHits === 0) {
    score -= 4;
  }

  return score;
}

function normalizeWorkload(value: string): string {
  return value.replace(/\s+/g, "").trim();
}

function dedupeSignature(job: Pick<JobListing, "title" | "company" | "location">): string {
  return `${normalizeText(job.title)}|${normalizeText(job.company)}|${normalizeText(job.location)}`;
}

function toScrapedListing(job: ScrapedJob, relevanceScore: number): JobListing {
  const cleanedDescription = cleanJobSummary(job.description, job.fullDescription);
  const cleanedFullDescription = cleanJobText(job.fullDescription);
  const cleanedResponsibilities = cleanJobList(job.responsibilities ?? [], job.fullDescription);
  const cleanedRequirements = cleanJobList(job.requirements ?? [], job.fullDescription);
  const cleanedBenefits = cleanJobList(job.benefits ?? [], job.fullDescription);

  return {
    id: String(job.id),
    title: cleanJobText(job.title),
    company: cleanJobText(job.company),
    location: cleanJobText(job.location),
    type: job.type || "Festanstellung",
    workload: job.workload || "80-100%",
    description: cleanedDescription || cleanJobText(job.description),
    fullDescription: cleanedFullDescription,
    responsibilities: cleanedResponsibilities,
    requirements: cleanedRequirements,
    benefits: cleanedBenefits,
    datePosted: job.datePosted,
    isNew: Boolean(job.isNew),
    isUrgent: Boolean(job.isUrgent),
    source: "scraped",
    salary: cleanJobText(job.salary) || undefined,
    jobUrl: job.jobUrl || undefined,
    isRemote: typeof job.isRemote === "boolean" ? job.isRemote : undefined,
    companyUrl: job.companyUrl || undefined,
    scrapedSource: job.source || undefined,
    relevanceScore,
  };
}

function toGeneratedListing(job: GeneratedJob): JobListing {
  return {
    ...job,
    source: "generated",
    relevanceScore: 1,
  };
}

function toMockListing(job: Job): JobListing {
  return {
    ...job,
    source: "mock",
    relevanceScore: 1,
  };
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
    if (!listing.description || !listing.description.trim()) {
      continue;
    }
    const signature = dedupeSignature(listing);
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

  const normalizedQuery = normalizeText(query);
  return (
    normalizeText(job.title).includes(normalizedQuery) ||
    normalizeText(job.company).includes(normalizedQuery) ||
    normalizeText(job.description).includes(normalizedQuery)
  );
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

    if (type) {
      typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1);
    }
    if (workload) {
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

async function getSourceJobs(query: string, location: string): Promise<SourceBundle> {
  const [meta, curatedScraped] = await Promise.all([
    getScrapedMeta(),
    buildCuratedScrapedListings(),
  ]);
  const scrapedAt = meta?.scrapedAt ?? null;

  // Always generate supplemental jobs so every search returns results
  const context = normalizeSearchInput(
    query || "Zimmermann",
    location || "Schweiz"
  );
  const generated = generateFakeJobs({
    query: context.query,
    location: context.location,
    count: FALLBACK_GENERATED_COUNT,
  }).map(toGeneratedListing);

  if (curatedScraped.length > 0) {
    // Real scraped jobs first, generated ones fill gaps
    const dedupeKeys = new Set(curatedScraped.map(dedupeSignature));
    const uniqueGenerated = generated.filter(
      (g) => !dedupeKeys.has(dedupeSignature(g))
    );

    return {
      scrapedJobs: curatedScraped,
      generatedJobs: uniqueGenerated,
      scrapedAt,
      fallbackUsed: false,
    };
  }

  return {
    scrapedJobs: [],
    generatedJobs: generated,
    scrapedAt,
    fallbackUsed: true,
  };
}

function withoutLongDescription(job: JobListing): JobListing {
  if (!job.fullDescription) {
    return job;
  }

  const clone = { ...job };
  delete clone.fullDescription;
  return clone;
}

export async function searchJobListings(params: JobSearchParams): Promise<JobSearchResult> {
  const normalized = normalizeSearchParams(params);
  const sourceBundle = await getSourceJobs(normalized.q, normalized.loc);
  const originCoordinate =
    normalized.loc && normalized.radiusKm ? getCachedCoordinate(normalized.loc) : null;

  const baseScopedScraped = sourceBundle.scrapedJobs.filter(
    (job) =>
      matchesQuery(job, normalized.q) &&
      matchesLocationWithRadius(job, normalized.loc, normalized.radiusKm, originCoordinate)
  );
  const baseScopedGenerated = sourceBundle.generatedJobs.filter(
    (job) =>
      matchesQuery(job, normalized.q) &&
      matchesLocationWithRadius(job, normalized.loc, normalized.radiusKm, originCoordinate)
  );

  const filteredScraped = baseScopedScraped.filter(
    (job) =>
      isValueInFilter(job.type, normalized.type) &&
      isValueInFilter(normalizeWorkload(job.workload), normalizeWorkload(normalized.workload)) &&
      matchesRemote(job, normalized.remote) &&
      matchesPostedWithinDays(job, normalized.postedWithinDays)
  );
  const filteredGenerated = baseScopedGenerated.filter(
    (job) =>
      isValueInFilter(job.type, normalized.type) &&
      isValueInFilter(normalizeWorkload(job.workload), normalizeWorkload(normalized.workload)) &&
      matchesRemote(job, normalized.remote) &&
      matchesPostedWithinDays(job, normalized.postedWithinDays)
  );

  const includeGenerated = filteredScraped.length < MIN_REAL_RESULTS_FOR_SCRAPED_ONLY;
  const facets = buildFacets(
    includeGenerated ? [...baseScopedScraped, ...baseScopedGenerated] : baseScopedScraped
  );

  const sortedScraped = sortJobs(filteredScraped, normalized.sort);
  const sortedGenerated = sortJobs(filteredGenerated, normalized.sort);
  const combined = includeGenerated ? [...sortedScraped, ...sortedGenerated] : sortedScraped;

  const total = combined.length;
  const paged = combined
    .slice(normalized.offset, normalized.offset + normalized.limit)
    .map(withoutLongDescription);

  return {
    jobs: paged,
    total,
    offset: normalized.offset,
    limit: normalized.limit,
    facets,
    scrapedAt: sourceBundle.scrapedAt,
    fallbackUsed: sourceBundle.fallbackUsed,
  };
}

function normalizeGeneratedFromId(
  id: string,
  context: { query?: string; location?: string }
): JobListing | null {
  const generated = generateFakeJobById({
    id,
    query: context.query ?? "",
    location: context.location ?? "",
  });

  if (!generated) {
    return null;
  }

  return toGeneratedListing(generated);
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

function normalizeMockById(id: string): JobListing | null {
  const mock = mockJobs.find((job) => job.id === id);
  return mock ? toMockListing(mock) : null;
}

export async function getJobListingById(input: {
  id: string;
  query?: string;
  location?: string;
}): Promise<JobListing | null> {
  if (input.id.startsWith("gen-")) {
    return normalizeGeneratedFromId(input.id, {
      query: input.query,
      location: input.location,
    });
  }

  return (await normalizeScrapedById(input.id)) ?? normalizeMockById(input.id);
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
  let candidates: JobListing[] = [];

  if (current.source === "scraped") {
    candidates = await buildCuratedScrapedListings();
  } else if (current.source === "generated") {
    const context: SearchContext = current.searchContext ?? normalizeSearchInput(current.title, current.location);
    candidates = generateFakeJobs({
      query: context.query,
      location: context.location,
      count: 18,
    }).map(toGeneratedListing);
  } else {
    candidates = mockJobs.map(toMockListing);
  }

  return candidates
    .filter((candidate) => candidate.id !== current.id)
    .map((candidate) => {
      let score = overlapScore(current.title, candidate.title);

      if (normalizeText(candidate.location) === normalizeText(current.location)) {
        score += 3;
      }
      if (normalizeText(candidate.company) === normalizeText(current.company)) {
        score += 1;
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
    .map(({ candidate }) => withoutLongDescription(candidate));
}

export async function getIndexableJobListings(limit = 400): Promise<JobListing[]> {
  const curatedScraped = await buildCuratedScrapedListings();

  if (curatedScraped.length > 0) {
    return sortJobs(curatedScraped, "newest").slice(0, limit).map(withoutLongDescription);
  }

  return mockJobs.map(toMockListing).slice(0, limit);
}

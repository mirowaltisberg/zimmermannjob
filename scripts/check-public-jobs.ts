import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildPublicJobCopy } from "../src/lib/job-public";
import { classifyZimmermannTitle, validateRawJobIdentity } from "../src/lib/job-safety";
import {
  isPublicJobNew,
  validatePublicJobDate,
  type PublicJobDateError,
} from "../src/lib/job-freshness";
import {
  assertNoForbiddenPublicFields,
  serializePublicJob,
} from "../src/lib/public-job-boundary";

interface RawScrapedJob {
  id: unknown;
  trade: unknown;
  jobUrl: unknown;
  source: unknown;
  title: unknown;
  company: unknown;
  location: unknown;
  type: unknown;
  workload: unknown;
  datePosted: unknown;
  expectedDisposition?: unknown;
  expectedPublicTitle?: unknown;
  expectedIdentityError?: unknown;
  expectedDateError?: unknown;
}

interface ScrapedJobFile {
  jobs?: unknown;
}

const DEFAULT_FIXTURES = [
  "scripts/fixtures/job-safety-positive.json",
  "scripts/fixtures/job-safety-negative.json",
];
const FAKE_MARKER_PATTERN = /\b(?:demo|tinder|generated|mock)\b/iu;
const usesBundledFixtures = !process.argv[2];
const checkNow = new Date();

function fail(message: string): never {
  throw new Error(message);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsExactEmployerName(publicCopy: string, employer: string): boolean {
  const normalizedEmployer = employer.trim();
  if (!normalizedEmployer) return false;

  return new RegExp(
    `(?:^|[^\\p{L}\\p{N}])${escapeRegExp(normalizedEmployer)}(?:$|[^\\p{L}\\p{N}])`,
    "iu",
  ).test(publicCopy);
}

function requireString(
  job: RawScrapedJob,
  key: keyof RawScrapedJob,
  index: number,
): string {
  const value = job[key];
  if (typeof value !== "string") {
    fail(`Job ${index + 1} has a non-string ${String(key)}`);
  }
  return value;
}

function readJobs(filePath: string): RawScrapedJob[] {
  const parsed: unknown = JSON.parse(readFileSync(filePath, "utf8"));
  const jobs = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === "object"
      ? (parsed as ScrapedJobFile).jobs
      : undefined;

  if (!Array.isArray(jobs) || jobs.length === 0) {
    fail(`${filePath} must contain a non-empty jobs array`);
  }

  return jobs as RawScrapedJob[];
}

const fixturePaths = process.argv[2]
  ? [resolve(process.cwd(), process.argv[2])]
  : DEFAULT_FIXTURES.map((path) => resolve(process.cwd(), path));
const jobs = fixturePaths.flatMap(readJobs);
const seenIds = new Set<string>();

function resolveFixtureDate(value: string): string {
  if (value !== "$TODAY") return value;
  if (!usesBundledFixtures) fail("$TODAY is allowed only in the bundled test fixtures");
  return checkNow.toISOString().slice(0, 10);
}

for (const [index, job] of jobs.entries()) {
  const id = requireString(job, "id", index);
  const trade = requireString(job, "trade", index);
  const jobUrl = requireString(job, "jobUrl", index);
  const source = requireString(job, "source", index);
  const title = requireString(job, "title", index);
  const datePosted = resolveFixtureDate(requireString(job, "datePosted", index));

  const dateError = validatePublicJobDate(datePosted, checkNow);
  const expectedDateError =
    typeof job.expectedDateError === "string"
      ? (job.expectedDateError as PublicJobDateError)
      : null;
  if (dateError !== expectedDateError) {
    fail(
      `Job ${index + 1} date result was ${dateError ?? "valid"}, ` +
        `expected ${expectedDateError ?? "valid"}`,
    );
  }

  const identityError = validateRawJobIdentity({ trade, id, jobUrl, source });
  const expectedIdentityError =
    typeof job.expectedIdentityError === "string" ? job.expectedIdentityError : null;
  if (identityError !== expectedIdentityError) {
    fail(
      `Job ${index + 1} identity result was ${identityError ?? "valid"}, ` +
        `expected ${expectedIdentityError ?? "valid"}`,
    );
  }
  if (seenIds.has(id)) {
    fail(`Duplicate scraped ID: ${id}`);
  }
  seenIds.add(id);

  const classification = classifyZimmermannTitle(title);
  const expectedDisposition = requireString(job, "expectedDisposition", index);
  if (classification.disposition !== expectedDisposition) {
    fail(
      `Job ${index + 1} classified ${classification.disposition}, expected ${expectedDisposition}`,
    );
  }

  if (identityError || dateError) continue;
  if (classification.disposition !== "ACCEPT") continue;

  const company = requireString(job, "company", index);
  const location = requireString(job, "location", index);
  const type = requireString(job, "type", index);
  const workload = requireString(job, "workload", index);

  const publicCopy = buildPublicJobCopy({
    title,
    company,
    location,
    type,
    workload,
  });
  const publicJob = serializePublicJob({
    id,
    ...publicCopy,
    datePosted,
    isNew: isPublicJobNew(datePosted, checkNow),
    isUrgent: false,
  });
  const serialized = JSON.stringify(publicJob);

  if (job.expectedPublicTitle && publicCopy.title !== job.expectedPublicTitle) {
    fail(`Public title for ${id} did not match its controlled fixture title`);
  }
  if (publicJob.benefits.length !== 0) {
    fail(`Public copy for ${id} must keep benefits empty`);
  }

  if (containsExactEmployerName(serialized, company)) {
    fail(`Public copy for job ${index + 1} contains the exact employer name`);
  }

  assertNoForbiddenPublicFields(publicJob, `fixture ${id}`);

  if (FAKE_MARKER_PATTERN.test(`${id}\n${serialized}`)) {
    fail(`Public copy for ${id} contains a demo/generated marker`);
  }
}

const freshnessFixture = JSON.parse(
  readFileSync(resolve(process.cwd(), "scripts/fixtures/job-freshness.json"), "utf8"),
) as { cases?: Array<{ offsetDays?: unknown; expectedError?: unknown }> };
if (!Array.isArray(freshnessFixture.cases) || freshnessFixture.cases.length < 5) {
  fail("Freshness fixture must contain at least five boundary cases");
}
const todayMs = Date.parse(`${checkNow.toISOString().slice(0, 10)}T00:00:00.000Z`);
for (const [index, testCase] of freshnessFixture.cases.entries()) {
  if (typeof testCase.offsetDays !== "number" || !Number.isInteger(testCase.offsetDays)) {
    fail(`Freshness fixture ${index + 1} has an invalid offset`);
  }
  const date = new Date(todayMs + testCase.offsetDays * 86_400_000).toISOString().slice(0, 10);
  const actual = validatePublicJobDate(date, checkNow);
  const expected = typeof testCase.expectedError === "string" ? testCase.expectedError : null;
  if (actual !== expected) {
    fail(`Freshness fixture ${index + 1} was ${actual ?? "valid"}, expected ${expected ?? "valid"}`);
  }
}

const exposureFixture = JSON.parse(
  readFileSync(resolve(process.cwd(), "scripts/fixtures/public-job-exposure.json"), "utf8")
) as { cases?: Array<{ name?: unknown; payload?: unknown }> };
if (!Array.isArray(exposureFixture.cases) || exposureFixture.cases.length < 10) {
  fail("Public exposure fixture must contain at least 10 cases");
}
for (const [index, exposure] of exposureFixture.cases.entries()) {
  let rejected = false;
  try {
    assertNoForbiddenPublicFields(exposure.payload, `exposure fixture ${index + 1}`);
  } catch {
    rejected = true;
  }
  if (!rejected) {
    fail(`Exposure fixture ${String(exposure.name ?? index + 1)} was not rejected`);
  }
}

console.log(
  `Public-job and trade-safety checks passed for ${jobs.length} jobs and ` +
    `${exposureFixture.cases.length} exposure fixtures.`
);

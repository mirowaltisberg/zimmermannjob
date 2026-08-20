import type { JobListing } from "@/lib/job-types";

const NORMALIZED_FORBIDDEN_KEYS = new Set([
  "company",
  "companyname",
  "companyurl",
  "employer",
  "employername",
  "externalid",
  "externalurl",
  "fulldescription",
  "hiringorganization",
  "jobsource",
  "joburl",
  "originaljoburl",
  "originalurl",
  "provider",
  "rawcompany",
  "rawemployer",
  "rawjoburl",
  "rawsource",
  "rawtitle",
  "scrapedsource",
  "source",
  "sourceid",
  "sourcelink",
  "sourcesite",
  "sourceurl",
]);

const PUBLIC_JOB_KEYS = new Set([
  "id",
  "title",
  "location",
  "type",
  "workload",
  "description",
  "responsibilities",
  "requirements",
  "benefits",
  "datePosted",
  "isNew",
  "isUrgent",
  "salary",
  "isRemote",
  "relevanceScore",
]);

function normalizeKey(key: string): string {
  return key.replace(/[-_]/g, "").toLowerCase();
}

export function isForbiddenPublicJobKey(key: string): boolean {
  return NORMALIZED_FORBIDDEN_KEYS.has(normalizeKey(key));
}

export function assertNoForbiddenPublicFields(
  value: unknown,
  boundary = "public payload"
): void {
  const visited = new WeakSet<object>();

  const visit = (candidate: unknown, path: string): void => {
    if (!candidate || typeof candidate !== "object") return;
    if (visited.has(candidate)) return;
    visited.add(candidate);

    if (Array.isArray(candidate)) {
      candidate.forEach((entry, index) => visit(entry, `${path}[${index}]`));
      return;
    }

    for (const [key, nested] of Object.entries(candidate)) {
      if (isForbiddenPublicJobKey(key)) {
        throw new Error(`${boundary} contains forbidden field at ${path}.${key}`);
      }
      visit(nested, `${path}.${key}`);
    }
  };

  visit(value, "$root");
}

export function assertPublicJobListing(job: JobListing): void {
  assertNoForbiddenPublicFields(job, "JobListing");

  for (const key of Object.keys(job)) {
    if (!PUBLIC_JOB_KEYS.has(key)) {
      throw new Error(`JobListing contains unreviewed field: ${key}`);
    }
  }

  const requiredStrings: Array<keyof JobListing> = [
    "id",
    "title",
    "location",
    "type",
    "workload",
    "description",
    "datePosted",
  ];
  for (const key of requiredStrings) {
    if (typeof job[key] !== "string") {
      throw new Error(`JobListing has invalid ${key}`);
    }
  }

  if (
    !Array.isArray(job.responsibilities) ||
    !Array.isArray(job.requirements) ||
    !Array.isArray(job.benefits) ||
    !job.responsibilities.every((item) => typeof item === "string") ||
    !job.requirements.every((item) => typeof item === "string") ||
    !job.benefits.every((item) => typeof item === "string")
  ) {
    throw new Error("JobListing has invalid public copy arrays");
  }

  if (typeof job.isNew !== "boolean" || typeof job.isUrgent !== "boolean") {
    throw new Error("JobListing has invalid public status flags");
  }
}

export function serializePublicJob(job: JobListing): JobListing {
  assertPublicJobListing(job);

  const serialized: JobListing = {
    id: job.id,
    title: job.title,
    location: job.location,
    type: job.type,
    workload: job.workload,
    description: job.description,
    responsibilities: [...job.responsibilities],
    requirements: [...job.requirements],
    benefits: [...job.benefits],
    datePosted: job.datePosted,
    isNew: job.isNew,
    isUrgent: job.isUrgent,
    ...(job.salary ? { salary: job.salary } : {}),
    ...(typeof job.isRemote === "boolean" ? { isRemote: job.isRemote } : {}),
    ...(typeof job.relevanceScore === "number" ? { relevanceScore: job.relevanceScore } : {}),
  };

  assertPublicJobListing(serialized);
  return serialized;
}

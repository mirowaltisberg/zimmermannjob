import { createHash } from "node:crypto";
import safetyConfig from "@/config/job-safety.json";

export type JobSafetyDisposition = "ACCEPT" | "REVIEW" | "REJECT";
export type JobSafetyProfile = keyof typeof safetyConfig.profiles;

export interface JobSafetyResult {
  disposition: JobSafetyDisposition;
  reason: string;
  publicTitle?: string;
  profile?: JobSafetyProfile;
}

export interface RawJobIdentity {
  trade: unknown;
  id: unknown;
  jobUrl: unknown;
  source?: unknown;
}

const idPattern = new RegExp(safetyConfig.idPattern);
const standaloneEfzPattern = /(?:^|[^\p{L}\p{N}_])efz(?:$|[^\p{L}\p{N}_])/iu;

function normalize(value: unknown): string {
  return typeof value === "string"
    ? value.normalize("NFKC").toLocaleLowerCase("de-CH").replace(/\s+/g, " ").trim()
    : "";
}

function includesAny(value: string, patterns: readonly string[]): boolean {
  return patterns.some((pattern) => value.includes(pattern));
}

export function classifyZimmermannTitle(titleValue: unknown): JobSafetyResult {
  const title = normalize(titleValue);
  if (!title) return { disposition: "REJECT", reason: "missing-title" };

  if (includesAny(title, safetyConfig.hardNegativeTitlePatterns)) {
    return { disposition: "REJECT", reason: "hard-negative-title" };
  }

  const specific = safetyConfig.highSpecificityTitles.find(({ pattern }) =>
    new RegExp(pattern, "iu").test(title),
  );
  const hasTradeContext = includesAny(title, safetyConfig.tradeContextPatterns);
  const broad = hasTradeContext
    ? safetyConfig.broadTitlesRequiringTradeContext.find(({ pattern }) =>
        new RegExp(pattern, "iu").test(title),
      )
    : undefined;
  const match = specific ?? broad;

  // Descriptions are intentionally absent from this classifier. Body text can
  // never rescue a generic or unrelated title.
  if (!match) return { disposition: "REJECT", reason: "no-zimmermann-title-signal" };

  if (includesAny(title, safetyConfig.otherTradeTitlePatterns)) {
    return { disposition: "REVIEW", reason: "mixed-trade-title" };
  }

  const hasStandaloneEfz = standaloneEfzPattern.test(title);
  return {
    disposition: "ACCEPT",
    reason: specific ? "specific-zimmermann-title" : "broad-role-with-zimmermann-context",
    publicTitle: `${match.publicTitle}${hasStandaloneEfz ? " EFZ" : ""}`,
    profile: match.profile as JobSafetyProfile,
  };
}

export function validateRawJobIdentity(job: RawJobIdentity): string | null {
  if (job.trade !== safetyConfig.trade) return "wrong-trade";
  if (typeof job.id !== "string" || !idPattern.test(job.id)) return "invalid-id";
  if (typeof job.jobUrl !== "string" || !/^https?:\/\//i.test(job.jobUrl)) return "invalid-job-url";
  const expectedId = `scraped-${safetyConfig.trade}-${createHash("md5").update(job.jobUrl).digest("hex").slice(0, 12)}`;
  if (job.id !== expectedId) return "id-url-mismatch";
  if (
    job.source !== undefined &&
    (typeof job.source !== "string" || !safetyConfig.allowedSources.includes(job.source.toLowerCase()))
  ) {
    return "invalid-source";
  }
  return null;
}

export function isValidZimmermannJobId(value: unknown): value is string {
  return typeof value === "string" && idPattern.test(value);
}

export function getZimmermannProfile(profile: JobSafetyProfile) {
  return safetyConfig.profiles[profile];
}

export { safetyConfig as JOB_SAFETY_CONFIG };

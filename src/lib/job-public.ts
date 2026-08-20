import { cleanJobText } from "@/lib/job-text-clean";
import { classifyZimmermannTitle, getZimmermannProfile } from "@/lib/job-safety";

interface PublicJobCopyInput {
  title: string;
  company: string;
  location: string;
  type: string;
  workload: string;
}

interface PublicJobCopy {
  title: string;
  location: string;
  type: string;
  workload: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
}

const NOT_PROVIDED = "Nicht angegeben";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsExactEmployer(value: string, company: string): boolean {
  const normalizedValue = value.normalize("NFKC");
  const normalizedCompany = cleanJobText(company).normalize("NFKC").trim();
  if (!normalizedCompany) return false;

  return new RegExp(
    `(?:^|[^\\p{L}\\p{N}])${escapeRegExp(normalizedCompany)}(?:$|[^\\p{L}\\p{N}])`,
    "iu",
  ).test(normalizedValue);
}

function sanitizeOutwardField(value: string, company: string, fallback: string): string {
  const cleaned = cleanJobText(value).normalize("NFKC").trim();
  return cleaned && !containsExactEmployer(cleaned, company) ? cleaned : fallback;
}

export function buildPublicJobCopy(input: PublicJobCopyInput): PublicJobCopy {
  // Never echo a scraped title: employer brands and source identifiers can be
  // embedded directly in it.
  const classification = classifyZimmermannTitle(input.title);
  if (
    classification.disposition !== "ACCEPT" ||
    !classification.publicTitle ||
    !classification.profile
  ) {
    throw new Error(`Unsafe public job title: ${classification.reason}`);
  }
  const title = classification.publicTitle;
  const location = sanitizeOutwardField(input.location, input.company, "Schweiz");
  const type = sanitizeOutwardField(input.type, input.company, NOT_PROVIDED);
  const workload = sanitizeOutwardField(input.workload, input.company, NOT_PROVIDED);
  const profile = getZimmermannProfile(classification.profile);
  const publishedDetails = [
    type !== NOT_PROVIDED ? `die Anstellungsart ${type}` : "",
    workload !== NOT_PROVIDED ? `das Pensum ${workload}` : "",
  ].filter(Boolean);
  const detailSentence = publishedDetails.length
    ? `Im verfügbaren Inserat ist ${publishedDetails.join(" und ")} angegeben.`
    : "Anstellungsart und Pensum sind im verfügbaren Inserat nicht ausgewiesen.";

  return {
    title,
    location,
    type,
    workload,
    description:
      "Ausgeschrieben ist die Position " +
      title +
      " in " +
      location +
      `. ${detailSentence} Arbeitgeberangaben werden auf der öffentlichen Stellenansicht nicht angezeigt.`,
    responsibilities: profile.responsibilities,
    requirements: profile.requirements,
    benefits: [],
  };
}

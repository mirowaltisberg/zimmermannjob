import { cache, Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/json-ld";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getJobListingById, getSimilarJobListings } from "@/lib/job-catalog";
import type { JobListing } from "@/lib/job-types";
import { JobPrimaryAction, JobShareActions, RecentlyViewedJobs } from "@/components/job-detail-client-tools";
import { TOP_LANDING_PAGES, getLandingPath } from "@/lib/landing-pages";
import { estimateSalary, formatSalaryRange, type SalaryRange } from "@/lib/salary-estimates";

interface JobDetailsPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function readParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function getDisplayJobId(job: JobListing): string {
  if (job.source === "generated") {
    return job.id.toUpperCase();
  }
  if (job.source === "scraped") {
    const hash = job.id.replace(/^scraped-/, "");
    return `ZIM-${hash.slice(0, 8).toUpperCase()}`;
  }
  return `ZIM-${job.id.padStart(4, "0")}`;
}

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zimmermannjob.ch";

// SEO-DECISION: Map Swiss-German job type labels to schema.org employmentType values
function mapEmploymentType(type: string): string | string[] {
  const lower = type.toLowerCase();
  if (lower.includes("vollzeit") || lower === "full-time") return "FULL_TIME";
  if (lower.includes("teilzeit") || lower === "part-time") return "PART_TIME";
  if (lower.includes("temporär") || lower.includes("temp")) return "TEMPORARY";
  if (lower.includes("praktikum") || lower.includes("intern")) return "INTERN";
  if (lower.includes("freelance") || lower.includes("freiberuf")) return "CONTRACTOR";
  // "Festanstellung", "Unbefristet" → FULL_TIME as default
  return "FULL_TIME";
}

// SEO-DECISION: Parse location string "City, Canton" into structured address parts
function parseSwissLocation(location: string): { locality: string; region: string } {
  const parts = location.split(",").map((p) => p.trim());
  return {
    locality: parts[0] || location,
    region: parts[1] || "",
  };
}

// SEO-DECISION: Parse salary string or use estimated range for baseSalary schema
function buildSalarySchema(
  salaryStr: string | undefined,
  estimatedRange: SalaryRange | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any> | undefined {
  const range = estimatedRange;

  // Try to extract numeric values from salary string
  if (salaryStr) {
    const numbers = salaryStr.match(/[\d']+/g);
    if (numbers && numbers.length >= 2) {
      const min = parseInt(numbers[0].replace(/'/g, ""), 10);
      const max = parseInt(numbers[1].replace(/'/g, ""), 10);
      if (min > 0 && max > 0) {
        return {
          "@type": "MonetaryAmount",
          currency: "CHF",
          value: {
            "@type": "QuantitativeValue",
            minValue: min,
            maxValue: max,
            unitText: "YEAR",
          },
        };
      }
    }
  }

  // Fall back to estimated salary range
  if (range) {
    return {
      "@type": "MonetaryAmount",
      currency: "CHF",
      value: {
        "@type": "QuantitativeValue",
        minValue: range.min,
        maxValue: range.max,
        unitText: "YEAR",
      },
    };
  }

  return undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildJobPostingSchema(job: JobListing): Record<string, any> {
  const { locality, region } = parseSwissLocation(job.location);
  const salaryEstimate = estimateSalary(job.title);
  const baseSalary = buildSalarySchema(job.salary, salaryEstimate);

  // SEO-DECISION: validThrough defaults to datePosted + 60 days if not explicitly set
  const postedDate = new Date(job.datePosted);
  const validThrough = new Date(postedDate);
  validThrough.setDate(validThrough.getDate() + 60);

  const fullDescription = job.fullDescription || job.description;
  // Build a richer description from structured sections
  const descriptionParts = [fullDescription];
  if (job.responsibilities.length > 0) {
    descriptionParts.push("\n\nAufgaben:\n" + job.responsibilities.map((r) => `- ${r}`).join("\n"));
  }
  if (job.requirements.length > 0) {
    descriptionParts.push("\n\nAnforderungen:\n" + job.requirements.map((r) => `- ${r}`).join("\n"));
  }
  if (job.benefits.length > 0) {
    descriptionParts.push("\n\nWir bieten:\n" + job.benefits.map((b) => `- ${b}`).join("\n"));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: descriptionParts.join(""),
    datePosted: job.datePosted,
    validThrough: validThrough.toISOString().split("T")[0],
    employmentType: mapEmploymentType(job.type),
    hiringOrganization: {
      "@type": "Organization",
      name: job.company,
      ...(job.companyUrl ? { sameAs: job.companyUrl } : {}),
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: locality,
        ...(region ? { addressRegion: region } : {}),
        addressCountry: "CH",
      },
    },
    directApply: true,
    industry: "Holzbau & Zimmerei",
    url: `${SITE_URL}/jobs/${job.id}`,
  };

  if (baseSalary) {
    schema.baseSalary = baseSalary;
  }

  if (job.isRemote === true) {
    schema.jobLocationType = "TELECOMMUTE";
  }

  if (job.workload) {
    // SEO-DECISION: Extract workload percentage as workHours annotation
    schema.workHours = job.workload;
  }

  return schema;
}

function buildJobBreadcrumbSchema(job: JobListing) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Startseite",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Zimmermannjobs",
        item: `${SITE_URL}/`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: job.title,
        item: `${SITE_URL}/jobs/${job.id}`,
      },
    ],
  };
}

function buildJobHref(job: JobListing, fallbackQuery: string, fallbackLocation: string): string {
  if (job.source !== "generated") {
    return `/jobs/${job.id}`;
  }

  const query = job.searchContext?.query ?? fallbackQuery;
  const location = job.searchContext?.location ?? fallbackLocation;
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }
  if (location) {
    params.set("loc", location);
  }

  const queryString = params.toString();
  return queryString ? `/jobs/${job.id}?${queryString}` : `/jobs/${job.id}`;
}

const getJobPageData = cache(async ({ params, searchParams }: JobDetailsPageProps): Promise<{
  job: JobListing | null;
  query: string;
  location: string;
}> => {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const query = readParam(resolvedSearchParams.q);
  const location = readParam(resolvedSearchParams.loc);

  const job = await getJobListingById({
    id,
    query,
    location,
  });

  return { job, query, location };
});

export async function generateMetadata(props: JobDetailsPageProps): Promise<Metadata> {
  const { job } = await getJobPageData(props);

  if (!job) {
    return {
      title: "Stelle nicht gefunden | zimmermannjob.ch",
      description: "Die gewünschte Stelle konnte nicht gefunden werden.",
    };
  }

  const description = job.description.slice(0, 160);

  return {
    title: `${job.title} | zimmermannjob.ch`,
    description,
    alternates: {
      canonical: `/jobs/${job.id}`,
    },
    openGraph: {
      title: `${job.title}`,
      description,
      type: "article",
      url: `/jobs/${job.id}`,
    },
  };
}

/** Async server component — streams in after main content */
async function SimilarJobsSection({
  job,
  query,
  location,
}: {
  job: JobListing;
  query: string;
  location: string;
}) {
  const similarJobs = await getSimilarJobListings(job, 4);

  if (similarJobs.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Ähnliche Stellenangebote" className="bg-white border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
      <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3">Ähnliche Jobs</h2>
      <div className="space-y-2">
        {similarJobs.map((item) => (
          <Link
            key={`${item.source}-${item.id}`}
            href={buildJobHref(item, query, location)}
            className="block rounded-lg border border-slate-200 px-3 py-2 hover:border-primary/40 hover:bg-primary/5 transition-colors"
          >
            <p className="text-sm font-semibold text-slate-900 line-clamp-1">{item.title}</p>
            <p className="text-xs text-slate-500 line-clamp-1">{item.location}</p>
          </Link>
        ))}
      </div>
    </nav>
  );
}

function SimilarJobsSkeleton() {
  return (
    <div className="bg-white border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
      <div className="h-5 w-32 rounded bg-slate-200 mb-3" />
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-slate-200 px-3 py-2">
            <div className="h-4 w-3/4 rounded bg-slate-100 mb-1" />
            <div className="h-3 w-1/2 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function JobDetailsPage(props: JobDetailsPageProps) {
  const { job, query, location } = await getJobPageData(props);

  if (!job) {
    notFound();
  }

  const currentHref = buildJobHref(job, query, location);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <JsonLd data={buildJobPostingSchema(job)} />
      <JsonLd data={buildJobBreadcrumbSchema(job)} />
      <header className="border-b sticky top-0 z-30 header-blur animate-header">
        <div className="container mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center shrink-0">
            <Image src="/logo.svg" alt="zimmermannjob.ch — Zimmermannjobs in der Schweiz" width={142} height={29} className="h-7 sm:h-8 w-auto" priority />
          </Link>
          <nav className="shrink-0">
            <Button variant="ghost" size="sm" asChild className="text-sm px-2 sm:px-4 h-9 sm:h-10 btn-interactive">
              <Link href="/">Zurück</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-5 sm:py-8 max-w-5xl pb-32 lg:pb-8">
        <Breadcrumbs
          items={[
            { label: "Startseite", href: "/" },
            { label: "Zimmermannjobs", href: "/" },
            { label: job.title },
          ]}
          className="mb-4 sm:mb-6"
        />

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="flex-1 min-w-0 space-y-6 sm:space-y-8">
            {/* Main job content — renders instantly, no animation wrapper */}
            <article className="bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border shadow-sm">
              <div className="flex flex-col gap-4 mb-6">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className={job.source === "scraped" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-600"}
                    >
                      <Building2 className="h-3 w-3" />
                      {job.source === "scraped" ? "Live-Stelle" : "Demo-Stelle"}
                    </Badge>
                    {job.isRemote === true && (
                      <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700">
                        Remote
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-3 sm:mb-4 break-words">
                    {job.title}
                  </h1>
                  {/* Structured info grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-100 rounded-xl border border-slate-200 overflow-hidden">
                    <div className="bg-white px-3 sm:px-4 py-3 flex flex-col gap-0.5">
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                        <MapPin className="h-4 w-4 text-primary shrink-0" />
                        {job.location}
                      </span>
                      <span className="text-[11px] text-slate-400 uppercase tracking-wide">Ort</span>
                    </div>
                    <div className="bg-white px-3 sm:px-4 py-3 flex flex-col gap-0.5">
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                        <Wallet className="h-4 w-4 text-primary shrink-0" />
                        {job.salary || (() => {
                          const est = estimateSalary(job.title);
                          return est ? `~${formatSalaryRange(est)}` : "–";
                        })()}
                      </span>
                      <span className="text-[11px] text-slate-400 uppercase tracking-wide">Lohn, CHF/Jahr</span>
                    </div>
                    <div className="bg-white px-3 sm:px-4 py-3 flex flex-col gap-0.5">
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                        <Clock className="h-4 w-4 text-primary shrink-0" />
                        {job.workload}
                      </span>
                      <span className="text-[11px] text-slate-400 uppercase tracking-wide">Pensum</span>
                    </div>
                    <div className="bg-white px-3 sm:px-4 py-3 flex flex-col gap-0.5">
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                        <CalendarDays className="h-4 w-4 text-primary shrink-0" />
                        {job.type}
                      </span>
                      <span className="text-[11px] text-slate-400 uppercase tracking-wide">Anstellungsart</span>
                    </div>
                  </div>
                </div>

                <JobShareActions job={job} />
              </div>

              <div className="prose prose-slate max-w-none">
                <p className="text-base sm:text-lg text-slate-700 leading-relaxed mb-6 sm:mb-8">
                  {job.description}
                </p>

                {job.responsibilities.length > 0 && (
                  <>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">Deine Aufgaben</h2>
                    <ul className="space-y-2.5 sm:space-y-3 mb-8">
                      {job.responsibilities.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 sm:gap-3">
                          <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0 mt-0.5" />
                          <span className="text-slate-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {job.requirements.length > 0 && (
                  <>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">Dein Profil</h2>
                    <ul className="space-y-2.5 sm:space-y-3 mb-8">
                      {job.requirements.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 sm:gap-3">
                          <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0 mt-0.5" />
                          <span className="text-slate-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {job.benefits.length > 0 && (
                  <>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">Was wir bieten</h2>
                    <ul className="space-y-2.5 sm:space-y-3">
                      {job.benefits.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 sm:gap-3">
                          <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-accent shrink-0 mt-0.5" />
                          <span className="text-slate-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </article>

            {/* Similar jobs — streamed in via Suspense, does NOT block main content */}
            <Suspense fallback={<SimilarJobsSkeleton />}>
              <SimilarJobsSection job={job} query={query} location={location} />
            </Suspense>

            <RecentlyViewedJobs currentJob={job} currentHref={currentHref} />

            <nav aria-label="Beliebte Stellenangebote" className="bg-white border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3">Beliebte Suchseiten</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TOP_LANDING_PAGES.slice(0, 8).map((item) => (
                  <Link
                    key={`${item.role}-${item.canton}`}
                    href={getLandingPath(item)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:border-primary/40 hover:text-primary transition-colors"
                  >
                    {item.role} in {item.canton}
                  </Link>
                ))}
              </div>
            </nav>
          </div>

          <div className="hidden lg:block lg:w-80 shrink-0">
            <aside className="bg-white p-6 rounded-2xl border shadow-sm sticky top-24">
              <div className="mb-6">
                <h2 className="font-bold text-slate-900 mb-2">Interessiert an dieser Stelle?</h2>
                <p className="text-sm text-slate-500">
                  Jetzt in weniger als 2 Minuten bewerben. Kein Konto nötig.
                </p>
              </div>

              <JobPrimaryAction job={job} />

              <div className="mt-6 pt-6 border-t text-sm text-slate-500 space-y-3">
                {(() => {
                  const salaryDisplay = job.salary || (() => {
                    const est = estimateSalary(job.title);
                    return est ? `~${formatSalaryRange(est)}` : null;
                  })();
                  return salaryDisplay ? (
                    <div className="flex justify-between gap-3">
                      <span>Lohn/Jahr</span>
                      <span className="font-medium text-slate-900 text-right">{salaryDisplay}</span>
                    </div>
                  ) : null;
                })()}
                <div className="flex justify-between">
                  <span>Publiziert</span>
                  <span className="font-medium text-slate-900">
                    {new Date(job.datePosted).toLocaleDateString("de-CH")}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>Stellen-ID</span>
                  <span className="font-medium text-slate-900 break-all text-right">{getDisplayJobId(job)}</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 px-4 pt-3 pb-[max(0.875rem,env(safe-area-inset-bottom))] bg-white/95 backdrop-blur-sm border-t shadow-[0_-4px_12px_-2px_rgb(0,0,0,0.08)] z-20">
        <JobPrimaryAction job={job} />
      </div>
    </div>
  );
}

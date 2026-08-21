import { cache, Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/json-ld";
import { JobPostingJsonLd } from "@/components/job-posting-json-ld";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getJobListingById, getSimilarJobListings } from "@/lib/job-catalog";
import type { JobListing } from "@/lib/job-types";
import { JobPrimaryAction, JobShareActions, RecentlyViewedJobs } from "@/components/job-detail-client-tools";
import { TOP_LANDING_PAGES, getLandingPath } from "@/lib/landing-pages";
import { areApplicationsAvailable } from "@/lib/applications-config";
import { SiteBrand } from "@/components/site-brand";
import { formatSwissDate } from "@/lib/date-format";
import { buildJobPostingSchema } from "@/lib/job-schema";

interface JobDetailsPageProps {
  params: Promise<{ id: string }>;
}

function getDisplayJobId(job: JobListing): string {
  const hash = job.id.replace(/^scraped-(?:zimmermann-)?/, "");
  return "SAN-" + hash.slice(0, 8).toUpperCase();
}

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zimmermannjob.ch";

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

const getJobPageData = cache(async ({ params }: JobDetailsPageProps): Promise<JobListing | null> => {
  const { id } = await params;
  return getJobListingById({ id });
});

export async function generateMetadata(props: JobDetailsPageProps): Promise<Metadata> {
  const job = await getJobPageData(props);

  if (!job) {
    return {
      title: "Stelle nicht gefunden",
      description: "Die gewünschte Stelle konnte nicht gefunden werden.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description = job.description.slice(0, 155);

  const slugPath = `/jobs/${job.id}`;

  return {
    title: job.title,
    description,
    alternates: {
      canonical: slugPath,
    },
    openGraph: {
      title: `${job.title}`,
      description,
      type: "article",
      url: slugPath,
    },
    twitter: {
      card: "summary_large_image",
      title: `${job.title}`,
      description,
    },
  };
}

/** Async server component — streams in after main content */
async function SimilarJobsSection({ job }: { job: JobListing }) {
  const similarJobs = await getSimilarJobListings(job, 4);

  if (similarJobs.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Ähnliche Stellenangebote" className="trade-panel p-4 sm:p-6">
      <p className="eyebrow mb-2">Weitere Leitungen</p>
      <h2 className="text-lg sm:text-xl font-black text-foreground mb-4">Ähnliche Jobs</h2>
      <div className="space-y-2">
        {similarJobs.map((item) => (
          <Link
            key={item.id}
            href={`/jobs/${item.id}`}
            className="link-tile block px-3 py-2 pr-9 hover:border-primary/50 hover:text-primary transition-colors"
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
    <div className="trade-panel p-4 sm:p-6">
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
  const job = await getJobPageData(props);

  if (!job) {
    notFound();
  }

  const currentHref = `/jobs/${job.id}`;
  const applicationsAvailable = areApplicationsAvailable();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <JobPostingJsonLd
        data={buildJobPostingSchema(job, {
          siteName: "zimmermannjob.ch",
          siteUrl: SITE_URL,
          directApply: applicationsAvailable,
        })}
      />
      <JsonLd data={buildJobBreadcrumbSchema(job)} />
      <header className="trade-header border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 sm:px-6 h-16 sm:h-[4.5rem] flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center shrink-0">
            <SiteBrand />
          </Link>
          <nav className="shrink-0">
            <Button variant="ghost" size="sm" asChild className="text-sm px-2 sm:px-4 h-9 sm:h-10 btn-interactive">
              <Link href="/">Zurück</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main id="main-content" className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-6xl pb-32 lg:pb-12">
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
            <article className="detail-panel p-5 sm:p-7 md:p-9 border-t-4 border-t-primary">
              <div className="flex flex-col gap-4 mb-6">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {job.isRemote === true && (
                      <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700">
                        Remote
                      </Badge>
                    )}
                  </div>
                  <p className="eyebrow mb-3">Stellenprofil</p>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground mb-3 sm:mb-4 [overflow-wrap:anywhere]">
                    {job.title}
                  </h1>
                  <p className="mb-4 text-sm text-slate-600">
                    Arbeitgeberangaben werden auf der öffentlichen Stellenansicht nicht angezeigt.
                  </p>
                  {/* Structured info grid */}
                  <div className="job-facts">
                    <div className="job-fact">
                      <span className="job-fact__value">
                        <MapPin className="h-4 w-4 text-primary shrink-0" />
                        {job.location}
                      </span>
                      <span className="job-fact__label">Ort</span>
                    </div>
                    <div className="job-fact">
                      <span className="job-fact__value">
                        <Wallet className="h-4 w-4 text-primary shrink-0" />
                        {job.salary || (
                          <Link
                            href="/lohn-zimmermann-schweiz"
                            className="underline decoration-primary/40 underline-offset-2"
                            data-analytics-action="salary_orientation_from_job"
                          >
                            Lohnorientierung berechnen
                          </Link>
                        )}
                      </span>
                      <span className="job-fact__label">Lohnangabe</span>
                    </div>
                    <div className="job-fact">
                      <span className="job-fact__value">
                        <Clock className="h-4 w-4 text-primary shrink-0" />
                        {job.workload}
                      </span>
                      <span className="job-fact__label">Pensum</span>
                    </div>
                    <div className="job-fact">
                      <span className="job-fact__value">
                        <CalendarDays className="h-4 w-4 text-primary shrink-0" />
                        {job.type}
                      </span>
                      <span className="job-fact__label">Anstellungsart</span>
                    </div>
                  </div>

                  <JobShareActions jobId={job.id} jobTitle={job.title} />
                </div>
              </div>

              <p className="text-base sm:text-lg text-slate-700 leading-relaxed mb-6 sm:mb-8">
                {job.description}
              </p>

                {(job.responsibilities.length > 0 || job.requirements.length > 0) && (
                  <p className="mb-6 text-sm leading-relaxed text-slate-600">
                    Die folgenden Aufgaben und Anforderungen sind eine redaktionelle Orientierung
                    zum Berufsbild. Sie stammen nicht aus dem Originalinserat; massgebend sind die
                    Angaben der ausschreibenden Stelle.
                  </p>
                )}

                {job.responsibilities.length > 0 && (
                  <>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">Typische Aufgaben im Berufsbild</h2>
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
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">Typisches Berufsprofil</h2>
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
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">Weitere Hinweise</h2>
                    <ul className="space-y-2.5 sm:space-y-3">
                      {job.benefits.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 sm:gap-3">
                          <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0 mt-0.5" />
                          <span className="text-slate-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
            </article>

            {/* Similar jobs — streamed in via Suspense, does NOT block main content */}
            <Suspense fallback={<SimilarJobsSkeleton />}>
              <SimilarJobsSection job={job} />
            </Suspense>

            <RecentlyViewedJobs
              jobId={job.id}
              jobTitle={job.title}
              location={job.location}
              currentHref={currentHref}
            />

            <nav aria-label="Beliebte Stellenangebote" className="trade-panel p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3">Beliebte Suchseiten</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TOP_LANDING_PAGES.slice(0, 8).map((item) => (
                  <Link
                    key={`${item.role}-${item.canton}`}
                    href={getLandingPath(item)}
                    className="link-tile flex items-center px-3 py-2 pr-9 text-sm text-foreground hover:border-primary/50 hover:text-primary transition-colors"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </nav>
          </div>

          <div className="hidden lg:block lg:w-80 shrink-0">
            <aside className="source-panel p-6 sticky top-24">
              <div className="mb-6">
                <h2 className="font-bold text-slate-900 mb-2">Interessiert an dieser Stelle?</h2>
                <p className="text-sm text-slate-500">
                  {applicationsAvailable
                    ? "Du kannst deine Angaben zur internen Prüfung übermitteln. Eine Weiterleitung an den Arbeitgeber erfolgt nicht automatisch."
                    : "Online-Bewerbungen werden über diese Website derzeit nicht entgegengenommen."}
                </p>
              </div>

              <JobPrimaryAction
                jobId={job.id}
                jobTitle={job.title}
                applicationsAvailable={applicationsAvailable}
              />

              <div className="mt-6 pt-6 border-t text-sm text-slate-500 space-y-3">
                {(() => {
                  return job.salary ? (
                    <div className="flex justify-between gap-3">
                      <span>Lohnangabe</span>
                      <span className="font-medium text-slate-900 text-right">{job.salary}</span>
                    </div>
                  ) : null;
                })()}
                <div className="flex justify-between">
                  <span>Publiziert</span>
                  <span className="font-medium text-slate-900">
                    {formatSwissDate(job.datePosted)}
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

      <div className="mobile-command-bar lg:hidden fixed bottom-0 left-0 right-0 px-4 pt-3 pb-[max(0.875rem,env(safe-area-inset-bottom))] border-t z-20">
        <JobPrimaryAction
          jobId={job.id}
          jobTitle={job.title}
          applicationsAvailable={applicationsAvailable}
        />
      </div>
    </div>
  );
}

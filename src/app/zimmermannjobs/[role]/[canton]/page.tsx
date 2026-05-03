import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, MapPin, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/json-ld";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import {
  findLandingPageBySlug,
  getLandingPath,
  getRelatedLandingPages,
  toCantonSlug,
  toRoleSlug,
  TOP_LANDING_PAGES,
  type LandingPageConfig,
} from "@/lib/landing-pages";
import { searchJobListings } from "@/lib/job-catalog";
import type { JobListing } from "@/lib/job-types";
import { estimateSalary, formatSalaryRange } from "@/lib/salary-estimates";
import { buildJobPostingSchema } from "@/lib/job-schema";
import { getEditorialContent } from "@/data/editorial/zimmermannjob";
import { EditorialIntro } from "@/app/_components/editorial-intro";

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zimmermannjob.ch";

interface LandingPageProps {
  params: Promise<{ role: string; canton: string }>;
}

function buildJobHref(job: JobListing, role: string, canton: string): string {
  if (job.source !== "generated") {
    return `/jobs/${job.id}`;
  }

  const query = job.searchContext?.query ?? role;
  const location = job.searchContext?.location ?? canton;
  const params = new URLSearchParams({ q: query, loc: location });
  return `/jobs/${job.id}?${params.toString()}`;
}

function buildBreadcrumbSchema(config: LandingPageConfig) {
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
        name: config.title,
        item: `${SITE_URL}${getLandingPath(config)}`,
      },
    ],
  };
}

function buildItemListSchema(jobs: JobListing[], config: LandingPageConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: config.title,
    description: config.description,
    numberOfItems: jobs.length,
    itemListElement: jobs.slice(0, 20).map((job, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/jobs/${job.id}`,
      name: job.title,
    })),
  };
}

function buildFaqSchema(config: LandingPageConfig) {
  if (!config.faqs || config.faqs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: config.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

async function resolveLandingConfig(params: LandingPageProps["params"]) {
  const { role, canton } = await params;
  return findLandingPageBySlug(role, canton);
}

export async function generateStaticParams() {
  return TOP_LANDING_PAGES.map((item) => {
    const path = getLandingPath(item).split("/");
    return {
      role: path[2],
      canton: path[3],
    };
  });
}

export async function generateMetadata({ params }: LandingPageProps): Promise<Metadata> {
  const config = await resolveLandingConfig(params);

  if (!config) {
    return {
      title: "Zimmermannjobs",
      description: "Aktuelle Zimmermannjobs in der Schweiz.",
    };
  }

  return {
    title: config.title,
    description: config.description,
    alternates: {
      canonical: getLandingPath(config),
      languages: {
        "de-CH": getLandingPath(config),
      },
    },
    openGraph: {
      title: `${config.title} | zimmermannjob.ch`,
      description: config.description,
      url: getLandingPath(config),
      type: "website",
      siteName: "zimmermannjob.ch",
      locale: "de_CH",
    },
  };
}

export default async function LandingRolePage({ params }: LandingPageProps) {
  const config = await resolveLandingConfig(params);

  if (!config) {
    notFound();
  }

  const result = await searchJobListings({
    q: config.role,
    loc: config.canton,
    limit: 24,
    offset: 0,
    sort: "newest",
  });

  const relatedPages = getRelatedLandingPages(config, 8);
  const faqSchema = buildFaqSchema(config);
  const editorial = getEditorialContent(
    toRoleSlug(config.role),
    toCantonSlug(config.canton)
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <JsonLd data={buildBreadcrumbSchema(config)} />
      <JsonLd data={buildItemListSchema(result.jobs, config)} />
      {faqSchema && <JsonLd data={faqSchema} />}
      {result.jobs.slice(0, 20).map((job) => (
        <JsonLd key={`jp-${job.source}-${job.id}`} data={buildJobPostingSchema(job)} />
      ))}

      {/* Header */}
      <header className="border-b header-blur sticky top-0 z-30">
        <div className="container mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/logo.svg"
              alt="zimmermannjob.ch — Zimmermannjobs in der Schweiz"
              width={142}
              height={29}
              className="h-7 sm:h-8 w-auto"
              priority
            />
          </Link>
          <nav className="shrink-0">
            <Button size="sm" asChild className="text-xs sm:text-sm px-2.5 sm:px-4 h-8 sm:h-10 btn-interactive shadow-md shadow-primary/20">
              <Link href="/">Alle Jobs suchen</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-5xl">
        <Breadcrumbs
          items={[
            { label: "Startseite", href: "/" },
            { label: "Zimmermannjobs", href: "/" },
            { label: config.title },
          ]}
          className="mb-4"
        />

        {/* Hero section with intro text */}
        <header className="mt-3 mb-8">
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {config.title}
          </h1>
          <p className="text-slate-600 mt-3 text-base sm:text-lg leading-relaxed">
            {config.intro}
          </p>
          <p className="text-slate-500 mt-2 text-sm">
            {result.total} {result.total === 1 ? "Stelle" : "Stellen"} gefunden
          </p>
          <Button asChild className="mt-4">
            <Link href={`/?q=${encodeURIComponent(config.role)}&loc=${encodeURIComponent(config.canton)}`}>
              Alle passenden Stellen suchen
            </Link>
          </Button>
        </header>

        {/* Job listings */}
        <section aria-label="Stellenangebote" className="space-y-3 sm:space-y-4">
          {result.jobs.map((job) => (
            <article key={`${job.source}-${job.id}`}>
              <Link href={buildJobHref(job, config.role, config.canton)} className="block group">
                <Card className="job-card hover:border-primary/50">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-primary line-clamp-1">
                        {job.title}
                      </h3>
                      <Badge
                        variant="outline"
                        className={
                          job.source === "scraped"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-slate-50 text-slate-600"
                        }
                      >
                        {job.source === "scraped" ? "Live" : "Demo"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-100 rounded-lg border border-slate-200 overflow-hidden">
                      <div className="bg-white px-2.5 py-2 flex flex-col gap-0.5">
                        <span className="flex items-center gap-1 text-sm font-semibold text-slate-900 truncate">
                          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                          {job.location}
                        </span>
                        <span className="text-[11px] text-slate-400 uppercase tracking-wide">Ort</span>
                      </div>
                      <div className="bg-white px-2.5 py-2 flex flex-col gap-0.5">
                        <span className="flex items-center gap-1 text-sm font-semibold text-slate-900 truncate">
                          <Wallet className="h-3.5 w-3.5 text-primary shrink-0" />
                          {job.salary ||
                            (() => {
                              const est = estimateSalary(job.title);
                              return est ? `~${formatSalaryRange(est)}` : "–";
                            })()}
                        </span>
                        <span className="text-[11px] text-slate-400 uppercase tracking-wide">
                          Lohn, CHF/Jahr
                        </span>
                      </div>
                      <div className="bg-white px-2.5 py-2 flex flex-col gap-0.5">
                        <span className="flex items-center gap-1 text-sm font-semibold text-slate-900 truncate">
                          <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                          {job.workload}
                        </span>
                        <span className="text-[11px] text-slate-400 uppercase tracking-wide">Pensum</span>
                      </div>
                      <div className="bg-white px-2.5 py-2 flex flex-col gap-0.5">
                        <span className="flex items-center gap-1 text-sm font-semibold text-slate-900 truncate">
                          <CalendarDays className="h-3.5 w-3.5 text-primary shrink-0" />
                          {job.type}
                        </span>
                        <span className="text-[11px] text-slate-400 uppercase tracking-wide">
                          Anstellungsart
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </article>
          ))}
        </section>

        {/* Role & canton detail — unique content per page to reduce duplicate ratio */}
        <section className="mt-12 space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
              Was macht ein {config.role}?
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {config.roleDescription}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Jahreslohn</p>
              <p className="text-sm font-semibold text-slate-900">{config.salaryRange}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Voraussetzungen</p>
              <p className="text-sm text-slate-700">{config.requirements.split(",")[0]}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Karriere</p>
              <p className="text-sm text-slate-700">{config.career.split(".")[0]}.</p>
            </div>
          </div>
          {!editorial && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
                Arbeitsmarkt in {config.canton}
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {config.cantonContext} Das durchschnittliche Jahresgehalt für {config.role} in der Schweiz liegt bei {config.salaryRange}. {config.career}
              </p>
            </div>
          )}
        </section>

        {editorial && (
          <EditorialIntro
            role={config.role}
            canton={config.canton}
            content={editorial}
          />
        )}

        {/* FAQ section */}
        {config.faqs && config.faqs.length > 0 && (
          <section className="mt-12" aria-label="Häufig gestellte Fragen">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
              Häufig gestellte Fragen — {config.role} in {config.canton}
            </h2>
            <div className="space-y-3">
              {config.faqs.map((faq, index) => (
                <details
                  key={index}
                  className="group rounded-lg border border-slate-200 bg-white overflow-hidden"
                  open={index === 0}
                >
                  <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors">
                    {faq.question}
                    <span
                      className="ml-2 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
                      aria-hidden="true"
                    >
                      ▾
                    </span>
                  </summary>
                  <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Related landing pages */}
        {relatedPages.length > 0 && (
          <nav aria-label="Verwandte Stellenangebote" className="mt-10">
            <h2 className="text-lg font-bold text-slate-900 mb-3">Verwandte Suchseiten</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {relatedPages.map((page) => (
                <Link
                  key={`${page.role}-${page.canton}`}
                  href={getLandingPath(page)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:border-primary/40 hover:text-primary transition-colors"
                >
                  {page.role} in {page.canton}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

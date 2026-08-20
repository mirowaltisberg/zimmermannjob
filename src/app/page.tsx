import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Search } from "lucide-react";
import {
  HomepageSearch,
  type HomepageInitialFilters,
} from "@/app/_components/homepage-search";
import { HomepageSeoContent } from "@/app/_components/homepage-seo-content";
import { SiteBrand } from "@/components/site-brand";
import { SiteFooter } from "@/components/site-footer";
import { searchJobListings } from "@/lib/job-catalog";
import { JsonLd } from "@/components/json-ld";

import type { JobSearchParams, JobSort, RemoteFilter } from "@/lib/job-types";

const homepageMetadata: Metadata = {
  title: "Zimmermann Jobs Schweiz | Stellenangebote",
  description:
    "Finde Stellenangebote für Zimmerleute, Holzbau, Elementbau, Montage, Konstruktion und Projektleitung Holzbau in der Schweiz.",
  alternates: { canonical: "/" },
};

type HomeSearchParams = Record<string, string | string[] | undefined>;

interface HomePageProps {
  searchParams: Promise<HomeSearchParams>;
}

function firstValue(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

function parseHomepageFilters(searchParams: HomeSearchParams): HomepageInitialFilters {
  const q = firstValue(searchParams.q).slice(0, 80);
  const loc = firstValue(searchParams.loc).slice(0, 80);
  const radiusParam = firstValue(searchParams.radiusKm);
  const radiusValues = new Set(["5", "10", "15", "25", "35", "50", "80", "120", "all"]);
  const regionRadius: Record<string, string> = {
    "grossraum zürich": "50",
    "grossraum zurich": "50",
    zentralschweiz: "50",
    nordwestschweiz: "50",
    ostschweiz: "80",
    mittelland: "50",
    "westschweiz / romandie": "80",
    westschweiz: "80",
    romandie: "80",
    tessin: "50",
    wallis: "50",
  };
  const radiusKm = radiusValues.has(radiusParam)
    ? radiusParam
    : (regionRadius[loc.toLocaleLowerCase("de-CH")] ?? "25");
  const remoteParam = firstValue(searchParams.remote);
  const remote: RemoteFilter = ["any", "true", "false"].includes(remoteParam)
    ? (remoteParam as RemoteFilter)
    : "any";
  const postedParam = firstValue(searchParams.postedWithinDays);
  const postedWithinDays = ["7", "14", "30", "all"].includes(postedParam)
    ? postedParam
    : "30";
  const sortParam = firstValue(searchParams.sort);
  const sort: JobSort = ["newest", "oldest", "relevance"].includes(sortParam)
    ? (sortParam as JobSort)
    : "newest";

  return {
    q,
    loc,
    radiusKm,
    type: firstValue(searchParams.type).slice(0, 80) || "all",
    workload: firstValue(searchParams.workload).slice(0, 40) || "all",
    remote,
    postedWithinDays,
    sort,
  };
}

export async function generateMetadata({ searchParams }: HomePageProps): Promise<Metadata> {
  const params = await searchParams;
  return Object.keys(params).length > 0
    ? { ...homepageMetadata, robots: { index: false, follow: true } }
    : homepageMetadata;
}

// SEO-DECISION: This page is a server component that:
// 1. Fetches initial jobs server-side so Google crawler sees real job titles in HTML
// 2. Passes SSR jobs to the client-side search interface for hydration
// 3. Renders a safe ItemList containing only controlled public titles and URLs
// 4. Server-rendered SEO content (intro, FAQ, salary table, links)

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zimmermannjob.ch";

const JOB_SUGGESTIONS = [
  "Zimmermann EFZ", "Zimmerin EFZ", "Holzbau-Fachperson", "Holzbauer Montage",
  "Konstrukteur Holzbau", "Holzbaupolier", "Projektleiter Holzbau",
];

const LOCATION_SUGGESTIONS = [
  "Zürich, ZH", "Bern, BE", "Basel, BS", "Luzern, LU", "St. Gallen, SG",
  "Winterthur, ZH", "Aarau, AG", "Biel, BE", "Thun, BE", "Chur, GR",
  "Schaffhausen, SH", "Solothurn, SO", "Zug, ZG", "Fribourg, FR",
  "Lausanne, VD", "Lugano, TI", "Grossraum Zürich", "Zentralschweiz",
  "Nordwestschweiz", "Ostschweiz", "Mittelland", "Westschweiz / Romandie",
  "Tessin", "Wallis", "Ganze Schweiz",
];

const EMPLOYER_MENU_ITEMS = [
  { label: "Arbeitgeber-Login", href: "/arbeitgeber/login" },
  { label: "Preise & Pakete", href: "/arbeitgeber/preise" },
  { label: "Kandidatenzugang", href: "/arbeitgeber/kandidaten" },
  { label: "Support kontaktieren", href: "/kontakt" },
];

const homepageBreadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Startseite",
      item: SITE_URL,
    },
  ],
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const rawSearchParams = await searchParams;
  const filters = parseHomepageFilters(rawSearchParams);
  const hasActiveSearch = Object.keys(rawSearchParams).length > 0;
  const jobSearchParams: JobSearchParams = {
    q: filters.q,
    loc: filters.loc,
    radiusKm: filters.radiusKm === "all" ? undefined : Number(filters.radiusKm),
    limit: 12,
    offset: 0,
    type: filters.type === "all" ? undefined : filters.type,
    workload: filters.workload === "all" ? undefined : filters.workload,
    remote: filters.remote,
    postedWithinDays:
      filters.postedWithinDays === "all" ? undefined : Number(filters.postedWithinDays),
    sort: filters.sort,
  };
  const initialData = await searchJobListings(jobSearchParams);
  const homepageJobListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: initialData.jobs.length,
    itemListElement: initialData.jobs.map((job, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Thing",
        name: job.title,
        url: `${SITE_URL}/jobs/${job.id}`,
      },
    })),
  };

  return (
    <>
      <JsonLd data={homepageBreadcrumbSchema} />
      {initialData.jobs.length > 0 && <JsonLd data={homepageJobListSchema} />}
      <div className="flex min-h-screen flex-col overflow-x-clip">
        <header className="trade-header sticky top-0 z-30 border-b">
          <div className="container mx-auto flex h-16 items-center justify-between gap-2 px-4 sm:h-[4.5rem] sm:px-6">
            <Link href="/" prefetch={false} className="flex shrink-0 items-center"><SiteBrand /></Link>
            <nav aria-label="Hauptnavigation" className="flex shrink-0 items-center gap-1 sm:gap-2">
              <details className="group relative hidden sm:block">
                <summary className="btn-interactive inline-flex h-11 cursor-pointer list-none items-center justify-center gap-1 rounded-md px-4 text-sm font-medium outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
                  Für Arbeitgeber <span aria-hidden="true" className="transition-transform group-open:rotate-180">⌄</span>
                </summary>
                <ul className="search-dropdown absolute right-0 top-[calc(100%+8px)] z-50 min-w-56 overflow-hidden border bg-white py-1 shadow-lg">
                  {EMPLOYER_MENU_ITEMS.map((item) => (
                    <li key={item.href}><Link href={item.href} className="search-dropdown-item block px-4 py-2.5 text-sm text-slate-700 outline-none focus:bg-primary/10 focus:text-slate-900">{item.label}</Link></li>
                  ))}
                </ul>
              </details>
              <Link href="/arbeitgeber/preise" prefetch={false} className="btn-interactive inline-flex h-11 items-center justify-center rounded-md border border-primary/35 bg-transparent px-2.5 text-xs font-medium outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:px-4 sm:text-sm">
                <span className="sm:hidden">Betriebe</span><span className="hidden sm:inline">Angebot für Betriebe</span>
              </Link>
            </nav>
          </div>
        </header>

        <main id="main-content" className="flex-1">
          <section className={`trade-hero relative z-20 overflow-visible ${hasActiveSearch ? "pb-5 pt-8 sm:pb-7 sm:pt-10 md:pt-12" : "pb-6 pt-10 sm:pb-9 sm:pt-14 md:pt-20"}`}>
            <div className="container mx-auto max-w-6xl px-4 sm:px-6">
              <div className="trade-hero-grid">
                <div>
                  <p className="trade-kicker">Zimmermann · ganze Schweiz</p>
                  <h1 className="trade-display"><span className="block">Zimmermann</span><span className="block">jobs.</span><em>Tragfähig ausgewählt.</em></h1>
                  <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-lg">
                    Stellen für Zimmerei, Holzbau, Elementbau, Abbund, Montage, AVOR und Projektleitung. Direkt nach Beruf, Ort und Pensum filtern.
                  </p>
                </div>
                <div className="timber-frame" aria-hidden="true"><span className="timber-frame__label">Rahmen 03 / Stellenraster CH</span></div>
              </div>

              <form action="/" method="get" className="relative z-30">
                <div className="search-bench min-w-0">
                  <div className="search-field relative flex-1">
                    <label htmlFor="homepage-query" className="search-field__label">Beruf oder Stichwort</label>
                    <Search className="search-field__icon pointer-events-none absolute bottom-3.5 left-3 z-10 h-5 w-5 text-primary" aria-hidden="true" />
                    <input id="homepage-query" name="q" type="search" list="homepage-job-suggestions" maxLength={80} defaultValue={filters.q} placeholder="Welchen Job suchst du?" className="search-field__input flex h-12 w-full border-0 bg-transparent pl-10 pr-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none" />
                    <datalist id="homepage-job-suggestions">{JOB_SUGGESTIONS.map((suggestion) => <option key={suggestion} value={suggestion} />)}</datalist>
                  </div>
                  <div className="search-field relative flex-1">
                    <label htmlFor="homepage-location" className="search-field__label">Arbeitsort</label>
                    <MapPin className="search-field__icon pointer-events-none absolute bottom-3.5 left-3 z-10 h-5 w-5 text-primary" aria-hidden="true" />
                    <input id="homepage-location" name="loc" type="search" list="homepage-location-suggestions" maxLength={80} defaultValue={filters.loc} placeholder="Wo? (Ort, Kanton oder PLZ)" className="search-field__input flex h-12 w-full border-0 bg-transparent pl-10 pr-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none" />
                    <datalist id="homepage-location-suggestions">{LOCATION_SUGGESTIONS.map((suggestion) => <option key={suggestion} value={suggestion} />)}</datalist>
                  </div>
                  <button type="submit" className="btn-interactive inline-flex h-12 w-full items-center justify-center bg-primary px-6 text-base font-bold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 md:w-auto sm:px-8">Jobs suchen</button>
                </div>
              </form>
            </div>
          </section>

          <HomepageSearch initialData={initialData} initialFilters={filters} />
        </main>
      </div>
      <HomepageSeoContent />
      <SiteFooter />
    </>
  );
}

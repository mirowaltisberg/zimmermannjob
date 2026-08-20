"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useHaptic } from "@/hooks/use-haptic";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpWideNarrow,
  CalendarDays,
  Clock,
  Loader2,
  MapPin,
  RefreshCw,
  SlidersHorizontal,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type {
  DirectHireOpportunity,
  JobFacets,
  JobListing,
  JobSort,
  RemoteFilter,
} from "@/lib/job-types";
import { FEATURE_FLAGS } from "@/lib/feature-flags";
import { trackEvent } from "@/lib/analytics";
import { TOP_LANDING_PAGES, getLandingPath } from "@/lib/landing-pages";
import { formatSwissDate, formatSwissDateTime } from "@/lib/date-format";

const PAGE_SIZE = 12;
const SCRAPE_STALE_HOURS = 72;
const DEFAULT_RADIUS_KM = "25";
const COUNTRY_WIDE_LOCATIONS = new Set([
  "schweiz",
  "ganze schweiz",
  "schweizweit",
  "switzerland",
  "whole switzerland",
  "ch",
]);
const RADIUS_OPTIONS = [
  { value: "5", label: "5 km" },
  { value: "10", label: "10 km" },
  { value: "15", label: "15 km" },
  { value: "25", label: "25 km" },
  { value: "35", label: "35 km" },
  { value: "50", label: "50 km" },
  { value: "80", label: "80 km" },
  { value: "120", label: "120 km" },
  { value: "all", label: "Beliebig" },
] as const;
const DEFAULT_FACETS: JobFacets = {
  types: [],
  workloads: [],
  remote: {
    true: 0,
    false: 0,
    unknown: 0,
  },
};

function NativeDialog({ open, onOpenChange, titleId, descriptionId, compact = false, children }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
  compact?: boolean;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return (
    <dialog ref={dialogRef} className={`trade-native-dialog ${compact ? "trade-native-dialog--compact" : ""}`} aria-labelledby={titleId} aria-describedby={descriptionId} onCancel={() => onOpenChange(false)} onClose={() => onOpenChange(false)}>
      <button type="button" className="absolute right-3 top-3 grid h-11 w-11 place-items-center text-2xl text-muted-foreground hover:text-foreground" aria-label="Schliessen" onClick={() => onOpenChange(false)}>×</button>
      {children}
    </dialog>
  );
}

interface JobsApiResponse {
  jobs: JobListing[];
  opportunities: DirectHireOpportunity[];
  total: number;
  offset: number;
  limit: number;
  facets: JobFacets;
  scrapedAt: string | null;
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function normalizeLocationFilter(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (COUNTRY_WIDE_LOCATIONS.has(normalize(trimmed))) {
    return "";
  }

  return trimmed;
}

function isScrapedStale(scrapedAt: string | null): boolean {
  if (!scrapedAt) {
    return true;
  }

  const parsed = Date.parse(scrapedAt);
  if (!Number.isFinite(parsed)) {
    return true;
  }

  return Date.now() - parsed > SCRAPE_STALE_HOURS * 60 * 60 * 1000;
}

interface InitialJobData {
  jobs: JobListing[];
  opportunities: DirectHireOpportunity[];
  total: number;
  offset: number;
  limit: number;
  facets: JobFacets;
  scrapedAt: string | null;
}

interface HomepageSearchProps {
  initialData?: InitialJobData;
  initialFilters?: HomepageInitialFilters;
}

export interface HomepageInitialFilters {
  q: string;
  loc: string;
  radiusKm: string;
  type: string;
  workload: string;
  remote: RemoteFilter;
  postedWithinDays: string;
  sort: JobSort;
}

const DEFAULT_INITIAL_FILTERS: HomepageInitialFilters = {
  q: "",
  loc: "",
  radiusKm: DEFAULT_RADIUS_KM,
  type: "all",
  workload: "all",
  remote: "any",
  postedWithinDays: "30",
  sort: "newest",
};

function hasActiveInitialFilters(filters: HomepageInitialFilters): boolean {
  return Boolean(
    filters.q ||
      normalizeLocationFilter(filters.loc) ||
      filters.radiusKm !== DEFAULT_RADIUS_KM ||
      filters.type !== "all" ||
      filters.workload !== "all" ||
      filters.remote !== "any" ||
      filters.postedWithinDays !== "30" ||
      filters.sort !== "newest",
  );
}

function DirectHireOpportunityCard({ opportunity }: { opportunity: DirectHireOpportunity }) {
  const headingId = `opportunity-${opportunity.id}`;
  return (
    <Card data-nosnippet className="job-card border-primary/35 bg-primary/[0.035] py-0 gap-0" role="group" aria-labelledby={headingId}>
      <CardContent className="p-5 pl-6 sm:p-6 sm:pl-7">
        <div className="mb-3 flex min-w-0 flex-wrap items-center gap-2">
          <h3 id={headingId} className="basis-full min-w-0 text-base font-bold text-slate-900 [overflow-wrap:anywhere] sm:text-xl">{opportunity.role}</h3>
          <Badge variant="outline" className="border-primary/40 bg-white text-primary">{opportunity.engagement}</Badge>
          <span className="text-xs font-semibold text-slate-600">Kein aktuelles Stelleninserat</span>
        </div>
        <div className="job-facts">
          <div className="job-fact">
            <span className="job-fact__value"><MapPin className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" /><span className="truncate">{opportunity.location}</span></span>
            <span className="job-fact__label">Suchregion</span>
          </div>
          <div className="job-fact sm:col-span-3">
            <span className="job-fact__value min-w-0"><span className="truncate">{opportunity.preferenceSummary.join(" · ")}</span></span>
            <span className="job-fact__label">Deine validierten Präferenzen</span>
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <p className="min-w-0 flex-1 text-sm leading-relaxed text-slate-600 [overflow-wrap:anywhere]">{opportunity.process}</p>
          <Link href={opportunity.contactHref} prefetch={false} className="job-card__action inline-flex min-h-11 shrink-0 items-center gap-1 self-start px-1 sm:self-auto">
            Interesse mitteilen <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function HomepageSearch({ initialData, initialFilters }: HomepageSearchProps) {
  const seededFilters = initialFilters ?? DEFAULT_INITIAL_FILTERS;
  const { trigger } = useHaptic();
  const activeQuery = seededFilters.q;
  const activeLocation = normalizeLocationFilter(seededFilters.loc);
  const hasSearched = hasActiveInitialFilters(seededFilters);

  const [jobs, setJobs] = useState<JobListing[]>(initialData?.jobs ?? []);
  const [opportunities, setOpportunities] = useState<DirectHireOpportunity[]>(initialData?.opportunities ?? []);
  const [totalJobs, setTotalJobs] = useState(initialData?.total ?? 0);
  const [facets, setFacets] = useState<JobFacets>(initialData?.facets ?? DEFAULT_FACETS);
  const [scrapedAt, setScrapedAt] = useState<string | null>(initialData?.scrapedAt ?? null);
  const [searchKey, setSearchKey] = useState(0);
  const [searchRevision, setSearchRevision] = useState(0);

  const [typeFilter, setTypeFilter] = useState(seededFilters.type);
  const [workloadFilter, setWorkloadFilter] = useState(seededFilters.workload);
  const [remoteFilter, setRemoteFilter] = useState<RemoteFilter>(seededFilters.remote);
  const [postedWithinDays, setPostedWithinDays] = useState(seededFilters.postedWithinDays);
  const [radiusKm, setRadiusKm] = useState(seededFilters.radiusKm);
  const [sortBy, setSortBy] = useState<JobSort>(seededFilters.sort);

  const [isLoading, setIsLoading] = useState(!initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false);

  const hasTrackedFilterChange = useRef(false);
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);
  const hasVisibleResultsRef = useRef(Boolean((initialData?.jobs.length ?? 0) + (initialData?.opportunities.length ?? 0)));
  const searchAbortRef = useRef<AbortController | null>(null);
  const searchRequestRef = useRef(0);
  const loadMoreInFlightRef = useRef(false);

  const runSearch = useCallback(
    async (append: boolean, offsetOverride = 0) => {
      if (append && loadMoreInFlightRef.current) {
        return;
      }

      const nextOffset = append ? offsetOverride : 0;
      const scopedLocation = normalizeLocationFilter(activeLocation);
      const requestId = searchRequestRef.current + 1;
      searchRequestRef.current = requestId;
      searchAbortRef.current?.abort();
      const controller = new AbortController();
      searchAbortRef.current = controller;

      setErrorMessage(null);
      if (append) {
        loadMoreInFlightRef.current = true;
        setIsLoadingMore(true);
      } else if (hasVisibleResultsRef.current) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const params = new URLSearchParams({
          q: activeQuery,
          loc: scopedLocation,
          limit: String(PAGE_SIZE),
          offset: String(nextOffset),
          sort: sortBy,
          remote: remoteFilter,
        });

        if (typeFilter !== "all") {
          params.set("type", typeFilter);
        }
        if (workloadFilter !== "all") {
          params.set("workload", workloadFilter);
        }
        if (postedWithinDays !== "all") {
          params.set("postedWithinDays", postedWithinDays);
        }
        if (scopedLocation && radiusKm !== "all") {
          params.set("radiusKm", radiusKm);
        }

        const response = await fetch("/api/jobs?" + params.toString(), {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Die Jobs konnten nicht geladen werden.");
        }

        const data = (await response.json()) as JobsApiResponse;
        if (requestId !== searchRequestRef.current) {
          return;
        }

        setJobs((previousJobs) => {
          if (!append) {
            return data.jobs;
          }

          const existingIds = new Set(previousJobs.map((job) => job.id));
          const nextJobs = [
            ...previousJobs,
            ...data.jobs.filter((job) => !existingIds.has(job.id)),
          ];
          return nextJobs;
        });
        if (!append) {
          setOpportunities(data.opportunities ?? []);
          hasVisibleResultsRef.current = data.jobs.length + (data.opportunities?.length ?? 0) > 0;
        }
        setTotalJobs(data.total);
        setFacets(data.facets ?? DEFAULT_FACETS);
        setScrapedAt(data.scrapedAt ?? null);

        if (!append) {
          setSearchKey((previous) => previous + 1);
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setErrorMessage(error instanceof Error ? error.message : "Unbekannter Fehler");
        }
      } finally {
        if (requestId === searchRequestRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
          setIsLoadingMore(false);
          loadMoreInFlightRef.current = false;
        }
      }
    },
    [
      activeLocation,
      activeQuery,
      postedWithinDays,
      radiusKm,
      remoteFilter,
      sortBy,
      typeFilter,
      workloadFilter,
    ]
  );

  const skipInitialSearch = useRef(Boolean(initialData));

  useEffect(() => {
    if (skipInitialSearch.current) {
      skipInitialSearch.current = false;
      return;
    }

    void runSearch(false);
  }, [runSearch, searchRevision]);

  useEffect(() => () => searchAbortRef.current?.abort(), []);

  useEffect(() => {
    if (!hasTrackedFilterChange.current) {
      hasTrackedFilterChange.current = true;
      return;
    }

    const scopedLocation = normalizeLocationFilter(activeLocation);
    trackEvent("filter_usage", {
      has_type_filter: typeFilter !== "all",
      has_workload_filter: workloadFilter !== "all",
      remote: remoteFilter,
      posted_within_days: postedWithinDays,
      radius_km: scopedLocation ? radiusKm : "all",
      sort: sortBy,
    });
  }, [activeLocation, postedWithinDays, radiusKm, remoteFilter, sortBy, typeFilter, workloadFilter]);

  const handleLoadMore = useCallback(() => {
    void runSearch(true, jobs.length);
  }, [runSearch, jobs.length]);

  const visibleJobs = jobs.length;
  const canLoadMore = visibleJobs < totalJobs;

  const salaryMap = useMemo(() => {
    const map = new Map<string, string | null>();
    for (const job of jobs) {
      map.set(job.id, job.salary || null);
    }
    return map;
  }, [jobs]);

  const staleData = isScrapedStale(scrapedAt);
  const normalizedActiveLocation = normalizeLocationFilter(activeLocation);
  const hasActiveLocation = Boolean(normalizedActiveLocation);
  const hasLocationInput = hasActiveLocation;

  useEffect(() => {
    if (!canLoadMore || isLoadingMore) return;
    const sentinel = loadMoreSentinelRef.current;
    if (!sentinel) return;

    const media = window.matchMedia("(max-width: 767px)");
    let observer: IntersectionObserver | null = null;
    const syncObserver = () => {
      observer?.disconnect();
      observer = null;
      if (!media.matches) return;
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            handleLoadMore();
          }
        },
        { rootMargin: "200px", threshold: 0 }
      );
      observer.observe(sentinel);
    };

    syncObserver();
    media.addEventListener("change", syncObserver);
    return () => {
      media.removeEventListener("change", syncObserver);
      observer?.disconnect();
    };
  }, [canLoadMore, isLoadingMore, handleLoadMore]);

  const resetFilters = () => {
    setTypeFilter("all");
    setWorkloadFilter("all");
    setRemoteFilter("any");
    setPostedWithinDays("30");
    setRadiusKm(DEFAULT_RADIUS_KM);
    setSortBy("newest");
    trackEvent("filter_reset");
  };

  const filterSelectClass =
    "trade-select h-11 w-full px-3 text-sm focus:outline-none";

  return (
    <>
        <section
          className={`results-workbench relative z-10 pb-24 sm:pb-16 ${hasSearched ? "pt-6 sm:pt-8" : "pt-8 sm:pt-12"
            }`}
        >
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
              <div>
                <p className="eyebrow mb-2">Stellenleitung</p>
                <h2 className="text-2xl sm:text-3xl font-black text-foreground">
                  {hasSearched ? "Passende Zimmermannstellen" : "Aktuelle Zimmermannstellen"}
                </h2>
                {hasActiveLocation && (
                  <p className="text-xs text-slate-500 mt-1">
                    Suchradius: {radiusKm === "all" ? "Beliebig" : `${radiusKm} km`}
                  </p>
                )}
                {scrapedAt && (
                  <p className="text-xs text-slate-500 mt-1">
                    Datenstand: {formatSwissDateTime(scrapedAt)}
                  </p>
                )}
              </div>
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground [overflow-wrap:anywhere]" role="status" aria-live="polite">
                  <span key={searchKey} className="count-animate">
                    {visibleJobs} von {totalJobs} konkreten Stellen
                  </span>{" "}
                  {opportunities.length > 0 && <span>· {opportunities.length} Direktanstellungsprofile</span>}
              </span>
            </div>

            <div className="filter-rack hidden md:grid grid-cols-2 lg:grid-cols-5 gap-2 mb-5">
              <div>
                <label htmlFor="filter-type" className="sr-only">Vertragsart</label>
                <select
                  id="filter-type"
                  className={filterSelectClass}
                  value={typeFilter}
                  onChange={(event) => { trigger("selection"); setTypeFilter(event.target.value); }}
                >
                  <option value="all">Vertragsart</option>
                  {facets.types.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.value} ({item.count})
                    </option>
                  ))}
                </select>
              </div>

              <select
                aria-label="Pensum"
                className={filterSelectClass}
                value={workloadFilter}
                onChange={(event) => { trigger("selection"); setWorkloadFilter(event.target.value); }}
              >
                <option value="all">Pensum</option>
                {facets.workloads.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.value} ({item.count})
                  </option>
                ))}
              </select>

              <select
                aria-label="Arbeitsmodell"
                className={filterSelectClass}
                value={remoteFilter}
                onChange={(event) => { trigger("selection"); setRemoteFilter(event.target.value as RemoteFilter); }}
              >
                <option value="any">Remote</option>
                <option value="true">Nur Remote</option>
                <option value="false">Nur vor Ort</option>
              </select>

              <select
                aria-label="Publikationszeitraum"
                className={filterSelectClass}
                value={postedWithinDays}
                onChange={(event) => { trigger("selection"); setPostedWithinDays(event.target.value); }}
              >
                <option value="7">Letzte 7 Tage</option>
                <option value="14">Letzte 14 Tage</option>
                <option value="30">Letzte 30 Tage</option>
                <option value="all">Alle Zeiträume</option>
              </select>

              <div>
                <label htmlFor="filter-sort" className="sr-only">Sortierung</label>
                <select
                  id="filter-sort"
                  className={filterSelectClass}
                  value={sortBy}
                  onChange={(event) => { trigger("selection"); setSortBy(event.target.value as JobSort); }}
                >
                  <option value="newest">Neueste zuerst</option>
                  <option value="relevance">Relevanz</option>
                  <option value="oldest">Älteste zuerst</option>
                </select>
              </div>
            </div>

            {!isLoading && staleData && (
              <div className="source-panel mb-4 px-4 py-3 text-sm text-foreground">
                <p className="font-semibold">Datenstand: {scrapedAt ? formatSwissDateTime(scrapedAt) : "unbekannt"}</p>
                <p className="mt-1">Die Daten sind älter als der vorgesehene Aktualisierungszeitraum. Bis zum nächsten Abruf bleiben die zuletzt geladenen Inserate sichtbar.</p>
              </div>
            )}

            {isRefreshing && (
              <div className="mb-3 flex items-center gap-2 text-sm text-slate-500" role="status" aria-live="polite">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Ergebnisse werden aktualisiert
              </div>
            )}

            {errorMessage && (
              <Card className="mb-4 border-red-200 py-0 gap-0">
                <CardContent className="p-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-red-700">Jobs konnten nicht geladen werden</p>
                    <p className="text-sm text-slate-600 mt-1">{errorMessage}</p>
                  </div>
                  <Button variant="outline" onClick={() => setSearchRevision((revision) => revision + 1)}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Erneut laden
                  </Button>
                </CardContent>
              </Card>
            )}

            {isLoading && !isLoadingMore && !errorMessage && (
              <div className="space-y-3 sm:space-y-4 results-enter">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="skeleton-card h-32 sm:h-36 border border-slate-100"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            )}

            {jobs.length + opportunities.length > 0 && (
              <>
                <div className="space-y-3 sm:space-y-4">
                  {jobs.map((job, index) => (
                      <Link
                        key={job.id}
                        href={`/jobs/${job.id}`}
                        className="block group"
                        onClick={() => {
                          trigger("light");
                          trackEvent("job_open", {
                            job_id: job.id,
                            position: index + 1,
                          });
                        }}
                      >
                        <Card className="job-card py-0 gap-0">
                          <CardContent className="p-5 pl-6 sm:p-6 sm:pl-7">
                            {/* Title row */}
                            <div className="flex min-w-0 flex-wrap items-center gap-2 mb-3">
                              <h3 className="basis-full min-w-0 text-base sm:text-xl font-bold text-slate-900 group-hover:text-primary transition-colors duration-200 [overflow-wrap:anywhere]">
                                {job.title}
                              </h3>
                              {job.isNew && (
                                <Badge className="bg-accent text-slate-900 hover:bg-accent/90">Neu</Badge>
                              )}
                              {job.isUrgent && (
                                <Badge variant="destructive">Dringend</Badge>
                              )}
                              {job.isRemote === true && (
                                <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700">
                                  Remote
                                </Badge>
                              )}
                            </div>

                            {/* Structured info grid */}
                            <div className="job-facts">
                                  <div className="job-fact">
                                    <span className="job-fact__value">
                                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                                      <span className="truncate">{job.location}</span>
                                    </span>
                                    <span className="job-fact__label">Ort</span>
                                  </div>
                                  <div className="job-fact">
                                    <span className="job-fact__value tabular-nums">
                                      <Wallet className="h-3.5 w-3.5 text-primary shrink-0" />
                                      <span className="truncate">{salaryMap.get(job.id) ?? "–"}</span>
                                    </span>
                                    <span className="job-fact__label">Lohnangabe</span>
                                  </div>
                                  <div className="job-fact">
                                    <span className="job-fact__value">
                                      <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                                      <span className="truncate">{job.workload}</span>
                                    </span>
                                    <span className="job-fact__label">Pensum</span>
                                  </div>
                                  <div className="job-fact">
                                    <span className="job-fact__value">
                                      <CalendarDays className="h-3.5 w-3.5 text-primary shrink-0" />
                                      <span className="truncate">{job.type}</span>
                                    </span>
                                    <span className="job-fact__label">Anstellungsart</span>
                                  </div>
                                </div>

                            {/* Description + actions */}
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                              <p className="text-slate-600 text-sm line-clamp-2 flex-1 min-w-0">{job.description}</p>
                              <div className="flex items-center gap-3 shrink-0">
                                <span className="job-card__action inline-flex items-center gap-1">
                                  Details ansehen <ArrowRight className="h-3.5 w-3.5" />
                                </span>
                                <span className="text-xs text-slate-600 flex items-center gap-1 whitespace-nowrap">
                                  <CalendarDays className="h-3 w-3" />
                                  {formatSwissDate(job.datePosted)}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                  ))}
                  {opportunities.map((opportunity) => (
                    <DirectHireOpportunityCard key={opportunity.id} opportunity={opportunity} />
                  ))}
                </div>

                {canLoadMore && (
                  <div className="mt-6 flex flex-col items-center gap-2 md:hidden">
                    <div
                      ref={loadMoreSentinelRef}
                      className="h-4 w-full"
                      aria-hidden="true"
                    />
                    {isLoadingMore && (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Lädt weitere Jobs...
                      </div>
                    )}
                  </div>
                )}

                {canLoadMore && (
                  <div className="mt-10 text-center hidden md:block">
                    <Button
                      onClick={handleLoadMore}
                      variant="outline"
                      size="lg"
                      className="btn-interactive"
                      disabled={isLoadingMore}
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Lädt...
                        </>
                      ) : (
                        "Weitere Jobs laden"
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}

            <div className="mt-10 sm:mt-12">
              <h3 className="text-lg font-bold text-slate-900 mb-3">Beliebte Suchseiten</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {TOP_LANDING_PAGES.slice(0, 12).map((item) => (
                  <Link
                    key={`${item.role}-${item.canton}`}
                    href={getLandingPath(item)}
                    className="link-tile flex items-center px-3 py-2 pr-9 text-sm text-foreground hover:border-primary/50 hover:text-primary transition-colors"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

      {FEATURE_FLAGS.mobileFilters && (
        <div className="mobile-command-bar md:hidden fixed bottom-0 left-0 right-0 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t z-20">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Button variant="outline" className="h-11 w-full" onClick={() => setIsFilterSheetOpen(true)}>
                <SlidersHorizontal className="h-4 w-4 mr-1" />
                Filter
              </Button>
              <NativeDialog open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen} titleId="mobile-filter-title" descriptionId="mobile-filter-description">
                <div className="pr-12">
                  <h2 id="mobile-filter-title" className="text-lg font-semibold">Filter</h2>
                  <p id="mobile-filter-description" className="mt-1 text-sm text-muted-foreground">
                    Grenze die aktuelle Trefferliste nach Umkreis, Vertragsart, Pensum,
                    Arbeitsmodell und Publikationszeitraum ein.
                  </p>
                </div>
                <div className="space-y-3">
                  {hasLocationInput && (
                    <select
                      aria-label="Umkreis"
                      className={filterSelectClass}
                      value={radiusKm}
                      onChange={(event) => { trigger("selection"); setRadiusKm(event.target.value); }}
                    >
                      {RADIUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.value === "all" ? "Umkreis: Beliebig" : `Umkreis: ${option.label}`}
                        </option>
                      ))}
                    </select>
                  )}
                  <select
                    aria-label="Vertragsart"
                    className={filterSelectClass}
                    value={typeFilter}
                    onChange={(event) => { trigger("selection"); setTypeFilter(event.target.value); }}
                  >
                    <option value="all">Vertragsart</option>
                    {facets.types.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.value} ({item.count})
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label="Pensum"
                    className={filterSelectClass}
                    value={workloadFilter}
                    onChange={(event) => { trigger("selection"); setWorkloadFilter(event.target.value); }}
                  >
                    <option value="all">Pensum</option>
                    {facets.workloads.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.value} ({item.count})
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label="Arbeitsmodell"
                    className={filterSelectClass}
                    value={remoteFilter}
                    onChange={(event) => { trigger("selection"); setRemoteFilter(event.target.value as RemoteFilter); }}
                  >
                    <option value="any">Remote</option>
                    <option value="true">Nur Remote</option>
                    <option value="false">Nur vor Ort</option>
                  </select>
                  <select
                    aria-label="Publikationszeitraum"
                    className={filterSelectClass}
                    value={postedWithinDays}
                    onChange={(event) => { trigger("selection"); setPostedWithinDays(event.target.value); }}
                  >
                    <option value="7">Letzte 7 Tage</option>
                    <option value="14">Letzte 14 Tage</option>
                    <option value="30">Letzte 30 Tage</option>
                    <option value="all">Alle Zeiträume</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Button variant="outline" onClick={resetFilters}>
                    Zurücksetzen
                  </Button>
                  <Button onClick={() => setIsFilterSheetOpen(false)}>Fertig</Button>
                </div>
              </NativeDialog>
            </div>

            <div>
              <Button variant="outline" className="h-11 w-full" onClick={() => setIsSortSheetOpen(true)}>
                <ArrowUpWideNarrow className="h-4 w-4 mr-1" />
                Sortieren
              </Button>
              <NativeDialog open={isSortSheetOpen} onOpenChange={setIsSortSheetOpen} titleId="mobile-sort-title" descriptionId="mobile-sort-description" compact>
                <div className="pr-12">
                  <h2 id="mobile-sort-title" className="text-lg font-semibold">Sortieren nach</h2>
                  <p id="mobile-sort-description" className="mt-1 text-sm text-muted-foreground">
                    Lege fest, in welcher Reihenfolge die aktuellen Treffer angezeigt werden.
                  </p>
                </div>
                <div className="space-y-2 mt-1">
                  {[
                    { value: "newest", label: "Neueste zuerst" },
                    { value: "relevance", label: "Relevanz" },
                    { value: "oldest", label: "Älteste zuerst" },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      className={`min-h-11 w-full text-left border px-3 py-2 text-sm transition-colors ${sortBy === item.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      onClick={() => {
                        trigger("selection");
                        setSortBy(item.value as JobSort);
                        setIsSortSheetOpen(false);
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </NativeDialog>
            </div>
          </div>
        </div>
      )}

    </>
  );
}

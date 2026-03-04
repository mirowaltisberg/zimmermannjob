import type { Job } from "@/lib/mock-data";

export type JobSource = "mock" | "generated" | "scraped";
export type JobSort = "newest" | "oldest" | "relevance";
export type RemoteFilter = "any" | "true" | "false";

export interface SearchContext {
  query: string;
  location: string;
}

export interface GeneratedJob extends Job {
  source: "generated";
  searchContext: SearchContext;
}

export interface JobListing extends Job {
  source: JobSource;
  salary?: string;
  jobUrl?: string;
  isRemote?: boolean;
  companyUrl?: string;
  scrapedSource?: string;
  relevanceScore?: number;
  searchContext?: SearchContext;
  fullDescription?: string;
}

export interface JobFacetCount {
  value: string;
  count: number;
}

export interface JobFacets {
  types: JobFacetCount[];
  workloads: JobFacetCount[];
  remote: {
    true: number;
    false: number;
    unknown: number;
  };
}

export interface JobSearchParams {
  q?: string;
  loc?: string;
  radiusKm?: number;
  limit?: number;
  offset?: number;
  type?: string;
  workload?: string;
  remote?: RemoteFilter;
  postedWithinDays?: number;
  sort?: JobSort;
}

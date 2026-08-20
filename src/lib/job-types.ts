export type JobSort = "newest" | "oldest" | "relevance";
export type RemoteFilter = "any" | "true" | "false";

/**
 * Public job shape. Employer identities, source URLs, raw descriptions, and
 * contact details must never cross this boundary.
 */
export interface JobListing {
  id: string;
  title: string;
  location: string;
  type: string;
  workload: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  datePosted: string;
  isNew: boolean;
  isUrgent: boolean;
  salary?: string;
  isRemote?: boolean;
  relevanceScore?: number;
}

/**
 * Evergreen direct-hire profile. This is deliberately not a JobListing: it has
 * no employer, vacancy, source, salary, application, or job-detail fields.
 */
export interface DirectHireOpportunity {
  kind: "direct-hire-opportunity";
  id: string;
  role: string;
  location: string;
  engagement: "Direktanstellung";
  preferenceSummary: string[];
  process: string;
  contactHref: string;
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

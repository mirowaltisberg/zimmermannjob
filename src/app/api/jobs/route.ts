import { NextResponse } from "next/server";
import { searchJobListings } from "@/lib/job-catalog";
import type { JobSearchParams, JobSort, RemoteFilter } from "@/lib/job-types";
import { assertNoForbiddenPublicFields, serializePublicJob } from "@/lib/public-job-boundary";
import { assertDirectHireOpportunity } from "@/lib/direct-hire-opportunities";

function parseRemote(value: string | null): RemoteFilter {
  if (value === "true" || value === "false" || value === "any") {
    return value;
  }
  return "any";
}

function parseSort(value: string | null): JobSort {
  if (value === "newest" || value === "oldest" || value === "relevance") {
    return value;
  }
  return "newest";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const params: JobSearchParams = {
    q: (searchParams.get("q") ?? "").slice(0, 80),
    loc: (searchParams.get("loc") ?? "").slice(0, 80),
    radiusKm: Number(searchParams.get("radiusKm") ?? ""),
    limit: Number(searchParams.get("limit") ?? "30"),
    offset: Number(searchParams.get("offset") ?? "0"),
    type: (searchParams.get("type") ?? "").slice(0, 80),
    workload: (searchParams.get("workload") ?? "").slice(0, 40),
    remote: parseRemote(searchParams.get("remote")),
    postedWithinDays: Number(searchParams.get("postedWithinDays") ?? ""),
    sort: parseSort(searchParams.get("sort")),
  };

  const result = await searchJobListings(params);
  result.opportunities.forEach(assertDirectHireOpportunity);
  const payload = { ...result, jobs: result.jobs.map(serializePublicJob) };
  assertNoForbiddenPublicFields(payload, "GET /api/jobs response");
  return NextResponse.json(
    payload,
    { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=3600" } },
  );
}

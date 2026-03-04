import { NextResponse } from "next/server";
import { searchJobListings } from "@/lib/job-catalog";
import type { JobSearchParams, JobSort, RemoteFilter } from "@/lib/job-types";

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
    q: searchParams.get("q") ?? "",
    loc: searchParams.get("loc") ?? "",
    radiusKm: Number(searchParams.get("radiusKm") ?? ""),
    limit: Number(searchParams.get("limit") ?? "30"),
    offset: Number(searchParams.get("offset") ?? "0"),
    type: searchParams.get("type") ?? "",
    workload: searchParams.get("workload") ?? "",
    remote: parseRemote(searchParams.get("remote")),
    postedWithinDays: Number(searchParams.get("postedWithinDays") ?? ""),
    sort: parseSort(searchParams.get("sort")),
  };

  const result = await searchJobListings(params);
  return NextResponse.json(result, {
    headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=3600" },
  });
}

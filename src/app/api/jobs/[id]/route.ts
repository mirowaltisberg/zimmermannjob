import { NextResponse } from "next/server";
import { getJobListingById, getSimilarJobListings } from "@/lib/job-catalog";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const { searchParams } = new URL(request.url);

  const job = await getJobListingById({
    id,
    query: searchParams.get("q") ?? "",
    location: searchParams.get("loc") ?? "",
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const similarJobs = await getSimilarJobListings(job, 4);
  return NextResponse.json(
    { job, similarJobs },
    { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=3600" } },
  );
}

import { NextResponse } from "next/server";
import { getJobListingById, getSimilarJobListings } from "@/lib/job-catalog";
import { assertNoForbiddenPublicFields, serializePublicJob } from "@/lib/public-job-boundary";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const job = await getJobListingById({ id });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const similarJobs = await getSimilarJobListings(job, 4);
  const payload = {
    job: serializePublicJob(job),
    similarJobs: similarJobs.map(serializePublicJob),
  };
  assertNoForbiddenPublicFields(payload, "GET /api/jobs/[id] response");
  return NextResponse.json(
    payload,
    { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=3600" } },
  );
}

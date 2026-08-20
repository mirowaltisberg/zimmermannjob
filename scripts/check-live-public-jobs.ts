import { createClient } from "@supabase/supabase-js";
import { buildPublicJobCopy } from "../src/lib/job-public";
import { classifyZimmermannTitle, validateRawJobIdentity } from "../src/lib/job-safety";
import { getPublicJobDateBounds, validatePublicJobDate } from "../src/lib/job-freshness";
import { assertNoForbiddenPublicFields, serializePublicJob } from "../src/lib/public-job-boundary";

interface RawRow {
  id: string;
  trade: string;
  title: string;
  company: string;
  location: string;
  type: string | null;
  workload: string | null;
  date_posted: string | null;
  job_url: string;
  source: string;
}

const TRADE = "zimmermann";
const PAGE_SIZE = 1000;
const FAKE_MARKERS = /\b(?:demo|tinder|generated|mock)\b/iu;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsEmployer(value: string, employer: string): boolean {
  if (!employer.trim()) return false;
  return new RegExp(
    `(?:^|[^\\p{L}\\p{N}])${escapeRegExp(employer.trim())}(?:$|[^\\p{L}\\p{N}])`,
    "iu",
  ).test(value);
}

async function readRows(): Promise<RawRow[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Required server-only Supabase environment is missing");

  const client = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { minDate } = getPublicJobDateBounds();
  const rows: RawRow[] = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await client
      .from("jobs")
      .select("id,trade,title,company,location,type,workload,date_posted,job_url,source")
      .eq("trade", TRADE)
      .gte("date_posted", minDate)
      .order("id")
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error("Private source read failed");
    const page = (data ?? []) as RawRow[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  if (rows.length === 0) throw new Error("No fresh private source records found");
  return rows;
}

async function main(): Promise<void> {
  const rows = await readRows();
  const seen = new Set<string>();
  const failures = new Map<string, number>();
  const recordFailure = (reason: string) => {
    failures.set(reason, (failures.get(reason) ?? 0) + 1);
  };

  rows.forEach((row) => {
    const dateError = validatePublicJobDate(row.date_posted);
    if (dateError) {
      recordFailure(dateError);
      return;
    }

    const identityError = validateRawJobIdentity({
      trade: row.trade,
      id: row.id,
      jobUrl: row.job_url,
      source: row.source,
    });
    if (identityError) {
      recordFailure(identityError);
      return;
    }
    if (seen.has(row.id)) {
      recordFailure("duplicate-id");
      return;
    }
    seen.add(row.id);

    const classification = classifyZimmermannTitle(row.title);
    if (classification.disposition !== "ACCEPT") {
      recordFailure(`classifier-${classification.disposition.toLowerCase()}`);
      return;
    }

    try {
      const publicCopy = buildPublicJobCopy({
        title: row.title,
        company: row.company,
        location: row.location,
        type: row.type ?? "",
        workload: row.workload ?? "",
      });
      const publicJob = serializePublicJob({
        id: row.id,
        ...publicCopy,
        datePosted: row.date_posted ?? "",
        isNew: false,
        isUrgent: false,
      });
      assertNoForbiddenPublicFields(publicJob, `live job ${row.id}`);
      const serialized = JSON.stringify(publicJob);
      if (containsEmployer(serialized, row.company)) recordFailure("employer-name-leak");
      if (FAKE_MARKERS.test(`${row.id}\n${serialized}`)) recordFailure("fake-marker");
    } catch {
      recordFailure("public-boundary-rejected");
    }
  });

  if (failures.size > 0) {
    const summary = [...failures.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([reason, count]) => `${reason}=${count}`)
      .join(", ");
    throw new Error(`Live public-job invariant failed for ${rows.length} fresh records: ${summary}`);
  }

  console.log(`Live public-job invariant passed for ${rows.length} fresh ${TRADE} source records.`);
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Live public-job invariant failed");
  process.exitCode = 1;
});

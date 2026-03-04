import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://mwnhzniryagcchotspwm.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error("SUPABASE_SERVICE_ROLE_KEY is required. Set it in .env.local or as an env var.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

interface ScrapedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  workload: string;
  description: string;
  fullDescription: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  datePosted: string;
  isNew: boolean;
  isUrgent: boolean;
  salary: string;
  jobUrl: string;
  source: string;
  isRemote: boolean;
  companyUrl: string;
}

interface ScrapedData {
  scrapedAt: string;
  totalJobs: number;
  jobs: ScrapedJob[];
}

function toDbRow(job: ScrapedJob) {
  return {
    id: job.id,
    title: job.title || "",
    company: job.company || "",
    location: job.location || "",
    type: job.type || "Vollzeit",
    workload: job.workload || "100%",
    description: job.description || "",
    full_description: job.fullDescription || "",
    responsibilities: job.responsibilities ?? [],
    requirements: job.requirements ?? [],
    benefits: job.benefits ?? [],
    date_posted: job.datePosted || null,
    is_new: Boolean(job.isNew),
    is_urgent: Boolean(job.isUrgent),
    salary: job.salary || "",
    job_url: job.jobUrl || "",
    source: job.source || "linkedin",
    is_remote: Boolean(job.isRemote),
    company_url: job.companyUrl || "",
  };
}

async function main() {
  const filePath = path.join(process.cwd(), "src", "data", "scraped-jobs.json");
  console.log(`Reading ${filePath}...`);

  const raw = fs.readFileSync(filePath, "utf-8");
  const data: ScrapedData = JSON.parse(raw);
  console.log(`Found ${data.jobs.length} jobs (scraped at ${data.scrapedAt})`);

  const BATCH_SIZE = 500;
  let inserted = 0;

  for (let i = 0; i < data.jobs.length; i += BATCH_SIZE) {
    const batch = data.jobs.slice(i, i + BATCH_SIZE).map(toDbRow);
    const { error } = await supabase.from("jobs").upsert(batch, { onConflict: "id" });

    if (error) {
      console.error(`Error inserting batch starting at index ${i}:`, error.message);
      process.exit(1);
    }

    inserted += batch.length;
    console.log(`  Inserted ${inserted} / ${data.jobs.length}`);
  }

  // Update scrape metadata
  const { error: metaError } = await supabase
    .from("scrape_metadata")
    .update({ scraped_at: data.scrapedAt, total_jobs: data.totalJobs })
    .eq("id", 1);

  if (metaError) {
    console.error("Error updating scrape_metadata:", metaError.message);
    process.exit(1);
  }

  console.log(`\nDone! Seeded ${inserted} jobs into Supabase.`);
}

main();

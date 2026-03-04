import { HomepageSearch } from "@/app/_components/homepage-search";
import { HomepageSeoContent } from "@/app/_components/homepage-seo-content";
import { SiteFooter } from "@/components/site-footer";
import { searchJobListings } from "@/lib/job-catalog";
import { JsonLd } from "@/components/json-ld";
import { buildJobPostingSchema } from "@/lib/job-schema";

// SEO-DECISION: This page is a server component that:
// 1. Fetches initial jobs server-side so Google crawler sees real job titles in HTML
// 2. Passes SSR jobs to the client-side search interface for hydration
// 3. Renders FAQPage schema + JobPosting schema for Rich Results
// 4. Server-rendered SEO content (intro, FAQ, salary table, links)

export const revalidate = 3600;

export default async function HomePage() {
  const initialData = await searchJobListings({
    q: "",
    loc: "",
    limit: 12,
    offset: 0,
    sort: "newest",
  });

  return (
    <>
      {initialData.jobs.map((job) => (
        <JsonLd key={`schema-${job.source}-${job.id}`} data={buildJobPostingSchema(job)} />
      ))}
      <HomepageSearch initialData={initialData} />
      <HomepageSeoContent />
      <SiteFooter />
    </>
  );
}

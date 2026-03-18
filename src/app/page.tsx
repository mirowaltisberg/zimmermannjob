import type { Metadata } from "next";
import { HomepageSearch } from "@/app/_components/homepage-search";
import { HomepageSeoContent } from "@/app/_components/homepage-seo-content";
import { SiteFooter } from "@/components/site-footer";
import { searchJobListings } from "@/lib/job-catalog";
import { JsonLd } from "@/components/json-ld";
import { buildJobPostingSchema } from "@/lib/job-schema";

export const metadata: Metadata = {
  title: "Zimmermann Jobs Schweiz 2026 | Offene Stellen finden",
  description:
    "Finde aktuelle Zimmermann Jobs in der Schweiz. Stellen für Zimmermann EFZ, Holzbau-Vorarbeiter, Holzbau-Polier, Holzbautechniker & mehr. Jetzt Lebenslauf einreichen.",
  alternates: { canonical: "/" },
};

// SEO-DECISION: This page is a server component that:
// 1. Fetches initial jobs server-side so Google crawler sees real job titles in HTML
// 2. Passes SSR jobs to the client-side search interface for hydration
// 3. Renders FAQPage schema + JobPosting schema for Rich Results
// 4. Server-rendered SEO content (intro, FAQ, salary table, links)

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.zimmermannjob.ch";

const homepageBreadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Startseite",
      item: SITE_URL,
    },
  ],
};

export default async function HomePage() {
  const initialData = await searchJobListings({
    q: "",
    loc: "",
    limit: 12,
    offset: 0,
    sort: "relevance",
  });

  // Strip heavy arrays not needed by the client-side search component
  const liteData = {
    ...initialData,
    jobs: initialData.jobs.map(({ responsibilities, requirements, benefits, fullDescription, ...rest }) => ({
      ...rest,
      responsibilities: [] as string[],
      requirements: [] as string[],
      benefits: [] as string[],
    })),
  };

  return (
    <>
      <JsonLd data={homepageBreadcrumbSchema} />
      {initialData.jobs.map((job) => (
        <JsonLd key={`schema-${job.source}-${job.id}`} data={buildJobPostingSchema(job)} />
      ))}
      <HomepageSearch initialData={liteData} />
      <HomepageSeoContent />
      <SiteFooter />
    </>
  );
}

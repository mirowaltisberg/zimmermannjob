import type { MetadataRoute } from "next";
import { getIndexableJobListings } from "@/lib/job-catalog";
import { getLandingPath, TOP_LANDING_PAGES } from "@/lib/landing-pages";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zimmermannjob.ch";

function toAbsolute(path: string): string {
  return `${SITE_URL}${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const jobs = await getIndexableJobListings(400);
  const now = new Date();
  const landingPageDate = new Date("2025-06-01");

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: toAbsolute("/"),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1,
    },
    ...TOP_LANDING_PAGES.map((page) => ({
      url: toAbsolute(getLandingPath(page)),
      lastModified: landingPageDate,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];

  const jobRoutes: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: toAbsolute(`/jobs/${job.id}`),
    lastModified: job.datePosted ? new Date(job.datePosted) : now,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [...staticRoutes, ...jobRoutes];
}

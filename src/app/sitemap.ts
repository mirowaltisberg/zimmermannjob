import type { MetadataRoute } from "next";
import { getIndexableJobListings } from "@/lib/job-catalog";
import { validatePublicJobDate } from "@/lib/job-freshness";

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zimmermannjob.ch";

function toAbsolute(path: string): string {
  return `${SITE_URL}${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const jobs = await getIndexableJobListings(400);
  const now = new Date();
  const minDescriptionLength = 160;
  const validJobs = jobs.filter((job) => {
    if (!job.id || !job.title) return false;
    const descriptionLength = job.description?.length || 0;
    return descriptionLength >= minDescriptionLength && validatePublicJobDate(job.datePosted) === null;
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date("2026-08-20"),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: toAbsolute("/kontakt"),
      lastModified: new Date("2026-08-20"),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: toAbsolute("/team"),
      lastModified: new Date("2026-08-20"),
      changeFrequency: "monthly",
      priority: 0.55,
    },
    {
      url: toAbsolute("/lohn-zimmermann-schweiz"),
      lastModified: new Date("2026-08-20"),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    },
    {
      url: toAbsolute("/zimmermann-ausbildung"),
      lastModified: new Date("2026-08-20"),
      changeFrequency: "monthly" as const,
      priority: 0.75,
    },
    {
      url: toAbsolute("/zimmermann-in-der-naehe"),
      lastModified: new Date("2026-08-20"),
      changeFrequency: "weekly" as const,
      priority: 0.75,
    },
  ];

  const jobRoutes: MetadataRoute.Sitemap = validJobs.map((job) => ({
    url: toAbsolute(`/jobs/${job.id}`),
    lastModified: job.datePosted ? new Date(`${job.datePosted}T00:00:00.000Z`) : now,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [...staticRoutes, ...jobRoutes];
}

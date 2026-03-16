import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zimmermannjob.ch";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/api/",
          "/arbeitgeber/login",
          "/arbeitgeber/kandidaten",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

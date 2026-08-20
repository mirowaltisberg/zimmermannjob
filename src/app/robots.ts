import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zimmermannjob.ch";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/api/", "/arbeitgeber/login", "/arbeitgeber/kandidaten"],
      },
      {
        userAgent: "GPTBot",
        allow: ["/"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: ["/"],
      },
      {
        userAgent: "ClaudeBot",
        allow: ["/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: ["/"],
      },
      {
        userAgent: "Google-Extended",
        allow: ["/"],
      },
      {
        userAgent: "Bingbot",
        allow: ["/"],
      },
      {
        userAgent: "OAI-SearchBot",
        allow: ["/"],
      },
      {
        userAgent: "Applebot-Extended",
        allow: ["/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

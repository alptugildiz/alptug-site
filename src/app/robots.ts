import type { MetadataRoute } from "next";
import { profile } from "@/content/resume";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/giderler"] },
    sitemap: `${profile.site}/sitemap.xml`,
  };
}

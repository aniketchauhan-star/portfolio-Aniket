import type { MetadataRoute } from "next";
import { profile } from "@/data/profile";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = profile.seo.siteUrl;
  // Sitemap entries must be absolute URLs, so with no origin set the only
  // honest sitemap is an empty one. Set `seo.siteUrl` and the entry returns.
  if (!siteUrl) return [];
  return [
    {
      url: siteUrl,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}

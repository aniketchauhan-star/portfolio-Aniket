import type { MetadataRoute } from "next";
import { profile } from "@/data/profile";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = profile.seo.siteUrl;
  return {
    rules: { userAgent: "*", allow: "/" },
    // A `Sitemap:` line has to be an absolute URL. Until `seo.siteUrl` is set
    // there is no origin to build one from, so the directive is left out
    // rather than pointing crawlers at a domain that is not ours.
    ...(siteUrl ? { sitemap: `${siteUrl}/sitemap.xml` } : {}),
  };
}

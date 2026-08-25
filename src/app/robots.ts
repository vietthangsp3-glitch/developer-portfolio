import type { MetadataRoute } from "next";

import { isProductionIndexingEnabled } from "@/config/seo";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  if (!isProductionIndexingEnabled()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}

import type { MetadataRoute } from "next";

import { isProductionIndexingEnabled } from "@/config/seo";
import { siteConfig } from "@/config/site";
import { getPublishedProjects } from "@/server/dal/projects";

const staticRoutes = ["", "/work", "/about", "/services", "/contact"];

function absoluteUrl(value: string) {
  return new URL(value, siteConfig.url).toString();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${siteConfig.url}${path}`,
    changeFrequency: path === "" || path === "/work" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/work" ? 0.9 : 0.7,
  }));

  try {
    const projects = await getPublishedProjects();
    return [
      ...staticEntries,
      ...projects.map((project) => ({
        url: `${siteConfig.url}/work/${project.slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.8,
        images: project.thumbnail
          ? [absoluteUrl(project.thumbnail.url)]
          : undefined,
      })),
    ];
  } catch (error) {
    if (isProductionIndexingEnabled()) throw error;

    console.error("Sitemap project read failed", {
      errorType: error instanceof Error ? error.name : "UnknownError",
    });
    return staticEntries;
  }
}

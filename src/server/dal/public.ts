import "server-only";

import { unstable_cache } from "next/cache";

import type { Project } from "@/features/projects/types";
import {
  getPublishedServices,
  getPublishedTestimonials,
  getPublicSiteSettings,
} from "@/server/dal/content";
import type {
  PublicProjectDetailDto,
  PublicProjectSummaryDto,
} from "@/server/dal/dto";
import {
  getProjectBySlug,
  getPublishedProjects,
  getSelectedProjects,
} from "@/server/dal/projects";
import { resolvePublicSiteSettings } from "@/server/dal/mappers";

const placeholder = {
  src: "/images/media-placeholder.svg",
  alt: "",
  width: 1536,
  height: 1024,
};

export function projectSummaryToView(
  project: PublicProjectSummaryDto,
): Project {
  return {
    slug: project.slug,
    title: project.title,
    sector: project.category,
    year: String(project.year),
    services: project.role
      .split(" / ")
      .map((item) => item.trim())
      .filter(Boolean),
    technologies: project.technologies,
    summary: project.summary,
    outcome: project.summary,
    image: project.thumbnail
      ? {
          src: project.thumbnail.url,
          alt: project.thumbnail.altText,
          width: project.thumbnail.width,
          height: project.thumbnail.height,
        }
      : placeholder,
    featured: project.featured,
    blocks: [],
  };
}

export function projectDetailToView(project: PublicProjectDetailDto): Project {
  return {
    ...projectSummaryToView(project),
    outcome: project.description ?? project.summary,
    image: project.heroMedia
      ? {
          src: project.heroMedia.url,
          alt: project.heroMedia.altText,
          width: project.heroMedia.width,
          height: project.heroMedia.height,
        }
      : projectSummaryToView(project).image,
    blocks: project.caseStudyContent.blocks,
  };
}

export const getCachedPublishedProjects = unstable_cache(
  getPublishedProjects,
  ["public-projects"],
  { revalidate: 3600, tags: ["projects"] },
);
export const getCachedSelectedProjects = unstable_cache(
  () => getSelectedProjects(4),
  ["public-selected-projects"],
  { revalidate: 3600, tags: ["projects"] },
);
export const getCachedProjectBySlug = (slug: string) =>
  unstable_cache(() => getProjectBySlug(slug), ["public-project", slug], {
    revalidate: 3600,
    tags: ["projects", `project:${slug}`],
  })();
export const getCachedPublishedServices = unstable_cache(
  getPublishedServices,
  ["public-services"],
  { revalidate: 3600, tags: ["services"] },
);
export const getCachedPublishedTestimonials = unstable_cache(
  getPublishedTestimonials,
  ["public-testimonials"],
  { revalidate: 3600, tags: ["testimonials"] },
);
export const getCachedPublicSiteSettings = unstable_cache(
  getPublicSiteSettings,
  ["public-settings"],
  { revalidate: 3600, tags: ["settings"] },
);

export async function getResolvedPublicSiteSettings() {
  return resolvePublicSiteSettings(await getCachedPublicSiteSettings());
}

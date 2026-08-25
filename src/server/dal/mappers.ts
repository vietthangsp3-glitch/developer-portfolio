import { caseStudyContentSchema } from "@/features/projects/schemas/project";
import { socialLinkSchema } from "@/features/site-settings/schemas/site-settings";
import {
  optionalSafeHttpUrlSchema,
  safeMediaUrlSchema,
} from "@/lib/validation";
import type {
  PublicMediaDto,
  PublicProjectDetailDto,
  PublicProjectSummaryDto,
  PublicSiteSettingsDto,
} from "@/server/dal/dto";

type MediaFields = {
  url: string;
  width: number;
  height: number;
  format: string;
  altText: string;
};

type ProjectFields = {
  slug: string;
  title: string;
  subtitle: string | null;
  summary: string;
  description: string | null;
  category: string;
  role: string;
  year: number;
  featuredRank: number | null;
  liveUrl: string | null;
  repositoryUrl: string | null;
  caseStudyContent: unknown;
  seoTitle: string | null;
  seoDescription: string | null;
};

export function toPublicMediaDto(
  media: MediaFields | null,
): PublicMediaDto | null {
  if (!media) return null;

  return {
    url: safeMediaUrlSchema.parse(media.url),
    width: media.width,
    height: media.height,
    format: media.format,
    altText: media.altText,
  };
}

export function toPublicProjectSummaryDto(
  project: ProjectFields,
  thumbnail: MediaFields | null,
  technologyNames: string[],
): PublicProjectSummaryDto {
  return {
    slug: project.slug,
    title: project.title,
    subtitle: project.subtitle,
    summary: project.summary,
    category: project.category,
    role: project.role,
    year: project.year,
    featured: project.featuredRank !== null,
    thumbnail: toPublicMediaDto(thumbnail),
    technologies: technologyNames,
    liveUrl: optionalSafeHttpUrlSchema.parse(project.liveUrl),
    repositoryUrl: optionalSafeHttpUrlSchema.parse(project.repositoryUrl),
  };
}

export function toPublicProjectDetailDto(
  project: ProjectFields,
  thumbnail: MediaFields | null,
  heroMedia: MediaFields | null,
  technologyNames: string[],
  media: Array<
    MediaFields & {
      role: "cover" | "hero" | "gallery" | "case_study";
      altTextOverride: string | null;
      caption: string | null;
    }
  >,
): PublicProjectDetailDto {
  return {
    ...toPublicProjectSummaryDto(project, thumbnail, technologyNames),
    description: project.description,
    heroMedia: toPublicMediaDto(heroMedia),
    media: media.map((item) => ({
      ...toPublicMediaDto({
        ...item,
        altText: item.altTextOverride ?? item.altText,
      })!,
      role: item.role,
      caption: item.caption,
    })),
    caseStudyContent: caseStudyContentSchema.parse(project.caseStudyContent),
    seo: {
      title: project.seoTitle,
      description: project.seoDescription,
    },
  };
}

export function toPublicSiteSettingsDto(input: {
  siteName: string;
  siteTitle: string;
  siteDescription: string;
  availability: string;
  contactEmail: string;
  socialLinks: unknown;
  seoTitle: string;
  seoDescription: string;
}): PublicSiteSettingsDto {
  return {
    ...input,
    socialLinks: socialLinkSchema.array().max(12).parse(input.socialLinks),
  };
}

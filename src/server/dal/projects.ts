import "server-only";

import { and, asc, desc, eq, inArray, isNotNull, lte } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { slugSchema } from "@/lib/validation";
import { getDatabase } from "@/server/db";
import { runDatabaseOperation } from "@/server/db/errors";
import {
  mediaAssets,
  projectMedia,
  projects,
  projectTechnologies,
  technologies,
} from "@/server/db/schema";
import type {
  PublicProjectDetailDto,
  PublicProjectSummaryDto,
} from "@/server/dal/dto";
import {
  toPublicProjectDetailDto,
  toPublicProjectSummaryDto,
} from "@/server/dal/mappers";

const thumbnailMedia = alias(mediaAssets, "thumbnail_media");
const heroMedia = alias(mediaAssets, "hero_media");

const projectFields = {
  id: projects.id,
  slug: projects.slug,
  title: projects.title,
  subtitle: projects.subtitle,
  summary: projects.summary,
  description: projects.description,
  category: projects.category,
  role: projects.role,
  year: projects.year,
  featuredRank: projects.featuredRank,
  liveUrl: projects.liveUrl,
  repositoryUrl: projects.repositoryUrl,
  caseStudyContent: projects.caseStudyContent,
  seoTitle: projects.seoTitle,
  seoDescription: projects.seoDescription,
};

const thumbnailFields = {
  url: thumbnailMedia.url,
  width: thumbnailMedia.width,
  height: thumbnailMedia.height,
  format: thumbnailMedia.format,
  altText: thumbnailMedia.altText,
};

async function getTechnologyMap(projectIds: string[]) {
  const map = new Map<string, string[]>();
  if (projectIds.length === 0) return map;

  const rows = await getDatabase()
    .select({
      projectId: projectTechnologies.projectId,
      name: technologies.name,
    })
    .from(projectTechnologies)
    .innerJoin(
      technologies,
      eq(projectTechnologies.technologyId, technologies.id),
    )
    .where(inArray(projectTechnologies.projectId, projectIds))
    .orderBy(projectTechnologies.projectId, projectTechnologies.sortOrder);

  for (const row of rows) {
    map.set(row.projectId, [...(map.get(row.projectId) ?? []), row.name]);
  }

  return map;
}

export async function getPublishedProjects(): Promise<
  PublicProjectSummaryDto[]
> {
  return runDatabaseOperation("getPublishedProjects", async () => {
    const rows = await getDatabase()
      .select({ project: projectFields, thumbnail: thumbnailFields })
      .from(projects)
      .leftJoin(
        thumbnailMedia,
        eq(projects.thumbnailMediaId, thumbnailMedia.id),
      )
      .where(
        and(
          eq(projects.status, "published"),
          lte(projects.publishedAt, new Date()),
        ),
      )
      .orderBy(asc(projects.sortOrder), desc(projects.publishedAt));

    const technologiesByProject = await getTechnologyMap(
      rows.map(({ project }) => project.id),
    );

    return rows.map(({ project, thumbnail }) =>
      toPublicProjectSummaryDto(
        project,
        thumbnail,
        technologiesByProject.get(project.id) ?? [],
      ),
    );
  });
}

export async function getFeaturedProjects(
  limit = 4,
): Promise<PublicProjectSummaryDto[]> {
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 20);

  return runDatabaseOperation("getFeaturedProjects", async () => {
    const rows = await getDatabase()
      .select({ project: projectFields, thumbnail: thumbnailFields })
      .from(projects)
      .leftJoin(
        thumbnailMedia,
        eq(projects.thumbnailMediaId, thumbnailMedia.id),
      )
      .where(
        and(
          eq(projects.status, "published"),
          isNotNull(projects.featuredRank),
          lte(projects.publishedAt, new Date()),
        ),
      )
      .orderBy(asc(projects.featuredRank), asc(projects.sortOrder))
      .limit(safeLimit);

    const technologiesByProject = await getTechnologyMap(
      rows.map(({ project }) => project.id),
    );

    return rows.map(({ project, thumbnail }) =>
      toPublicProjectSummaryDto(
        project,
        thumbnail,
        technologiesByProject.get(project.id) ?? [],
      ),
    );
  });
}

export async function getProjectBySlug(
  slug: string,
): Promise<PublicProjectDetailDto | null> {
  const parsedSlug = slugSchema.safeParse(slug);
  if (!parsedSlug.success) return null;

  return runDatabaseOperation("getProjectBySlug", async () => {
    const [row] = await getDatabase()
      .select({
        project: projectFields,
        thumbnail: thumbnailFields,
        hero: {
          url: heroMedia.url,
          width: heroMedia.width,
          height: heroMedia.height,
          format: heroMedia.format,
          altText: heroMedia.altText,
        },
      })
      .from(projects)
      .leftJoin(
        thumbnailMedia,
        eq(projects.thumbnailMediaId, thumbnailMedia.id),
      )
      .leftJoin(heroMedia, eq(projects.heroMediaId, heroMedia.id))
      .where(
        and(
          eq(projects.slug, parsedSlug.data),
          eq(projects.status, "published"),
          lte(projects.publishedAt, new Date()),
        ),
      )
      .limit(1);

    if (!row) return null;

    const [technologiesByProject, mediaRows] = await Promise.all([
      getTechnologyMap([row.project.id]),
      getDatabase()
        .select({
          role: projectMedia.role,
          altTextOverride: projectMedia.altTextOverride,
          caption: projectMedia.caption,
          url: mediaAssets.url,
          width: mediaAssets.width,
          height: mediaAssets.height,
          format: mediaAssets.format,
          altText: mediaAssets.altText,
        })
        .from(projectMedia)
        .innerJoin(mediaAssets, eq(projectMedia.mediaId, mediaAssets.id))
        .where(eq(projectMedia.projectId, row.project.id))
        .orderBy(asc(projectMedia.sortOrder)),
    ]);

    return toPublicProjectDetailDto(
      row.project,
      row.thumbnail,
      row.hero,
      technologiesByProject.get(row.project.id) ?? [],
      mediaRows,
    );
  });
}

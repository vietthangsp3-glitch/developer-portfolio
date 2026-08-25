import "server-only";

import { and, asc, desc, eq, ne, sql } from "drizzle-orm";

import type { ProjectAdminInput } from "@/server/dal/cms-types";
import { assertAdmin } from "@/server/auth/session";
import { getDatabase } from "@/server/db";
import {
  inquiries,
  mediaAssets,
  projectMedia,
  projects,
  projectTechnologies,
  services,
  siteSettings,
  technologies,
  testimonials,
} from "@/server/db/schema";

export async function listAdminProjects() {
  await assertAdmin();
  return getDatabase()
    .select({
      id: projects.id,
      title: projects.title,
      slug: projects.slug,
      status: projects.status,
      featuredRank: projects.featuredRank,
      sortOrder: projects.sortOrder,
      updatedAt: projects.updatedAt,
    })
    .from(projects)
    .orderBy(asc(projects.sortOrder), desc(projects.updatedAt))
    .limit(100);
}

export async function listAdminTechnologies() {
  await assertAdmin();
  return getDatabase()
    .select({ id: technologies.id, name: technologies.name })
    .from(technologies)
    .orderBy(asc(technologies.name))
    .limit(200);
}

export async function getAdminProject(id: string) {
  await assertAdmin();
  const [project] = await getDatabase()
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);
  if (!project) return null;

  const [technologyRows, mediaRows] = await Promise.all([
    getDatabase()
      .select({ id: technologies.id, name: technologies.name })
      .from(projectTechnologies)
      .innerJoin(
        technologies,
        eq(projectTechnologies.technologyId, technologies.id),
      )
      .where(eq(projectTechnologies.projectId, id))
      .orderBy(asc(projectTechnologies.sortOrder)),
    getDatabase()
      .select({
        id: projectMedia.id,
        mediaId: projectMedia.mediaId,
        role: projectMedia.role,
        altTextOverride: projectMedia.altTextOverride,
        caption: projectMedia.caption,
        sortOrder: projectMedia.sortOrder,
      })
      .from(projectMedia)
      .where(eq(projectMedia.projectId, id))
      .orderBy(asc(projectMedia.sortOrder)),
  ]);
  return { ...project, technologyRows, mediaRows };
}

export async function isProjectSlugAvailable(slug: string, id?: string) {
  await assertAdmin();
  const conditions = id
    ? and(eq(projects.slug, slug), ne(projects.id, id))
    : eq(projects.slug, slug);
  const [row] = await getDatabase()
    .select({ id: projects.id })
    .from(projects)
    .where(conditions)
    .limit(1);
  return !row;
}

async function syncProjectRelations(
  projectId: string,
  technologyNames: string[],
  mediaRelations: ProjectAdminInput["mediaRelations"],
) {
  const db = getDatabase();
  await db
    .delete(projectTechnologies)
    .where(eq(projectTechnologies.projectId, projectId));

  for (const [index, rawName] of technologyNames.entries()) {
    const name = rawName.trim();
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const [technology] = await db
      .insert(technologies)
      .values({ name, slug })
      .onConflictDoUpdate({
        target: technologies.slug,
        set: { updatedAt: new Date() },
      })
      .returning({ id: technologies.id });
    await db.insert(projectTechnologies).values({
      projectId,
      technologyId: technology.id,
      sortOrder: index,
    });
  }

  await db.delete(projectMedia).where(eq(projectMedia.projectId, projectId));
  if (mediaRelations.length) {
    await db.insert(projectMedia).values(
      mediaRelations.map((item, index) => ({
        projectId,
        mediaId: item.mediaId,
        role: item.role,
        altTextOverride: item.altTextOverride,
        caption: item.caption,
        sortOrder: index,
      })),
    );
  }
}

export async function createAdminProject(input: ProjectAdminInput) {
  await assertAdmin();
  const now = new Date();
  const [project] = await getDatabase()
    .insert(projects)
    .values({
      ...input.project,
      publishedAt: input.project.status === "published" ? now : null,
    })
    .returning({ id: projects.id, slug: projects.slug });
  await syncProjectRelations(
    project.id,
    input.technologies,
    input.mediaRelations,
  );
  return project;
}

export async function updateAdminProject(id: string, input: ProjectAdminInput) {
  await assertAdmin();
  const [current] = await getDatabase()
    .select({ publishedAt: projects.publishedAt })
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);
  if (!current) return null;
  const [project] = await getDatabase()
    .update(projects)
    .set({
      ...input.project,
      publishedAt:
        input.project.status === "published"
          ? (current.publishedAt ?? new Date())
          : null,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, id))
    .returning({ id: projects.id, slug: projects.slug });
  await syncProjectRelations(id, input.technologies, input.mediaRelations);
  return project;
}

export async function deleteAdminProject(id: string) {
  await assertAdmin();
  const [row] = await getDatabase()
    .delete(projects)
    .where(and(eq(projects.id, id), ne(projects.status, "published")))
    .returning({ id: projects.id, slug: projects.slug });
  return row ?? null;
}

export async function listAdminServices() {
  await assertAdmin();
  return getDatabase()
    .select()
    .from(services)
    .orderBy(asc(services.sortOrder))
    .limit(100);
}

export async function getAdminService(id: string) {
  await assertAdmin();
  const [row] = await getDatabase()
    .select()
    .from(services)
    .where(eq(services.id, id))
    .limit(1);
  return row ?? null;
}

export async function saveAdminService(
  input: typeof services.$inferInsert,
  id?: string,
) {
  await assertAdmin();
  if (id) {
    const [row] = await getDatabase()
      .update(services)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(services.id, id))
      .returning({ id: services.id, slug: services.slug });
    return row ?? null;
  }
  const [row] = await getDatabase()
    .insert(services)
    .values(input)
    .returning({ id: services.id, slug: services.slug });
  return row;
}

export async function deleteAdminService(id: string) {
  await assertAdmin();
  const [row] = await getDatabase()
    .delete(services)
    .where(and(eq(services.id, id), eq(services.published, false)))
    .returning({ id: services.id });
  return row ?? null;
}

export async function listAdminTestimonials() {
  await assertAdmin();
  return getDatabase()
    .select()
    .from(testimonials)
    .orderBy(asc(testimonials.sortOrder))
    .limit(100);
}

export async function getAdminTestimonial(id: string) {
  await assertAdmin();
  const [row] = await getDatabase()
    .select()
    .from(testimonials)
    .where(eq(testimonials.id, id))
    .limit(1);
  return row ?? null;
}

export async function saveAdminTestimonial(
  input: typeof testimonials.$inferInsert,
  id?: string,
) {
  await assertAdmin();
  if (id) {
    const [row] = await getDatabase()
      .update(testimonials)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(testimonials.id, id))
      .returning({ id: testimonials.id });
    return row ?? null;
  }
  const [row] = await getDatabase()
    .insert(testimonials)
    .values(input)
    .returning({ id: testimonials.id });
  return row;
}

export async function deleteAdminTestimonial(id: string) {
  await assertAdmin();
  const [row] = await getDatabase()
    .delete(testimonials)
    .where(eq(testimonials.id, id))
    .returning({ id: testimonials.id });
  return row ?? null;
}

export async function listAdminInquiries(
  limit = 50,
  offset = 0,
  status?: "received" | "contacted" | "archived",
) {
  await assertAdmin();
  return getDatabase()
    .select({
      id: inquiries.id,
      name: inquiries.name,
      email: inquiries.email,
      company: inquiries.company,
      projectType: inquiries.projectType,
      status: inquiries.status,
      emailDeliveryStatus: inquiries.emailDeliveryStatus,
      createdAt: inquiries.createdAt,
    })
    .from(inquiries)
    .where(status ? eq(inquiries.status, status) : undefined)
    .orderBy(desc(inquiries.createdAt))
    .limit(Math.min(limit, 100))
    .offset(Math.max(offset, 0));
}

export async function getAdminInquiry(id: string) {
  await assertAdmin();
  const [row] = await getDatabase()
    .select({
      id: inquiries.id,
      name: inquiries.name,
      email: inquiries.email,
      company: inquiries.company,
      projectType: inquiries.projectType,
      budget: inquiries.budget,
      message: inquiries.message,
      status: inquiries.status,
      emailDeliveryStatus: inquiries.emailDeliveryStatus,
      emailProviderMessageId: inquiries.emailProviderMessageId,
      source: inquiries.source,
      readAt: inquiries.readAt,
      createdAt: inquiries.createdAt,
      updatedAt: inquiries.updatedAt,
    })
    .from(inquiries)
    .where(eq(inquiries.id, id))
    .limit(1);
  if (row && !row.readAt) {
    await getDatabase()
      .update(inquiries)
      .set({ readAt: new Date() })
      .where(eq(inquiries.id, id));
  }
  return row ?? null;
}

export async function updateAdminInquiryStatus(
  id: string,
  status: "received" | "contacted" | "archived",
) {
  await assertAdmin();
  const [row] = await getDatabase()
    .update(inquiries)
    .set({ status, updatedAt: new Date() })
    .where(eq(inquiries.id, id))
    .returning({ id: inquiries.id });
  return row ?? null;
}

export async function getAdminSiteSettings() {
  await assertAdmin();
  const [row] = await getDatabase()
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.settingsKey, "default"))
    .limit(1);
  return row ?? null;
}

export async function saveAdminSiteSettings(
  input: Omit<typeof siteSettings.$inferInsert, "settingsKey">,
) {
  const session = await assertAdmin();
  const [row] = await getDatabase()
    .insert(siteSettings)
    .values({
      ...input,
      settingsKey: "default",
      updatedByUserId: session.user.id,
    })
    .onConflictDoUpdate({
      target: siteSettings.settingsKey,
      set: {
        ...input,
        updatedByUserId: session.user.id,
        updatedAt: new Date(),
      },
    })
    .returning({ id: siteSettings.id });
  return row;
}

export async function listAdminMedia(limit = 60, offset = 0) {
  await assertAdmin();
  return getDatabase()
    .select()
    .from(mediaAssets)
    .orderBy(desc(mediaAssets.createdAt))
    .limit(Math.min(limit, 100))
    .offset(Math.max(offset, 0));
}

export async function getMediaReferenceCounts(id: string) {
  await assertAdmin();
  const [row] = await getDatabase()
    .select({
      projectMedia: sql<number>`count(distinct ${projectMedia.id})::int`,
      thumbnail: sql<number>`count(distinct ${projects.id}) filter (where ${projects.thumbnailMediaId} = ${id})::int`,
      hero: sql<number>`count(distinct ${projects.id}) filter (where ${projects.heroMediaId} = ${id})::int`,
      testimonial: sql<number>`count(distinct ${testimonials.id}) filter (where ${testimonials.avatarMediaId} = ${id})::int`,
    })
    .from(mediaAssets)
    .leftJoin(projectMedia, eq(projectMedia.mediaId, mediaAssets.id))
    .leftJoin(
      projects,
      sql`${projects.thumbnailMediaId} = ${mediaAssets.id} or ${projects.heroMediaId} = ${mediaAssets.id}`,
    )
    .leftJoin(testimonials, eq(testimonials.avatarMediaId, mediaAssets.id))
    .where(eq(mediaAssets.id, id))
    .groupBy(mediaAssets.id);
  return row ?? null;
}

export async function updateAdminMediaAlt(id: string, altText: string) {
  await assertAdmin();
  const [row] = await getDatabase()
    .update(mediaAssets)
    .set({ altText, updatedAt: new Date() })
    .where(eq(mediaAssets.id, id))
    .returning({ id: mediaAssets.id });
  return row ?? null;
}

export async function createAdminMedia(input: typeof mediaAssets.$inferInsert) {
  const session = await assertAdmin();
  const [row] = await getDatabase()
    .insert(mediaAssets)
    .values({ ...input, createdByUserId: session.user.id })
    .returning({ id: mediaAssets.id });
  return row;
}

export async function getAdminMedia(id: string) {
  await assertAdmin();
  const [row] = await getDatabase()
    .select()
    .from(mediaAssets)
    .where(eq(mediaAssets.id, id))
    .limit(1);
  return row ?? null;
}

export async function deleteAdminMediaRow(id: string) {
  await assertAdmin();
  const [row] = await getDatabase()
    .delete(mediaAssets)
    .where(eq(mediaAssets.id, id))
    .returning({ id: mediaAssets.id });
  return row ?? null;
}

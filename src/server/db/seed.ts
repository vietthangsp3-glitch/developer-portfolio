import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";

import { migrationEnvSchema } from "@/config/env.schema";
import { loadDatabaseCommandEnv } from "@/config/load-env";
import { siteConfig } from "@/config/site";
import { services as serviceFixtures } from "@/features/content/data/site-content";
import { projects as projectFixtures } from "@/features/projects/data/projects";
import { caseStudyContentSchema } from "@/features/projects/schemas/project";
import { slugSchema } from "@/lib/validation";
import * as schema from "@/server/db/schema";

const developmentConfirmationFlag = "--confirm-development";
const productionConfirmationFlag = "--confirm-production-import";

loadDatabaseCommandEnv();

function assertSeedTarget(connectionString: string) {
  const isDevelopment = process.argv.includes(developmentConfirmationFlag);
  const isProduction = process.argv.includes(productionConfirmationFlag);

  if (isDevelopment === isProduction) {
    throw new Error(
      `Content import not run. Pass exactly one of ${developmentConfirmationFlag} or ${productionConfirmationFlag} after verifying the target branch.`,
    );
  }

  if (isDevelopment && process.env.VERCEL_ENV === "production") {
    throw new Error("Development content import refused in production.");
  }

  if (isProduction) {
    const expectedHost = process.env.CONTENT_IMPORT_EXPECTED_DATABASE_HOST;
    const actualHost = new URL(connectionString).hostname;
    if (
      process.env.VERCEL_ENV !== "production" ||
      process.env.PRODUCTION_CONTENT_APPROVED !== "six-portfolio-projects" ||
      !expectedHost ||
      expectedHost !== actualHost
    ) {
      throw new Error(
        "Production content import refused. Confirm VERCEL_ENV, owner-approved content, and the exact Neon host.",
      );
    }
  }
}

function getSeedConnectionString() {
  const result = migrationEnvSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED,
  });

  if (!result.success) {
    throw new Error(
      "Development seed requires DATABASE_URL_UNPOOLED or DATABASE_URL.",
    );
  }

  return result.data.DATABASE_URL_UNPOOLED ?? result.data.DATABASE_URL!;
}

function toSlug(value: string) {
  return slugSchema.parse(
    value
      .trim()
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, ""),
  );
}

async function seed() {
  const connectionString = getSeedConnectionString();
  assertSeedTarget(connectionString);

  const client = neon(connectionString);
  const db = drizzle({ client, schema });

  for (const [projectIndex, project] of projectFixtures.entries()) {
    const mediaBySource = new Map<
      string,
      { id: string; altText: string; width: number; height: number }
    >();
    const projectImages = [
      project.image,
      ...project.blocks.flatMap((block) =>
        block.type === "image" ? [block.image] : [],
      ),
    ];

    for (const image of projectImages) {
      if (mediaBySource.has(image.src)) continue;

      const [media] = await db
        .insert(schema.mediaAssets)
        .values({
          provider: "local",
          providerKey: image.src,
          url: image.src,
          width: image.width,
          height: image.height,
          format: image.src.split(".").at(-1) ?? "unknown",
          altText: image.alt,
          folder: "portfolio-local-assets",
        })
        .onConflictDoUpdate({
          target: [schema.mediaAssets.provider, schema.mediaAssets.providerKey],
          set: {
            url: image.src,
            width: image.width,
            height: image.height,
            altText: image.alt,
          },
        })
        .returning({
          id: schema.mediaAssets.id,
          altText: schema.mediaAssets.altText,
          width: schema.mediaAssets.width,
          height: schema.mediaAssets.height,
        });

      mediaBySource.set(image.src, media);
    }

    const coverMedia = mediaBySource.get(project.image.src)!;
    const [projectRow] = await db
      .insert(schema.projects)
      .values({
        title: project.title,
        slug: project.slug,
        summary: project.summary,
        description: project.outcome,
        category: project.sector,
        role: project.services.join(" / "),
        year: Number(project.year),
        status: "published",
        featuredRank: project.featured ? 0 : null,
        sortOrder: projectIndex,
        thumbnailMediaId: coverMedia.id,
        heroMediaId: coverMedia.id,
        caseStudyContent: caseStudyContentSchema.parse({
          version: 1,
          blocks: project.blocks,
        }),
        publishedAt: new Date(`${project.year}-01-01T00:00:00.000Z`),
      })
      .onConflictDoUpdate({
        target: schema.projects.slug,
        set: {
          title: project.title,
          summary: project.summary,
          description: project.outcome,
          category: project.sector,
          role: project.services.join(" / "),
          year: Number(project.year),
          status: "published",
          featuredRank: project.featured ? 0 : null,
          sortOrder: projectIndex,
          thumbnailMediaId: coverMedia.id,
          heroMediaId: coverMedia.id,
          caseStudyContent: { version: 1, blocks: project.blocks },
          publishedAt: new Date(`${project.year}-01-01T00:00:00.000Z`),
        },
      })
      .returning({ id: schema.projects.id });

    await db
      .insert(schema.projectMedia)
      .values({
        projectId: projectRow.id,
        mediaId: coverMedia.id,
        role: "cover",
        sortOrder: 0,
      })
      .onConflictDoUpdate({
        target: [
          schema.projectMedia.projectId,
          schema.projectMedia.mediaId,
          schema.projectMedia.role,
        ],
        set: { sortOrder: 0 },
      });

    let caseStudyMediaOrder = 1;
    for (const block of project.blocks) {
      if (block.type !== "image") continue;

      await db
        .insert(schema.projectMedia)
        .values({
          projectId: projectRow.id,
          mediaId: mediaBySource.get(block.image.src)!.id,
          role: "case_study",
          altTextOverride: block.image.alt,
          caption: block.caption,
          sortOrder: caseStudyMediaOrder,
        })
        .onConflictDoUpdate({
          target: [
            schema.projectMedia.projectId,
            schema.projectMedia.mediaId,
            schema.projectMedia.role,
          ],
          set: {
            altTextOverride: block.image.alt,
            caption: block.caption,
            sortOrder: caseStudyMediaOrder,
          },
        });

      caseStudyMediaOrder += 1;
    }

    for (const [
      technologyIndex,
      technologyName,
    ] of project.technologies.entries()) {
      const [technology] = await db
        .insert(schema.technologies)
        .values({
          name: technologyName,
          slug: toSlug(technologyName),
        })
        .onConflictDoUpdate({
          target: schema.technologies.slug,
          set: { name: technologyName },
        })
        .returning({ id: schema.technologies.id });

      await db
        .insert(schema.projectTechnologies)
        .values({
          projectId: projectRow.id,
          technologyId: technology.id,
          sortOrder: technologyIndex,
        })
        .onConflictDoUpdate({
          target: [
            schema.projectTechnologies.projectId,
            schema.projectTechnologies.technologyId,
          ],
          set: { sortOrder: technologyIndex },
        });
    }
  }

  for (const [serviceIndex, service] of serviceFixtures.entries()) {
    await db
      .insert(schema.services)
      .values({
        title: service.title,
        slug: toSlug(service.title),
        summary: service.description,
        description: `${service.description}\n\nDeliverables: ${service.deliverables.join(", ")}.`,
        sortOrder: serviceIndex,
        published: true,
      })
      .onConflictDoUpdate({
        target: schema.services.slug,
        set: {
          title: service.title,
          summary: service.description,
          description: `${service.description}\n\nDeliverables: ${service.deliverables.join(", ")}.`,
          sortOrder: serviceIndex,
          published: true,
        },
      });
  }

  const [existingSettings] = await db
    .select({ id: schema.siteSettings.id })
    .from(schema.siteSettings)
    .where(eq(schema.siteSettings.settingsKey, "default"))
    .limit(1);

  const settings = {
    siteName: siteConfig.name,
    siteTitle: siteConfig.title,
    siteDescription: siteConfig.description,
    availability: siteConfig.availability,
    contactEmail: siteConfig.email,
    socialLinks: [],
    seoTitle: siteConfig.title,
    seoDescription: siteConfig.description,
  };

  if (existingSettings) {
    await db
      .update(schema.siteSettings)
      .set(settings)
      .where(eq(schema.siteSettings.id, existingSettings.id));
  } else {
    await db.insert(schema.siteSettings).values(settings);
  }

  console.info(
    `Imported ${projectFixtures.length} portfolio projects and ${serviceFixtures.length} services. Testimonials and inquiries were intentionally excluded.`,
  );
}

seed().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "Development seed failed.",
  );
  process.exitCode = 1;
});

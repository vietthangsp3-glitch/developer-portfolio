import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import type { CaseStudyContent } from "@/features/projects/schemas/project";
import { mediaAssets } from "@/server/db/schema/media";
import { projectMediaRole, projectStatus } from "@/server/db/schema/enums";

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 160 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull(),
    subtitle: varchar("subtitle", { length: 240 }),
    summary: varchar("summary", { length: 500 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 120 }).notNull(),
    role: varchar("role", { length: 240 }).notNull(),
    year: smallint("year").notNull(),
    status: projectStatus("status").default("draft").notNull(),
    featuredRank: integer("featured_rank"),
    sortOrder: integer("sort_order").default(0).notNull(),
    thumbnailMediaId: uuid("thumbnail_media_id").references(
      () => mediaAssets.id,
      { onDelete: "restrict" },
    ),
    heroMediaId: uuid("hero_media_id").references(() => mediaAssets.id, {
      onDelete: "restrict",
    }),
    liveUrl: text("live_url"),
    repositoryUrl: text("repository_url"),
    caseStudyContent: jsonb("case_study_content")
      .$type<CaseStudyContent>()
      .default({ version: 1, blocks: [] })
      .notNull(),
    seoTitle: varchar("seo_title", { length: 160 }),
    seoDescription: varchar("seo_description", { length: 320 }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("projects_slug_unique").on(table.slug),
    index("projects_status_published_at_idx").on(
      table.status,
      table.publishedAt,
    ),
    index("projects_featured_order_idx").on(
      table.featuredRank,
      table.sortOrder,
    ),
    index("projects_category_idx").on(table.category),
    check("projects_year_range", sql`${table.year} between 1900 and 2200`),
    check("projects_sort_order_non_negative", sql`${table.sortOrder} >= 0`),
    check(
      "projects_featured_rank_non_negative",
      sql`${table.featuredRank} is null or ${table.featuredRank} >= 0`,
    ),
    check(
      "projects_published_at_required",
      sql`${table.status} <> 'published' or ${table.publishedAt} is not null`,
    ),
  ],
);

export const technologies = pgTable(
  "technologies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull(),
    category: varchar("category", { length: 80 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("technologies_name_unique").on(table.name),
    uniqueIndex("technologies_slug_unique").on(table.slug),
  ],
);

export const projectTechnologies = pgTable(
  "project_technologies",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    technologyId: uuid("technology_id")
      .notNull()
      .references(() => technologies.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.projectId, table.technologyId] }),
    uniqueIndex("project_technologies_project_order_unique").on(
      table.projectId,
      table.sortOrder,
    ),
    check(
      "project_technologies_sort_order_non_negative",
      sql`${table.sortOrder} >= 0`,
    ),
  ],
);

export const projectMedia = pgTable(
  "project_media",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    mediaId: uuid("media_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "restrict" }),
    role: projectMediaRole("role").notNull(),
    altTextOverride: varchar("alt_text_override", { length: 300 }),
    caption: varchar("caption", { length: 500 }),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("project_media_project_media_role_unique").on(
      table.projectId,
      table.mediaId,
      table.role,
    ),
    index("project_media_project_order_idx").on(
      table.projectId,
      table.sortOrder,
    ),
    check(
      "project_media_sort_order_non_negative",
      sql`${table.sortOrder} >= 0`,
    ),
  ],
);

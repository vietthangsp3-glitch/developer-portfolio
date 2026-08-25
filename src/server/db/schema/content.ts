import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import type { SocialLink } from "@/features/site-settings/schemas/site-settings";
import { user } from "@/server/db/schema/auth";
import { mediaAssets } from "@/server/db/schema/media";

export const services = pgTable(
  "services",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 160 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull(),
    summary: varchar("summary", { length: 500 }).notNull(),
    description: text("description").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    published: boolean("published").default(false).notNull(),
    seoTitle: varchar("seo_title", { length: 160 }),
    seoDescription: varchar("seo_description", { length: 320 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("services_slug_unique").on(table.slug),
    index("services_published_order_idx").on(table.published, table.sortOrder),
    check("services_sort_order_non_negative", sql`${table.sortOrder} >= 0`),
  ],
);

export const testimonials = pgTable(
  "testimonials",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    personName: varchar("person_name", { length: 160 }).notNull(),
    role: varchar("role", { length: 160 }).notNull(),
    company: varchar("company", { length: 160 }).notNull(),
    quote: text("quote").notNull(),
    avatarMediaId: uuid("avatar_media_id").references(() => mediaAssets.id, {
      onDelete: "restrict",
    }),
    published: boolean("published").default(false).notNull(),
    isDemo: boolean("is_demo").default(false).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("testimonials_published_order_idx").on(
      table.published,
      table.sortOrder,
    ),
    check("testimonials_sort_order_non_negative", sql`${table.sortOrder} >= 0`),
  ],
);

export const siteSettings = pgTable(
  "site_settings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    settingsKey: varchar("settings_key", { length: 32 })
      .default("default")
      .notNull(),
    siteName: varchar("site_name", { length: 120 }).notNull(),
    siteTitle: varchar("site_title", { length: 180 }).notNull(),
    siteDescription: varchar("site_description", { length: 500 }).notNull(),
    availability: varchar("availability", { length: 240 }).notNull(),
    contactEmail: varchar("contact_email", { length: 320 }).notNull(),
    socialLinks: jsonb("social_links")
      .$type<SocialLink[]>()
      .default([])
      .notNull(),
    seoTitle: varchar("seo_title", { length: 160 }).notNull(),
    seoDescription: varchar("seo_description", { length: 320 }).notNull(),
    updatedByUserId: uuid("updated_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("site_settings_key_unique").on(table.settingsKey),
    check("site_settings_singleton_key", sql`${table.settingsKey} = 'default'`),
  ],
);

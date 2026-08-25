import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { user } from "@/server/db/schema/auth";

export const mediaAssets = pgTable(
  "media_assets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    provider: varchar("provider", { length: 40 }).notNull(),
    providerKey: varchar("provider_key", { length: 500 }).notNull(),
    url: text("url").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    format: varchar("format", { length: 32 }).notNull(),
    bytes: integer("bytes"),
    altText: varchar("alt_text", { length: 300 }).notNull(),
    folder: varchar("folder", { length: 300 }),
    createdByUserId: uuid("created_by_user_id").references(() => user.id, {
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
    uniqueIndex("media_assets_provider_key_unique").on(
      table.provider,
      table.providerKey,
    ),
    index("media_assets_created_at_idx").on(table.createdAt),
    check("media_assets_width_positive", sql`${table.width} > 0`),
    check("media_assets_height_positive", sql`${table.height} > 0`),
    check(
      "media_assets_bytes_non_negative",
      sql`${table.bytes} is null or ${table.bytes} >= 0`,
    ),
  ],
);

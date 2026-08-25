import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import type { AuditMetadata } from "@/features/audit/schemas/audit";
import { user } from "@/server/db/schema/auth";
import { emailDeliveryStatus, inquiryStatus } from "@/server/db/schema/enums";

export const inquiries = pgTable(
  "inquiries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 160 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    company: varchar("company", { length: 160 }),
    projectType: varchar("project_type", { length: 120 }).notNull(),
    budget: varchar("budget", { length: 120 }),
    message: text("message").notNull(),
    status: inquiryStatus("status").default("received").notNull(),
    emailDeliveryStatus: emailDeliveryStatus("email_delivery_status")
      .default("not_requested")
      .notNull(),
    emailProviderMessageId: varchar("email_provider_message_id", {
      length: 255,
    }),
    source: varchar("source", { length: 80 }).default("website").notNull(),
    networkIdentifierHash: varchar("network_identifier_hash", { length: 64 }),
    userAgentExcerpt: varchar("user_agent_excerpt", { length: 256 }),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("inquiries_status_created_at_idx").on(table.status, table.createdAt),
    index("inquiries_created_at_idx").on(table.createdAt),
    check(
      "inquiries_network_hash_length",
      sql`${table.networkIdentifierHash} is null or length(${table.networkIdentifierHash}) = 64`,
    ),
  ],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorUserId: uuid("actor_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    action: varchar("action", { length: 120 }).notNull(),
    entityType: varchar("entity_type", { length: 80 }).notNull(),
    entityId: uuid("entity_id"),
    metadata: jsonb("metadata").$type<AuditMetadata>().default({}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("audit_logs_actor_created_at_idx").on(
      table.actorUserId,
      table.createdAt,
    ),
    index("audit_logs_entity_created_at_idx").on(
      table.entityType,
      table.entityId,
      table.createdAt,
    ),
  ],
);

export const rateLimits = pgTable(
  "rate_limits",
  {
    scope: varchar("scope", { length: 80 }).notNull(),
    identifierHash: varchar("identifier_hash", { length: 64 }).notNull(),
    windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
    requestCount: integer("request_count").default(1).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.scope, table.identifierHash, table.windowStart],
    }),
    index("rate_limits_expires_at_idx").on(table.expiresAt),
    check("rate_limits_request_count_positive", sql`${table.requestCount} > 0`),
    check(
      "rate_limits_identifier_hash_length",
      sql`length(${table.identifierHash}) = 64`,
    ),
    check(
      "rate_limits_expiry_after_window",
      sql`${table.expiresAt} > ${table.windowStart}`,
    ),
  ],
);

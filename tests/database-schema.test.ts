import { describe, expect, it } from "vitest";
import { getTableConfig } from "drizzle-orm/pg-core";

import {
  auditLogs,
  account,
  inquiries,
  mediaAssets,
  projectMedia,
  projects,
  projectStatus,
  projectTechnologies,
  rateLimits,
  session,
  services,
  siteSettings,
  technologies,
  testimonials,
  user,
  verification,
} from "@/server/db/schema";

describe("database schema assumptions", () => {
  it("uses one UUID identity strategy and timezone-aware entity timestamps", () => {
    const entityTables = [
      user,
      session,
      account,
      verification,
      projects,
      technologies,
      projectMedia,
      mediaAssets,
      services,
      testimonials,
      inquiries,
      siteSettings,
      auditLogs,
    ];

    for (const table of entityTables) {
      expect(table.id.dataType).toBe("string");
      expect(table.id.hasDefault).toBe(true);
    }

    for (const table of [
      user,
      session,
      account,
      verification,
      projects,
      technologies,
      projectMedia,
      mediaAssets,
      services,
      testimonials,
      inquiries,
      siteSettings,
    ]) {
      expect(table.createdAt.getSQLType()).toBe("timestamp with time zone");
      expect(table.updatedAt.getSQLType()).toBe("timestamp with time zone");
    }
  });

  it("keeps Better Auth identities, sessions, and account relationships constrained", () => {
    const sessionConfig = getTableConfig(session);
    const accountConfig = getTableConfig(account);

    expect(user.id.hasDefault).toBe(true);
    expect(user.email.isUnique).toBe(true);
    expect(session.token.isUnique).toBe(true);
    expect(sessionConfig.foreignKeys).toHaveLength(1);
    expect(accountConfig.foreignKeys).toHaveLength(1);
    expect(session.expiresAt.getSQLType()).toBe("timestamp with time zone");
  });

  it("defines explicit publication states and critical uniqueness constraints", () => {
    expect(projectStatus.enumValues).toEqual([
      "draft",
      "published",
      "archived",
    ]);

    const projectConfig = getTableConfig(projects);
    const serviceConfig = getTableConfig(services);

    expect(
      projectConfig.indexes.some(
        (index) => index.config.name === "projects_slug_unique",
      ),
    ).toBe(true);
    expect(
      serviceConfig.indexes.some(
        (index) => index.config.name === "services_slug_unique",
      ),
    ).toBe(true);
    expect(projectConfig.checks.map((check) => check.name)).toContain(
      "projects_published_at_required",
    );
  });

  it("keeps join and rate-limit identities composite", () => {
    expect(getTableConfig(projectTechnologies).primaryKeys).toHaveLength(1);
    expect(getTableConfig(rateLimits).primaryKeys).toHaveLength(1);
    expect(getTableConfig(projectMedia).foreignKeys).toHaveLength(2);
  });
});

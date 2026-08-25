import "server-only";

import { count, eq } from "drizzle-orm";

import { assertAdmin } from "@/server/auth/session";
import { getDatabase } from "@/server/db";
import { runDatabaseOperation } from "@/server/db/errors";
import {
  inquiries,
  projects,
  services,
  testimonials,
} from "@/server/db/schema";

export type AdminDashboardMetrics = {
  projects: number;
  publishedProjects: number;
  services: number;
  testimonials: number;
  inquiries: number;
};

async function countRows(
  table:
    typeof projects | typeof services | typeof testimonials | typeof inquiries,
) {
  const [row] = await getDatabase().select({ value: count() }).from(table);
  return row?.value ?? 0;
}

export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  await assertAdmin();

  return runDatabaseOperation("getAdminDashboardMetrics", async () => {
    const [
      projectCount,
      [publishedProjectCount],
      serviceCount,
      testimonialCount,
      inquiryCount,
    ] = await Promise.all([
      countRows(projects),
      getDatabase()
        .select({ value: count() })
        .from(projects)
        .where(eq(projects.status, "published")),
      countRows(services),
      countRows(testimonials),
      countRows(inquiries),
    ]);

    return {
      projects: projectCount,
      publishedProjects: publishedProjectCount?.value ?? 0,
      services: serviceCount,
      testimonials: testimonialCount,
      inquiries: inquiryCount,
    };
  });
}

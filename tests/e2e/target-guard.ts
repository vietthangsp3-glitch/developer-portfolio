import { z } from "zod";

const adminE2EEnvironmentSchema = z.object({
  VERCEL_ENV: z.string().optional(),
  E2E_TARGET_CONFIRM: z.literal("development"),
  E2E_EXPECTED_DATABASE_HOST: z.string().trim().min(1),
  E2E_ADMIN_EMAIL: z.string().trim().email(),
  E2E_ADMIN_PASSWORD: z.string().min(1),
  DATABASE_URL: z.string().url(),
});

export function assertAdminE2ETarget(
  environment: Record<string, string | undefined>,
) {
  if (environment.VERCEL_ENV === "production") {
    throw new Error("Authenticated E2E refuses VERCEL_ENV=production.");
  }

  const parsed = adminE2EEnvironmentSchema.safeParse(environment);
  if (!parsed.success) {
    throw new Error(
      "Authenticated E2E requires development confirmation, expected Neon host, database URL, and admin credentials.",
    );
  }

  const database = new URL(parsed.data.DATABASE_URL);
  if (
    !database.hostname.endsWith(".neon.tech") ||
    database.hostname !== parsed.data.E2E_EXPECTED_DATABASE_HOST
  ) {
    throw new Error(
      "Authenticated E2E database does not match the explicitly confirmed Neon development host.",
    );
  }

  return {
    databaseHost: database.hostname,
    adminEmail: parsed.data.E2E_ADMIN_EMAIL,
  };
}

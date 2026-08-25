import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";

import { serverEnvSchema } from "../src/config/env.schema";
import { loadDatabaseCommandEnv } from "../src/config/load-env";
import * as schema from "../src/server/db/schema";

loadDatabaseCommandEnv();

const bootstrapEnvironment = process.env.ADMIN_BOOTSTRAP_CONFIRM;
const migrationUrl =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "";

if (bootstrapEnvironment === "development") {
  if (process.env.VERCEL_ENV === "production") {
    throw new Error("Development admin bootstrap refused in production.");
  }
} else if (bootstrapEnvironment === "production") {
  const expectedHost = process.env.ADMIN_BOOTSTRAP_EXPECTED_DATABASE_HOST;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const authUrl = process.env.BETTER_AUTH_URL;
  const actualHost = migrationUrl ? new URL(migrationUrl).hostname : "";

  if (
    process.env.VERCEL_ENV !== "production" ||
    !expectedHost ||
    expectedHost !== actualHost ||
    !siteUrl?.startsWith("https://") ||
    new URL(siteUrl).origin !== new URL(authUrl ?? "http://invalid").origin
  ) {
    throw new Error(
      "Production admin bootstrap refused. Confirm VERCEL_ENV, HTTPS auth origin, and the exact Neon host with ADMIN_BOOTSTRAP_EXPECTED_DATABASE_HOST.",
    );
  }
} else {
  throw new Error(
    "Admin bootstrap refused. Set ADMIN_BOOTSTRAP_CONFIRM to development or production after verifying the target database.",
  );
}

const env = serverEnvSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  RATE_LIMIT_HMAC_SECRET: process.env.RATE_LIMIT_HMAC_SECRET,
});
const client = neon(env.DATABASE_URL_UNPOOLED ?? env.DATABASE_URL);
const database = drizzle({ client, schema });

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(database, {
    provider: "pg",
    schema: {
      account: schema.account,
      session: schema.session,
      user: schema.user,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
  },
  advanced: {
    database: { generateId: "uuid" },
  },
  plugins: [admin({ adminRoles: ["admin"], defaultRole: "user" })],
});

import { defineConfig } from "drizzle-kit";

import { loadDatabaseCommandEnv } from "./src/config/load-env";

loadDatabaseCommandEnv();

const migrationUrl =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema/index.ts",
  out: "./drizzle",
  strict: true,
  verbose: true,
  ...(migrationUrl
    ? {
        dbCredentials: {
          url: migrationUrl,
        },
      }
    : {}),
});

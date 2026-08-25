import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { getServerEnv } from "@/config/env";
import * as schema from "@/server/db/schema";

type Database = ReturnType<typeof createDatabase>;

let database: Database | undefined;

function createDatabase(connectionString: string) {
  const client = neon(connectionString);
  return drizzle({ client, schema });
}

export function getDatabase(): Database {
  if (database) return database;

  database = createDatabase(getServerEnv().DATABASE_URL);
  return database;
}

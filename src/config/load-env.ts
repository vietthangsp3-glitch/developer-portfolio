import { config } from "dotenv";

export function loadDatabaseCommandEnv() {
  config({ path: ".env.local", quiet: true });
  config({ path: ".env", quiet: true });
}

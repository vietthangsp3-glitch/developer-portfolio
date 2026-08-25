import { defineConfig } from "@playwright/test";
import { config as loadEnv } from "dotenv";

import publicConfig from "./playwright.config";
import { assertAdminE2ETarget } from "./tests/e2e/target-guard";

loadEnv({ path: ".env.local", quiet: true });
assertAdminE2ETarget(process.env);

export default defineConfig({
  ...publicConfig,
  testMatch: "admin.spec.ts",
});

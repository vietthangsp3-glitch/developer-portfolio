import { parseProductionEnvironment } from "../src/config/production";
import { loadDatabaseCommandEnv } from "../src/config/load-env";

loadDatabaseCommandEnv();

try {
  const environment = parseProductionEnvironment();
  const database = new URL(environment.DATABASE_URL_UNPOOLED);

  console.info("Production environment preflight passed.");
  console.info(`Canonical/auth origin: ${environment.NEXT_PUBLIC_SITE_URL}`);
  console.info(
    `Neon target: ${database.hostname}/${database.pathname.slice(1)}`,
  );
  console.info("Cloudinary: configured");
  console.info("Resend: configured");
} catch (error) {
  console.error("Production environment preflight failed.");
  if (error instanceof Error) console.error(error.message);
  process.exitCode = 1;
}

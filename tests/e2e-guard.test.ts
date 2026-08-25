import { describe, expect, it } from "vitest";

import { assertAdminE2ETarget } from "./e2e/target-guard";

const validEnvironment = {
  E2E_TARGET_CONFIRM: "development",
  E2E_EXPECTED_DATABASE_HOST: "ep-portfolio-pooler.us-east-2.aws.neon.tech",
  E2E_ADMIN_EMAIL: "admin@example.com",
  E2E_ADMIN_PASSWORD: "not-a-real-password",
  DATABASE_URL:
    "postgresql://user:password@ep-portfolio-pooler.us-east-2.aws.neon.tech/neondb",
};

describe("authenticated E2E target guard", () => {
  it("accepts only an explicitly matched development Neon host", () => {
    expect(assertAdminE2ETarget(validEnvironment).databaseHost).toBe(
      validEnvironment.E2E_EXPECTED_DATABASE_HOST,
    );
  });

  it("refuses production, missing confirmation, and host mismatches", () => {
    expect(() =>
      assertAdminE2ETarget({ ...validEnvironment, VERCEL_ENV: "production" }),
    ).toThrow(/refuses/);
    expect(() =>
      assertAdminE2ETarget({
        ...validEnvironment,
        E2E_TARGET_CONFIRM: undefined,
      }),
    ).toThrow(/requires/);
    expect(() =>
      assertAdminE2ETarget({
        ...validEnvironment,
        E2E_EXPECTED_DATABASE_HOST: "another.neon.tech",
      }),
    ).toThrow(/does not match/);
  });
});

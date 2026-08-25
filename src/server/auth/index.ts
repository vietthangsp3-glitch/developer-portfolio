import "server-only";

import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";

import { getServerEnv } from "@/config/env";
import { siteConfig } from "@/config/site";
import { getDatabase } from "@/server/db";
import { account, session, user, verification } from "@/server/db/schema";
import { recordAuditEventBestEffort } from "@/server/audit";

const env = getServerEnv();
const configuredOrigins = [
  new URL(env.BETTER_AUTH_URL).origin,
  new URL(siteConfig.url).origin,
];

if (process.env.NODE_ENV !== "production") {
  configuredOrigins.push("http://localhost:3000", "http://127.0.0.1:3000");
}

export const auth = betterAuth({
  appName: siteConfig.name,
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [...new Set(configuredOrigins)],
  database: drizzleAdapter(getDatabase(), {
    provider: "pg",
    schema: { account, session, user, verification },
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
  },
  session: {
    expiresIn: 60 * 60 * 8,
    updateAge: 60 * 60,
    freshAge: 60 * 30,
  },
  advanced: {
    cookiePrefix: "portfolio-admin",
    ipAddress: {
      disableIpTracking: true,
    },
    database: {
      generateId: "uuid",
    },
    useSecureCookies: process.env.NODE_ENV === "production",
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    },
  },
  logger: {
    level: "error",
  },
  plugins: [
    admin({
      adminRoles: ["admin"],
      defaultRole: "user",
    }),
    nextCookies(),
  ],
  databaseHooks: {
    session: {
      create: {
        after: async (createdSession) => {
          await recordAuditEventBestEffort({
            actorUserId: createdSession.userId,
            action: "auth.login.succeeded",
            entityType: "auth_session",
            entityId: createdSession.id,
            metadata: {},
          });
        },
      },
    },
  },
});

export type AuthSession = typeof auth.$Infer.Session;

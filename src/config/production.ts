import { z } from "zod";

import { serverEnvSchema } from "@/config/env.schema";
import { safeHttpUrlSchema } from "@/lib/validation";

function normalizedNeonHost(value: string) {
  return new URL(value).hostname.replace("-pooler.", ".");
}

export const productionEnvironmentSchema = serverEnvSchema
  .safeExtend({
    NEXT_PUBLIC_SITE_URL: safeHttpUrlSchema,
    VERCEL_ENV: z.literal("production"),
    CLOUDINARY_CLOUD_NAME: z.string().trim().min(1),
    CLOUDINARY_API_KEY: z.string().trim().min(1),
    CLOUDINARY_API_SECRET: z.string().trim().min(1),
    RESEND_API_KEY: z.string().trim().min(1),
    INQUIRY_NOTIFICATION_EMAIL: z.string().trim().toLowerCase().email(),
    INQUIRY_FROM_EMAIL: z.string().trim().toLowerCase().email(),
    DATABASE_URL_UNPOOLED: z.string().trim().min(1),
  })
  .superRefine((value, context) => {
    const siteUrl = new URL(value.NEXT_PUBLIC_SITE_URL);
    const authUrl = new URL(value.BETTER_AUTH_URL);
    const pooledUrl = new URL(value.DATABASE_URL);
    const directUrl = new URL(value.DATABASE_URL_UNPOOLED);

    if (siteUrl.protocol !== "https:") {
      context.addIssue({
        code: "custom",
        message: "Production site URL must use HTTPS.",
        path: ["NEXT_PUBLIC_SITE_URL"],
      });
    }

    if (siteUrl.origin !== authUrl.origin) {
      context.addIssue({
        code: "custom",
        message: "BETTER_AUTH_URL must exactly match the production origin.",
        path: ["BETTER_AUTH_URL"],
      });
    }

    if (
      !pooledUrl.hostname.endsWith(".neon.tech") ||
      !directUrl.hostname.endsWith(".neon.tech")
    ) {
      context.addIssue({
        code: "custom",
        message: "Production database URLs must target Neon.",
        path: ["DATABASE_URL"],
      });
    }

    if (
      normalizedNeonHost(value.DATABASE_URL) !==
        normalizedNeonHost(value.DATABASE_URL_UNPOOLED) ||
      pooledUrl.pathname !== directUrl.pathname ||
      pooledUrl.username !== directUrl.username
    ) {
      context.addIssue({
        code: "custom",
        message:
          "Pooled and direct database URLs must identify the same Neon database.",
        path: ["DATABASE_URL_UNPOOLED"],
      });
    }

    if (value.BETTER_AUTH_SECRET === value.RATE_LIMIT_HMAC_SECRET) {
      context.addIssue({
        code: "custom",
        message: "Authentication and rate-limit secrets must be distinct.",
        path: ["RATE_LIMIT_HMAC_SECRET"],
      });
    }
  });

export type ProductionEnvironment = z.infer<typeof productionEnvironmentSchema>;

export function parseProductionEnvironment(
  environment: NodeJS.ProcessEnv = process.env,
) {
  return productionEnvironmentSchema.parse({
    NEXT_PUBLIC_SITE_URL: environment.NEXT_PUBLIC_SITE_URL,
    VERCEL_ENV: environment.VERCEL_ENV,
    DATABASE_URL: environment.DATABASE_URL,
    DATABASE_URL_UNPOOLED: environment.DATABASE_URL_UNPOOLED,
    BETTER_AUTH_URL: environment.BETTER_AUTH_URL,
    BETTER_AUTH_SECRET: environment.BETTER_AUTH_SECRET,
    RATE_LIMIT_HMAC_SECRET: environment.RATE_LIMIT_HMAC_SECRET,
    CLOUDINARY_CLOUD_NAME: environment.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: environment.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: environment.CLOUDINARY_API_SECRET,
    RESEND_API_KEY: environment.RESEND_API_KEY,
    INQUIRY_NOTIFICATION_EMAIL: environment.INQUIRY_NOTIFICATION_EMAIL,
    INQUIRY_FROM_EMAIL: environment.INQUIRY_FROM_EMAIL,
  });
}

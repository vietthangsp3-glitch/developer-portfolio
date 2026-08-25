import { z } from "zod";

import { safeHttpUrlSchema } from "@/lib/validation";

const postgresUrlSchema = z
  .string()
  .trim()
  .min(1)
  .max(4_096)
  .refine((value) => {
    try {
      const protocol = new URL(value).protocol;
      return protocol === "postgres:" || protocol === "postgresql:";
    } catch {
      return false;
    }
  }, "Expected a PostgreSQL connection URL.");

const optionalSecretSchema = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().trim().min(1).optional(),
);

const optionalEmailSchema = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().trim().toLowerCase().email().optional(),
);

export const serverEnvSchema = z
  .object({
    DATABASE_URL: postgresUrlSchema,
    DATABASE_URL_UNPOOLED: postgresUrlSchema.optional(),
    BETTER_AUTH_URL: safeHttpUrlSchema.refine(
      (value) => new URL(value).pathname === "/",
      "BETTER_AUTH_URL must be an application origin without a path.",
    ),
    BETTER_AUTH_SECRET: z.string().min(32).max(512),
    RATE_LIMIT_HMAC_SECRET: z.string().min(32).max(512),
    CLOUDINARY_CLOUD_NAME: z.string().trim().min(1).optional(),
    CLOUDINARY_API_KEY: z.string().trim().min(1).optional(),
    CLOUDINARY_API_SECRET: z.string().trim().min(1).optional(),
    RESEND_API_KEY: optionalSecretSchema,
    INQUIRY_NOTIFICATION_EMAIL: optionalEmailSchema,
    INQUIRY_FROM_EMAIL: optionalEmailSchema,
  })
  .superRefine((value, context) => {
    const cloudinary = [
      value.CLOUDINARY_CLOUD_NAME,
      value.CLOUDINARY_API_KEY,
      value.CLOUDINARY_API_SECRET,
    ];
    if (cloudinary.some(Boolean) && !cloudinary.every(Boolean)) {
      context.addIssue({
        code: "custom",
        message: "Configure all Cloudinary variables or leave all three unset.",
        path: ["CLOUDINARY_CLOUD_NAME"],
      });
    }

    const email = [
      value.RESEND_API_KEY,
      value.INQUIRY_NOTIFICATION_EMAIL,
      value.INQUIRY_FROM_EMAIL,
    ];
    if (email.some(Boolean) && !email.every(Boolean)) {
      context.addIssue({
        code: "custom",
        message:
          "Configure all inquiry email variables or leave all three unset.",
        path: ["RESEND_API_KEY"],
      });
    }
  });

export const migrationEnvSchema = z
  .object({
    DATABASE_URL: postgresUrlSchema.optional(),
    DATABASE_URL_UNPOOLED: postgresUrlSchema.optional(),
  })
  .refine(
    (value) => value.DATABASE_URL_UNPOOLED ?? value.DATABASE_URL,
    "DATABASE_URL_UNPOOLED or DATABASE_URL is required.",
  );

export type ServerEnv = z.infer<typeof serverEnvSchema>;

import { z } from "zod";

const localHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);

export const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lowercase URL-safe slug.");

export const safeHttpUrlSchema = z
  .string()
  .trim()
  .max(2_048)
  .url()
  .refine((value) => {
    try {
      const url = new URL(value);

      return (
        url.protocol === "https:" ||
        (url.protocol === "http:" && localHosts.has(url.hostname))
      );
    } catch {
      return false;
    }
  }, "Use HTTPS, or HTTP only for a local development URL.");

export const safeMediaUrlSchema = z.union([
  safeHttpUrlSchema,
  z
    .string()
    .trim()
    .max(2_048)
    .regex(/^\/(?!\/)[^\s]*$/, "Use a root-relative path or a safe HTTP URL."),
]);

export const optionalSafeHttpUrlSchema = z
  .union([safeHttpUrlSchema, z.literal(""), z.null()])
  .transform((value) => (value === "" ? null : value));

export const plainTextSchema = (maximum: number) =>
  z.string().trim().min(1).max(maximum);

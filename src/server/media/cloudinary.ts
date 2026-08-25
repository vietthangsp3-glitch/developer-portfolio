import "server-only";

import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { z } from "zod";

import { getServerEnv } from "@/config/env";
import { safeHttpUrlSchema } from "@/lib/validation";

export const cloudinaryFolder = "portfolio/projects";
export const maxMediaBytes = 10 * 1024 * 1024;
export const allowedMediaFormats = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "avif",
] as const;

export type MediaReferenceCounts = {
  projectMedia: number;
  thumbnail: number;
  hero: number;
  testimonial: number;
};

export function getMediaReferenceTotal(value: MediaReferenceCounts) {
  return value.projectMedia + value.thumbnail + value.hero + value.testimonial;
}

function config() {
  const env = getServerEnv();
  if (
    !env.CLOUDINARY_CLOUD_NAME ||
    !env.CLOUDINARY_API_KEY ||
    !env.CLOUDINARY_API_SECRET
  ) {
    throw new Error("Cloudinary is not configured.");
  }
  return {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET,
  };
}

export function isCloudinaryConfigured() {
  const env = getServerEnv();
  return Boolean(
    env.CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET,
  );
}

export function createCloudinarySignature(
  parameters: Record<string, string | number>,
  secret: string,
) {
  const payload = Object.entries(parameters)
    .filter(([, value]) => value !== "")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  return createHash("sha1").update(`${payload}${secret}`, "utf8").digest("hex");
}

export function createSignedUploadAuthorization() {
  const { cloudName, apiKey, apiSecret } = config();
  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = randomUUID();
  const parameters = {
    folder: cloudinaryFolder,
    public_id: publicId,
    timestamp,
  };
  return {
    cloudName,
    apiKey,
    ...parameters,
    signature: createCloudinarySignature(parameters, apiSecret),
    maxBytes: maxMediaBytes,
    allowedFormats: allowedMediaFormats,
  };
}

export const cloudinaryUploadResponseSchema = z.object({
  public_id: z
    .string()
    .min(1)
    .max(500)
    .refine(
      (value) => value.startsWith(`${cloudinaryFolder}/`),
      "Unexpected media folder.",
    ),
  secure_url: safeHttpUrlSchema.refine(
    (value) => new URL(value).hostname === "res.cloudinary.com",
    "Unexpected media host.",
  ),
  width: z.number().int().min(600).max(6000),
  height: z.number().int().min(600).max(6000),
  format: z.enum(allowedMediaFormats),
  bytes: z.number().int().positive().max(maxMediaBytes),
  resource_type: z.literal("image"),
  version: z.number().int().positive(),
  signature: z.string().regex(/^[a-f0-9]{40}$/),
});

export type CloudinaryUploadResponse = z.infer<
  typeof cloudinaryUploadResponseSchema
>;

export function verifyCloudinaryUploadResponse(input: unknown) {
  const value = cloudinaryUploadResponseSchema.parse(input);
  const expected = createCloudinarySignature(
    { public_id: value.public_id, version: value.version },
    config().apiSecret,
  );
  const receivedBuffer = Buffer.from(value.signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    throw new Error("Cloudinary response signature is invalid.");
  }
  return value;
}

export async function destroyCloudinaryAsset(publicId: string) {
  if (!publicId.startsWith(`${cloudinaryFolder}/`))
    throw new Error("Refusing to delete media outside the controlled folder.");
  const { cloudName, apiKey, apiSecret } = config();
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createCloudinarySignature(
    { public_id: publicId, timestamp },
    apiSecret,
  );
  const body = new URLSearchParams({
    public_id: publicId,
    timestamp: String(timestamp),
    api_key: apiKey,
    signature,
  });
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
    { method: "POST", body, cache: "no-store" },
  );
  if (!response.ok) throw new Error("Cloudinary deletion failed.");
  const result = z
    .object({ result: z.enum(["ok", "not found"]) })
    .parse(await response.json());
  return result.result;
}

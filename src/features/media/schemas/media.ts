import { z } from "zod";

import { plainTextSchema, safeMediaUrlSchema } from "@/lib/validation";

export const mediaInputSchema = z.object({
  provider: plainTextSchema(40),
  providerKey: plainTextSchema(500),
  url: safeMediaUrlSchema,
  width: z.number().int().positive().max(12_000),
  height: z.number().int().positive().max(12_000),
  format: plainTextSchema(32),
  bytes: z.number().int().nonnegative().max(100_000_000).nullable().optional(),
  altText: z.string().trim().max(300),
  folder: z.string().trim().max(300).nullable().optional(),
});

export type MediaInput = z.infer<typeof mediaInputSchema>;

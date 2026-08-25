import { z } from "zod";

import { plainTextSchema, slugSchema } from "@/lib/validation";

export const serviceInputSchema = z.object({
  title: plainTextSchema(160),
  slug: slugSchema,
  summary: plainTextSchema(500),
  description: plainTextSchema(5_000),
  sortOrder: z.number().int().min(0).max(100_000),
  published: z.boolean(),
  seoTitle: z.string().trim().max(160).nullable().optional(),
  seoDescription: z.string().trim().max(320).nullable().optional(),
});

export type ServiceInput = z.infer<typeof serviceInputSchema>;

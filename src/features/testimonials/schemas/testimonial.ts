import { z } from "zod";

import { plainTextSchema } from "@/lib/validation";

export const testimonialInputSchema = z.object({
  personName: plainTextSchema(160),
  role: plainTextSchema(160),
  company: plainTextSchema(160),
  quote: plainTextSchema(2_000),
  avatarMediaId: z.string().uuid().nullable().optional(),
  published: z.boolean(),
  isDemo: z.boolean().default(false),
  sortOrder: z.number().int().min(0).max(100_000),
});

export type TestimonialInput = z.infer<typeof testimonialInputSchema>;

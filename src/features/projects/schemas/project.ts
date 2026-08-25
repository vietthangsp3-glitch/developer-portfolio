import { z } from "zod";

import {
  optionalSafeHttpUrlSchema,
  plainTextSchema,
  safeMediaUrlSchema,
  slugSchema,
} from "@/lib/validation";

export const projectStatusSchema = z.enum(["draft", "published", "archived"]);

export const projectImageSchema = z.object({
  src: safeMediaUrlSchema,
  alt: z.string().trim().max(300),
  width: z.number().int().positive().max(12_000),
  height: z.number().int().positive().max(12_000),
});

export const projectStatSchema = z.object({
  value: plainTextSchema(40),
  label: plainTextSchema(120),
});

export const caseStudyBlockSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("narrative"),
    eyebrow: plainTextSchema(80),
    title: plainTextSchema(180),
    body: z.array(plainTextSchema(2_000)).min(1).max(12),
  }),
  z.object({
    type: z.literal("image"),
    image: projectImageSchema,
    caption: z.string().trim().max(300).optional(),
  }),
  z.object({
    type: z.literal("quote"),
    quote: plainTextSchema(1_000),
    attribution: plainTextSchema(160),
  }),
  z.object({
    type: z.literal("stats"),
    items: z.array(projectStatSchema).min(1).max(8),
  }),
  z.object({
    type: z.literal("technical-summary"),
    title: plainTextSchema(180),
    body: plainTextSchema(2_000),
    items: z.array(plainTextSchema(180)).min(1).max(16),
  }),
]);

export const caseStudyContentSchema = z.object({
  version: z.literal(1),
  blocks: z.array(caseStudyBlockSchema).max(80),
});

export const projectInputSchema = z
  .object({
    title: plainTextSchema(160),
    slug: slugSchema,
    subtitle: z.string().trim().max(240).nullable().optional(),
    summary: plainTextSchema(500),
    description: z.string().trim().max(5_000).nullable().optional(),
    category: plainTextSchema(120),
    role: plainTextSchema(240),
    year: z.number().int().min(1900).max(2200),
    status: projectStatusSchema,
    featuredRank: z.number().int().min(0).nullable().optional(),
    sortOrder: z.number().int().min(0).max(100_000),
    thumbnailMediaId: z.string().uuid().nullable().optional(),
    heroMediaId: z.string().uuid().nullable().optional(),
    liveUrl: optionalSafeHttpUrlSchema.optional(),
    repositoryUrl: optionalSafeHttpUrlSchema.optional(),
    caseStudyContent: caseStudyContentSchema,
    seoTitle: z.string().trim().max(160).nullable().optional(),
    seoDescription: z.string().trim().max(320).nullable().optional(),
    publishedAt: z.date().nullable().optional(),
  })
  .superRefine((value, context) => {
    if (value.status === "published" && !value.publishedAt) {
      context.addIssue({
        code: "custom",
        message: "Published projects require a publication timestamp.",
        path: ["publishedAt"],
      });
    }
  });

export type ProjectStatus = z.infer<typeof projectStatusSchema>;
export type ProjectImage = z.infer<typeof projectImageSchema>;
export type ProjectStat = z.infer<typeof projectStatSchema>;
export type CaseStudyBlock = z.infer<typeof caseStudyBlockSchema>;
export type CaseStudyContent = z.infer<typeof caseStudyContentSchema>;
export type ProjectInput = z.infer<typeof projectInputSchema>;

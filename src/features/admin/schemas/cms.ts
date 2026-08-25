import { z } from "zod";

import { inquiryStatusSchema } from "@/features/inquiries/schemas/inquiry";
import { caseStudyContentSchema } from "@/features/projects/schemas/project";
import { serviceInputSchema } from "@/features/services/schemas/service";
import { siteSettingsInputSchema } from "@/features/site-settings/schemas/site-settings";
import { testimonialInputSchema } from "@/features/testimonials/schemas/testimonial";
import {
  entityIdSchema,
  optionalSafeHttpUrlSchema,
  plainTextSchema,
  slugSchema,
} from "@/lib/validation";

const nullableText = (maximum: number) =>
  z
    .string()
    .trim()
    .max(maximum)
    .transform((value) => value || null);

const nullableUuid = z
  .string()
  .trim()
  .transform((value) => value || null)
  .pipe(z.string().uuid().nullable());

export const projectAdminInputSchema = z
  .object({
    title: plainTextSchema(160),
    slug: slugSchema,
    subtitle: nullableText(240),
    summary: plainTextSchema(500),
    description: nullableText(5_000),
    category: plainTextSchema(120),
    role: plainTextSchema(240),
    year: z.coerce.number().int().min(1900).max(2200),
    status: z.enum(["draft", "published", "archived"]),
    featured: z.boolean(),
    featuredRank: z.coerce.number().int().min(0).max(100_000),
    sortOrder: z.coerce.number().int().min(0).max(100_000),
    thumbnailMediaId: nullableUuid,
    heroMediaId: nullableUuid,
    liveUrl: optionalSafeHttpUrlSchema,
    repositoryUrl: optionalSafeHttpUrlSchema,
    seoTitle: nullableText(160),
    seoDescription: nullableText(320),
    technologies: z.array(plainTextSchema(100)).max(30),
    mediaRelations: z
      .array(
        z.object({
          mediaId: z.string().uuid(),
          role: z.enum(["cover", "hero", "gallery", "case_study"]),
          altTextOverride: nullableText(300),
          caption: nullableText(500),
        }),
      )
      .max(40),
    caseStudyContent: caseStudyContentSchema,
  })
  .superRefine((value, context) => {
    if (
      value.status === "published" &&
      (!value.thumbnailMediaId || !value.heroMediaId)
    ) {
      context.addIssue({
        code: "custom",
        message: "Published projects require thumbnail and hero media.",
        path: ["status"],
      });
    }
    if (value.status === "published") {
      value.caseStudyContent.blocks.forEach((block, index) => {
        if (block.type === "image" && block.image.alt.trim().length === 0) {
          context.addIssue({
            code: "custom",
            message: "Published case-study images require meaningful alt text.",
            path: ["caseStudyContent", "blocks", index, "image", "alt"],
          });
        }
      });
    }
  });

export const projectFormSchema = projectAdminInputSchema.extend({
  id: z.string().uuid().optional(),
});

export const serviceFormSchema = serviceInputSchema.extend({
  id: z.string().uuid().optional(),
});

export const testimonialFormSchema = testimonialInputSchema.extend({
  id: z.string().uuid().optional(),
});

export const settingsFormSchema = siteSettingsInputSchema;

export const inquiryStatusFormSchema = z.object({
  id: z.string().uuid(),
  status: inquiryStatusSchema,
});

export { entityIdSchema };

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function parseJsonField(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return undefined;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return undefined;
  }
}

export function parseCsv(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return [];
  return Array.from(
    new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

export function parseIdList(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseSocialLinks(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separator = line.indexOf("|");
      return separator < 0
        ? { label: "Website", url: line }
        : {
            label: line.slice(0, separator).trim(),
            url: line.slice(separator + 1).trim(),
          };
    });
}

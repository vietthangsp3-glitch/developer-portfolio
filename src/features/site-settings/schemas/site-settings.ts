import { z } from "zod";

import { plainTextSchema, safeHttpUrlSchema } from "@/lib/validation";

export const socialLinkSchema = z.object({
  label: plainTextSchema(60),
  url: safeHttpUrlSchema,
});

export const siteSettingsInputSchema = z.object({
  siteName: plainTextSchema(120),
  siteTitle: plainTextSchema(180),
  siteDescription: plainTextSchema(500),
  availability: plainTextSchema(240),
  contactEmail: z.string().trim().toLowerCase().email().max(320),
  socialLinks: z.array(socialLinkSchema).max(12),
  seoTitle: plainTextSchema(160),
  seoDescription: plainTextSchema(320),
});

export type SocialLink = z.infer<typeof socialLinkSchema>;
export type SiteSettingsInput = z.infer<typeof siteSettingsInputSchema>;

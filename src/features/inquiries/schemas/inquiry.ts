import { z } from "zod";

import { plainTextSchema } from "@/lib/validation";

export const inquiryStatusSchema = z.enum([
  "received",
  "contacted",
  "archived",
]);
export const emailDeliveryStatusSchema = z.enum([
  "not_requested",
  "pending",
  "sent",
  "failed",
]);

export const inquiryInputSchema = z.object({
  name: plainTextSchema(160),
  email: z.string().trim().toLowerCase().email().max(320),
  company: z.string().trim().max(160).nullable().optional(),
  projectType: plainTextSchema(120),
  budget: z.string().trim().max(120).nullable().optional(),
  message: plainTextSchema(8_000),
  source: z.string().trim().min(1).max(80).default("website"),
});

const nullableOptionalText = (maximum: number) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? null : value,
    z.string().trim().max(maximum).nullable().optional(),
  );

export const inquiryFormSchema = inquiryInputSchema
  .omit({ source: true })
  .extend({
    company: nullableOptionalText(160),
    budget: nullableOptionalText(120),
    website: z.string().trim().max(500).default(""),
  });

export type InquiryInput = z.infer<typeof inquiryInputSchema>;
export type InquiryFormInput = z.infer<typeof inquiryFormSchema>;

import { pgEnum } from "drizzle-orm/pg-core";

export const projectStatus = pgEnum("project_status", [
  "draft",
  "published",
  "archived",
]);

export const projectMediaRole = pgEnum("project_media_role", [
  "cover",
  "hero",
  "gallery",
  "case_study",
]);

export const inquiryStatus = pgEnum("inquiry_status", [
  "received",
  "contacted",
  "archived",
]);

export const emailDeliveryStatus = pgEnum("email_delivery_status", [
  "not_requested",
  "pending",
  "sent",
  "failed",
]);

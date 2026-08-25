import "server-only";

import { Resend } from "resend";

import { getServerEnv } from "@/config/env";
import type { InquiryInput } from "@/features/inquiries/schemas/inquiry";

export type InquiryEmailResult = { id: string };

export function isInquiryEmailConfigured() {
  const env = getServerEnv();
  return Boolean(
    env.RESEND_API_KEY &&
    env.INQUIRY_NOTIFICATION_EMAIL &&
    env.INQUIRY_FROM_EMAIL,
  );
}

export async function sendInquiryNotification(
  inquiry: InquiryInput,
): Promise<InquiryEmailResult> {
  const env = getServerEnv();
  if (
    !env.RESEND_API_KEY ||
    !env.INQUIRY_NOTIFICATION_EMAIL ||
    !env.INQUIRY_FROM_EMAIL
  ) {
    throw new Error("Inquiry email is not configured.");
  }

  const resend = new Resend(env.RESEND_API_KEY);
  const optionalLines = [
    inquiry.company ? `Company: ${inquiry.company}` : null,
    inquiry.budget ? `Budget: ${inquiry.budget}` : null,
  ].filter(Boolean);
  const text = [
    "A new portfolio inquiry was stored.",
    "",
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    ...optionalLines,
    `Project type: ${inquiry.projectType}`,
    "",
    "Message:",
    inquiry.message,
  ].join("\n");

  const { data, error } = await resend.emails.send({
    from: env.INQUIRY_FROM_EMAIL,
    to: [env.INQUIRY_NOTIFICATION_EMAIL],
    replyTo: inquiry.email,
    subject: `Portfolio inquiry — ${inquiry.projectType.replace(/[\r\n]+/g, " ")}`,
    text,
  });

  if (error || !data?.id) throw new Error("Resend did not accept the email.");
  return { id: data.id };
}

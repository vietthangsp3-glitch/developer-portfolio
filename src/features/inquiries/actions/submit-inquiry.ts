"use server";

import { headers } from "next/headers";

import type { InquiryActionState } from "@/features/inquiries/action-state";
import {
  inquiryFormSchema,
  inquiryInputSchema,
} from "@/features/inquiries/schemas/inquiry";
import { submitInquiry } from "@/features/inquiries/server/submission";
import {
  createInquiry,
  updateInquiryEmailDelivery,
} from "@/server/dal/inquiries";
import {
  isInquiryEmailConfigured,
  sendInquiryNotification,
} from "@/server/email/resend";
import { consumeRateLimit } from "@/server/rate-limit";
import { getContactIdentifierHash } from "@/server/security/request-identity";

const RATE_LIMIT = 4;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1_000;

export async function submitInquiryAction(
  _state: InquiryActionState,
  formData: FormData,
): Promise<InquiryActionState> {
  const parsed = inquiryFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    company: formData.get("company"),
    projectType: formData.get("projectType"),
    budget: formData.get("budget"),
    message: formData.get("message"),
    website: formData.get("website"),
  });

  if (!parsed.success) {
    return {
      status: "validation_error",
      message: "Review the highlighted fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // A filled honeypot receives the same public success response as a genuine
  // submission, without consuming storage or revealing the spam decision.
  if (parsed.data.website) {
    return {
      status: "success",
      message: "Thanks — your inquiry has been received.",
    };
  }

  const input = inquiryInputSchema.parse({
    ...parsed.data,
    website: undefined,
    source: "website",
  });

  try {
    const identifierHash = getContactIdentifierHash(await headers());
    const emailConfigured = isInquiryEmailConfigured();
    const result = await submitInquiry(input, identifierHash, {
      consumeRateLimit: () =>
        consumeRateLimit({
          scope: "contact-submit",
          identifierHash,
          limit: RATE_LIMIT,
          windowMs: RATE_LIMIT_WINDOW_MS,
        }),
      createInquiry,
      sendNotification: emailConfigured ? sendInquiryNotification : undefined,
      updateEmailDelivery: updateInquiryEmailDelivery,
    });

    if (result.status === "rate_limited") {
      return {
        status: "rate_limited",
        message:
          "Too many inquiries were sent recently. Please wait a few minutes and try again.",
      };
    }

    if (result.status === "storage_failed") {
      return {
        status: "error",
        message:
          "Your inquiry could not be saved right now. Please try again or use the direct email address.",
      };
    }

    return {
      status: "success",
      message:
        result.delivery === "failed"
          ? "Thanks — your inquiry is safely stored. Email notification is delayed, but no action is needed from you."
          : "Thanks — your inquiry has been received. I’ll review it and reply within two working days.",
    };
  } catch (error) {
    console.error("Inquiry submission failed", {
      errorType: error instanceof Error ? error.name : "UnknownError",
    });
    return {
      status: "error",
      message:
        "The form is temporarily unavailable. Please try again or use the direct email address.",
    };
  }
}

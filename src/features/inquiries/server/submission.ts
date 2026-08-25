import "server-only";

import type { InquiryInput } from "@/features/inquiries/schemas/inquiry";

type SubmissionDependencies = {
  consumeRateLimit: () => Promise<{ allowed: boolean }>;
  createInquiry: (
    input: InquiryInput,
    options: {
      emailDeliveryStatus: "not_requested" | "pending";
      networkIdentifierHash: string;
    },
  ) => Promise<{ id: string }>;
  sendNotification?: (input: InquiryInput) => Promise<{ id: string }>;
  updateEmailDelivery: (
    id: string,
    status: "sent" | "failed",
    providerMessageId?: string,
  ) => Promise<void>;
};

export type InquirySubmissionResult =
  | { status: "success"; delivery: "sent" | "failed" | "not_requested" }
  | { status: "rate_limited" }
  | { status: "storage_failed" };

export async function submitInquiry(
  input: InquiryInput,
  networkIdentifierHash: string,
  dependencies: SubmissionDependencies,
): Promise<InquirySubmissionResult> {
  const rateLimit = await dependencies.consumeRateLimit();
  if (!rateLimit.allowed) return { status: "rate_limited" };

  let inquiry: { id: string };
  try {
    inquiry = await dependencies.createInquiry(input, {
      emailDeliveryStatus: dependencies.sendNotification
        ? "pending"
        : "not_requested",
      networkIdentifierHash,
    });
  } catch {
    return { status: "storage_failed" };
  }

  if (!dependencies.sendNotification) {
    return { status: "success", delivery: "not_requested" };
  }

  try {
    const email = await dependencies.sendNotification(input);
    await dependencies.updateEmailDelivery(inquiry.id, "sent", email.id);
    return { status: "success", delivery: "sent" };
  } catch (error) {
    console.error("Inquiry notification failed", {
      inquiryId: inquiry.id,
      errorType: error instanceof Error ? error.name : "UnknownError",
    });
    try {
      await dependencies.updateEmailDelivery(inquiry.id, "failed");
    } catch {
      // The authoritative inquiry is already stored. A later admin review can
      // reconcile a stale pending delivery state.
    }
    return { status: "success", delivery: "failed" };
  }
}

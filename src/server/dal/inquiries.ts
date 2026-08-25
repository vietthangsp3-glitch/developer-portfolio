import "server-only";

import { eq } from "drizzle-orm";

import type { InquiryInput } from "@/features/inquiries/schemas/inquiry";
import { getDatabase } from "@/server/db";
import { runDatabaseOperation } from "@/server/db/errors";
import { inquiries } from "@/server/db/schema";

export async function createInquiry(
  input: InquiryInput,
  options: {
    emailDeliveryStatus: "not_requested" | "pending";
    networkIdentifierHash: string;
  },
) {
  return runDatabaseOperation("createInquiry", async () => {
    const [row] = await getDatabase()
      .insert(inquiries)
      .values({
        ...input,
        emailDeliveryStatus: options.emailDeliveryStatus,
        networkIdentifierHash: options.networkIdentifierHash,
      })
      .returning({ id: inquiries.id });

    if (!row) throw new Error("Inquiry insert returned no row.");
    return row;
  });
}

export async function updateInquiryEmailDelivery(
  id: string,
  status: "pending" | "sent" | "failed",
  emailProviderMessageId?: string,
) {
  return runDatabaseOperation("updateInquiryEmailDelivery", async () => {
    await getDatabase()
      .update(inquiries)
      .set({
        emailDeliveryStatus: status,
        emailProviderMessageId: emailProviderMessageId ?? null,
        updatedAt: new Date(),
      })
      .where(eq(inquiries.id, id));
  });
}

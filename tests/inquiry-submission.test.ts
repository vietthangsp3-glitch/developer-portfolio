import { describe, expect, it, vi } from "vitest";

import { submitInquiry } from "@/features/inquiries/server/submission";

const input = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  company: "Analytical Engines",
  projectType: "Web application",
  budget: "$10,000–$25,000",
  message: "A sufficiently detailed project inquiry.",
  source: "website",
};

function dependencies() {
  return {
    consumeRateLimit: vi.fn().mockResolvedValue({ allowed: true }),
    createInquiry: vi.fn().mockResolvedValue({ id: "inquiry-id" }),
    sendNotification: vi.fn().mockResolvedValue({ id: "email-id" }),
    updateEmailDelivery: vi.fn().mockResolvedValue(undefined),
  };
}

describe("inquiry submission service", () => {
  it("stores before notifying and records the provider message ID", async () => {
    const calls: string[] = [];
    const deps = dependencies();
    deps.createInquiry.mockImplementation(async () => {
      calls.push("store");
      return { id: "inquiry-id" };
    });
    deps.sendNotification.mockImplementation(async () => {
      calls.push("email");
      return { id: "email-id" };
    });

    await expect(submitInquiry(input, "a".repeat(64), deps)).resolves.toEqual({
      status: "success",
      delivery: "sent",
    });
    expect(calls).toEqual(["store", "email"]);
    expect(deps.createInquiry).toHaveBeenCalledWith(input, {
      emailDeliveryStatus: "pending",
      networkIdentifierHash: "a".repeat(64),
    });
    expect(deps.updateEmailDelivery).toHaveBeenCalledWith(
      "inquiry-id",
      "sent",
      "email-id",
    );
  });

  it("never sends email when the database insert fails", async () => {
    const deps = dependencies();
    deps.createInquiry.mockRejectedValue(new Error("database unavailable"));

    await expect(submitInquiry(input, "a".repeat(64), deps)).resolves.toEqual({
      status: "storage_failed",
    });
    expect(deps.sendNotification).not.toHaveBeenCalled();
  });

  it("retains the inquiry and marks delivery failed when Resend fails", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const deps = dependencies();
    deps.sendNotification.mockRejectedValue(new Error("provider unavailable"));

    await expect(submitInquiry(input, "a".repeat(64), deps)).resolves.toEqual({
      status: "success",
      delivery: "failed",
    });
    expect(deps.updateEmailDelivery).toHaveBeenCalledWith(
      "inquiry-id",
      "failed",
    );
    expect(log).toHaveBeenCalledWith(
      "Inquiry notification failed",
      expect.objectContaining({ inquiryId: "inquiry-id" }),
    );
    log.mockRestore();
  });

  it("does not write when the atomic rate limit denies the request", async () => {
    const deps = dependencies();
    deps.consumeRateLimit.mockResolvedValue({ allowed: false });

    await expect(submitInquiry(input, "a".repeat(64), deps)).resolves.toEqual({
      status: "rate_limited",
    });
    expect(deps.createInquiry).not.toHaveBeenCalled();
    expect(deps.sendNotification).not.toHaveBeenCalled();
  });

  it("stores without requesting email when delivery is not configured", async () => {
    const deps = dependencies();
    const withoutEmail = {
      consumeRateLimit: deps.consumeRateLimit,
      createInquiry: deps.createInquiry,
      updateEmailDelivery: deps.updateEmailDelivery,
    };

    await expect(
      submitInquiry(input, "a".repeat(64), withoutEmail),
    ).resolves.toEqual({ status: "success", delivery: "not_requested" });
    expect(deps.createInquiry).toHaveBeenCalledWith(input, {
      emailDeliveryStatus: "not_requested",
      networkIdentifierHash: "a".repeat(64),
    });
  });
});

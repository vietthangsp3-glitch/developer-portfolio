import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  assertAdmin: vi.fn(),
  deleteUnreferencedAdminMedia: vi.fn(),
  destroyCloudinaryAsset: vi.fn(),
  recordAuditEvent: vi.fn(),
  restoreAdminMediaRow: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), updateTag: vi.fn() }));
vi.mock("@/server/auth/session", () => ({ assertAdmin: mocks.assertAdmin }));
vi.mock("@/server/audit", () => ({
  recordAuditEvent: mocks.recordAuditEvent,
}));
vi.mock("@/server/dal/cms", () => ({
  createAdminMedia: vi.fn(),
  deleteUnreferencedAdminMedia: mocks.deleteUnreferencedAdminMedia,
  restoreAdminMediaRow: mocks.restoreAdminMediaRow,
  updateAdminMediaAlt: vi.fn(),
}));
vi.mock("@/server/media/cloudinary", () => ({
  destroyCloudinaryAsset: mocks.destroyCloudinaryAsset,
  verifyCloudinaryUploadResponse: vi.fn(),
}));

import { deleteMediaAction } from "@/features/admin/actions/media";

const media = {
  id: "bd2ef06f-7e49-4fac-a6cb-59a33bb083e8",
  provider: "cloudinary",
  providerKey: "portfolio/projects/test",
  url: "https://res.cloudinary.com/demo/image/upload/test.webp",
  width: 1200,
  height: 800,
  format: "webp",
  bytes: 10_000,
  altText: "Test image",
  folder: "portfolio/projects",
  createdByUserId: null,
  createdAt: new Date("2026-08-25T00:00:00.000Z"),
  updatedAt: new Date("2026-08-25T00:00:00.000Z"),
};

function deletionForm() {
  const formData = new FormData();
  formData.set("id", media.id);
  formData.set("confirm", "delete");
  return formData;
}

describe("media deletion recovery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.assertAdmin.mockResolvedValue({ user: { id: crypto.randomUUID() } });
  });

  it("does not touch the provider when the atomic DB claim finds references", async () => {
    mocks.deleteUnreferencedAdminMedia.mockResolvedValue(null);
    await deleteMediaAction(deletionForm());
    expect(mocks.destroyCloudinaryAsset).not.toHaveBeenCalled();
  });

  it("restores authoritative DB metadata when provider deletion fails", async () => {
    mocks.deleteUnreferencedAdminMedia.mockResolvedValue(media);
    mocks.destroyCloudinaryAsset.mockRejectedValue(new Error("provider down"));

    await expect(deleteMediaAction(deletionForm())).rejects.toThrow(
      "provider down",
    );
    expect(mocks.restoreAdminMediaRow).toHaveBeenCalledWith(media);
    expect(mocks.recordAuditEvent).not.toHaveBeenCalled();
  });
});

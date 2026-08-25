import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  assertAdmin: vi.fn(),
  createAdminProject: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), updateTag: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/server/auth/session", () => ({ assertAdmin: mocks.assertAdmin }));
vi.mock("@/server/audit", () => ({ recordAuditEvent: vi.fn() }));
vi.mock("@/server/dal/cms", () => ({
  createAdminProject: mocks.createAdminProject,
  deleteAdminProject: vi.fn(),
  deleteAdminService: vi.fn(),
  deleteAdminTestimonial: vi.fn(),
  isProjectSlugAvailable: vi.fn(),
  saveAdminService: vi.fn(),
  saveAdminSiteSettings: vi.fn(),
  saveAdminTestimonial: vi.fn(),
  updateAdminInquiryStatus: vi.fn(),
  updateAdminProject: vi.fn(),
}));

import { saveProjectAction } from "@/features/admin/actions/cms";
import { initialAdminActionState } from "@/features/admin/action-state";

describe("CMS mutation authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.assertAdmin.mockRejectedValue(new Error("Unauthorized"));
  });

  it("rejects before validation or project mutation without an admin session", async () => {
    await expect(
      saveProjectAction(initialAdminActionState, new FormData()),
    ).rejects.toThrow("Unauthorized");
    expect(mocks.createAdminProject).not.toHaveBeenCalled();
  });
});

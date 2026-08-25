import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  assertAdmin: vi.fn(),
  getDatabase: vi.fn(),
}));

vi.mock("@/server/auth/session", () => ({ assertAdmin: mocks.assertAdmin }));
vi.mock("@/server/db", () => ({ getDatabase: mocks.getDatabase }));

import { entityIdSchema } from "@/lib/validation";
import { getAdminInquiry, getAdminProject } from "@/server/dal/cms";

describe("admin route identifiers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.assertAdmin.mockResolvedValue({ user: { id: crypto.randomUUID() } });
  });

  it("rejects malformed UUIDs before constructing a database query", async () => {
    expect(entityIdSchema.safeParse("not-a-uuid").success).toBe(false);
    await expect(getAdminProject("not-a-uuid")).resolves.toBeNull();
    await expect(getAdminInquiry("not-a-uuid")).resolves.toBeNull();
    expect(mocks.getDatabase).not.toHaveBeenCalled();
  });
});

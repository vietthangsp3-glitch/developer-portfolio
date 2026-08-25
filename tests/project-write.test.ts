import { beforeEach, describe, expect, it, vi } from "vitest";
import { drizzle } from "drizzle-orm/neon-http";

const mocks = vi.hoisted(() => ({
  assertAdmin: vi.fn(),
  batch: vi.fn(),
  getDatabase: vi.fn(),
}));

vi.mock("@/server/auth/session", () => ({ assertAdmin: mocks.assertAdmin }));
vi.mock("@/server/db", () => ({ getDatabase: mocks.getDatabase }));

import { canonicalizeTechnologies } from "@/features/admin/technology";
import type { ProjectAdminInput } from "@/server/dal/cms-types";
import { createAdminProject } from "@/server/dal/cms";
import * as schema from "@/server/db/schema";

function projectInput(): ProjectAdminInput {
  return {
    project: {
      title: "Atomic project",
      slug: "atomic-project",
      subtitle: null,
      summary: "A project mutation test.",
      description: null,
      category: "Engineering",
      role: "Development",
      year: 2026,
      status: "draft",
      featuredRank: null,
      sortOrder: 0,
      thumbnailMediaId: null,
      heroMediaId: null,
      liveUrl: null,
      repositoryUrl: null,
      seoTitle: null,
      seoDescription: null,
      caseStudyContent: { version: 1, blocks: [] },
    },
    technologies: ["Next.js", "next js", "NEXT.JS", "TypeScript"],
    mediaRelations: [],
  };
}

describe("atomic project writes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.assertAdmin.mockResolvedValue({ user: { id: crypto.randomUUID() } });
    mocks.batch.mockRejectedValue(new Error("relation write failed"));

    const database = drizzle.mock({ schema });
    vi.spyOn(database, "batch").mockImplementation(mocks.batch);
    mocks.getDatabase.mockReturnValue(database);
  });

  it("submits the project and every relation write through one atomic batch", async () => {
    await expect(createAdminProject(projectInput())).rejects.toThrow(
      "relation write failed",
    );
    expect(mocks.batch).toHaveBeenCalledTimes(1);
    expect(mocks.batch.mock.calls[0]?.[0]).toHaveLength(6);
  });

  it("deduplicates technology casing and punctuation by canonical slug", () => {
    expect(
      canonicalizeTechnologies([
        "Next.js",
        " next js ",
        "NEXT.JS",
        "TypeScript",
      ]),
    ).toEqual([
      { name: "Next.js", slug: "next-js" },
      { name: "TypeScript", slug: "typescript" },
    ]);
  });
});

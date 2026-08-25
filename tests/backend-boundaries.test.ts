import { describe, expect, it } from "vitest";

import {
  toPublicMediaDto,
  toPublicProjectDetailDto,
  toPublicProjectSummaryDto,
} from "@/server/dal/mappers";
import { getRateLimitWindow } from "@/server/rate-limit";
import { hashPrivateIdentifier } from "@/server/security/identifiers";

const projectRow = {
  slug: "northline-build",
  title: "Northline Build",
  subtitle: null,
  summary: "A concise summary.",
  description: "A longer description.",
  category: "Architecture",
  role: "Design / Development",
  year: 2026,
  featuredRank: 0,
  liveUrl: null,
  repositoryUrl: null,
  caseStudyContent: {
    version: 1,
    blocks: [
      {
        type: "narrative",
        eyebrow: "Challenge",
        title: "A clear title",
        body: ["A safe structured paragraph."],
      },
    ],
  },
  seoTitle: null,
  seoDescription: null,
};

const media = {
  url: "/images/projects/northline-build.webp",
  width: 1536,
  height: 1024,
  format: "webp",
  altText: "A project image",
};

describe("server data boundaries", () => {
  it("maps database-shaped values into minimal public project DTOs", () => {
    const dto = toPublicProjectDetailDto(
      projectRow,
      media,
      media,
      ["Next.js", "TypeScript"],
      [
        {
          ...media,
          role: "case_study",
          altTextOverride: "A more specific editorial description",
          caption: "Project process",
        },
      ],
    );

    expect(dto).toMatchObject({
      slug: "northline-build",
      featured: true,
      technologies: ["Next.js", "TypeScript"],
      media: [
        {
          altText: "A more specific editorial description",
          role: "case_study",
          caption: "Project process",
        },
      ],
    });
    expect(dto).not.toHaveProperty("id");
    expect(dto).not.toHaveProperty("status");
    expect(dto).not.toHaveProperty("featuredRank");
  });

  it("revalidates structured JSON when it crosses the database boundary", () => {
    expect(() =>
      toPublicProjectDetailDto(
        {
          ...projectRow,
          caseStudyContent: { version: 1, blocks: [{ type: "html" }] },
        },
        media,
        media,
        [],
        [],
      ),
    ).toThrow();
  });

  it("revalidates public URLs when they cross the database boundary", () => {
    expect(() =>
      toPublicProjectSummaryDto(
        { ...projectRow, liveUrl: "javascript:alert(1)" },
        null,
        [],
      ),
    ).toThrow();

    expect(() =>
      toPublicMediaDto({
        ...media,
        url: "javascript:alert(1)",
      }),
    ).toThrow();
  });

  it("creates normalized, deterministic HMAC identifiers", () => {
    const secret = "a-development-only-secret-with-32-characters";
    const first = hashPrivateIdentifier(" Person@Example.com ", secret);
    const second = hashPrivateIdentifier("person@example.com", secret);

    expect(first).toBe(second);
    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(first).not.toContain("person@example.com");
  });

  it("calculates deterministic fixed rate-limit windows", () => {
    const result = getRateLimitWindow(
      new Date("2026-08-24T10:03:42.500Z"),
      60_000,
    );

    expect(result.windowStart.toISOString()).toBe("2026-08-24T10:03:00.000Z");
    expect(result.retryAt.toISOString()).toBe("2026-08-24T10:04:00.000Z");
  });
});

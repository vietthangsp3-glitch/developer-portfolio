import { beforeEach, describe, expect, it, vi } from "vitest";

const { getPublishedProjects } = vi.hoisted(() => ({
  getPublishedProjects: vi.fn(),
}));

vi.mock("@/config/seo", () => ({
  isProductionIndexingEnabled: () => false,
}));

vi.mock("@/config/site", () => ({
  siteConfig: { url: "https://portfolio.example.com" },
}));

vi.mock("@/server/dal/projects", () => ({ getPublishedProjects }));

import sitemap from "@/app/sitemap";

describe("public sitemap", () => {
  beforeEach(() => getPublishedProjects.mockReset());

  it("includes only canonical public routes and published project details", async () => {
    getPublishedProjects.mockResolvedValue([
      {
        slug: "published-project",
        thumbnail: {
          url: "https://res.cloudinary.com/demo/image/upload/project.webp",
        },
      },
    ]);

    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toEqual([
      "https://portfolio.example.com",
      "https://portfolio.example.com/projects",
      "https://portfolio.example.com/projects/published-project",
    ]);
    expect(urls).not.toContain("https://portfolio.example.com/work");
    expect(urls).not.toContain("https://portfolio.example.com/about");
    expect(urls).not.toContain("https://portfolio.example.com/services");
    expect(urls).not.toContain("https://portfolio.example.com/contact");
  });
});

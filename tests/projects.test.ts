import { describe, expect, it } from "vitest";

import {
  getNextProject,
  getProject,
  projects,
} from "@/features/projects/data/projects";

describe("project fixtures", () => {
  it("provides unique, route-safe projects with complete local media", () => {
    expect(projects).toHaveLength(6);
    expect(new Set(projects.map((project) => project.slug)).size).toBe(
      projects.length,
    );

    for (const project of projects) {
      expect(project.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(project.image.src).toMatch(/^\/images\/projects\/.+\.webp$/);
      expect(project.image.alt.length).toBeGreaterThan(20);
      expect(project.image.width).toBe(1536);
      expect(project.image.height).toBe(1024);
      expect(project.blocks.some((block) => block.type === "narrative")).toBe(
        true,
      );
      expect(getProject(project.slug)).toBe(project);
    }
  });

  it("cycles the next-project navigation", () => {
    expect(getNextProject(projects.at(-1)!.slug)).toBe(projects[0]);
  });
});

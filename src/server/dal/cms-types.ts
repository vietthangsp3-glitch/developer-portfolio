import "server-only";

import type { z } from "zod";

import type { projectAdminInputSchema } from "@/features/admin/schemas/cms";

type ParsedProject = z.infer<typeof projectAdminInputSchema>;

export type ProjectAdminInput = {
  project: Omit<
    ParsedProject,
    "technologies" | "mediaRelations" | "featured" | "featuredRank"
  > & {
    featuredRank: number | null;
  };
  technologies: string[];
  mediaRelations: ParsedProject["mediaRelations"];
};

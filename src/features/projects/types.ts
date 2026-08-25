import type {
  CaseStudyBlock,
  ProjectImage,
  ProjectStat,
} from "@/features/projects/schemas/project";

export type { CaseStudyBlock, ProjectImage, ProjectStat };

export type Project = {
  slug: string;
  title: string;
  sector: string;
  year: string;
  services: string[];
  technologies: string[];
  summary: string;
  outcome: string;
  image: ProjectImage;
  featured?: boolean;
  blocks: CaseStudyBlock[];
};

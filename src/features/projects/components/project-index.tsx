import { ProjectCard } from "@/features/projects/components/project-card";
import type { Project } from "@/features/projects/types";

type ProjectIndexProps = {
  items: Project[];
  headingLevel?: "h2" | "h3";
  variant?: "editorial" | "technical";
};

export function ProjectIndex({
  items,
  headingLevel = "h2",
  variant = "editorial",
}: ProjectIndexProps) {
  return (
    <div
      className={
        variant === "technical"
          ? "grid gap-2.5 md:grid-cols-2 md:gap-2"
          : "grid gap-x-6 gap-y-16 md:gap-y-20 lg:grid-cols-2 lg:gap-y-28"
      }
    >
      {items.map((project, index) => (
        <ProjectCard
          key={project.slug}
          project={project}
          index={index}
          layout={index % 3 === 0 ? "wide" : "standard"}
          headingLevel={headingLevel}
          variant={variant}
        />
      ))}
    </div>
  );
}

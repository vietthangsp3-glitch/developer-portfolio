import Image from "next/image";
import Link from "next/link";

import type { Project } from "@/features/projects/types";

type ProjectCardProps = {
  project: Project;
  index: number;
  layout: "standard" | "wide";
  headingLevel?: "h2" | "h3";
  variant?: "editorial" | "technical";
};

export function ProjectCard({
  project,
  index,
  layout,
  headingLevel = "h2",
  variant = "editorial",
}: ProjectCardProps) {
  const Heading = headingLevel;
  const isWide = layout === "wide";

  if (variant === "technical") {
    return (
      <article
        className="project-cell bg-surface hover:bg-surface-strong focus-within:bg-surface-strong border-border group relative min-h-[18rem] overflow-hidden border transition-colors duration-400 md:min-h-[19rem] xl:min-h-[20rem]"
        data-project-layout="technical"
      >
        <Link
          href={`/projects/${project.slug}`}
          className="flex min-h-[inherit] flex-col p-5 no-underline md:p-6"
        >
          <div className="absolute inset-0 overflow-hidden" data-project-media>
            <Image
              src={project.image.src}
              alt=""
              fill
              sizes="(min-width: 1440px) 676px, (min-width: 768px) 50vw, 100vw"
              className="project-cell-image object-cover object-center"
            />
            <span
              aria-hidden="true"
              className="project-cell-shade absolute inset-0"
            />
          </div>

          <div className="relative z-10 flex items-start justify-between gap-6">
            <span className="text-label text-foreground/60 font-mono uppercase">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span
              aria-hidden="true"
              className="project-cell-arrow text-foreground/75 text-lg leading-none"
            >
              ↗
            </span>
          </div>

          <div
            className="relative z-10 mt-auto max-w-[31rem] pt-10 md:pt-12"
            data-project-meta
          >
            <Heading className="text-[clamp(1.65rem,2.25vw,2.35rem)] leading-[1.05] font-medium tracking-[-0.03em]">
              {project.title}
            </Heading>
            <p className="text-foreground/70 mt-3 max-w-[38ch] text-sm leading-6 md:text-[0.9375rem] md:leading-6">
              {project.summary}
            </p>
            <p className="text-label text-foreground/50 mt-5 font-mono uppercase">
              {project.technologies.join(" / ")}
            </p>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article
      className={`group border-border border-t pt-4 ${isWide ? "lg:col-span-2" : ""}`}
      data-project-layout={layout}
    >
      <Link href={`/projects/${project.slug}`} className="block no-underline">
        <div
          className={`bg-surface-strong relative overflow-hidden ${
            isWide
              ? "aspect-[4/3] md:aspect-[16/9] lg:aspect-[12/5]"
              : "aspect-[4/3] md:aspect-[3/2]"
          }`}
          data-project-media
        >
          <Image
            src={project.image.src}
            alt={project.image.alt}
            fill
            sizes={
              isWide
                ? "(min-width: 1440px) 1440px, (min-width: 1024px) calc(100vw - 7rem), 100vw"
                : "(min-width: 1440px) 696px, (min-width: 1024px) calc(50vw - 4.5rem), 100vw"
            }
            className="object-cover transition-transform duration-500 ease-out group-focus-within:scale-[1.015] group-hover:scale-[1.015]"
          />
        </div>
        <div
          className={`grid grid-cols-4 gap-x-4 gap-y-4 pt-4 md:grid-cols-8 md:gap-x-6 ${
            isWide ? "lg:grid-cols-12" : ""
          }`}
          data-project-meta
        >
          <span className="text-label text-muted-foreground col-span-1 font-mono uppercase">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div
            className={`col-span-3 md:col-span-5 ${isWide ? "lg:col-span-5" : ""}`}
          >
            <p className="text-label text-accent mb-2 font-mono uppercase">
              {project.sector}
            </p>
            <Heading className="text-subheading font-medium underline-offset-4 group-focus-within:underline group-hover:underline">
              {project.title}
            </Heading>
            <p className="text-muted-foreground mt-3 max-w-[42ch] text-sm leading-6">
              {project.summary}
            </p>
          </div>
          <div
            className={`text-label text-muted-foreground col-span-3 col-start-2 flex items-start justify-between gap-4 font-mono uppercase md:col-span-2 md:col-start-auto md:block md:text-right ${
              isWide ? "lg:col-span-3 lg:col-start-10" : ""
            }`}
          >
            <span className="block">{project.services.join(" / ")}</span>
            <span className="mt-0 block md:mt-2">{project.year}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}

import Image from "next/image";

import { Container } from "@/components/ui/container";
import type { Project } from "@/features/projects/types";

export function CaseStudyHero({ project }: { project: Project }) {
  return (
    <header className="pt-section-compact pb-section-compact">
      <Container>
        <div className="border-border grid grid-cols-4 gap-x-4 gap-y-10 border-t pt-4 md:grid-cols-8 md:gap-x-6 lg:grid-cols-12">
          <p className="text-label text-muted-foreground col-span-4 font-mono uppercase md:col-span-2 lg:col-span-3">
            {project.sector} / {project.year}
          </p>
          <div className="col-span-4 md:col-span-6 lg:col-span-9">
            <h1 className="text-page-title max-w-[12ch] font-medium text-balance">
              {project.title}
            </h1>
            <p className="text-lead text-muted-foreground mt-7 max-w-[46ch]">
              {project.summary}
            </p>
          </div>
        </div>
        <div className="bg-surface-strong relative mt-12 aspect-[4/3] overflow-hidden md:mt-20 md:aspect-[16/9] lg:aspect-[12/5]">
          <Image
            src={project.image.src}
            alt={project.image.alt}
            fill
            priority
            sizes="(min-width: 1440px) 1440px, (min-width: 768px) calc(100vw - 6vw), 100vw"
            className="object-cover lg:object-[center_58%]"
          />
        </div>
        <div className="border-border grid grid-cols-2 gap-6 border-b py-5 text-sm md:grid-cols-3">
          <div>
            <p className="text-label text-muted-foreground font-mono uppercase">
              Services
            </p>
            <p className="mt-2">{project.services.join(", ")}</p>
          </div>
          <div>
            <p className="text-label text-muted-foreground font-mono uppercase">
              Technology
            </p>
            <p className="mt-2">{project.technologies.join(", ")}</p>
          </div>
          <div className="col-span-2 md:col-span-1">
            <p className="text-label text-muted-foreground font-mono uppercase">
              Direction
            </p>
            <p className="mt-2">Representative concept case study</p>
          </div>
        </div>
      </Container>
    </header>
  );
}

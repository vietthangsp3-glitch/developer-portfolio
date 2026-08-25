import type { Metadata } from "next";

import { PageIntro } from "@/components/layout/page-intro";
import { Container } from "@/components/ui/container";
import { ProjectIndex } from "@/features/projects/components/project-index";
import {
  getCachedPublishedProjects,
  projectSummaryToView,
} from "@/server/dal/public";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Selected website, product, commerce, and interactive development case studies.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const projects = (await getCachedPublishedProjects()).map(
    projectSummaryToView,
  );

  return (
    <main id="main-content" tabIndex={-1}>
      <PageIntro
        label="Projects / Index"
        title="Selected projects."
        description="Published work across websites, digital products, publishing systems, and interactive experiences."
      />
      <section aria-label="Project index" className="pb-section">
        <Container>
          <ProjectIndex items={projects} variant="technical" />
        </Container>
      </section>
    </main>
  );
}

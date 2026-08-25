import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/components/ui/container";
import { TextLink } from "@/components/ui/text-link";
import { CaseStudyBlocks } from "@/features/projects/components/case-study-blocks";
import { CaseStudyHero } from "@/features/projects/components/case-study-hero";
import {
  getCachedProjectBySlug,
  getCachedPublishedProjects,
  projectDetailToView,
  projectSummaryToView,
} from "@/server/dal/public";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getCachedProjectBySlug(slug);
  if (!project) return {};
  const socialImage = project.heroMedia ?? project.thumbnail;
  return {
    title: project.seo.title ?? project.title,
    description: project.seo.description ?? project.summary,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      type: "article",
      title: project.seo.title ?? project.title,
      description: project.seo.description ?? project.summary,
      url: `/work/${project.slug}`,
      images: socialImage
        ? [
            {
              url: socialImage.url,
              width: socialImage.width,
              height: socialImage.height,
              alt: socialImage.altText,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: project.seo.title ?? project.title,
      description: project.seo.description ?? project.summary,
      images: socialImage ? [socialImage.url] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const projectDto = await getCachedProjectBySlug(slug);
  if (!projectDto) notFound();
  const project = projectDetailToView(projectDto);
  const projects = (await getCachedPublishedProjects()).map(
    projectSummaryToView,
  );
  const currentIndex = projects.findIndex((item) => item.slug === slug);
  const nextProject = projects[(currentIndex + 1) % projects.length] ?? project;
  return (
    <main id="main-content" tabIndex={-1}>
      <CaseStudyHero project={project} />
      <CaseStudyBlocks blocks={project.blocks} />
      <section className="py-section" aria-labelledby="next-project">
        <Container>
          <div className="border-border grid grid-cols-4 gap-x-4 gap-y-8 border-t pt-4 md:grid-cols-8 md:gap-x-6 lg:grid-cols-12">
            <p className="text-label text-muted-foreground col-span-4 font-mono uppercase md:col-span-2 lg:col-span-3">
              Next project
            </p>
            <div className="col-span-4 md:col-span-6 lg:col-span-8">
              <h2 id="next-project" className="text-heading font-medium">
                {nextProject.title}
              </h2>
              <TextLink className="mt-6" href={`/work/${nextProject.slug}`}>
                View case study
              </TextLink>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}

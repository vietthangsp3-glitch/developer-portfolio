import { HomePage } from "@/features/home/components/home-page";
import {
  projectSummaryToView,
  getCachedFeaturedProjects,
  getCachedPublishedProjects,
  getCachedPublishedTestimonials,
  getCachedPublicSiteSettings,
} from "@/server/dal/public";

export default async function Home() {
  const [projects, featuredProjects, testimonials, settings] =
    await Promise.all([
      getCachedPublishedProjects(),
      getCachedFeaturedProjects(),
      getCachedPublishedTestimonials(),
      getCachedPublicSiteSettings(),
    ]);
  return (
    <main id="main-content" tabIndex={-1}>
      <HomePage
        projects={projects.map(projectSummaryToView)}
        featuredProject={
          featuredProjects[0]
            ? projectSummaryToView(featuredProjects[0])
            : undefined
        }
        testimonials={testimonials}
        settings={settings}
      />
    </main>
  );
}

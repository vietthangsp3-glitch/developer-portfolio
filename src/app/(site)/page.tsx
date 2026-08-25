import { HomePage } from "@/features/home/components/home-page";
import {
  projectSummaryToView,
  getCachedPublishedServices,
  getCachedPublishedTestimonials,
  getCachedPublicSiteSettings,
  getCachedSelectedProjects,
} from "@/server/dal/public";

export default async function Home() {
  const [selectedProjects, services, testimonials, settings] =
    await Promise.all([
      getCachedSelectedProjects(),
      getCachedPublishedServices(),
      getCachedPublishedTestimonials(),
      getCachedPublicSiteSettings(),
    ]);
  return (
    <main id="main-content" tabIndex={-1}>
      <HomePage
        selectedProjects={selectedProjects.map(projectSummaryToView)}
        services={services}
        testimonials={testimonials}
        settings={settings}
      />
    </main>
  );
}

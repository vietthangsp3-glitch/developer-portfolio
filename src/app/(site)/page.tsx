import { HomePage } from "@/features/home/components/home-page";
import {
  projectSummaryToView,
  getCachedPublishedServices,
  getCachedPublicSiteSettings,
  getCachedSelectedProjects,
} from "@/server/dal/public";

export default async function Home() {
  const [selectedProjects, services, settings] = await Promise.all([
    getCachedSelectedProjects(),
    getCachedPublishedServices(),
    getCachedPublicSiteSettings(),
  ]);
  return (
    <main id="main-content" tabIndex={-1}>
      <HomePage
        selectedProjects={selectedProjects.map(projectSummaryToView)}
        services={services}
        settings={settings}
      />
    </main>
  );
}

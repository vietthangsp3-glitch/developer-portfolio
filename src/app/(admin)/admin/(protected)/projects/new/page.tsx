import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { ProjectForm } from "@/features/admin/components/project-form";
import { requireAdmin } from "@/server/auth/session";
import { listAdminMedia, listAdminTechnologies } from "@/server/dal/cms";

export default async function NewProjectPage() {
  await requireAdmin();
  const [media, technologies] = await Promise.all([
    listAdminMedia(),
    listAdminTechnologies(),
  ]);
  return (
    <div>
      <AdminPageHeader
        eyebrow="Projects"
        title="New project"
        description="Start as a draft, validate the complete case study, then publish explicitly."
      />
      <ProjectForm
        media={media.map(({ id, altText, url }) => ({ id, altText, url }))}
        technologyOptions={technologies}
        value={{
          title: "",
          slug: "",
          subtitle: null,
          summary: "",
          description: null,
          category: "",
          role: "",
          year: new Date().getFullYear(),
          status: "draft",
          featuredRank: null,
          sortOrder: 0,
          thumbnailMediaId: null,
          heroMediaId: null,
          liveUrl: null,
          repositoryUrl: null,
          seoTitle: null,
          seoDescription: null,
          technologies: [],
          mediaRelations: [],
          caseStudyContent: { version: 1, blocks: [] },
        }}
      />
    </div>
  );
}

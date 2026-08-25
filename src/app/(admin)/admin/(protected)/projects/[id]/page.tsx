import { notFound } from "next/navigation";

import { deleteProjectAction } from "@/features/admin/actions/cms";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { DeleteControl } from "@/features/admin/components/delete-control";
import { ProjectForm } from "@/features/admin/components/project-form";
import { caseStudyContentSchema } from "@/features/projects/schemas/project";
import { entityIdSchema } from "@/lib/validation";
import { requireAdmin } from "@/server/auth/session";
import {
  getAdminProject,
  listAdminMedia,
  listAdminTechnologies,
} from "@/server/dal/cms";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const parsedId = entityIdSchema.safeParse((await params).id);
  if (!parsedId.success) notFound();
  const id = parsedId.data;
  const [project, media, technologies] = await Promise.all([
    getAdminProject(id),
    listAdminMedia(),
    listAdminTechnologies(),
  ]);
  if (!project) notFound();
  return (
    <div>
      <AdminPageHeader
        eyebrow="Projects"
        title={project.title}
        description={`Edit /work/${project.slug}. Published changes invalidate the related public routes.`}
      />
      <ProjectForm
        media={media.map(({ id: mediaId, altText, url }) => ({
          id: mediaId,
          altText,
          url,
        }))}
        technologyOptions={technologies}
        value={{
          ...project,
          caseStudyContent: caseStudyContentSchema.parse(
            project.caseStudyContent,
          ),
          technologies: project.technologyRows.map((item) => item.name),
          mediaRelations: project.mediaRows.map((item) => ({
            mediaId: item.mediaId,
            role: item.role,
            altTextOverride: item.altTextOverride,
            caption: item.caption,
          })),
        }}
      />
      <section
        className="border-border mt-10 border-t pt-6"
        aria-labelledby="delete-project"
      >
        <h2 id="delete-project" className="mb-4 text-lg font-medium">
          Danger zone
        </h2>
        <DeleteControl
          action={deleteProjectAction}
          id={project.id}
          label="project"
          disabledReason={
            project.status === "published"
              ? "Unpublish or archive this project before deleting it."
              : undefined
          }
        />
      </section>
    </div>
  );
}

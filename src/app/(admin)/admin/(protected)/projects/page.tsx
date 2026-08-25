import Link from "next/link";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { requireAdmin } from "@/server/auth/session";
import { listAdminProjects } from "@/server/dal/cms";

export default async function AdminProjectsPage() {
  await requireAdmin();
  const projects = await listAdminProjects();
  return (
    <div>
      <AdminPageHeader
        eyebrow="Content"
        title="Projects"
        description="Create, order, publish, and maintain structured portfolio case studies."
      />
      <div className="mt-6 flex justify-end">
        <Link
          className="bg-accent text-accent-foreground inline-flex min-h-11 items-center px-4 text-sm font-semibold no-underline"
          href="/admin/projects/new"
        >
          New project
        </Link>
      </div>
      {projects.length ? (
        <div className="border-border mt-6 border-t">
          {projects.map((project) => (
            <article
              className="border-border grid gap-4 border-b py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
              key={project.id}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-medium">{project.title}</h2>
                  <span className="text-muted-foreground font-mono text-xs uppercase">
                    {project.status}
                  </span>
                  {project.featuredRank !== null ? (
                    <span className="text-accent font-mono text-xs uppercase">
                      Featured {project.featuredRank}
                    </span>
                  ) : null}
                </div>
                <p className="text-muted-foreground mt-1 truncate text-sm">
                  /work/{project.slug} · order {project.sortOrder}
                </p>
              </div>
              <Link
                className="border-border inline-flex min-h-10 items-center justify-center border px-4 text-sm no-underline"
                href={`/admin/projects/${project.id}`}
              >
                Edit
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="border-border mt-8 border py-12 text-center">
          <p className="text-muted-foreground text-sm">No projects yet.</p>
        </div>
      )}
    </div>
  );
}

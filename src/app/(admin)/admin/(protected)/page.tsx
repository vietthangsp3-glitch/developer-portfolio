import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { requireAdmin } from "@/server/auth/session";
import { getAdminDashboardMetrics } from "@/server/dal/admin";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const metrics = await getAdminDashboardMetrics();
  const items = [
    ["Projects", metrics.projects],
    ["Published projects", metrics.publishedProjects],
    ["Services", metrics.services],
    ["Testimonials", metrics.testimonials],
    ["Inquiries", metrics.inquiries],
  ] as const;

  return (
    <div>
      <AdminPageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="A concise operational view of portfolio content currently stored in Neon."
      />
      <dl className="border-border mt-8 grid border sm:grid-cols-2 xl:grid-cols-5">
        {items.map(([label, value]) => (
          <div
            className="border-border min-w-0 border-b p-5 last:border-b-0 sm:border-r xl:border-b-0 xl:last:border-r-0 sm:[&:nth-last-child(-n+2)]:border-b-0"
            key={label}
          >
            <dt className="text-muted-foreground text-xs leading-snug uppercase">
              {label}
            </dt>
            <dd className="mt-6 font-mono text-3xl">{value}</dd>
          </div>
        ))}
      </dl>
      <section
        className="border-border mt-8 border-t pt-6"
        aria-labelledby="system-status"
      >
        <h2 className="text-lg font-medium" id="system-status">
          System status
        </h2>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          Authentication, protected CMS mutations, database-backed public
          content, and targeted cache invalidation are active.
        </p>
      </section>
    </div>
  );
}

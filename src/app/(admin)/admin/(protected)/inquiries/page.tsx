import Link from "next/link";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { inquiryStatusSchema } from "@/features/inquiries/schemas/inquiry";
import { requireAdmin } from "@/server/auth/session";
import { listAdminInquiries } from "@/server/dal/cms";

const filters = ["all", "received", "contacted", "archived"] as const;

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  await requireAdmin();
  const query = await searchParams;
  const page = Math.max(Number(query.page) || 1, 1);
  const parsedStatus = inquiryStatusSchema.safeParse(query.status);
  const status = parsedStatus.success ? parsedStatus.data : undefined;
  const items = await listAdminInquiries(50, (page - 1) * 50, status);
  const pageHref = (nextPage: number) =>
    `/admin/inquiries?page=${nextPage}${status ? `&status=${status}` : ""}`;
  return (
    <div>
      <AdminPageHeader
        eyebrow="Workflow"
        title="Inquiries"
        description="Review stored inquiries, email delivery, and private workflow state."
      />
      <nav
        className="mt-8 flex flex-wrap gap-2"
        aria-label="Inquiry status filters"
      >
        {filters.map((filter) => {
          const active = filter === (status ?? "all");
          const href =
            filter === "all"
              ? "/admin/inquiries"
              : `/admin/inquiries?status=${filter}`;
          return (
            <Link
              key={filter}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`border px-4 py-2 text-sm capitalize no-underline ${active ? "border-accent text-accent" : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"}`}
            >
              {filter}
            </Link>
          );
        })}
      </nav>
      {items.length ? (
        <div className="border-border mt-8 border-t">
          {items.map((item) => (
            <article
              className="border-border grid gap-3 border-b py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
              key={item.id}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap gap-3">
                  <h2 className="font-medium">{item.name}</h2>
                  <span className="text-accent font-mono text-xs uppercase">
                    {item.status}
                  </span>
                </div>
                <p className="text-muted-foreground mt-1 truncate text-sm">
                  {item.email} · {item.projectType} · Email{" "}
                  {item.emailDeliveryStatus.replace("_", " ")} ·{" "}
                  <time dateTime={item.createdAt.toISOString()}>
                    {item.createdAt.toLocaleDateString("en-GB")}
                  </time>
                </p>
              </div>
              <Link
                className="border-border inline-flex min-h-10 items-center justify-center border px-4 text-sm no-underline"
                href={`/admin/inquiries/${item.id}`}
              >
                Review
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="border-border text-muted-foreground mt-8 border py-12 text-center text-sm">
          No inquiries.
        </div>
      )}
      <nav
        className="mt-6 flex justify-between text-sm"
        aria-label="Inquiry pages"
      >
        {page > 1 ? <Link href={pageHref(page - 1)}>Previous</Link> : <span />}
        {items.length === 50 ? (
          <Link href={pageHref(page + 1)}>Next</Link>
        ) : null}
      </nav>
    </div>
  );
}

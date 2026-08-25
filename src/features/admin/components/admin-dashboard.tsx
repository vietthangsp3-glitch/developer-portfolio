import type { ReactNode } from "react";
import Link from "next/link";

import {
  AdminIcon,
  type AdminIconName,
} from "@/features/admin/components/admin-icon";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import type { AdminDashboardMetrics } from "@/server/dal/admin";

type RecentInquiry = {
  id: string;
  name: string;
  email: string;
  projectType: string;
  status: "received" | "contacted" | "archived";
  createdAt: Date;
};

type Metric = {
  label: string;
  value: number | string;
  detail: string;
  href: string;
  icon: AdminIconName;
};

function MetricCard({ metric }: { metric: Metric }) {
  return (
    <Link
      href={metric.href}
      className="border-border/80 bg-surface/82 hover:border-accent/45 focus-visible:border-accent group min-w-0 rounded-md border p-4 no-underline transition-colors duration-200 sm:p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="text-muted-foreground font-mono text-[0.6875rem] tracking-[0.08em] uppercase">
          {metric.label}
        </span>
        <span className="bg-muted/65 text-muted-foreground group-hover:bg-accent/12 group-hover:text-accent grid size-8 shrink-0 place-items-center rounded-md transition-colors">
          <AdminIcon name={metric.icon} />
        </span>
      </div>
      <p className="mt-5 font-mono text-[2rem] leading-none tracking-[-0.04em] sm:text-[2.25rem]">
        {metric.value}
      </p>
      <p className="text-muted-foreground mt-2 truncate text-xs">
        {metric.detail}
      </p>
    </Link>
  );
}

function Panel({
  title,
  eyebrow,
  children,
  className = "",
}: {
  title: string;
  eyebrow: string;
  children: ReactNode;
  className?: string;
}) {
  const titleId = `${eyebrow.toLowerCase().replaceAll(" ", "-")}-title`;

  return (
    <section
      className={`border-border/80 bg-surface/78 rounded-md border p-5 sm:p-6 ${className}`}
      aria-labelledby={titleId}
    >
      <div className="border-border/70 flex items-center justify-between gap-4 border-b pb-4">
        <div>
          <p className="text-accent font-mono text-[0.625rem] tracking-[0.14em] uppercase">
            {eyebrow}
          </p>
          <h2
            className="mt-1.5 text-lg font-medium tracking-[-0.02em]"
            id={titleId}
          >
            {title}
          </h2>
        </div>
      </div>
      {children}
    </section>
  );
}

export function AdminDashboard({
  metrics,
  recentInquiries,
  mediaTotal,
  cloudinaryConfigured,
}: {
  metrics: AdminDashboardMetrics;
  recentInquiries: RecentInquiry[];
  mediaTotal: number;
  cloudinaryConfigured: boolean;
}) {
  const publishedRatio = metrics.projects
    ? Math.round((metrics.publishedProjects / metrics.projects) * 100)
    : 0;
  const mediaCount = mediaTotal === 100 ? "100+" : mediaTotal;
  const metricItems: Metric[] = [
    {
      label: "Projects",
      value: metrics.projects,
      detail: "All case studies",
      href: "/admin/projects",
      icon: "projects",
    },
    {
      label: "Published projects",
      value: metrics.publishedProjects,
      detail: `${publishedRatio}% of project library`,
      href: "/admin/projects",
      icon: "check",
    },
    {
      label: "Services",
      value: metrics.services,
      detail: "Managed offerings",
      href: "/admin/services",
      icon: "services",
    },
    {
      label: "Testimonials",
      value: metrics.testimonials,
      detail: "Client proof records",
      href: "/admin/testimonials",
      icon: "testimonials",
    },
    {
      label: "Inquiries",
      value: metrics.inquiries,
      detail: "Stored conversations",
      href: "/admin/inquiries",
      icon: "inquiries",
    },
    {
      label: "Media",
      value: mediaCount,
      detail: mediaTotal === 100 ? "100 or more assets" : "Provider assets",
      href: "/admin/media",
      icon: "media",
    },
  ];
  const quickActions = [
    {
      label: "New project",
      detail: "Create a structured case study",
      href: "/admin/projects/new",
      icon: "plus" as const,
    },
    {
      label: "Review inquiries",
      detail: "Continue lead workflow",
      href: "/admin/inquiries",
      icon: "inquiries" as const,
    },
    {
      label: "Upload media",
      detail: "Open the asset library",
      href: "/admin/media",
      icon: "media" as const,
    },
    {
      label: "Site settings",
      detail: "Update identity and SEO",
      href: "/admin/settings",
      icon: "settings" as const,
    },
  ];
  const systemStatus = [
    {
      label: "Database",
      detail: "Neon connected",
      icon: "database" as const,
      active: true,
    },
    {
      label: "Authentication",
      detail: "Admin session protected",
      icon: "check" as const,
      active: true,
    },
    {
      label: "Media provider",
      detail: cloudinaryConfigured ? "Cloudinary configured" : "Not configured",
      icon: "media" as const,
      active: cloudinaryConfigured,
    },
  ];

  return (
    <div>
      <AdminPageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Portfolio content, conversations, and system readiness in one focused workspace."
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {metricItems.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(18rem,0.85fr)]">
        <Panel title="Recent inquiries" eyebrow="Inbox">
          {recentInquiries.length ? (
            <div className="divide-border/70 divide-y">
              {recentInquiries.map((inquiry) => (
                <Link
                  href={`/admin/inquiries/${inquiry.id}`}
                  key={inquiry.id}
                  className="group grid gap-2 py-4 no-underline first:pt-5 last:pb-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                >
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-medium">
                        {inquiry.name}
                      </span>
                      <span className="border-border bg-muted/45 text-muted-foreground rounded-sm border px-1.5 py-0.5 font-mono text-[0.625rem] uppercase">
                        {inquiry.status}
                      </span>
                    </span>
                    <span className="text-muted-foreground mt-1 block truncate text-xs">
                      {inquiry.projectType} · {inquiry.email}
                    </span>
                  </span>
                  <span className="text-muted-foreground group-hover:text-accent flex items-center gap-2 font-mono text-[0.6875rem] transition-colors">
                    <time dateTime={inquiry.createdAt.toISOString()}>
                      {inquiry.createdAt.toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </time>
                    <span aria-hidden="true">↗</span>
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-9 text-center">
              <span className="bg-muted/55 text-muted-foreground mx-auto grid size-10 place-items-center rounded-md">
                <AdminIcon name="inquiries" />
              </span>
              <p className="mt-4 text-sm font-medium">Inbox is clear</p>
              <p className="text-muted-foreground mt-1 text-xs">
                New project inquiries will appear here.
              </p>
            </div>
          )}
        </Panel>

        <Panel title="Quick actions" eyebrow="Shortcuts">
          <div className="grid gap-2 pt-4">
            {quickActions.map((action) => (
              <Link
                href={action.href}
                key={action.href}
                className="border-border/70 bg-background/30 hover:border-accent/40 group flex min-h-14 items-center gap-3 rounded-md border px-3.5 py-2.5 no-underline transition-colors"
              >
                <span className="bg-muted/65 text-muted-foreground group-hover:text-accent grid size-8 shrink-0 place-items-center rounded-sm transition-colors">
                  <AdminIcon name={action.icon} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium">
                    {action.label}
                  </span>
                  <span className="text-muted-foreground block truncate text-xs">
                    {action.detail}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="text-muted-foreground group-hover:text-accent ml-auto transition-colors"
                >
                  ↗
                </span>
              </Link>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="Content status" eyebrow="Publishing">
          <div className="pt-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Project library</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {metrics.publishedProjects} published of {metrics.projects}{" "}
                  total
                </p>
              </div>
              <span className="text-accent font-mono text-sm">
                {publishedRatio}%
              </span>
            </div>
            <div
              className="bg-muted mt-4 h-1.5 overflow-hidden rounded-full"
              role="progressbar"
              aria-label="Published projects"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={publishedRatio}
            >
              <div
                className="bg-accent h-full rounded-full"
                style={{ width: `${publishedRatio}%` }}
              />
            </div>
            <dl className="border-border/70 mt-5 grid grid-cols-2 gap-4 border-t pt-4">
              <div>
                <dt className="text-muted-foreground text-xs">Services</dt>
                <dd className="mt-1 font-mono text-lg">{metrics.services}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">Testimonials</dt>
                <dd className="mt-1 font-mono text-lg">
                  {metrics.testimonials}
                </dd>
              </div>
            </dl>
          </div>
        </Panel>

        <Panel title="System status" eyebrow="Infrastructure">
          <ul className="divide-border/70 divide-y pt-1">
            {systemStatus.map((status) => (
              <li className="flex items-center gap-3 py-3.5" key={status.label}>
                <span className="bg-muted/55 text-muted-foreground grid size-8 shrink-0 place-items-center rounded-sm">
                  <AdminIcon name={status.icon} />
                </span>
                <span>
                  <span className="block text-sm font-medium">
                    {status.label}
                  </span>
                  <span className="text-muted-foreground block text-xs">
                    {status.detail}
                  </span>
                </span>
                <span
                  className={`ml-auto size-2 rounded-full ${status.active ? "bg-success" : "bg-muted-foreground"}`}
                  role="img"
                  aria-label={status.active ? "Active" : "Needs configuration"}
                />
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

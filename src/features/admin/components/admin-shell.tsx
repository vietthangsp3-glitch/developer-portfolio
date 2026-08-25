import type { ReactNode } from "react";
import Link from "next/link";

import { AdminIcon } from "@/features/admin/components/admin-icon";
import { AdminNavigation } from "@/features/admin/components/admin-navigation";

type AdminShellProps = {
  admin: { name: string; email: string };
  children: ReactNode;
};

export function AdminShell({ admin, children }: AdminShellProps) {
  const initials = admin.name
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-dvh">
      <a className="skip-link" href="#admin-content">
        Skip to admin content
      </a>
      <header className="border-border/80 bg-surface/95 sticky top-0 z-30 border-b lg:hidden">
        <div className="flex min-h-16 items-center justify-between gap-4 px-4">
          <Link
            href="/admin"
            className="flex min-h-11 items-center gap-3 no-underline"
          >
            <span className="bg-accent text-accent-foreground grid size-8 place-items-center rounded-md font-mono text-xs font-bold">
              TN
            </span>
            <span>
              <span className="block text-sm font-semibold">Portfolio</span>
              <span className="text-muted-foreground block font-mono text-[0.625rem] tracking-[0.12em] uppercase">
                Admin workspace
              </span>
            </span>
          </Link>
          <details className="group relative">
            <summary className="border-border hover:border-accent/60 flex min-h-11 list-none items-center gap-2 rounded-md border px-3 text-sm transition-colors [&::-webkit-details-marker]:hidden">
              <AdminIcon name="dashboard" />
              Menu
            </summary>
            <div className="border-border bg-surface-strong absolute top-[calc(100%+0.5rem)] right-0 w-[min(20rem,calc(100vw-2rem))] rounded-md border p-3 shadow-2xl shadow-black/25">
              <div className="border-border/80 mb-3 flex items-center gap-3 border-b px-2 pb-3">
                <span className="bg-muted text-foreground grid size-9 shrink-0 place-items-center rounded-md font-mono text-xs font-semibold">
                  {initials}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">
                    {admin.name}
                  </span>
                  <span className="text-muted-foreground block truncate text-xs">
                    {admin.email}
                  </span>
                </span>
              </div>
              <AdminNavigation compact />
            </div>
          </details>
        </div>
      </header>
      <div className="mx-auto grid min-h-dvh max-w-[112rem] lg:grid-cols-[17.5rem_minmax(0,1fr)]">
        <aside className="border-border/80 bg-surface/88 sticky top-0 hidden h-dvh border-r p-5 lg:flex lg:flex-col xl:p-6">
          <Link
            href="/admin"
            className="border-border/80 flex min-h-16 items-center gap-3 border-b pb-5 no-underline"
          >
            <span className="bg-accent text-accent-foreground grid size-9 place-items-center rounded-md font-mono text-xs font-bold">
              TN
            </span>
            <span>
              <span className="block text-sm font-semibold">Portfolio</span>
              <span className="text-muted-foreground block font-mono text-[0.625rem] tracking-[0.12em] uppercase">
                Admin workspace
              </span>
            </span>
          </Link>
          <div className="mt-6 flex-1 overflow-y-auto">
            <p className="text-muted-foreground mb-3 px-3 font-mono text-[0.625rem] tracking-[0.14em] uppercase">
              Workspace
            </p>
            <AdminNavigation />
          </div>
          <div className="border-border/80 mt-5 border-t pt-5">
            <div className="bg-background/55 flex items-center gap-3 rounded-md border border-white/5 p-3">
              <span className="bg-muted text-foreground grid size-9 shrink-0 place-items-center rounded-md font-mono text-xs font-semibold">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{admin.name}</p>
                <p className="text-muted-foreground truncate text-xs">
                  {admin.email}
                </p>
              </div>
            </div>
          </div>
        </aside>
        <div className="min-w-0">
          <div className="border-border/70 hidden min-h-16 items-center justify-between border-b px-8 lg:flex xl:px-12">
            <p className="text-muted-foreground font-mono text-[0.6875rem] tracking-[0.12em] uppercase">
              Content operations
            </p>
            <div className="flex items-center gap-3">
              <span className="bg-success size-1.5 rounded-full" />
              <span className="text-muted-foreground text-xs">
                Secure admin session
              </span>
              <span className="border-border ml-2 border-l pl-4 text-sm font-medium">
                {admin.name}
              </span>
            </div>
          </div>
          <main
            className="mx-auto max-w-[92rem] min-w-0 px-4 py-7 sm:px-6 sm:py-9 lg:px-8 xl:px-12 xl:py-11"
            id="admin-content"
            tabIndex={-1}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

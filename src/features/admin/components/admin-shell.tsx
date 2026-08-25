import type { ReactNode } from "react";

import { AdminNavigation } from "@/features/admin/components/admin-navigation";

type AdminShellProps = {
  admin: { name: string; email: string };
  children: ReactNode;
};

export function AdminShell({ admin, children }: AdminShellProps) {
  return (
    <div className="bg-background min-h-dvh">
      <a className="skip-link" href="#admin-content">
        Skip to admin content
      </a>
      <header className="border-border bg-background sticky top-0 z-20 border-b lg:hidden">
        <div className="flex min-h-16 items-center justify-between gap-4 px-4">
          <p className="font-mono text-xs font-semibold tracking-[0.12em] uppercase">
            Portfolio admin
          </p>
          <details className="group relative">
            <summary className="border-border flex min-h-11 list-none items-center rounded-sm border px-3 text-sm [&::-webkit-details-marker]:hidden">
              Menu
            </summary>
            <div className="border-border bg-background absolute top-[calc(100%+0.5rem)] right-0 w-[min(19rem,calc(100vw-2rem))] border p-3">
              <AdminNavigation compact />
            </div>
          </details>
        </div>
      </header>
      <div className="mx-auto grid min-h-dvh max-w-[100rem] lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="border-border hidden border-r p-6 lg:flex lg:flex-col">
          <div className="border-border border-b pb-6">
            <p className="font-mono text-xs font-semibold tracking-[0.12em] uppercase">
              Portfolio admin
            </p>
            <p className="text-muted-foreground mt-4 truncate text-sm">
              {admin.name}
            </p>
            <p className="text-muted-foreground truncate text-xs">
              {admin.email}
            </p>
          </div>
          <div className="mt-6">
            <AdminNavigation />
          </div>
        </aside>
        <main
          className="min-w-0 px-4 py-8 sm:px-6 lg:px-10 lg:py-12"
          id="admin-content"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

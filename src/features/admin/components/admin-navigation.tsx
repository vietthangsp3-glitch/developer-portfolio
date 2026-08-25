"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoutButton } from "@/features/auth/components/logout-button";
import { AdminIcon } from "@/features/admin/components/admin-icon";
import { adminNavigation } from "@/features/admin/config";

type AdminNavigationProps = {
  compact?: boolean;
};

export function AdminNavigation({ compact = false }: AdminNavigationProps) {
  const pathname = usePathname() ?? "/admin";

  return (
    <nav
      aria-label="Admin navigation"
      className={compact ? undefined : "flex min-h-full flex-col"}
    >
      <ul className={compact ? "grid gap-1" : "grid gap-1.5"}>
        {adminNavigation.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <li key={item.href}>
              <Link
                aria-current={active ? "page" : undefined}
                className={`group relative flex min-h-11 items-center gap-3 rounded-md border px-3 py-2 text-sm font-medium no-underline transition-colors duration-200 ${
                  active
                    ? "border-accent/35 bg-accent/10 text-foreground"
                    : "text-muted-foreground hover:border-border hover:bg-muted/55 hover:text-foreground focus-visible:border-border focus-visible:bg-muted/55 focus-visible:text-foreground border-transparent"
                }`}
                href={item.href}
              >
                <span
                  className={`grid size-7 shrink-0 place-items-center rounded-sm transition-colors ${active ? "bg-accent/15 text-accent" : "bg-muted/65 text-muted-foreground group-hover:text-foreground"}`}
                >
                  <AdminIcon name={item.icon} />
                </span>
                <span>{item.label}</span>
                {active ? (
                  <span
                    aria-hidden="true"
                    className="bg-accent absolute inset-y-2 -left-px w-0.5 rounded-full"
                  />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
      <div
        className={`border-border/80 grid border-t pt-4 ${compact ? "mt-6" : "mt-auto"}`}
      >
        <Link
          className="text-muted-foreground hover:text-foreground flex min-h-11 items-center gap-3 px-3 text-sm no-underline transition-colors"
          href="/"
        >
          <AdminIcon name="external" className="size-4" />
          View live site
        </Link>
        <LogoutButton />
      </div>
    </nav>
  );
}

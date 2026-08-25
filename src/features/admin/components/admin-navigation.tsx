import Link from "next/link";

import { LogoutButton } from "@/features/auth/components/logout-button";
import { adminNavigation } from "@/features/admin/config";

type AdminNavigationProps = {
  compact?: boolean;
};

export function AdminNavigation({ compact = false }: AdminNavigationProps) {
  return (
    <nav aria-label="Admin navigation">
      <ul className={compact ? "grid gap-1" : "grid gap-1.5"}>
        {adminNavigation.map((item) => (
          <li key={item.href}>
            <Link
              className="hover:bg-muted focus-visible:bg-muted block min-h-11 rounded-sm px-3 py-2 text-sm font-medium no-underline transition-colors"
              href={item.href}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="border-border mt-6 grid border-t pt-4">
        <Link
          className="text-muted-foreground hover:text-foreground flex min-h-11 items-center text-sm no-underline transition-colors"
          href="/"
        >
          View site ↗
        </Link>
        <LogoutButton />
      </div>
    </nav>
  );
}

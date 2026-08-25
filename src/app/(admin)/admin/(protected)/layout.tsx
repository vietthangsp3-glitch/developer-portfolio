import type { ReactNode } from "react";

import { AdminShell } from "@/features/admin/components/admin-shell";
import { requireAdmin } from "@/server/auth/session";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <AdminShell admin={{ name: session.user.name, email: session.user.email }}>
      {children}
    </AdminShell>
  );
}

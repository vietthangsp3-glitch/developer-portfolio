"use client";

import { useState } from "react";

import { authClient } from "@/features/auth/auth-client";

export function LogoutButton() {
  const [pending, setPending] = useState(false);

  async function logout() {
    if (pending) return;
    setPending(true);

    try {
      await authClient.signOut();
    } finally {
      window.location.replace("/admin/login");
    }
  }

  return (
    <button
      className="text-muted-foreground hover:text-foreground min-h-11 px-3 text-left text-sm transition-colors"
      type="button"
      onClick={logout}
      disabled={pending}
    >
      {pending ? "Signing out…" : "Logout"}
    </button>
  );
}

import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { isAdminSession } from "@/features/auth/access";
import { auth } from "@/server/auth";

export class AdminAuthorizationError extends Error {
  constructor() {
    super("Administrator authorization is required.");
    this.name = "AdminAuthorizationError";
  }
}

export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

export async function getCurrentAdmin() {
  const session = await getSession();
  return isAdminSession(session) ? session : null;
}

export async function requireAdmin() {
  const session = await getCurrentAdmin();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}

export async function assertAdmin() {
  const session = await getCurrentAdmin();

  if (!session) {
    throw new AdminAuthorizationError();
  }

  return session;
}

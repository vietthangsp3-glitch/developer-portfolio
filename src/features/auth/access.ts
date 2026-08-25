import type { AuthSession } from "@/server/auth";

export function isAdminSession(
  session: AuthSession | null | undefined,
): session is AuthSession {
  return session?.user.role === "admin" && session.user.banned !== true;
}

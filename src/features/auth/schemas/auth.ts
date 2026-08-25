import { z } from "zod";

export const loginInputSchema = z.object({
  email: z.email().trim().toLowerCase().max(320),
  password: z.string().min(1).max(128),
});

export function getSafeAdminReturnTo(value: string | null | undefined) {
  if (!value || !value.startsWith("/admin") || value.startsWith("//")) {
    return "/admin";
  }

  try {
    const url = new URL(value, "http://local.invalid");

    if (
      url.origin !== "http://local.invalid" ||
      !url.pathname.startsWith("/admin") ||
      url.pathname === "/admin/login"
    ) {
      return "/admin";
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/admin";
  }
}

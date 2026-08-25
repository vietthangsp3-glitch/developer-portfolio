import { redirect } from "next/navigation";

import { LoginForm } from "@/features/auth/components/login-form";
import { getSafeAdminReturnTo } from "@/features/auth/schemas/auth";
import { getCurrentAdmin } from "@/server/auth/session";

type AdminLoginPageProps = {
  searchParams: Promise<{ returnTo?: string; error?: string }>;
};

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const params = await searchParams;
  const returnTo = getSafeAdminReturnTo(params.returnTo);

  try {
    if (await getCurrentAdmin()) redirect(returnTo);
  } catch {
    // Keep the login surface available when the auth database is unavailable.
  }

  return (
    <main
      className="grid min-h-dvh place-items-center px-4 py-12"
      id="main-content"
    >
      <section
        className="border-border w-full max-w-md border p-6 sm:p-9"
        aria-labelledby="login-title"
      >
        <p className="text-accent font-mono text-xs tracking-[0.12em] uppercase">
          Secure administration
        </p>
        <h1
          className="mt-4 text-[clamp(2rem,8vw,3.25rem)] leading-none font-medium tracking-[-0.045em]"
          id="login-title"
        >
          Sign in
        </h1>
        <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
          Administrator access only. Public registration is disabled.
        </p>
        {params.error ? (
          <p className="text-danger mt-5 text-sm" role="alert">
            Administrator access is required.
          </p>
        ) : null}
        <LoginForm returnTo={returnTo} />
      </section>
    </main>
  );
}

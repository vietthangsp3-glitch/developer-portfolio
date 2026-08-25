"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/features/auth/auth-client";

type LoginFormProps = {
  returnTo: string;
};

export function LoginForm({ returnTo }: LoginFormProps) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    setPending(true);
    setMessage("");

    try {
      const result = await authClient.signIn.email({
        email,
        password,
        rememberMe: false,
      });

      if (result.error) {
        setMessage(
          result.error.status === 429
            ? "Too many attempts. Try again later."
            : "Invalid email or password.",
        );
        return;
      }

      window.location.assign(returnTo);
    } catch {
      setMessage("Unable to sign in right now. Try again shortly.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="mt-10 space-y-6" onSubmit={handleSubmit} noValidate>
      <div>
        <label className="text-sm font-medium" htmlFor="admin-email">
          Email
        </label>
        <input
          className="border-border bg-surface focus:border-focus mt-2 min-h-12 w-full rounded-sm border px-3.5 text-base transition-colors outline-none"
          id="admin-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="username"
          maxLength={320}
          required
          disabled={pending}
        />
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor="admin-password">
          Password
        </label>
        <input
          className="border-border bg-surface focus:border-focus mt-2 min-h-12 w-full rounded-sm border px-3.5 text-base transition-colors outline-none"
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          minLength={12}
          maxLength={128}
          required
          disabled={pending}
        />
      </div>
      <p
        className="text-danger min-h-6 text-sm"
        role="status"
        aria-live="polite"
      >
        {message}
      </p>
      <Button className="w-full" type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

"use client";

import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";

import {
  initialAdminActionState,
  type AdminActionState,
} from "@/features/admin/action-state";

type Action = (
  state: AdminActionState,
  formData: FormData,
) => Promise<AdminActionState>;

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      className="bg-accent text-accent-foreground min-h-11 rounded-sm px-5 text-sm font-semibold disabled:cursor-wait disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

export function ActionForm({
  action,
  children,
  submitLabel = "Save changes",
  className = "",
}: {
  action: Action;
  children: ReactNode;
  submitLabel?: string;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, initialAdminActionState);
  const errors = Object.values(state.fieldErrors ?? {}).flat();
  return (
    <form action={formAction} className={className}>
      {children}
      {state.status !== "idle" ? (
        <div
          className={`mt-5 border-l-2 pl-4 text-sm ${state.status === "error" ? "border-danger text-danger" : "border-success text-success"}`}
          role={state.status === "error" ? "alert" : "status"}
        >
          <p>{state.message}</p>
          {errors.length ? (
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {errors.map((error, index) => (
                <li key={`${error}-${index}`}>{error}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      <div className="border-border mt-6 flex justify-end border-t pt-5">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}

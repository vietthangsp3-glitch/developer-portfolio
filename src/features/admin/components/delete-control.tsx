import type { ReactNode } from "react";

export function DeleteControl({
  action,
  id,
  label,
  disabledReason,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  label: string;
  disabledReason?: ReactNode;
}) {
  if (disabledReason)
    return <p className="text-muted-foreground text-xs">{disabledReason}</p>;
  return (
    <details className="border-danger/60 border p-3">
      <summary className="text-danger min-h-8 text-sm">Delete {label}</summary>
      <form action={action} className="mt-3 space-y-3">
        <input type="hidden" name="id" value={id} />
        <label className="flex items-start gap-2 text-xs">
          <input
            required
            type="checkbox"
            name="confirm"
            value="delete"
            className="mt-0.5 size-4"
          />
          <span>I understand this cannot be undone.</span>
        </label>
        <button
          type="submit"
          className="border-danger text-danger min-h-10 border px-3 text-sm"
        >
          Delete permanently
        </button>
      </form>
    </details>
  );
}

"use client";

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <div className="border-danger max-w-xl border-l-2 pl-5">
      <h1 className="text-2xl font-medium">Admin data is unavailable</h1>
      <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
        The request could not be completed. No sensitive database details have
        been exposed.
      </p>
      <button
        className="border-border hover:border-foreground mt-6 min-h-11 rounded-sm border px-4 text-sm transition-colors"
        type="button"
        onClick={reset}
      >
        Try again
      </button>
    </div>
  );
}

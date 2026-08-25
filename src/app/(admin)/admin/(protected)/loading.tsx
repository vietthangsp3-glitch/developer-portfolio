export default function AdminLoading() {
  return (
    <div aria-live="polite" aria-busy="true">
      <p className="font-mono text-xs tracking-[0.12em] uppercase">
        Loading admin data…
      </p>
    </div>
  );
}

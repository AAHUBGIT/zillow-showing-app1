export function PreviewModeBanner() {
  return (
    <div
      className="rounded-3xl border border-amber-200/80 bg-[linear-gradient(180deg,rgba(255,251,235,0.98),rgba(255,247,237,0.94))] px-4 py-4 text-sm text-amber-950 shadow-soft"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-semibold tracking-tight">Beta sample workspace - changes are not saved.</p>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-700">Read only beta</p>
      </div>
      <p className="mt-2 text-sm leading-6 text-amber-900/80">
        You can explore the workflow, filters, routes, and calendar handoff here. Save actions are
        disabled so the shared beta workspace stays stable.
      </p>
    </div>
  );
}

export function PreviewModeBanner() {
  return (
    <div
      className="rounded-3xl border border-amber-200/80 bg-[linear-gradient(180deg,rgba(255,251,235,0.98),rgba(255,247,237,0.94))] px-4 py-4 text-sm text-amber-950 shadow-soft"
      role="status"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-semibold tracking-tight">You are in preview mode - changes are not saved.</p>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-700">Read only preview</p>
      </div>
      <p className="mt-2 text-sm leading-6 text-amber-900/80">
        Use the app to explore the workflow, filters, routes, and calendar handoff. Create and
        update actions are intentionally disabled here.
      </p>
    </div>
  );
}

import { PreviewModeBanner } from "@/components/preview-mode-banner";
import { RouteDayPlanner } from "@/components/route-day-planner";
import { sortDateAndTime } from "@/lib/date";
import { isPreviewReadonlyMode } from "@/lib/deployment";
import { getLeads } from "@/lib/storage";

export default async function RoutesPage() {
  const leads = await getLeads();
  const isPreviewReadonly = isPreviewReadonlyMode();
  const scheduled = leads
    .filter((lead) => lead.showingDate && lead.showingTime)
    .sort((a, b) => sortDateAndTime(a.showingDate!, a.showingTime!, b.showingDate!, b.showingTime!));

  const routesByDay = scheduled.reduce<Record<string, typeof scheduled>>((acc, lead) => {
    const key = lead.showingDate!;
    acc[key] ??= [];
    acc[key].push(lead);
    return acc;
  }, {});

  const days = Object.keys(routesByDay).sort();

  return (
    <main className="space-y-6">
      {isPreviewReadonly ? <PreviewModeBanner /> : null}

      <section className="app-panel p-5 sm:p-6">
        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr] xl:items-end">
          <div className="max-w-3xl">
            <p className="app-eyebrow">Routes</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Daily showing route planner
            </h2>
            <p className="app-copy mt-2">
              Scheduled showings are grouped by day. Each day includes a Google Maps directions
              link built from the property addresses in showing order, with light same-time
              address clustering to make daily planning more practical.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="app-grid-card">
              <p className="app-kicker">Total Stops</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">{scheduled.length}</p>
            </div>
            <div className="app-grid-card">
              <p className="app-kicker">Day Groupings</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">{days.length}</p>
            </div>
            <div className="app-grid-card">
              <p className="app-kicker">Urgent Stops</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">
                {scheduled.filter((lead) => lead.priority === "urgent").length}
              </p>
            </div>
            <div className="app-grid-card">
              <p className="app-kicker">Priority Mix</p>
              <p className="mt-2 text-base font-semibold text-ink">
                {scheduled.filter((lead) => lead.priority === "high" || lead.priority === "urgent").length} high-focus tours
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-5">
        {days.length === 0 ? (
          <div className="app-subpanel p-8 text-sm text-slate-600">
            No scheduled showings yet. Add one from a lead details page to build your first route.
          </div>
        ) : (
          days.map((day) => {
            return (
              <RouteDayPlanner
                key={day}
                day={day}
                initialStops={routesByDay[day]}
                isPreviewReadonly={isPreviewReadonly}
              />
            );
          })
        )}
        </div>
      </section>
    </main>
  );
}

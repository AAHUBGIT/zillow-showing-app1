import Link from "next/link";
import { CopyRouteButton } from "@/components/copy-route-button";
import { formatDateLabel, formatDateTimeLabel, sortDateAndTime } from "@/lib/date";
import { PriorityBadge } from "@/components/priority-badge";
import { SourceBadge } from "@/components/source-badge";
import { buildGoogleMapsDirectionsLink, getLeads } from "@/lib/storage";

export default async function RoutesPage() {
  const leads = await getLeads();
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
    <main className="app-panel p-5 sm:p-6">
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr] xl:items-end">
        <div className="max-w-3xl">
          <p className="app-eyebrow">Routes</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Daily showing route planner
          </h2>
          <p className="app-copy mt-2">
            Scheduled showings are grouped by day. Each day includes a Google Maps directions
            link built from the property addresses in showing order.
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
            const dayLeads = routesByDay[day];
            const directionsLink = buildGoogleMapsDirectionsLink(
              dayLeads.map((lead) => lead.propertyAddress)
            );

            return (
              <section key={day} className="app-subpanel overflow-hidden p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <p className="text-lg font-semibold tracking-tight text-ink">{formatDateLabel(day)}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {dayLeads.length} scheduled {dayLeads.length === 1 ? "showing" : "showings"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <div className="app-chip">{dayLeads[0]?.showingDate || day}</div>
                      <div className="app-chip">
                        {dayLeads.filter((lead) => lead.priority === "urgent" || lead.priority === "high").length} priority stops
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <a
                      href={directionsLink}
                      target="_blank"
                      rel="noreferrer"
                      className="app-button-primary"
                    >
                      Open Google Maps Route
                    </a>
                    <CopyRouteButton link={directionsLink} />
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  {dayLeads.map((lead, index) => (
                    <div
                      key={lead.id}
                      className="flex flex-col gap-4 rounded-3xl border border-white/90 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                          Stop {index + 1}
                        </p>
                        <p className="mt-1 text-base font-semibold tracking-tight text-ink">
                          {lead.fullName}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">{lead.propertyAddress}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <PriorityBadge priority={lead.priority} />
                          <SourceBadge source={lead.source} />
                        </div>
                        <p className="mt-2 text-sm text-slate-500">
                          {formatDateTimeLabel(lead.showingDate!, lead.showingTime!)}
                        </p>
                      </div>

                      <Link href={`/leads/${lead.id}`} className="app-button-secondary">
                        View Lead
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>
    </main>
  );
}

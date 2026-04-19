import Link from "next/link";
import { CopyRouteButton } from "@/components/copy-route-button";
import { PreviewModeBanner } from "@/components/preview-mode-banner";
import { formatDateLabel, formatDateTimeLabel, sortDateAndTime } from "@/lib/date";
import { PriorityBadge } from "@/components/priority-badge";
import { RouteMapPreview } from "@/components/route-map-preview";
import { RouteStopControls } from "@/components/route-stop-controls";
import { SourceBadge } from "@/components/source-badge";
import { isPreviewReadonlyMode } from "@/lib/deployment";
import { buildRoutePreviewEmbedLink, getRouteDaySummary, sortRouteStops } from "@/lib/route-planner";
import { buildGoogleMapsDirectionsLink, getLeads } from "@/lib/storage";

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
            const dayLeads = sortRouteStops(routesByDay[day]);
            const directionsLink = buildGoogleMapsDirectionsLink(
              dayLeads.map((lead) => lead.propertyAddress)
            );
            const routePreviewLink = buildRoutePreviewEmbedLink(
              dayLeads.map((lead) => lead.propertyAddress)
            );
            const routeSummary = getRouteDaySummary(dayLeads);

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
                      <div className="app-chip">{routeSummary.totalDriveLabel}</div>
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

                {routeSummary.warning ? (
                  <div className="mt-5 rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    <p className="font-semibold">Route warning</p>
                    <p className="mt-1">{routeSummary.warning}</p>
                  </div>
                ) : null}

                <div className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
                  <RouteMapPreview
                    embedLink={routePreviewLink}
                    title={`Map preview for ${formatDateLabel(day)}`}
                  />

                  <div className="grid gap-3">
                    {dayLeads.map((lead, index) => (
                      <div key={lead.id} className="space-y-3">
                        {index > 0 ? (
                          <div
                            className={`rounded-2xl border px-4 py-3 text-sm ${
                              routeSummary.segments[index - 1]?.unrealistic
                                ? "border-amber-200 bg-amber-50 text-amber-900"
                                : "border-line/70 bg-slate-50 text-slate-600"
                            }`}
                          >
                            <p className="font-semibold">
                              Drive from stop {index} to stop {index + 1}:{" "}
                              {routeSummary.segments[index - 1]?.label}
                            </p>
                            {routeSummary.segments[index - 1]?.warning ? (
                              <p className="mt-1 text-xs leading-5">
                                {routeSummary.segments[index - 1]?.warning}
                              </p>
                            ) : null}
                          </div>
                        ) : null}

                        <div
                          className={`rounded-3xl border p-4 shadow-sm transition ${
                            lead.routeCompleted
                              ? "border-emerald-200 bg-emerald-50/70"
                              : "border-white/90 bg-white"
                          }`}
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                                  Stop {index + 1}
                                </p>
                                {lead.routeCompleted ? (
                                  <span className="rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                                    Completed
                                  </span>
                                ) : null}
                              </div>
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
                              {lead.routeNote ? (
                                <p className="mt-3 rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                                  {lead.routeNote}
                                </p>
                              ) : null}
                            </div>

                            <div className="flex w-full max-w-xl flex-col gap-3">
                              <RouteStopControls
                                leadId={lead.id}
                                showingDate={lead.showingDate}
                                routeCompleted={lead.routeCompleted}
                                routeNote={lead.routeNote}
                                canMoveUp={index > 0}
                                canMoveDown={index < dayLeads.length - 1}
                                isPreviewReadonly={isPreviewReadonly}
                              />
                              <Link href={`/leads/${lead.id}`} className="app-button-secondary text-center">
                                View Lead
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          })
        )}
        </div>
      </section>
    </main>
  );
}

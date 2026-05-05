import { PreviewModeBanner } from "@/components/preview-mode-banner";
import { RouteDayPlanner } from "@/components/route-day-planner";
import { formatDateLabel, formatDateTimeLabel } from "@/lib/date";
import { isPreviewReadonlyMode } from "@/lib/deployment";
import { buildGoogleMapsDirectionsLink, isRouteReadyLead, sortRouteStops } from "@/lib/route-planner";
import { getLeads } from "@/lib/storage";
import { LeadWithProperties } from "@/lib/types";

const appTimeZone = process.env.APP_TIME_ZONE || "America/New_York";

export default async function RoutesPage() {
  const leads = await getLeads();
  const isPreviewReadonly = isPreviewReadonlyMode();
  const scheduled = leads.filter(isRouteReadyLead);
  const today = getTodayIsoDate(appTimeZone);

  const routesByDay = scheduled.reduce<Record<string, typeof scheduled>>((acc, lead) => {
    const key = lead.showingDate!;
    acc[key] ??= [];
    acc[key].push(lead);
    return acc;
  }, {});

  const days = Object.keys(routesByDay).sort();
  const activeDays = days.filter((day) => day >= today);
  const pastDays = days.filter((day) => day < today).reverse();
  const activeStops = activeDays.flatMap((day) => routesByDay[day]);
  const urgentStopCount = activeStops.filter((lead) => lead.priority === "urgent").length;
  const priorityStopCount = activeStops.filter(
    (lead) => lead.priority === "high" || lead.priority === "urgent"
  ).length;

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
              link built from the property addresses in your saved showing order.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <RouteMetricLink
              href="#upcoming-routes"
              label="Total Stops"
              value={String(activeStops.length)}
            />
            <RouteMetricLink
              href="#upcoming-routes"
              label="Upcoming Days"
              value={String(activeDays.length)}
            />
            <RouteMetricLink
              href="#upcoming-routes"
              label="Urgent Stops"
              value={String(urgentStopCount)}
            />
            <RouteMetricLink
              href="#upcoming-routes"
              label="Priority Mix"
              value={`${priorityStopCount} high-focus tours`}
              compactValue
            />
          </div>
        </div>

        <div id="upcoming-routes" className="mt-6 scroll-mt-32 space-y-5">
          {activeDays.length === 0 ? (
            <div className="app-subpanel p-8 text-sm text-slate-600">
              No upcoming route stops.
            </div>
          ) : (
            activeDays.map((day) => {
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

          {pastDays.length > 0 ? (
            <details className="rounded-4xl border border-line/80 bg-white/85 p-5 shadow-soft">
              <summary className="cursor-pointer list-none text-sm font-semibold text-slate-700">
                Historical routes ({pastDays.length})
              </summary>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Past route days are kept for reference without crowding today's planning view.
              </p>
              <div className="mt-5 grid gap-3">
                {pastDays.map((day) => (
                  <PastRouteDay key={day} day={day} stops={routesByDay[day]} />
                ))}
              </div>
            </details>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function RouteMetricLink({
  href,
  label,
  value,
  compactValue = false
}: {
  href: string;
  label: string;
  value: string;
  compactValue?: boolean;
}) {
  return (
    <a
      href={href}
      className="app-grid-card block transition hover:-translate-y-0.5 hover:border-accent hover:shadow-panel focus-visible:ring-4 focus-visible:ring-accent/20"
      aria-label={`${label}: ${value}. Open route details.`}
    >
      <p className="app-kicker">{label}</p>
      <p
        className={
          compactValue
            ? "mt-2 text-base font-semibold text-ink"
            : "mt-2 text-3xl font-semibold tracking-tight text-ink"
        }
      >
        {value}
      </p>
      <p className="mt-2 text-xs font-medium text-slate-500">View routes</p>
    </a>
  );
}

function PastRouteDay({ day, stops }: { day: string; stops: LeadWithProperties[] }) {
  const orderedStops = sortRouteStops(stops);
  const mapsLink = buildGoogleMapsDirectionsLink(orderedStops.map((lead) => lead.propertyAddress));

  return (
    <article className="rounded-3xl border border-line/80 bg-slate-50/90 px-4 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-tight text-ink">{formatDateLabel(day)}</p>
          <p className="mt-1 text-sm text-slate-600">
            {orderedStops.length} historical {orderedStops.length === 1 ? "stop" : "stops"}
          </p>
        </div>
        <a href={mapsLink} target="_blank" rel="noreferrer" className="app-button-secondary">
          Open Maps
        </a>
      </div>
      <div className="mt-4 grid gap-2">
        {orderedStops.map((lead, index) => (
          <div key={lead.id} className="rounded-2xl border border-line/70 bg-white px-3 py-3 text-sm">
            <p className="font-semibold text-ink">
              Stop {index + 1}: {lead.fullName}
            </p>
            <p className="mt-1 text-slate-600">{lead.propertyAddress}</p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              {formatDateTimeLabel(lead.showingDate, lead.showingTime)}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}

function getTodayIsoDate(timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

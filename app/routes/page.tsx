import Link from "next/link";
import { formatDateLabel, formatDateTimeLabel, sortDateAndTime } from "@/lib/date";
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
    <main className="rounded-4xl border border-white/80 bg-white/85 p-5 shadow-panel backdrop-blur sm:p-6">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Routes</p>
        <h2 className="mt-1 text-2xl font-semibold text-ink">Daily showing route planner</h2>
        <p className="mt-2 text-sm text-slate-600">
          Scheduled showings are grouped by day. Each day includes a Google Maps directions
          link built from the property addresses in showing order.
        </p>
      </div>

      <div className="mt-6 space-y-5">
        {days.length === 0 ? (
          <div className="rounded-4xl bg-slate-50 p-6 text-sm text-slate-600">
            No scheduled showings yet. Add one from a lead details page to build your first route.
          </div>
        ) : (
          days.map((day) => {
            const dayLeads = routesByDay[day];
            const directionsLink = buildGoogleMapsDirectionsLink(
              dayLeads.map((lead) => lead.propertyAddress)
            );

            return (
              <section key={day} className="rounded-4xl bg-slate-50 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-ink">{formatDateLabel(day)}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {dayLeads.length} scheduled {dayLeads.length === 1 ? "showing" : "showings"}
                    </p>
                  </div>
                  <a
                    href={directionsLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Open Google Maps Route
                  </a>
                </div>

                <div className="mt-5 grid gap-3">
                  {dayLeads.map((lead, index) => (
                    <div
                      key={lead.id}
                      className="flex flex-col gap-3 rounded-3xl border border-white bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                          Stop {index + 1}
                        </p>
                        <p className="mt-1 text-base font-semibold text-ink">{lead.fullName}</p>
                        <p className="mt-1 text-sm text-slate-600">{lead.propertyAddress}</p>
                        <p className="mt-2 text-sm text-slate-500">
                          {formatDateTimeLabel(lead.showingDate!, lead.showingTime!)}
                        </p>
                      </div>

                      <Link
                        href={`/leads/${lead.id}`}
                        className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-accent hover:text-accent"
                      >
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

import Link from "next/link";
import { LeadCard } from "@/components/lead-card";
import { getLeads } from "@/lib/storage";

export default async function DashboardPage() {
  const leads = await getLeads();
  const stats = {
    total: leads.length,
    scheduled: leads.filter((lead) => lead.showingDate && lead.showingTime).length,
    new: leads.filter((lead) => lead.status === "new").length,
    closed: leads.filter((lead) => lead.status === "closed").length
  };

  return (
    <main className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Leads" value={stats.total} tone="bg-mist" />
        <StatCard label="New Leads" value={stats.new} tone="bg-amber-100" />
        <StatCard label="Scheduled Showings" value={stats.scheduled} tone="bg-emerald-100" />
        <StatCard label="Closed Leads" value={stats.closed} tone="bg-rose-100" />
      </section>

      <section className="rounded-4xl border border-white/80 bg-white/85 p-5 shadow-panel backdrop-blur sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              Lead Dashboard
            </p>
            <h2 className="mt-1 text-xl font-semibold text-ink">All leads in one place</h2>
            <p className="mt-2 text-sm text-slate-600">
              Tap any card to view lead details, update the status, or schedule a showing.
            </p>
          </div>
          <Link
            href="/routes"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-accent hover:text-accent"
          >
            View Routes
          </Link>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  tone
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className={`rounded-4xl ${tone} p-5 shadow-panel`}>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-ink">{value}</p>
    </div>
  );
}

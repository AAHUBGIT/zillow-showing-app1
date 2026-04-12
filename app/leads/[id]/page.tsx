import Link from "next/link";
import { notFound } from "next/navigation";
import { updateLeadSchedule } from "@/lib/actions";
import { formatDateLabel, formatDateTimeLabel } from "@/lib/date";
import { getLeadById } from "@/lib/storage";

const statusOptions = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "scheduled", label: "Scheduled" },
  { value: "closed", label: "Closed" }
] as const;

export default async function LeadDetailsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await getLeadById(id);

  if (!lead) {
    notFound();
  }

  return (
    <main className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-4xl border border-white/80 bg-white/85 p-5 shadow-panel backdrop-blur sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              Lead Details
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-ink">{lead.fullName}</h2>
            <p className="mt-2 text-sm text-slate-600">{lead.propertyAddress}</p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-accent hover:text-accent"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <InfoCard label="Phone" value={lead.phone} />
          <InfoCard label="Email" value={lead.email} />
          <InfoCard label="Desired move-in" value={formatDateLabel(lead.desiredMoveInDate)} />
          <InfoCard label="Status" value={lead.status} />
        </div>

        <div className="mt-6 rounded-3xl bg-slate-50 p-5">
          <p className="text-sm font-semibold text-ink">Lead notes</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
            {lead.notes || "No notes added yet."}
          </p>
        </div>
      </section>

      <aside className="rounded-4xl border border-white/80 bg-white/85 p-5 shadow-panel backdrop-blur sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
          Scheduling
        </p>
        <h3 className="mt-1 text-xl font-semibold text-ink">Assign or update showing</h3>
        <p className="mt-2 text-sm text-slate-600">
          This is where you set the showing date, time, agent notes, and lead status.
        </p>

        <div className="mt-5 rounded-3xl bg-slate-50 p-4">
          <p className="text-sm font-semibold text-ink">Current showing</p>
          <p className="mt-2 text-sm text-slate-600">
            {lead.showingDate && lead.showingTime
              ? formatDateTimeLabel(lead.showingDate, lead.showingTime)
              : "No showing scheduled yet."}
          </p>
        </div>

        <form action={updateLeadSchedule} className="mt-5 grid gap-4">
          <input type="hidden" name="id" value={lead.id} />

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Status</span>
            <select
              name="status"
              defaultValue={lead.status}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Showing date</span>
            <input
              type="date"
              name="showingDate"
              defaultValue={lead.showingDate}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Showing time</span>
            <input
              type="time"
              name="showingTime"
              defaultValue={lead.showingTime}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Agent notes</span>
            <textarea
              name="agentNotes"
              rows={5}
              defaultValue={lead.agentNotes}
              className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            />
          </label>

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Update Lead
          </button>
        </form>
      </aside>
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-slate-50 p-4">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

import { createLead } from "@/lib/actions";

const statusOptions = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "scheduled", label: "Scheduled" },
  { value: "closed", label: "Closed" }
] as const;

export default function NewLeadPage() {
  return (
    <main className="rounded-4xl border border-white/80 bg-white/85 p-5 shadow-panel backdrop-blur sm:p-6">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
          New Lead
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-ink">Add a renter lead</h2>
        <p className="mt-2 text-sm text-slate-600">
          Fill out the basics below. You can add a showing schedule right away or leave it for
          the details page later.
        </p>
      </div>

      <form action={createLead} className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Full name" name="fullName" required />
        <Field label="Phone" name="phone" type="tel" required />
        <Field label="Email" name="email" type="email" required />
        <Field label="Property address" name="propertyAddress" required />
        <Field label="Desired move-in date" name="desiredMoveInDate" type="date" required />

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Status</span>
          <select
            name="status"
            defaultValue="new"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="sm:col-span-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Notes</span>
            <textarea
              name="notes"
              rows={4}
              placeholder="Example: Prefers first-floor units, works downtown, wants parking."
              className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            />
          </label>
        </div>

        <div className="sm:col-span-2 rounded-3xl bg-slate-50 p-4">
          <p className="text-sm font-semibold text-ink">Optional first showing setup</p>
          <p className="mt-1 text-sm text-slate-600">
            If you already know the appointment time, add it now.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Showing date" name="showingDate" type="date" />
            <Field label="Showing time" name="showingTime" type="time" />
          </div>
          <div className="mt-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Agent notes</span>
              <textarea
                name="agentNotes"
                rows={3}
                placeholder="Lockbox code, parking tips, pet policy reminders, and so on."
                className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm"
              />
            </label>
          </div>
        </div>

        <div className="sm:col-span-2 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Save Lead
          </button>
        </div>
      </form>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        name={name}
        required={required}
        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
      />
    </label>
  );
}

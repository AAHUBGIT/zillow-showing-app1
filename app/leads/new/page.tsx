import { createLead } from "@/lib/actions";
import {
  getPriorityLabel,
  getSourceLabel,
  getStatusLabel,
  leadPriorityOptions,
  leadSourceOptions,
  leadStatusOptions
} from "@/lib/lead-utils";

export default function NewLeadPage() {
  return (
    <main className="app-panel p-5 sm:p-6">
      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr] xl:items-end">
        <div className="max-w-3xl">
          <p className="app-eyebrow">New Lead</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Add a renter lead
          </h2>
          <p className="app-copy mt-2">
            Fill out the basics below. You can add a showing schedule right away or leave it for
            the details page later.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="app-grid-card">
            <p className="app-kicker">Workflow</p>
            <p className="mt-2 text-base font-semibold text-ink">Create a new CRM record</p>
          </div>
          <div className="app-grid-card">
            <p className="app-kicker">Optional</p>
            <p className="mt-2 text-base font-semibold text-ink">Add showing details now or later</p>
          </div>
        </div>
      </div>

      <form action={createLead} className="mt-8 grid gap-5 sm:grid-cols-2">
        <Field label="Full name" name="fullName" required />
        <Field label="Phone" name="phone" type="tel" required />
        <Field label="Email" name="email" type="email" required />
        <Field label="Property address" name="propertyAddress" required />
        <Field label="Desired move-in date" name="desiredMoveInDate" type="date" required />
        <Field label="Next follow-up date" name="nextFollowUpDate" type="date" />

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Status</span>
          <select name="status" defaultValue="new" className="app-input">
            {leadStatusOptions.map((option) => (
              <option key={option} value={option}>
                {getStatusLabel(option)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Priority</span>
          <select name="priority" defaultValue="medium" className="app-input">
            {leadPriorityOptions.map((option) => (
              <option key={option} value={option}>
                {getPriorityLabel(option)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Lead source</span>
          <select name="source" defaultValue="other" className="app-input">
            {leadSourceOptions.map((option) => (
              <option key={option} value={option}>
                {getSourceLabel(option)}
              </option>
            ))}
          </select>
        </label>

        <div className="rounded-3xl border border-line/70 bg-slate-50/80 px-4 py-4">
          <p className="app-kicker">Lead Quality</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Use priority and follow-up date to keep urgent inquiries and time-sensitive leads near
            the top of the dashboard.
          </p>
        </div>

        <div className="sm:col-span-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Notes</span>
            <textarea
              name="notes"
              rows={4}
              placeholder="Example: Prefers first-floor units, works downtown, wants parking."
              className="app-textarea"
            />
          </label>
        </div>

        <div className="sm:col-span-2 app-subpanel p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">Optional first showing setup</p>
              <p className="mt-1 text-sm text-slate-600">
                Capture the showing now if you already have a scheduled tour.
              </p>
            </div>
            <div className="app-chip">Optional</div>
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Showing date" name="showingDate" type="date" />
            <Field label="Showing time" name="showingTime" type="time" />
          </div>
          <div className="mt-5">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Agent notes</span>
              <textarea
                name="agentNotes"
                rows={3}
                placeholder="Lockbox code, parking tips, pet policy reminders, and so on."
                className="app-textarea"
              />
            </label>
          </div>
        </div>

        <div className="sm:col-span-2 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Create a record with real context</p>
            <p className="mt-1 text-sm text-slate-500">
              Priority, source, and follow-up timing help the dashboard rank the lead intelligently.
            </p>
          </div>
          <button type="submit" className="app-button-primary">
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
      <input type={type} name={name} required={required} className="app-input" />
    </label>
  );
}

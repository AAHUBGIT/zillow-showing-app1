import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarLinkButton } from "@/components/calendar-link-button";
import { FollowUpBadge } from "@/components/follow-up-badge";
import { PriorityBadge } from "@/components/priority-badge";
import { SourceBadge } from "@/components/source-badge";
import { updateLeadSchedule } from "@/lib/actions";
import { buildGoogleCalendarUrl } from "@/lib/calendar";
import { formatDateLabel, formatDateTimeLabel } from "@/lib/date";
import {
  getPriorityLabel,
  getSourceLabel,
  getStatusLabel,
  leadPriorityOptions,
  leadSourceOptions,
  leadStatusOptions
} from "@/lib/lead-utils";
import { getLeadById } from "@/lib/storage";

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

  const calendarUrl = buildGoogleCalendarUrl(lead);

  return (
    <main className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="space-y-6">
        <div className="app-panel p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="app-eyebrow">Lead Details</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                {lead.fullName}
              </h2>
              <p className="mt-2 text-sm text-slate-500">{lead.propertyAddress}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <PriorityBadge priority={lead.priority} />
                <SourceBadge source={lead.source} />
                <FollowUpBadge nextFollowUpDate={lead.nextFollowUpDate} />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/" className="app-button-secondary">
                Back to Dashboard
              </Link>
              <CalendarLinkButton
                calendarUrl={calendarUrl}
                missingMessage="Add a showing date and time before creating a Google Calendar event."
              />
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <InfoCard label="Phone" value={lead.phone} />
            <InfoCard label="Email" value={lead.email} />
            <InfoCard label="Desired move-in" value={formatDateLabel(lead.desiredMoveInDate)} />
            <InfoCard label="Status" value={getStatusLabel(lead.status)} />
            <InfoCard
              label="Next follow-up"
              value={lead.nextFollowUpDate ? formatDateLabel(lead.nextFollowUpDate) : "Not set"}
            />
            <InfoCard label="Priority" value={getPriorityLabel(lead.priority)} />
            <InfoCard label="Source" value={getSourceLabel(lead.source)} />
            <InfoCard
              label="Showing"
              value={
                lead.showingDate && lead.showingTime
                  ? formatDateTimeLabel(lead.showingDate, lead.showingTime)
                  : "Not scheduled"
              }
            />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="app-subpanel p-5">
              <p className="app-kicker">Lead Notes</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {lead.notes || "No notes added yet."}
              </p>
            </div>

            <div className="app-subpanel p-5">
              <p className="app-kicker">Contact Shortcuts</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <a href={`tel:${lead.phone}`} className="app-button-secondary">
                  Call
                </a>
                <a href={`sms:${lead.phone}`} className="app-button-secondary">
                  Text
                </a>
                <a href={`mailto:${lead.email}`} className="app-button-secondary">
                  Email
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="app-panel p-5 sm:p-6">
          <p className="app-eyebrow">Showing Snapshot</p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="app-grid-card">
              <p className="app-kicker">Current Showing</p>
              <p className="mt-2 text-base font-semibold text-ink">
                {lead.showingDate && lead.showingTime
                  ? formatDateTimeLabel(lead.showingDate, lead.showingTime)
                  : "No showing scheduled yet."}
              </p>
            </div>
            <div className="app-grid-card">
              <p className="app-kicker">Property</p>
              <p className="mt-2 text-base font-semibold text-ink">{lead.propertyAddress}</p>
            </div>
            <div className="app-grid-card">
              <p className="app-kicker">Agent Notes</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {lead.agentNotes || "No agent notes yet."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <aside className="app-panel p-5 sm:p-6">
        <p className="app-eyebrow">Scheduling</p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink">
          Assign or update showing
        </h3>
        <p className="app-copy mt-2">
          Update the showing date, time, notes, and status. When a showing is scheduled, you can
          also send it straight to Google Calendar.
        </p>

        <div className="mt-5 app-subpanel p-4">
          <p className="app-kicker">Current Appointment</p>
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
            <select name="status" defaultValue={lead.status} className="app-input">
              {leadStatusOptions.map((option) => (
                <option key={option} value={option}>
                  {getStatusLabel(option)}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Priority</span>
              <select name="priority" defaultValue={lead.priority} className="app-input">
                {leadPriorityOptions.map((option) => (
                  <option key={option} value={option}>
                    {getPriorityLabel(option)}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Lead source</span>
              <select name="source" defaultValue={lead.source} className="app-input">
                {leadSourceOptions.map((option) => (
                  <option key={option} value={option}>
                    {getSourceLabel(option)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Showing date</span>
              <input
                type="date"
                name="showingDate"
                defaultValue={lead.showingDate}
                className="app-input"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Showing time</span>
              <input
                type="time"
                name="showingTime"
                defaultValue={lead.showingTime}
                className="app-input"
              />
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Next follow-up date</span>
            <input
              type="date"
              name="nextFollowUpDate"
              defaultValue={lead.nextFollowUpDate}
              className="app-input"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Agent notes</span>
            <textarea
              name="agentNotes"
              rows={5}
              defaultValue={lead.agentNotes}
              className="app-textarea"
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="submit" className="app-button-primary">
              Update Lead
            </button>
            <CalendarLinkButton
              calendarUrl={calendarUrl}
              missingMessage="Add a showing date and time before creating a Google Calendar event."
            />
          </div>
        </form>
      </aside>
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-line/70 bg-slate-50 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

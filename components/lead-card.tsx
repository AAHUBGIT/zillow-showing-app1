import { ContactActionLink } from "@/components/contact-action-link";
import { LoadingLink } from "@/components/loading-link";
import { getBedroomBathroomLabel, getBudgetLabel, getPreScreenStatus } from "@/lib/client-preferences";
import { buildCallHref, buildLeadEmailHref, buildLeadTextHref } from "@/lib/contact-actions";
import { formatDateLabel, formatDateTimeLabel } from "@/lib/date";
import { getSourceLabel } from "@/lib/lead-utils";
import { getPropertyInterestCountLabel } from "@/lib/property-interest-utils";
import { LeadWithProperties } from "@/lib/types";
import { FollowUpBadge } from "./follow-up-badge";
import { LeadStatusForm } from "./lead-status-form";
import { PriorityBadge } from "./priority-badge";
import { LeadStatusBadge } from "./lead-status-badge";
import { SourceBadge } from "./source-badge";

export function LeadCard({
  lead,
  isPreviewReadonly = false
}: {
  lead: LeadWithProperties;
  isPreviewReadonly?: boolean;
}) {
  const propertyCount = lead.propertyInterests.length;
  const phone = lead.phone.trim();
  const email = lead.email.trim();
  const hasPhone = phone.length > 0;
  const hasEmail = email.length > 0;

  return (
    <article className="group rounded-4xl border border-line/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-panel">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(37,99,235,0.14),rgba(15,23,42,0.08))] text-base font-semibold text-accent">
              {lead.fullName
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold tracking-tight text-ink">{lead.fullName}</p>
              <p className="mt-1 truncate text-sm text-slate-500">Primary target: {lead.propertyAddress}</p>
            </div>
          </div>
        </div>
        <LeadStatusBadge status={lead.status} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <PriorityBadge priority={lead.priority} />
        <SourceBadge source={lead.source} />
        <FollowUpBadge nextFollowUpDate={lead.nextFollowUpDate} />
        <div className="app-chip">{getPropertyInterestCountLabel(propertyCount)}</div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <PreferenceChip label={`Budget: ${getBudgetLabel(lead)}`} />
        <PreferenceChip label={getBedroomBathroomLabel(lead)} />
        <PreferenceChip label={getPreScreenStatus(lead)} />
        {lead.applicationReady ? <PreferenceChip label="Application ready" /> : null}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <ContactActionLink
          href={buildCallHref(phone)}
          label="Call"
          toastMessage="Opening phone app"
          disabled={!hasPhone}
          disabledLabel="Phone unavailable"
          className="app-button-secondary px-3 py-2 text-xs"
        />
        <ContactActionLink
          href={buildLeadTextHref(lead)}
          label="Text"
          toastMessage="Opening text app"
          disabled={!hasPhone}
          disabledLabel="Phone unavailable"
          className="app-button-secondary px-3 py-2 text-xs"
        />
        <ContactActionLink
          href={buildLeadEmailHref(lead)}
          label="Email"
          toastMessage="Opening email app"
          disabled={!hasEmail}
          disabledLabel="Email unavailable"
          className="app-button-secondary px-3 py-2 text-xs"
        />
      </div>

      <details className="group mt-5">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl border border-line/80 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-accent hover:text-accent [&::-webkit-details-marker]:hidden">
          <span>Lead details</span>
          <span className="rounded-full border border-line bg-slate-50 px-3 py-1 text-xs text-slate-600 group-open:hidden">
            Expand
          </span>
          <span className="hidden rounded-full border border-accent/30 bg-accentSoft px-3 py-1 text-xs text-accent group-open:inline-flex">
            Collapse
          </span>
        </summary>

        <div className="mt-4 space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoRow label="Move-in" value={formatDateLabel(lead.desiredMoveInDate)} />
            <InfoRow label="Phone" value={lead.phone} />
            <InfoRow label="Email" value={lead.email} />
            <InfoRow
              label="Next Follow-Up"
              value={lead.nextFollowUpDate ? formatDateLabel(lead.nextFollowUpDate) : "Not set"}
            />
            <InfoRow label="Tracked Properties" value={String(propertyCount)} />
            <InfoRow
              label="Showing"
              value={
                lead.showingDate && lead.showingTime
                  ? formatDateTimeLabel(lead.showingDate, lead.showingTime)
                  : "Not scheduled"
              }
            />
            <InfoRow label="Source" value={getSourceLabel(lead.source)} />
          </div>

          <div className="rounded-3xl border border-line/70 bg-slate-50/90 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Lead Notes
            </p>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
              {lead.notes || "No notes yet."}
            </p>
          </div>

          <LeadStatusForm
            leadId={lead.id}
            currentStatus={lead.status}
            isPreviewReadonly={isPreviewReadonly}
          />
        </div>
      </details>

      <div className="mt-5 flex flex-wrap gap-3">
        <LoadingLink href={`/leads/${lead.id}`} className="app-button-primary">
          Open Details
        </LoadingLink>
        <LoadingLink
          href={`/leads/${lead.id}#schedule-showing`}
          className="app-button-secondary"
          loadingLabel="Opening Schedule..."
        >
          Schedule Showing
        </LoadingLink>
      </div>
    </article>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line/70 bg-white/80 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}

function PreferenceChip({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-line/80 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
      {label}
    </span>
  );
}

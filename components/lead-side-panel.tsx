"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ContactActionLink } from "@/components/contact-action-link";
import { LeadFollowUpDateEditor } from "@/components/lead-follow-up-date-editor";
import { LeadStatusBadge } from "@/components/lead-status-badge";
import { LoadingLink } from "@/components/loading-link";
import { PriorityBadge } from "@/components/priority-badge";
import { SidePanel } from "@/components/side-panel";
import { SourceBadge } from "@/components/source-badge";
import { getBedroomBathroomLabel, getBudgetLabel, getPreScreenStatus } from "@/lib/client-preferences";
import { buildCallHref, buildLeadEmailHref, buildLeadTextHref } from "@/lib/contact-actions";
import { formatDateLabel, formatDateTimeLabel } from "@/lib/date";
import { getSourceLabel } from "@/lib/lead-utils";
import { getPropertyInterestCountLabel, getPropertyInterestStatusLabel } from "@/lib/property-interest-utils";
import type { CommunicationActivity, LeadWithProperties } from "@/lib/types";

export function LeadSidePanel({
  lead,
  isPreviewReadonly = false,
  triggerLabel = "Quick View",
  triggerClassName = "app-button-secondary",
  redirectTo
}: {
  lead: LeadWithProperties;
  isPreviewReadonly?: boolean;
  triggerLabel?: string;
  triggerClassName?: string;
  redirectTo?: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const resolvedRedirectTo = redirectTo || pathname || "/";
  const phone = lead.phone.trim();
  const email = lead.email.trim();
  const topProperties = useMemo(() => lead.propertyInterests.slice(0, 4), [lead.propertyInterests]);

  return (
    <>
      <button
        type="button"
        className={triggerClassName}
        onClick={(event) => {
          event.stopPropagation();
          setOpen(true);
        }}
      >
        {triggerLabel}
      </button>

      <SidePanel
        open={open}
        onClose={() => setOpen(false)}
        eyebrow="Lead Quick View"
        title={lead.fullName}
        footer={
          <div className="grid gap-2 sm:grid-cols-2">
            <LoadingLink href={`/leads/${lead.id}`} className="app-button-primary w-full">
              Open Full Record
            </LoadingLink>
            <LoadingLink href={`/leads/${lead.id}#schedule-showing`} className="app-button-secondary w-full">
              Schedule Showing
            </LoadingLink>
          </div>
        }
      >
        <div className="space-y-5">
          <section className="rounded-3xl border border-line/80 bg-slate-50/80 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm leading-6 text-slate-600">{lead.propertyAddress}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <PriorityBadge priority={lead.priority} />
                  <SourceBadge source={lead.source} />
                  <LeadStatusBadge status={lead.status} />
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-2 sm:grid-cols-3">
            <ContactActionLink
              action="call"
              href={buildCallHref(phone)}
              disabled={!phone}
              className="app-button-secondary min-h-[42px] px-3 py-2 text-xs"
            />
            <ContactActionLink
              action="text"
              href={buildLeadTextHref(lead)}
              disabled={!phone}
              className="app-button-secondary min-h-[42px] px-3 py-2 text-xs"
            />
            <ContactActionLink
              action="email"
              href={buildLeadEmailHref(lead)}
              disabled={!email}
              className="app-button-secondary min-h-[42px] px-3 py-2 text-xs"
            />
          </section>

          <section className="grid gap-3 sm:grid-cols-2">
            <QuickMetric label="Budget" value={getBudgetLabel(lead)} />
            <QuickMetric label="Beds/Baths" value={getBedroomBathroomLabel(lead)} />
            <QuickMetric label="Pre-screen" value={getPreScreenStatus(lead)} />
            <QuickMetric
              label="Showing"
              value={
                lead.showingDate && lead.showingTime
                  ? formatDateTimeLabel(lead.showingDate, lead.showingTime)
                  : "Not scheduled"
              }
            />
          </section>

          <LeadFollowUpDateEditor
            leadId={lead.id}
            initialDate={lead.nextFollowUpDate}
            redirectTo={resolvedRedirectTo}
            isPreviewReadonly={isPreviewReadonly}
            compact
          />

          <section className="rounded-3xl border border-line/80 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="app-kicker">Tracked Properties</p>
                <p className="mt-1 text-sm font-semibold text-ink">
                  {getPropertyInterestCountLabel(lead.propertyInterests.length)}
                </p>
              </div>
              <LoadingLink href={`/leads/${lead.id}#properties`} className="app-button-secondary min-h-[38px] px-3 py-2 text-xs">
                View
              </LoadingLink>
            </div>

            <div className="mt-3 grid gap-2">
              {topProperties.length > 0 ? (
                topProperties.map((property) => (
                  <div key={property.id} className="rounded-2xl border border-line/70 bg-slate-50 px-3 py-2">
                    <p className="truncate text-sm font-semibold text-ink">
                      {property.listingTitle || property.address}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {[property.rent, property.beds ? `${property.beds} bd` : "", property.neighborhood]
                        .filter(Boolean)
                        .join(" - ") || property.address}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {getPropertyInterestStatusLabel(property.status)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-line bg-slate-50 px-3 py-4 text-sm text-slate-500">
                  No properties attached yet.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-line/80 bg-white p-4">
            <p className="app-kicker">Notes and Activity</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {lead.notes || "No lead notes yet."}
            </p>
            <LastActivityLine activity={lead.lastActivity || null} />
          </section>

          <section className="rounded-3xl border border-line/80 bg-white p-4">
            <p className="app-kicker">Record Snapshot</p>
            <div className="mt-3 grid gap-2 text-sm text-slate-600">
              <p>Move-in: {formatDateLabel(lead.desiredMoveInDate)}</p>
              <p>Source: {getSourceLabel(lead.source)}</p>
              <p>Application: {lead.applicationReady ? "Ready" : "Not ready yet"}</p>
            </div>
          </section>
        </div>
      </SidePanel>
    </>
  );
}

function QuickMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line/80 bg-white px-3 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-700">{value}</p>
    </div>
  );
}

function LastActivityLine({ activity }: { activity: CommunicationActivity | null }) {
  if (!activity) {
    return (
      <p className="mt-3 rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-500">
        Last activity: none logged
      </p>
    );
  }

  return (
    <div className="mt-3 rounded-2xl bg-slate-50 px-3 py-2">
      <p className="text-sm font-semibold text-slate-700">
        {activity.channel.charAt(0).toUpperCase() + activity.channel.slice(1)} -{" "}
        {formatActivityDate(activity.createdAt)}
      </p>
      <p className="mt-1 line-clamp-2 text-sm text-slate-500">
        {activity.outcome || activity.body || activity.subject || "Activity logged"}
      </p>
    </div>
  );
}

function formatActivityDate(value: string) {
  if (!value) {
    return "recently";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

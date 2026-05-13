"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ContactActionLink } from "@/components/contact-action-link";
import { LeadFollowUpDateEditor } from "@/components/lead-follow-up-date-editor";
import { LeadSidePanel } from "@/components/lead-side-panel";
import { LoadingLink } from "@/components/loading-link";
import { getBedroomBathroomLabel, getBudgetLabel, getPreScreenStatus } from "@/lib/client-preferences";
import { buildCallHref, buildLeadEmailHref, buildLeadTextHref } from "@/lib/contact-actions";
import { formatDateLabel, formatDateTimeLabel } from "@/lib/date";
import { getSourceLabel } from "@/lib/lead-utils";
import { getPropertyInterestCountLabel, getPropertyInterestStatusLabel } from "@/lib/property-interest-utils";
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
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();

  return (
    <article className="dashboard-lead-card group rounded-4xl border border-line/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-panel">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex min-w-0 items-start gap-3">
            <div className="lead-card-avatar flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(37,99,235,0.14),rgba(15,23,42,0.08))] text-base font-semibold text-accent">
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
        <PropertySummaryChip lead={lead} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <PreferenceChip label={`Budget: ${getBudgetLabel(lead)}`} />
        <PreferenceChip label={getBedroomBathroomLabel(lead)} />
        <PreferenceChip label={getPreScreenStatus(lead)} />
        {lead.applicationReady ? <PreferenceChip label="Application ready" /> : null}
      </div>

      <div className="mt-4 rounded-2xl border border-line/80 bg-white p-2 shadow-sm">
        <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
          <button
            type="button"
            onClick={() => setIsExpanded((current) => !current)}
            aria-expanded={isExpanded}
            className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-accent focus-visible:ring-4 focus-visible:ring-accent/20"
          >
            <span>Lead details</span>
          </button>

          <div className="flex flex-wrap gap-2 xl:justify-end">
            <ContactActionLink
              action="call"
              href={buildCallHref(phone)}
              disabled={!hasPhone}
              className="app-button-secondary min-h-[38px] px-3 py-2 text-xs"
            />
            <ContactActionLink
              action="text"
              href={buildLeadTextHref(lead)}
              disabled={!hasPhone}
              className="app-button-secondary min-h-[38px] px-3 py-2 text-xs"
            />
            <ContactActionLink
              action="email"
              href={buildLeadEmailHref(lead)}
              disabled={!hasEmail}
              className="app-button-secondary min-h-[38px] px-3 py-2 text-xs"
            />
            <LeadSidePanel
              lead={lead}
              isPreviewReadonly={isPreviewReadonly}
              triggerLabel="Quick View"
              triggerClassName="app-button-secondary min-h-[38px] px-3 py-2 text-xs"
            />
            <LoadingLink
              href={`/leads/${lead.id}`}
              className="app-button-primary min-h-[38px] px-3 py-2 text-xs"
            >
              Open Details
            </LoadingLink>
            <LoadingLink
              href={`/leads/${lead.id}#schedule-showing`}
              className="app-button-secondary min-h-[38px] px-3 py-2 text-xs"
              loadingLabel="Opening Schedule..."
            >
              Schedule
            </LoadingLink>
          </div>
        </div>

        {isExpanded ? (
          <div className="mt-3 space-y-4 border-t border-line/70 pt-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoRow label="Move-in" value={formatDateLabel(lead.desiredMoveInDate)} />
              <InfoRow label="Phone" value={lead.phone} />
              <InfoRow label="Email" value={lead.email} />
              <LeadFollowUpDateEditor
                leadId={lead.id}
                initialDate={lead.nextFollowUpDate}
                redirectTo={pathname}
                isPreviewReadonly={isPreviewReadonly}
              />
              <PropertySummaryCard lead={lead} />
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
        ) : null}
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

function PropertySummaryChip({ lead }: { lead: LeadWithProperties }) {
  const countLabel = getPropertyInterestCountLabel(lead.propertyInterests.length);

  return (
    <span className="group/property relative inline-flex" tabIndex={0}>
      <span className="app-chip cursor-help">{countLabel}</span>
      <PropertySummaryTooltip lead={lead} />
    </span>
  );
}

function PropertySummaryCard({ lead }: { lead: LeadWithProperties }) {
  return (
    <div className="rounded-2xl border border-line/70 bg-white/80 px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Tracked Properties
          </p>
          <p className="mt-1 text-sm font-medium text-slate-700">
            {getPropertyInterestCountLabel(lead.propertyInterests.length)}
          </p>
        </div>
        <span className="group/property relative inline-flex" tabIndex={0}>
          <span className="rounded-full border border-line bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
            Summary
          </span>
          <PropertySummaryTooltip lead={lead} />
        </span>
      </div>
    </div>
  );
}

function PropertySummaryTooltip({ lead }: { lead: LeadWithProperties }) {
  const properties = lead.propertyInterests.slice(0, 4);
  const remaining = lead.propertyInterests.length - properties.length;

  return (
    <span className="pointer-events-none absolute left-0 top-full z-40 mt-2 hidden w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-line bg-white p-3 text-left shadow-panel group-hover/property:block group-focus-within/property:block">
      {properties.length === 0 ? (
        <span className="block text-xs font-medium leading-5 text-slate-500">
          No properties tracked yet.
        </span>
      ) : (
        <span className="grid gap-2">
          {properties.map((property) => (
            <span key={property.id} className="block rounded-xl bg-slate-50 px-3 py-2">
              <span className="block truncate text-xs font-semibold text-ink">
                {property.listingTitle || property.address}
              </span>
              <span className="mt-1 block truncate text-[11px] leading-4 text-slate-500">
                {[property.rent, property.beds ? `${property.beds} bd` : "", property.neighborhood]
                  .filter(Boolean)
                  .join(" - ") || property.address}
              </span>
              <span className="mt-1 block text-[11px] font-semibold text-slate-500">
                {getPropertyInterestStatusLabel(property.status)}
              </span>
            </span>
          ))}
          {remaining > 0 ? (
            <span className="block px-1 text-[11px] font-semibold text-slate-500">
              +{remaining} more
            </span>
          ) : null}
        </span>
      )}
    </span>
  );
}

function PreferenceChip({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-line/80 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
      {label}
    </span>
  );
}

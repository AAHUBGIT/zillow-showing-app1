"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ContactActionLink } from "@/components/contact-action-link";
import { FollowUpBadge } from "@/components/follow-up-badge";
import { LiveCalendarLinkButton } from "@/components/live-calendar-link-button";
import { LoadingLink } from "@/components/loading-link";
import { PriorityBadge } from "@/components/priority-badge";
import { SourceBadge } from "@/components/source-badge";
import { buildCallHref, buildLeadEmailHref, buildLeadTextHref } from "@/lib/contact-actions";
import { formatDateLabel, formatDateTimeLabel } from "@/lib/date";
import { getPriorityLabel, getSourceLabel, getStatusLabel } from "@/lib/lead-utils";
import { LeadWithProperties } from "@/lib/types";

type RecordDensity = "comfortable" | "compact";
type RecordLayout = "overview" | "full";

type RecordView = {
  density: RecordDensity;
  layout: RecordLayout;
};

const defaultRecordView: RecordView = {
  density: "compact",
  layout: "overview"
};

const recordViewStorageKey = "showings-crm:lead-record-view";

export function LeadRecordPanel({
  lead,
  calendarUrl
}: {
  lead: LeadWithProperties;
  calendarUrl: string | null;
}) {
  const [recordView, setRecordView] = useState<RecordView>(defaultRecordView);
  const phone = lead.phone.trim();
  const email = lead.email.trim();
  const hasPhone = phone.length > 0;
  const hasEmail = email.length > 0;
  const isCompact = recordView.density === "compact";

  useEffect(() => {
    const storedRecordView = window.localStorage.getItem(recordViewStorageKey);

    if (!storedRecordView) {
      return;
    }

    try {
      const parsedRecordView = JSON.parse(storedRecordView) as Partial<RecordView>;

      setRecordView({
        density: parsedRecordView.density === "compact" ? "compact" : "comfortable",
        layout: parsedRecordView.layout === "full" ? "full" : "overview"
      });
    } catch {
      window.localStorage.removeItem(recordViewStorageKey);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(recordViewStorageKey, JSON.stringify(recordView));
  }, [recordView]);

  const infoCards = useMemo(
    () => [
      { label: "Phone", value: lead.phone },
      { label: "Email", value: lead.email },
      { label: "Next follow-up", value: lead.nextFollowUpDate ? formatDateLabel(lead.nextFollowUpDate) : "Not set" },
      {
        label: "Showing",
        value:
          lead.showingDate && lead.showingTime
            ? formatDateTimeLabel(lead.showingDate, lead.showingTime)
            : "Not scheduled"
      },
      { label: "Desired move-in", value: formatDateLabel(lead.desiredMoveInDate) },
      { label: "Status", value: getStatusLabel(lead.status) },
      { label: "Priority", value: getPriorityLabel(lead.priority) },
      { label: "Source", value: getSourceLabel(lead.source) }
    ],
    [lead]
  );
  const visibleInfoCards =
    recordView.layout === "overview" ? infoCards.slice(0, 4) : infoCards;

  return (
    <div className={`app-panel ${isCompact ? "p-4 sm:p-5" : "p-5 sm:p-6"}`}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="app-eyebrow">Customer Record</p>
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
        <div className="flex flex-col gap-3 sm:items-end">
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <RecordViewButton
              active={recordView.layout === "overview"}
              onClick={() => setRecordView((current) => ({ ...current, layout: "overview" }))}
            >
              Overview
            </RecordViewButton>
            <RecordViewButton
              active={recordView.layout === "full"}
              onClick={() => setRecordView((current) => ({ ...current, layout: "full" }))}
            >
              Full
            </RecordViewButton>
            <RecordViewButton
              active={recordView.density === "compact"}
              onClick={() => setRecordView((current) => ({ ...current, density: "compact" }))}
            >
              Compact
            </RecordViewButton>
            <RecordViewButton
              active={recordView.density === "comfortable"}
              onClick={() =>
                setRecordView((current) => ({ ...current, density: "comfortable" }))
              }
            >
              Comfort
            </RecordViewButton>
          </div>
          <div className="mt-1 flex flex-wrap gap-3 sm:justify-end">
            <LoadingLink href="/" className="app-button-secondary">
              Back to Dashboard
            </LoadingLink>
            <LiveCalendarLinkButton
              leadId={lead.id}
              initialCalendarUrl={calendarUrl}
              missingMessage="Add a showing date and time before creating a Google Calendar event."
            />
          </div>
        </div>
      </div>

      <div className={`grid sm:grid-cols-2 xl:grid-cols-4 ${isCompact ? "mt-4 gap-3" : "mt-6 gap-4"}`}>
        {visibleInfoCards.map((item) => (
          <InfoCard
            key={item.label}
            label={item.label}
            value={item.value}
            density={recordView.density}
          />
        ))}
      </div>

      <div className={`grid gap-4 lg:grid-cols-[1.1fr_0.9fr] ${isCompact ? "mt-4" : "mt-6"}`}>
        <div className={`app-subpanel ${isCompact ? "p-4" : "p-5"}`}>
          <p className="app-kicker">Lead Notes</p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
            {lead.notes || "No notes added yet."}
          </p>
        </div>

        <div className={`app-subpanel ${isCompact ? "p-4" : "p-5"}`}>
          <p className="app-kicker">Contact Shortcuts</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <ContactActionLink action="call" href={buildCallHref(phone)} disabled={!hasPhone} />
            <ContactActionLink action="text" href={buildLeadTextHref(lead)} disabled={!hasPhone} />
            <ContactActionLink action="email" href={buildLeadEmailHref(lead)} disabled={!hasEmail} />
          </div>
        </div>
      </div>
    </div>
  );
}

function RecordViewButton({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "border-accent bg-accent text-white shadow-sm"
          : "border-line bg-white text-slate-600 hover:border-accent hover:text-accent"
      }`}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

function InfoCard({
  label,
  value,
  density
}: {
  label: string;
  value: string;
  density: RecordDensity;
}) {
  return (
    <div
      className={`rounded-3xl border border-line/70 bg-slate-50 ${
        density === "compact" ? "px-3 py-3" : "px-4 py-4"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

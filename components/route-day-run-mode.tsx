"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { LeadSidePanel } from "@/components/lead-side-panel";
import { LoadingLink } from "@/components/loading-link";
import { PriorityBadge } from "@/components/priority-badge";
import { ShowingLifecycleBadge } from "@/components/showing-lifecycle-badge";
import { SourceBadge } from "@/components/source-badge";
import { updateShowingLifecycle } from "@/lib/actions";
import { formatDateLabel, formatDateTimeLabel, formatTimeForManualEntry } from "@/lib/date";
import { buildGoogleMapsDirectionsLink, sortRouteStops } from "@/lib/route-planner";
import {
  getEffectiveShowingStatus,
  isTerminalShowingStatus
} from "@/lib/showing-lifecycle";
import type { LeadWithProperties, ShowingOutcome, ShowingStatus } from "@/lib/types";

type RunAction = "completed" | "no_show" | "canceled";
type DialogState = {
  action: RunAction;
  lead: LeadWithProperties;
} | null;

const completionOutcomes: Array<{ value: ShowingOutcome; label: string }> = [
  { value: "interested", label: "Loved it" },
  { value: "liked", label: "Liked it" },
  { value: "undecided", label: "Maybe" },
  { value: "rejected", label: "Rejected" },
  { value: "disliked", label: "Wrong fit" },
  { value: "applying", label: "Wants to apply" },
  { value: "needs_follow_up", label: "Needs follow-up" }
];

export function RouteDayRunMode({
  day,
  initialStops,
  isPreviewReadonly = false
}: {
  day: string;
  initialStops: LeadWithProperties[];
  isPreviewReadonly?: boolean;
}) {
  const [showFinished, setShowFinished] = useState(false);
  const [dialog, setDialog] = useState<DialogState>(null);

  const stops = useMemo(() => sortRouteStops(initialStops), [initialStops]);
  const activeStops = useMemo(
    () => stops.filter((lead) => !isFinishedStop(lead)),
    [stops]
  );
  const finishedStops = useMemo(
    () => stops.filter((lead) => isFinishedStop(lead)),
    [stops]
  );
  const nextStop = activeStops[0];
  const visibleStops = showFinished ? [...activeStops, ...finishedStops] : activeStops;
  const mapsLink = useMemo(
    () => buildGoogleMapsDirectionsLink(stops.map((lead) => lead.propertyAddress)),
    [stops]
  );

  return (
    <section id="route-day-run-mode" className="app-subpanel p-4 sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="app-eyebrow">Run Mode</p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink">
            {formatDateLabel(day)} route run
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Work the route from the next active stop. Finished stops stay out of the way unless
            you turn them back on.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="app-chip">{activeStops.length} active</span>
            <span className="app-chip">{finishedStops.length} finished</span>
            <span className="app-chip">{stops.length} total</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm">
            <input
              type="checkbox"
              checked={showFinished}
              onChange={(event) => setShowFinished(event.target.checked)}
              className="h-4 w-4 rounded border-line text-accent"
            />
            Show finished
          </label>
          <a href={mapsLink} target="_blank" rel="noreferrer" className="app-button-secondary">
            Open Maps
          </a>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <NowCard
          lead={nextStop}
          isPreviewReadonly={isPreviewReadonly}
          onOpenAction={setDialog}
        />

        <div className="rounded-3xl border border-line/80 bg-white p-3 shadow-sm sm:p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="app-kicker">Stop List</p>
              <p className="mt-1 text-sm text-slate-500">
                {showFinished ? "Active and finished stops" : "Active stops only"}
              </p>
            </div>
            <span className="app-chip">{visibleStops.length} shown</span>
          </div>

          <div className="mt-4 grid gap-3">
            {visibleStops.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-line bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                No active route stops. Turn on finished stops to review completed, no-show, or
                canceled showings.
              </div>
            ) : (
              visibleStops.map((lead, index) => (
                <RunModeStopCard
                  key={lead.id}
                  lead={lead}
                  index={index}
                  isPreviewReadonly={isPreviewReadonly}
                  onOpenAction={setDialog}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {dialog ? (
        <RunActionDialog
          dialog={dialog}
          redirectTo={`/routes?view=run&day=${day}#route-day-run-mode`}
          isPreviewReadonly={isPreviewReadonly}
          onClose={() => setDialog(null)}
        />
      ) : null}
    </section>
  );
}

function NowCard({
  lead,
  isPreviewReadonly,
  onOpenAction
}: {
  lead?: LeadWithProperties;
  isPreviewReadonly: boolean;
  onOpenAction: (dialog: DialogState) => void;
}) {
  if (!lead) {
    return (
      <section className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-5">
        <p className="app-kicker text-emerald-700">Now</p>
        <h4 className="mt-2 text-lg font-semibold text-emerald-950">Route is clear</h4>
        <p className="mt-2 text-sm leading-6 text-emerald-900">
          There are no active scheduled, confirmed, or rescheduled stops left for this route day.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-accent/20 bg-accent/5 p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="app-kicker text-accent">Now</p>
          <h4 className="mt-2 text-xl font-semibold tracking-tight text-ink">{lead.propertyAddress}</h4>
          <p className="mt-2 text-sm font-semibold text-slate-700">
            {formatTimeForManualEntry(lead.showingTime) || lead.showingTime} - {lead.fullName}
          </p>
        </div>
        <ShowingLifecycleBadge lead={lead} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <PriorityBadge priority={lead.priority} />
        <SourceBadge source={lead.source} />
        {lead.routeNote ? <span className="app-chip">{lead.routeNote}</span> : null}
      </div>

      <RunModeActions
        lead={lead}
        isPreviewReadonly={isPreviewReadonly}
        onOpenAction={onOpenAction}
        className="mt-5"
      />
    </section>
  );
}

function RunModeStopCard({
  lead,
  index,
  isPreviewReadonly,
  onOpenAction
}: {
  lead: LeadWithProperties;
  index: number;
  isPreviewReadonly: boolean;
  onOpenAction: (dialog: DialogState) => void;
}) {
  const finished = isFinishedStop(lead);

  return (
    <article
      className={`rounded-3xl border p-4 transition ${
        finished
          ? "border-line/70 bg-slate-50/80 opacity-75"
          : "border-line/90 bg-white shadow-sm"
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Stop {index + 1}
            </span>
            <ShowingLifecycleBadge lead={lead} />
            {finished ? <span className="app-chip">Finished</span> : null}
          </div>
          <h4 className="mt-3 text-base font-semibold tracking-tight text-ink">
            {lead.propertyAddress}
          </h4>
          <p className="mt-1 text-sm text-slate-600">
            {lead.fullName} - {formatDateTimeLabel(lead.showingDate, lead.showingTime)}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <PriorityBadge priority={lead.priority} />
            <SourceBadge source={lead.source} />
          </div>
          {lead.routeNote ? (
            <p className="mt-3 rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-600">
              {lead.routeNote}
            </p>
          ) : null}
        </div>

        <RunModeActions
          lead={lead}
          isPreviewReadonly={isPreviewReadonly}
          onOpenAction={onOpenAction}
          className="lg:max-w-sm"
        />
      </div>
    </article>
  );
}

function RunModeActions({
  lead,
  isPreviewReadonly,
  onOpenAction,
  className = ""
}: {
  lead: LeadWithProperties;
  isPreviewReadonly: boolean;
  onOpenAction: (dialog: DialogState) => void;
  className?: string;
}) {
  const status = getEffectiveShowingStatus(lead);
  const finished = isTerminalShowingStatus(status);
  const redirectTo = `/routes?view=run&day=${lead.showingDate}#route-day-run-mode`;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {!finished && status !== "confirmed" ? (
        <LifecycleInlineForm
          leadId={lead.id}
          redirectTo={redirectTo}
          showingStatus="confirmed"
          disabled={isPreviewReadonly}
          label="Confirm"
          pendingLabel="Confirming..."
        />
      ) : null}

      {!finished ? (
        <>
          <button
            type="button"
            disabled={isPreviewReadonly}
            onClick={() => onOpenAction({ action: "completed", lead })}
            className="app-button-secondary min-h-[38px] px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-55"
          >
            Complete
          </button>
          <button
            type="button"
            disabled={isPreviewReadonly}
            onClick={() => onOpenAction({ action: "no_show", lead })}
            className="app-button-secondary min-h-[38px] px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-55"
          >
            No-show
          </button>
          <button
            type="button"
            disabled={isPreviewReadonly}
            onClick={() => onOpenAction({ action: "canceled", lead })}
            className="app-button-secondary min-h-[38px] px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-55"
          >
            Cancel
          </button>
        </>
      ) : (
        <LifecycleInlineForm
          leadId={lead.id}
          redirectTo={redirectTo}
          showingStatus="scheduled"
          disabled={isPreviewReadonly}
          label="Reopen"
          pendingLabel="Reopening..."
        />
      )}

      <LeadSidePanel
        lead={lead}
        isPreviewReadonly={isPreviewReadonly}
        redirectTo={redirectTo}
        triggerLabel="Quick View"
        triggerClassName="app-button-secondary min-h-[38px] px-3 py-1.5 text-xs"
      />
      <LoadingLink
        href={`/leads/${lead.id}`}
        className="app-button-secondary min-h-[38px] px-3 py-1.5 text-xs"
        loadingLabel="Opening..."
      >
        View Lead
      </LoadingLink>
    </div>
  );
}

function LifecycleInlineForm({
  leadId,
  redirectTo,
  showingStatus,
  disabled,
  label,
  pendingLabel
}: {
  leadId: string;
  redirectTo: string;
  showingStatus: ShowingStatus;
  disabled: boolean;
  label: string;
  pendingLabel: string;
}) {
  return (
    <form action={updateShowingLifecycle}>
      <input type="hidden" name="leadId" value={leadId} />
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <input type="hidden" name="showingStatus" value={showingStatus} />
      <LifecycleSubmitButton disabled={disabled} pendingLabel={pendingLabel}>
        {label}
      </LifecycleSubmitButton>
    </form>
  );
}

function RunActionDialog({
  dialog,
  redirectTo,
  isPreviewReadonly,
  onClose
}: {
  dialog: NonNullable<DialogState>;
  redirectTo: string;
  isPreviewReadonly: boolean;
  onClose: () => void;
}) {
  const title =
    dialog.action === "completed"
      ? "Complete showing"
      : dialog.action === "no_show"
        ? "Mark no-show"
        : "Cancel showing";
  const description =
    dialog.action === "completed"
      ? "Choose an outcome before closing this stop."
      : "A reason is required so the activity history stays useful.";

  return (
    <div className="fixed inset-0 z-[90] bg-slate-950/20 px-4 py-4 backdrop-blur-[2px]" role="presentation">
      <button
        type="button"
        className="absolute inset-0 h-full w-full cursor-default"
        aria-label="Close route action"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute bottom-4 left-4 right-4 rounded-3xl border border-line/80 bg-white p-4 shadow-panel sm:left-auto sm:w-[420px]"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="app-kicker">Run Mode</p>
            <h4 className="mt-1 text-lg font-semibold text-ink">{title}</h4>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-slate-600 hover:border-accent hover:text-accent"
          >
            Close
          </button>
        </div>

        <p className="mt-4 rounded-2xl bg-slate-50 px-3 py-2 text-sm font-semibold text-ink">
          {dialog.lead.fullName} - {dialog.lead.propertyAddress}
        </p>

        <form action={updateShowingLifecycle} className="mt-4 grid gap-3">
          <input type="hidden" name="leadId" value={dialog.lead.id} />
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <input type="hidden" name="showingStatus" value={dialog.action} />
          <input type="hidden" name="requireLifecycleReason" value="true" />

          {dialog.action === "completed" ? (
            <>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Outcome</span>
                <select
                  name="showingOutcome"
                  required
                  defaultValue=""
                  className="app-input bg-white text-ink"
                >
                  <option value="" disabled>
                    Select outcome
                  </option>
                  {completionOutcomes.map((outcome) => (
                    <option key={`${outcome.value}-${outcome.label}`} value={outcome.value}>
                      {outcome.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Notes</span>
                <textarea
                  name="showingOutcomeNotes"
                  rows={4}
                  maxLength={1200}
                  className="app-textarea"
                  placeholder="What happened at the showing?"
                />
              </label>
              <LifecycleDialogButton disabled={isPreviewReadonly} pendingLabel="Saving...">
                Save completed stop
              </LifecycleDialogButton>
            </>
          ) : null}

          {dialog.action === "no_show" ? (
            <>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Reason</span>
                <textarea
                  name="showingOutcomeNotes"
                  rows={4}
                  required
                  maxLength={1200}
                  className="app-textarea"
                  placeholder="Why was this marked no-show?"
                />
              </label>
              <LifecycleDialogButton disabled={isPreviewReadonly} pendingLabel="Saving...">
                Save no-show
              </LifecycleDialogButton>
            </>
          ) : null}

          {dialog.action === "canceled" ? (
            <>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Cancellation reason</span>
                <textarea
                  name="showingCanceledReason"
                  rows={4}
                  required
                  maxLength={1200}
                  className="app-textarea"
                  placeholder="Why was this showing canceled?"
                />
              </label>
              <LifecycleDialogButton disabled={isPreviewReadonly} pendingLabel="Canceling...">
                Save cancellation
              </LifecycleDialogButton>
            </>
          ) : null}
        </form>
      </div>
    </div>
  );
}

function LifecycleSubmitButton({
  children,
  disabled,
  pendingLabel
}: {
  children: React.ReactNode;
  disabled: boolean;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      aria-busy={pending}
      className="app-button-secondary min-h-[38px] px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-55"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

function LifecycleDialogButton({
  children,
  disabled,
  pendingLabel
}: {
  children: React.ReactNode;
  disabled: boolean;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      aria-busy={pending}
      className="app-button-primary justify-self-start disabled:cursor-not-allowed disabled:opacity-55"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

function isFinishedStop(lead: LeadWithProperties) {
  const status = getEffectiveShowingStatus(lead);
  return isTerminalShowingStatus(status);
}

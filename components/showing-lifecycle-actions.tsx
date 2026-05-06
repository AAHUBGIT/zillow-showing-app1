"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import { InlineSpinner } from "@/components/inline-spinner";
import { TooltipShell } from "@/components/tooltip-shell";
import { updateShowingLifecycle } from "@/lib/actions";
import {
  getEffectiveShowingStatus,
  getShowingOutcomeLabel,
  isTerminalShowingStatus,
  showingOutcomeOptions
} from "@/lib/showing-lifecycle";
import type { LeadWithProperties, ShowingStatus } from "@/lib/types";

type ActionMode = "full" | "quick" | "route";

export function ShowingLifecycleActions({
  lead,
  redirectTo,
  mode = "quick",
  isPreviewReadonly = false,
  rescheduleHref
}: {
  lead: LeadWithProperties;
  redirectTo: string;
  mode?: ActionMode;
  isPreviewReadonly?: boolean;
  rescheduleHref?: string;
}) {
  const showingStatus = getEffectiveShowingStatus(lead);
  const hasShowing = Boolean(lead.showingDate && lead.showingTime);
  const isTerminal = isTerminalShowingStatus(showingStatus);
  const tooltipMessage = "This preview workspace is read-only. Use a live workspace to update showings.";
  const compactButtonClass =
    mode === "full"
      ? "app-button-secondary min-h-[42px] px-3.5 py-2 text-sm"
      : "app-button-secondary min-h-[36px] px-3 py-1.5 text-xs";

  if (!hasShowing) {
    return null;
  }

  return (
    <div className={mode === "full" ? "grid gap-3" : "flex flex-wrap items-center gap-2"}>
      <div className="flex flex-wrap items-center gap-2">
        {showingStatus !== "confirmed" && !isTerminal ? (
          <LifecycleForm
            leadId={lead.id}
            redirectTo={redirectTo}
            showingStatus="confirmed"
            buttonLabel="Confirm showing"
            pendingLabel="Confirming..."
            disabled={isPreviewReadonly}
            className={compactButtonClass}
            tooltipMessage={tooltipMessage}
          />
        ) : null}

        {!isTerminal ? (
          <>
            {mode === "full" ? null : (
              <LifecycleForm
                leadId={lead.id}
                redirectTo={redirectTo}
                showingStatus="completed"
                showingOutcome="undecided"
                buttonLabel={mode === "route" ? "Mark completed" : "Complete"}
                pendingLabel="Saving..."
                disabled={isPreviewReadonly}
                className={compactButtonClass}
                tooltipMessage={tooltipMessage}
              />
            )}
            <LifecycleForm
              leadId={lead.id}
              redirectTo={redirectTo}
              showingStatus="no_show"
              buttonLabel="No-show"
              pendingLabel="Saving..."
              disabled={isPreviewReadonly}
              className={compactButtonClass}
              tooltipMessage={tooltipMessage}
            />
            {mode === "full" ? null : (
              <LifecycleForm
                leadId={lead.id}
                redirectTo={redirectTo}
                showingStatus="canceled"
                buttonLabel="Cancel"
                pendingLabel="Canceling..."
                disabled={isPreviewReadonly}
                className={compactButtonClass}
                tooltipMessage={tooltipMessage}
              />
            )}
          </>
        ) : null}

        {rescheduleHref ? (
          <Link
            href={rescheduleHref}
            className={compactButtonClass}
          >
            Reschedule
          </Link>
        ) : null}
      </div>

      {mode === "full" && !isTerminal ? (
        <div className="grid gap-3">
          <details className="rounded-3xl border border-line/80 bg-slate-50/90 p-4">
            <summary className="cursor-pointer list-none text-sm font-semibold text-ink">
              Mark completed with outcome
            </summary>
            <LifecycleDetailForm
              leadId={lead.id}
              redirectTo={redirectTo}
              showingStatus="completed"
              disabled={isPreviewReadonly}
              tooltipMessage={tooltipMessage}
            />
          </details>

          <details className="rounded-3xl border border-line/80 bg-slate-50/90 p-4">
            <summary className="cursor-pointer list-none text-sm font-semibold text-ink">
              Cancel with reason
            </summary>
            <LifecycleCancelForm
              leadId={lead.id}
              redirectTo={redirectTo}
              disabled={isPreviewReadonly}
              tooltipMessage={tooltipMessage}
            />
          </details>
        </div>
      ) : null}
    </div>
  );
}

function HiddenLifecycleFields({
  leadId,
  redirectTo,
  showingStatus,
  showingOutcome = "",
  showingOutcomeNotes = "",
  showingCanceledReason = ""
}: {
  leadId: string;
  redirectTo: string;
  showingStatus: ShowingStatus;
  showingOutcome?: string;
  showingOutcomeNotes?: string;
  showingCanceledReason?: string;
}) {
  return (
    <>
      <input type="hidden" name="leadId" value={leadId} />
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <input type="hidden" name="showingStatus" value={showingStatus} />
      <input type="hidden" name="showingOutcome" value={showingOutcome} />
      <input type="hidden" name="showingOutcomeNotes" value={showingOutcomeNotes} />
      <input type="hidden" name="showingCanceledReason" value={showingCanceledReason} />
    </>
  );
}

function LifecycleForm({
  leadId,
  redirectTo,
  showingStatus,
  showingOutcome,
  buttonLabel,
  pendingLabel,
  disabled,
  className,
  tooltipMessage
}: {
  leadId: string;
  redirectTo: string;
  showingStatus: ShowingStatus;
  showingOutcome?: string;
  buttonLabel: string;
  pendingLabel: string;
  disabled: boolean;
  className: string;
  tooltipMessage: string;
}) {
  return (
    <TooltipShell disabled={disabled} message={tooltipMessage}>
      <form action={updateShowingLifecycle}>
        <HiddenLifecycleFields
          leadId={leadId}
          redirectTo={redirectTo}
          showingStatus={showingStatus}
          showingOutcome={showingOutcome}
        />
        <LifecycleButton disabled={disabled} pendingLabel={pendingLabel} className={className}>
          {buttonLabel}
        </LifecycleButton>
      </form>
    </TooltipShell>
  );
}

function LifecycleDetailForm({
  leadId,
  redirectTo,
  showingStatus,
  disabled,
  tooltipMessage
}: {
  leadId: string;
  redirectTo: string;
  showingStatus: ShowingStatus;
  disabled: boolean;
  tooltipMessage: string;
}) {
  return (
    <TooltipShell disabled={disabled} message={tooltipMessage}>
      <form action={updateShowingLifecycle} className="mt-4 grid gap-3">
        <input type="hidden" name="leadId" value={leadId} />
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <input type="hidden" name="showingStatus" value={showingStatus} />
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Outcome</span>
          <select name="showingOutcome" defaultValue="undecided" className="app-input bg-white text-ink">
            {showingOutcomeOptions.map((outcome) => (
              <option key={outcome} value={outcome}>
                {getShowingOutcomeLabel(outcome)}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Outcome notes</span>
          <textarea
            name="showingOutcomeNotes"
            rows={4}
            maxLength={1200}
            className="app-textarea"
            placeholder="What did the renter say after the tour?"
          />
        </label>
        <LifecycleButton disabled={disabled} pendingLabel="Saving..." className="app-button-primary justify-self-start">
          Save completed showing
        </LifecycleButton>
      </form>
    </TooltipShell>
  );
}

function LifecycleCancelForm({
  leadId,
  redirectTo,
  disabled,
  tooltipMessage
}: {
  leadId: string;
  redirectTo: string;
  disabled: boolean;
  tooltipMessage: string;
}) {
  return (
    <TooltipShell disabled={disabled} message={tooltipMessage}>
      <form action={updateShowingLifecycle} className="mt-4 grid gap-3">
        <input type="hidden" name="leadId" value={leadId} />
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <input type="hidden" name="showingStatus" value="canceled" />
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Cancellation reason</span>
          <textarea
            name="showingCanceledReason"
            rows={3}
            maxLength={1200}
            className="app-textarea"
            placeholder="Why was this showing canceled?"
          />
        </label>
        <LifecycleButton disabled={disabled} pendingLabel="Canceling..." className="app-button-primary justify-self-start">
          Save cancellation
        </LifecycleButton>
      </form>
    </TooltipShell>
  );
}

function LifecycleButton({
  children,
  disabled,
  pendingLabel,
  className
}: {
  children: React.ReactNode;
  disabled: boolean;
  pendingLabel: string;
  className: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={disabled || pending} aria-busy={pending} className={`${className} disabled:cursor-not-allowed disabled:opacity-55`}>
      {pending ? (
        <>
          <InlineSpinner />
          <span>{pendingLabel}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

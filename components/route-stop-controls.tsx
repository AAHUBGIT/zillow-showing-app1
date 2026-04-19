"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { InlineSpinner } from "@/components/inline-spinner";
import { TooltipShell } from "@/components/tooltip-shell";
import { moveRouteStop, toggleRouteStopCompleted, updateRouteStopNote } from "@/lib/actions";

export function RouteStopControls({
  leadId,
  showingDate,
  routeCompleted,
  routeNote,
  canMoveUp,
  canMoveDown,
  isPreviewReadonly = false
}: {
  leadId: string;
  showingDate: string;
  routeCompleted: boolean;
  routeNote: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  isPreviewReadonly?: boolean;
}) {
  const tooltipMessage =
    "Preview mode is read-only. Disable preview mode or use a live database to update route plans.";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <TooltipShell disabled={isPreviewReadonly} message={tooltipMessage}>
          <form action={toggleRouteStopCompleted}>
            <input type="hidden" name="leadId" value={leadId} />
            <input type="hidden" name="completed" value={routeCompleted ? "false" : "true"} />
            <RouteActionButton disabled={isPreviewReadonly}>
              {routeCompleted ? "Reopen Stop" : "Mark Completed"}
            </RouteActionButton>
          </form>
        </TooltipShell>

        <TooltipShell disabled={isPreviewReadonly} message={tooltipMessage}>
          <form action={moveRouteStop} className="flex gap-2">
            <input type="hidden" name="leadId" value={leadId} />
            <input type="hidden" name="showingDate" value={showingDate} />
            <input type="hidden" name="direction" value="up" />
            <RouteActionButton disabled={isPreviewReadonly || !canMoveUp}>Move Up</RouteActionButton>
          </form>
        </TooltipShell>

        <TooltipShell disabled={isPreviewReadonly} message={tooltipMessage}>
          <form action={moveRouteStop} className="flex gap-2">
            <input type="hidden" name="leadId" value={leadId} />
            <input type="hidden" name="showingDate" value={showingDate} />
            <input type="hidden" name="direction" value="down" />
            <RouteActionButton disabled={isPreviewReadonly || !canMoveDown}>Move Down</RouteActionButton>
          </form>
        </TooltipShell>
      </div>

      <TooltipShell disabled={isPreviewReadonly} message={tooltipMessage}>
        <form action={updateRouteStopNote} className="flex flex-col gap-2 sm:flex-row">
          <input type="hidden" name="leadId" value={leadId} />
          <input
            type="text"
            name="routeNote"
            defaultValue={routeNote}
            maxLength={160}
            aria-label="Quick note for this route stop"
            placeholder="Add a quick route note, parking note, or reminder"
            className="app-input min-h-[48px] flex-1"
            disabled={isPreviewReadonly}
          />
          <RouteActionButton disabled={isPreviewReadonly}>Save Note</RouteActionButton>
        </form>
      </TooltipShell>
    </div>
  );
}

function RouteActionButton({
  children,
  disabled
}: {
  children: ReactNode;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-line/80 bg-white px-4 py-2.5 text-sm font-semibold text-ink shadow-sm transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-55"
    >
      {pending ? <InlineSpinner className="h-4 w-4" /> : null}
      <span>{pending ? "Saving..." : children}</span>
    </button>
  );
}

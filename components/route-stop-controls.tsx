"use client";

import { useEffect, useState, type ReactNode } from "react";
import { InlineSpinner } from "@/components/inline-spinner";
import { TooltipShell } from "@/components/tooltip-shell";

type PendingAction = "toggle" | "move-up" | "move-down" | "note" | null;

export function RouteStopControls({
  routeCompleted,
  routeNote,
  canMoveUp,
  canMoveDown,
  isPreviewReadonly = false,
  onToggleCompleted,
  onMove,
  onSaveNote
}: {
  routeCompleted: boolean;
  routeNote: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  isPreviewReadonly?: boolean;
  onToggleCompleted: (nextCompleted: boolean) => Promise<void>;
  onMove: (direction: "up" | "down") => Promise<void>;
  onSaveNote: (note: string) => Promise<void>;
}) {
  const [noteValue, setNoteValue] = useState(routeNote);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  useEffect(() => {
    setNoteValue(routeNote);
  }, [routeNote]);

  const isBusy = pendingAction !== null;
  const tooltipMessage =
    "Preview mode is read-only. Disable preview mode or use a live database to update route plans.";

  async function runAction(action: Exclude<PendingAction, null>, callback: () => Promise<void>) {
    if (isBusy || isPreviewReadonly) {
      return;
    }

    setPendingAction(action);

    try {
      await callback();
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <TooltipShell disabled={isPreviewReadonly} message={tooltipMessage}>
          <RouteActionButton
            type="button"
            disabled={isPreviewReadonly || isBusy}
            isPending={pendingAction === "toggle"}
            pendingLabel="Saving..."
            onClick={() => runAction("toggle", () => onToggleCompleted(!routeCompleted))}
          >
            {routeCompleted ? "Reopen Stop" : "Mark Completed"}
          </RouteActionButton>
        </TooltipShell>

        <TooltipShell disabled={isPreviewReadonly} message={tooltipMessage}>
          <RouteActionButton
            type="button"
            disabled={isPreviewReadonly || isBusy || !canMoveUp}
            isPending={pendingAction === "move-up"}
            pendingLabel="Moving..."
            onClick={() => runAction("move-up", () => onMove("up"))}
          >
            Move Up
          </RouteActionButton>
        </TooltipShell>

        <TooltipShell disabled={isPreviewReadonly} message={tooltipMessage}>
          <RouteActionButton
            type="button"
            disabled={isPreviewReadonly || isBusy || !canMoveDown}
            isPending={pendingAction === "move-down"}
            pendingLabel="Moving..."
            onClick={() => runAction("move-down", () => onMove("down"))}
          >
            Move Down
          </RouteActionButton>
        </TooltipShell>
      </div>

      <TooltipShell disabled={isPreviewReadonly} message={tooltipMessage}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void runAction("note", () => onSaveNote(noteValue));
          }}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <input
            type="text"
            value={noteValue}
            onChange={(event) => setNoteValue(event.target.value)}
            maxLength={160}
            aria-label="Quick note for this route stop"
            placeholder="Add a quick route note, parking note, or reminder"
            className="app-input min-h-[48px] flex-1"
            disabled={isPreviewReadonly || isBusy}
          />
          <RouteActionButton
            type="submit"
            disabled={isPreviewReadonly || isBusy}
            isPending={pendingAction === "note"}
            pendingLabel="Saving..."
          >
            Save Note
          </RouteActionButton>
        </form>
      </TooltipShell>
    </div>
  );
}

function RouteActionButton({
  children,
  disabled,
  isPending = false,
  pendingLabel,
  type = "button",
  onClick
}: {
  children: ReactNode;
  disabled?: boolean;
  isPending?: boolean;
  pendingLabel: string;
  type?: "button" | "submit";
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      disabled={disabled || isPending}
      aria-busy={isPending}
      onClick={onClick}
      className="inline-flex min-h-[48px] touch-manipulation items-center justify-center gap-2 rounded-2xl border border-line/80 bg-white px-4 py-2.5 text-sm font-semibold text-ink shadow-sm transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-55"
    >
      {isPending ? <InlineSpinner className="h-4 w-4" /> : null}
      <span>{isPending ? pendingLabel : children}</span>
    </button>
  );
}

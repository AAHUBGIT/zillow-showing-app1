"use client";

import { TooltipShell } from "@/components/tooltip-shell";

export function CalendarLinkButton({
  calendarUrl,
  missingMessage
}: {
  calendarUrl: string | null;
  missingMessage: string;
}) {
  const isDisabled = !calendarUrl;

  const handleClick = () => {
    if (!calendarUrl) {
      return;
    }

    window.open(calendarUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <TooltipShell disabled={isDisabled} message={missingMessage}>
      <button
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        className="app-button-secondary disabled:cursor-not-allowed disabled:opacity-55"
      >
        Add to Google Calendar
      </button>
    </TooltipShell>
  );
}

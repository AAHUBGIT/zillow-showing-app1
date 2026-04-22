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

  return (
    <TooltipShell disabled={isDisabled} message={missingMessage}>
      {calendarUrl ? (
        <a
          href={calendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="app-button-secondary"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
            <path d="M7 2v3M17 2v3M3.5 9.5h17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <rect x="3.5" y="4.5" width="17" height="16" rx="3" stroke="currentColor" strokeWidth="1.8" />
          </svg>
          Add to Google Calendar
        </a>
      ) : (
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="app-button-secondary disabled:cursor-not-allowed disabled:opacity-55"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
            <path d="M7 2v3M17 2v3M3.5 9.5h17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <rect x="3.5" y="4.5" width="17" height="16" rx="3" stroke="currentColor" strokeWidth="1.8" />
          </svg>
          Add to Google Calendar
        </button>
      )}
    </TooltipShell>
  );
}

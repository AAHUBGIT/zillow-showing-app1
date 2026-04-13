"use client";

export function CalendarLinkButton({
  calendarUrl,
  missingMessage
}: {
  calendarUrl: string | null;
  missingMessage: string;
}) {
  const handleClick = () => {
    if (!calendarUrl) {
      window.dispatchEvent(
        new CustomEvent("app-toast", {
          detail: { message: missingMessage }
        })
      );
      return;
    }

    window.open(calendarUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <button type="button" onClick={handleClick} className="app-button-secondary">
      Add to Google Calendar
    </button>
  );
}

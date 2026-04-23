"use client";

import { useEffect, useState } from "react";
import { CalendarLinkButton } from "@/components/calendar-link-button";

export function LiveCalendarLinkButton({
  leadId,
  initialCalendarUrl,
  missingMessage
}: {
  leadId: string;
  initialCalendarUrl: string | null;
  missingMessage: string;
}) {
  const [calendarUrl, setCalendarUrl] = useState(initialCalendarUrl);

  useEffect(() => {
    setCalendarUrl(initialCalendarUrl);
  }, [initialCalendarUrl]);

  useEffect(() => {
    const handleCalendarUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ leadId?: string; calendarUrl?: string | null }>;

      if (customEvent.detail?.leadId !== leadId) {
        return;
      }

      setCalendarUrl(customEvent.detail.calendarUrl ?? null);
    };

    window.addEventListener("lead-calendar-url-change", handleCalendarUpdate as EventListener);
    return () => {
      window.removeEventListener("lead-calendar-url-change", handleCalendarUpdate as EventListener);
    };
  }, [leadId]);

  return <CalendarLinkButton calendarUrl={calendarUrl} missingMessage={missingMessage} />;
}

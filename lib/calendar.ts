import { Lead } from "./types";

function toGoogleCalendarDateTime(dateString: string, timeString: string, offsetMinutes = 0) {
  const date = new Date(`${dateString}T${timeString}`);
  date.setMinutes(date.getMinutes() + offsetMinutes);
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function buildGoogleCalendarUrl(lead: Lead) {
  if (!lead.showingDate || !lead.showingTime) {
    return null;
  }

  const title = `${lead.fullName} showing`;
  const details = [
    `Property: ${lead.propertyAddress}`,
    `Lead: ${lead.fullName}`,
    `Priority: ${lead.priority}`,
    `Source: ${lead.source}`,
    `Phone: ${lead.phone}`,
    `Email: ${lead.email}`,
    `Desired move-in: ${lead.desiredMoveInDate}`,
    lead.nextFollowUpDate ? `Next follow-up: ${lead.nextFollowUpDate}` : "",
    lead.notes ? `Lead notes: ${lead.notes}` : "",
    lead.agentNotes ? `Agent notes: ${lead.agentNotes}` : "",
    `Showing: ${lead.showingDate} at ${lead.showingTime}`
  ]
    .filter(Boolean)
    .join("\n");

  const start = toGoogleCalendarDateTime(lead.showingDate, lead.showingTime);
  const end = toGoogleCalendarDateTime(lead.showingDate, lead.showingTime, 60);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${start}/${end}`,
    details,
    location: lead.propertyAddress
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

import { Lead } from "./types";

function toGoogleCalendarDateTime(dateString: string, timeString: string, offsetMinutes = 0) {
  const date = new Date(`${dateString}T${timeString}`);
  date.setMinutes(date.getMinutes() + offsetMinutes);
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export type LeadCalendarDraft = Pick<
  Lead,
  | "fullName"
  | "propertyAddress"
  | "phone"
  | "email"
  | "notes"
  | "status"
  | "priority"
  | "source"
  | "desiredMoveInDate"
  | "nextFollowUpDate"
  | "agentNotes"
  | "showingDate"
  | "showingTime"
>;

export function buildGoogleCalendarUrlFromDraft(lead: LeadCalendarDraft) {
  if (
    !lead.fullName.trim() ||
    !lead.propertyAddress.trim() ||
    !lead.phone.trim() ||
    !lead.email.trim() ||
    !lead.showingDate ||
    !lead.showingTime
  ) {
    return null;
  }

  const title = lead.fullName;
  const details = [
    `Property: ${lead.propertyAddress}`,
    `Lead: ${lead.fullName}`,
    `Phone: ${lead.phone}`,
    `Email: ${lead.email}`,
    `Priority: ${lead.priority}`,
    `Source: ${lead.source}`,
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

export function buildGoogleCalendarUrl(lead: Lead) {
  return buildGoogleCalendarUrlFromDraft(lead);
}

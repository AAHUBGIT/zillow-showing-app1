import { Lead } from "./types";

function toGoogleCalendarDateTime(dateString: string, timeString: string, offsetMinutes = 0) {
  const [year, month, day] = dateString.split("-").map(Number);
  const [hours, minutes] = timeString.split(":").map(Number);
  const date = new Date(year, (month || 1) - 1, day || 1, hours || 0, minutes || 0, 0, 0);
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
  const combinedNotes = [lead.notes, lead.agentNotes].filter(Boolean).join("\n\n");
  const details = [
    `Phone: ${lead.phone}`,
    `Email: ${lead.email}`,
    combinedNotes ? `Notes: ${combinedNotes}` : ""
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

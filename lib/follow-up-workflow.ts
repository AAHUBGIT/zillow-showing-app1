import { getFollowUpState } from "@/lib/lead-utils";
import { getEffectiveShowingStatus } from "@/lib/showing-lifecycle";
import type { Lead } from "@/lib/types";

export function getFollowUpActionLabels(
  lead: Pick<
    Lead,
    | "nextFollowUpDate"
    | "showingDate"
    | "showingTime"
    | "showingStatus"
    | "showingOutcome"
    | "applicationReady"
    | "status"
    | "routeCompleted"
  >,
  referenceDate?: string
) {
  const labels: string[] = [];
  const followUpState = getFollowUpStateForDate(lead.nextFollowUpDate, referenceDate);
  const showingStatus = getEffectiveShowingStatus(lead);

  if (followUpState === "overdue") {
    labels.push("Follow up overdue");
  } else if (followUpState === "today") {
    labels.push("Due today");
  }

  if (showingStatus === "no_show") {
    labels.push("No-show: re-engage");
  } else if (showingStatus === "completed") {
    labels.push(
      lead.showingOutcome === "applying"
        ? "Application next step"
        : "Completed showing: ask for decision"
    );
  } else if ((lead.showingDate && lead.showingTime) && !showingStatus) {
    labels.push("Needs outcome");
  }

  if (lead.applicationReady) {
    labels.push("Application ready");
  }

  if (lead.status !== "closed" && !lead.nextFollowUpDate) {
    labels.push("Needs next follow-up date");
  }

  if (labels.length === 0 && lead.status !== "closed") {
    labels.push("Waiting on renter");
  }

  return labels.slice(0, 3);
}

export function getPrimaryFollowUpLabel(
  lead: Parameters<typeof getFollowUpActionLabels>[0],
  referenceDate?: string
) {
  return getFollowUpActionLabels(lead, referenceDate)[0] || "Waiting on renter";
}

function getFollowUpStateForDate(nextFollowUpDate: string, referenceDate?: string) {
  if (!referenceDate) {
    return getFollowUpState(nextFollowUpDate);
  }

  if (!nextFollowUpDate) {
    return "none";
  }

  if (nextFollowUpDate < referenceDate) {
    return "overdue";
  }

  if (nextFollowUpDate === referenceDate) {
    return "today";
  }

  return "upcoming";
}

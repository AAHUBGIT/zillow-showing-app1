import { getFollowUpState } from "@/lib/lead-utils";
import { normalizeDecisionStatus } from "@/lib/property-decision-statuses";
import { getEffectiveShowingStatus } from "@/lib/showing-lifecycle";
import type { Lead, PropertyInterest } from "@/lib/types";

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
  > & {
    propertyInterests?: Array<Pick<PropertyInterest, "status">>;
  },
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

  const propertyStatuses = (lead.propertyInterests || []).map((propertyInterest) =>
    normalizeDecisionStatus(propertyInterest.status)
  );
  const hasApplyingProperty = propertyStatuses.some((status) => status === "applying");
  const hasDecisionProperty = propertyStatuses.some((status) =>
    ["liked", "maybe", "interested", "needs_second_look"].includes(status)
  );

  if (hasApplyingProperty) {
    labels.push("Applying");
  } else if (showingStatus === "completed" && hasDecisionProperty) {
    labels.push("Ask for property decision");
  } else if (lead.status !== "closed" && lead.propertyInterests && lead.propertyInterests.length > 0 && !hasDecisionProperty) {
    labels.push("No property decision");
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

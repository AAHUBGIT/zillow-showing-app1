import { FollowUpState, Lead, LeadPriority, LeadSource, LeadStatus } from "./types";

export const leadStatusOptions: LeadStatus[] = ["new", "contacted", "scheduled", "closed"];
export const leadPriorityOptions: LeadPriority[] = ["low", "medium", "high", "urgent"];
export const leadSourceOptions: LeadSource[] = [
  "Zillow",
  "referral",
  "Facebook",
  "repeat client",
  "phone inquiry",
  "other"
];
export const followUpFilterOptions: Array<"all" | FollowUpState> = [
  "all",
  "overdue",
  "today",
  "upcoming",
  "none"
];

const priorityRank: Record<LeadPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3
};

const followUpRank: Record<FollowUpState, number> = {
  overdue: 0,
  today: 1,
  upcoming: 2,
  none: 3
};

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

export function getFollowUpState(nextFollowUpDate: string): FollowUpState {
  if (!nextFollowUpDate) {
    return "none";
  }

  const today = getTodayString();

  if (nextFollowUpDate < today) {
    return "overdue";
  }

  if (nextFollowUpDate === today) {
    return "today";
  }

  return "upcoming";
}

export function getShowingTimestamp(lead: Lead) {
  if (!lead.showingDate || !lead.showingTime) {
    return Number.POSITIVE_INFINITY;
  }

  return new Date(`${lead.showingDate}T${lead.showingTime}`).getTime();
}

export function getUpcomingShowingCount(leads: Lead[], withinDays: number) {
  const start = getTodayString();
  const end = new Date();
  end.setDate(end.getDate() + withinDays);
  const endString = end.toISOString().slice(0, 10);

  return leads.filter((lead) => lead.showingDate && lead.showingDate >= start && lead.showingDate <= endString)
    .length;
}

export function sortLeads(leads: Lead[]) {
  return [...leads].sort((first, second) => {
    const byPriority = priorityRank[first.priority] - priorityRank[second.priority];
    if (byPriority !== 0) {
      return byPriority;
    }

    const byFollowUp =
      followUpRank[getFollowUpState(first.nextFollowUpDate)] -
      followUpRank[getFollowUpState(second.nextFollowUpDate)];
    if (byFollowUp !== 0) {
      return byFollowUp;
    }

    const byShowing = getShowingTimestamp(first) - getShowingTimestamp(second);
    if (byShowing !== 0) {
      return byShowing;
    }

    return first.updatedAt < second.updatedAt ? 1 : -1;
  });
}

export function getPriorityLabel(priority: LeadPriority) {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

export function getSourceLabel(source: LeadSource) {
  return source.charAt(0).toUpperCase() + source.slice(1);
}

export function getStatusLabel(status: LeadStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function getFollowUpStateLabel(state: FollowUpState) {
  return state === "none" ? "No follow-up" : state.charAt(0).toUpperCase() + state.slice(1);
}

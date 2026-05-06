import type { Lead, PropertyInterestStatus, ShowingOutcome, ShowingStatus } from "./types";

export const showingStatusOptions: ShowingStatus[] = [
  "scheduled",
  "confirmed",
  "completed",
  "no_show",
  "canceled",
  "rescheduled"
];

export const showingOutcomeOptions: ShowingOutcome[] = [
  "liked",
  "disliked",
  "interested",
  "applying",
  "needs_follow_up",
  "rejected",
  "undecided"
];

const showingStatusLabels: Record<ShowingStatus, string> = {
  scheduled: "Scheduled",
  confirmed: "Confirmed",
  completed: "Completed",
  no_show: "No-show",
  canceled: "Canceled",
  rescheduled: "Rescheduled"
};

const showingOutcomeLabels: Record<ShowingOutcome, string> = {
  liked: "Liked it",
  disliked: "Did not like it",
  interested: "Interested",
  applying: "Wants to apply",
  needs_follow_up: "Needs follow-up",
  rejected: "Rejected",
  undecided: "Undecided"
};

const showingStatusTones: Record<ShowingStatus, string> = {
  scheduled: "border-blue-200 bg-blue-50 text-blue-700",
  confirmed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  completed: "border-slate-200 bg-slate-100 text-slate-700",
  no_show: "border-amber-200 bg-amber-50 text-amber-800",
  canceled: "border-rose-200 bg-rose-50 text-rose-700",
  rescheduled: "border-indigo-200 bg-indigo-50 text-indigo-700"
};

export function normalizeShowingStatus(value: string): ShowingStatus | "" {
  return showingStatusOptions.includes(value as ShowingStatus) ? (value as ShowingStatus) : "";
}

export function normalizeShowingOutcome(value: string): ShowingOutcome {
  return showingOutcomeOptions.includes(value as ShowingOutcome) ? (value as ShowingOutcome) : "undecided";
}

export function getEffectiveShowingStatus(
  lead: Pick<Lead, "showingDate" | "showingTime" | "showingStatus" | "routeCompleted">
): ShowingStatus | "" {
  const normalizedStatus = normalizeShowingStatus(lead.showingStatus || "");

  if (normalizedStatus) {
    return normalizedStatus;
  }

  if (lead.routeCompleted && lead.showingDate && lead.showingTime) {
    return "completed";
  }

  return lead.showingDate && lead.showingTime ? "scheduled" : "";
}

export function getShowingStatusLabel(status: ShowingStatus | "") {
  return status ? showingStatusLabels[status] : "No showing";
}

export function getShowingOutcomeLabel(outcome: ShowingOutcome | "") {
  return outcome ? showingOutcomeLabels[normalizeShowingOutcome(outcome)] : "";
}

export function getShowingStatusTone(status: ShowingStatus | "") {
  return status ? showingStatusTones[status] : "border-slate-200 bg-slate-50 text-slate-600";
}

export function isTerminalShowingStatus(status: ShowingStatus | "") {
  return status === "completed" || status === "no_show" || status === "canceled";
}

export function getPropertyStatusForShowingOutcome(outcome: ShowingOutcome): PropertyInterestStatus {
  if (outcome === "applying") {
    return "applying";
  }

  if (outcome === "disliked" || outcome === "rejected") {
    return "rejected";
  }

  return "toured";
}

export function getShowingLifecycleDefaults(
  lead: Partial<Pick<
    Lead,
    | "showingDate"
    | "showingTime"
    | "showingStatus"
    | "showingOutcome"
    | "showingOutcomeNotes"
    | "showingCompletedAt"
    | "showingCanceledReason"
  >>
) {
  const hasShowing = Boolean(lead.showingDate && lead.showingTime);

  return {
    showingStatus: normalizeShowingStatus(lead.showingStatus || "") || (hasShowing ? "scheduled" : ""),
    showingOutcome: lead.showingOutcome ? normalizeShowingOutcome(lead.showingOutcome) : "",
    showingOutcomeNotes: lead.showingOutcomeNotes || "",
    showingCompletedAt: lead.showingCompletedAt || "",
    showingCanceledReason: lead.showingCanceledReason || ""
  };
}

export function withShowingLifecycleDefaults<T extends Partial<Lead>>(lead: T): T & ReturnType<typeof getShowingLifecycleDefaults> {
  return {
    ...lead,
    ...getShowingLifecycleDefaults(lead)
  };
}

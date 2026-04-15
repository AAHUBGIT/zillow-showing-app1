import { getFollowUpState } from "@/lib/lead-utils";

const followUpStateClasses = {
  overdue: "border border-rose-200 bg-rose-50 text-rose-700",
  today: "border border-amber-200 bg-amber-50 text-amber-700",
  upcoming: "border border-emerald-200 bg-emerald-50 text-emerald-700",
  none: "border border-slate-200 bg-slate-50 text-slate-500"
} as const;

const followUpLabels = {
  overdue: "Follow-up overdue",
  today: "Follow-up today",
  upcoming: "Follow-up upcoming",
  none: "No follow-up"
} as const;

export function FollowUpBadge({ nextFollowUpDate }: { nextFollowUpDate: string }) {
  const state = getFollowUpState(nextFollowUpDate);

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${followUpStateClasses[state]}`}
    >
      {followUpLabels[state]}
    </span>
  );
}

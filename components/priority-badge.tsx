import { getPriorityLabel } from "@/lib/lead-utils";
import { LeadPriority } from "@/lib/types";

const priorityClasses: Record<LeadPriority, string> = {
  low: "border border-slate-200 bg-slate-50 text-slate-700",
  medium: "border border-blue-200 bg-blue-50 text-blue-700",
  high: "border border-amber-200 bg-amber-50 text-amber-700",
  urgent: "border border-rose-200 bg-rose-50 text-rose-700"
};

export function PriorityBadge({ priority }: { priority: LeadPriority }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${priorityClasses[priority]}`}
    >
      {getPriorityLabel(priority)}
    </span>
  );
}

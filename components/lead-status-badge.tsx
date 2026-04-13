import { getStatusLabel } from "@/lib/lead-utils";
import { LeadStatus } from "@/lib/types";

const badgeClasses: Record<LeadStatus, string> = {
  new: "border border-blue-200 bg-blue-50 text-blue-700",
  contacted: "border border-amber-200 bg-amber-50 text-amber-700",
  scheduled: "border border-emerald-200 bg-emerald-50 text-emerald-700",
  closed: "border border-rose-200 bg-rose-50 text-rose-700"
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${badgeClasses[status]}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

import { LeadStatus } from "@/lib/types";

const badgeClasses: Record<LeadStatus, string> = {
  new: "bg-sky-100 text-sky-700",
  contacted: "bg-amber-100 text-amber-700",
  scheduled: "bg-emerald-100 text-emerald-700",
  closed: "bg-rose-100 text-rose-700"
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${badgeClasses[status]}`}>
      {status}
    </span>
  );
}

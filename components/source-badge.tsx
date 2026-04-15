import { getSourceLabel } from "@/lib/lead-utils";
import { LeadSource } from "@/lib/types";

export function SourceBadge({ source }: { source: LeadSource }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
      {getSourceLabel(source)}
    </span>
  );
}

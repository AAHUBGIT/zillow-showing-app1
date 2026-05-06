import {
  getEffectiveShowingStatus,
  getShowingStatusLabel,
  getShowingStatusTone
} from "@/lib/showing-lifecycle";
import type { Lead } from "@/lib/types";

export function ShowingLifecycleBadge({
  lead,
  status,
  className = ""
}: {
  lead?: Pick<Lead, "showingDate" | "showingTime" | "showingStatus" | "routeCompleted">;
  status?: Lead["showingStatus"];
  className?: string;
}) {
  const effectiveStatus = status || (lead ? getEffectiveShowingStatus(lead) : "");

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getShowingStatusTone(
        effectiveStatus
      )} ${className}`}
    >
      {getShowingStatusLabel(effectiveStatus)}
    </span>
  );
}

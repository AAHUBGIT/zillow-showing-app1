import {
  getPropertyInterestStatusLabel,
  getPropertyInterestStatusTone
} from "@/lib/property-interest-utils";
import { PropertyInterestStatus } from "@/lib/types";
import type { PropertyDecisionStatusConfig } from "@/lib/property-decision-statuses";

export function PropertyInterestStatusBadge({
  status,
  decisionStatuses
}: {
  status: PropertyInterestStatus;
  decisionStatuses?: PropertyDecisionStatusConfig[];
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.12em] uppercase ${getPropertyInterestStatusTone(
        status,
        decisionStatuses
      )}`}
    >
      {getPropertyInterestStatusLabel(status, decisionStatuses)}
    </span>
  );
}

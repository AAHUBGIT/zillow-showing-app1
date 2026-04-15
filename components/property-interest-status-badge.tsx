import {
  getPropertyInterestStatusLabel,
  getPropertyInterestStatusTone
} from "@/lib/property-interest-utils";
import { PropertyInterestStatus } from "@/lib/types";

export function PropertyInterestStatusBadge({
  status
}: {
  status: PropertyInterestStatus;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.12em] uppercase ${getPropertyInterestStatusTone(
        status
      )}`}
    >
      {getPropertyInterestStatusLabel(status)}
    </span>
  );
}

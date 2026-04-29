import { getPropertyPreferenceFit, type PropertyPreferenceFitStatus } from "@/lib/client-preferences";
import { LeadWithProperties, PropertyInterest } from "@/lib/types";

export function PropertyFitBadges({
  lead,
  propertyInterest,
  compact = false
}: {
  lead: LeadWithProperties;
  propertyInterest: PropertyInterest;
  compact?: boolean;
}) {
  const fit = getPropertyPreferenceFit(propertyInterest, lead);
  const visibleItems = compact ? fit.items.filter((item) => item.status !== "match").slice(0, 3) : fit.items;

  return (
    <div className="flex flex-wrap gap-2">
      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getToneClass(getOverallTone(fit.label))}`}>
        {fit.label}
      </span>
      {visibleItems.map((item) => (
        <span
          key={`${propertyInterest.id}-${item.key}-${item.label}`}
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${getToneClass(item.status)}`}
          title={item.detail}
        >
          {item.label}
        </span>
      ))}
    </div>
  );
}

function getOverallTone(label: string): PropertyPreferenceFitStatus {
  if (label === "Good fit") {
    return "match";
  }

  if (label === "Needs review") {
    return "review";
  }

  if (label === "Partial fit") {
    return "unknown";
  }

  return "miss";
}

function getToneClass(status: PropertyPreferenceFitStatus) {
  switch (status) {
    case "match":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "miss":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "review":
    case "unknown":
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

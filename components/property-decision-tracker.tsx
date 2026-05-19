import { LoadingLink } from "@/components/loading-link";
import { PropertyInterestStatusBadge } from "@/components/property-interest-status-badge";
import { getPropertyPreferenceFit } from "@/lib/client-preferences";
import {
  groupPropertyInterestsByDecisionStatus,
  isDecisionStatusTerminal,
  type PropertyDecisionStatusConfig
} from "@/lib/property-decision-statuses";
import type { LeadWithProperties, PropertyInterest } from "@/lib/types";

export function PropertyDecisionTracker({
  lead,
  propertyInterests,
  decisionStatuses
}: {
  lead: LeadWithProperties;
  propertyInterests: PropertyInterest[];
  decisionStatuses?: PropertyDecisionStatusConfig[];
}) {
  if (propertyInterests.length === 0) {
    return (
      <div className="mt-5 rounded-3xl border border-dashed border-line bg-slate-50 px-5 py-6 text-center">
        <p className="text-sm font-semibold text-ink">
          Add properties to start tracking this renter&apos;s decision.
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Decisions appear here once this renter has listings to compare.
        </p>
      </div>
    );
  }

  const scoredProperties = propertyInterests
    .filter((propertyInterest) => !isDecisionStatusTerminal(propertyInterest.status, decisionStatuses))
    .map((propertyInterest) => ({
      propertyInterest,
      fit: getPropertyPreferenceFit(propertyInterest, lead)
    }))
    .sort((first, second) => {
      if (second.fit.score !== first.fit.score) {
        return second.fit.score - first.fit.score;
      }

      return second.propertyInterest.rating - first.propertyInterest.rating;
    });
  const bestFitId = scoredProperties[0]?.propertyInterest.id || "";
  const groups = groupPropertyInterestsByDecisionStatus(propertyInterests, decisionStatuses).filter(
    (group) => group.interests.length > 0
  );

  return (
    <section
      id="decision-tracker"
      className="mt-5 rounded-4xl border border-line/80 bg-white/90 p-4 shadow-soft"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="app-kicker">Decision Tracker</p>
          <h4 className="mt-2 text-lg font-semibold tracking-tight text-ink">
            Renter shortlist status
          </h4>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Move each listing from interested to liked, maybe, applying, backup, or rejected.
          </p>
        </div>
        {bestFitId ? <span className="app-chip">Best fit highlighted</span> : null}
      </div>

      <div className="mt-4 grid gap-3">
        {groups.map((group) => (
          <details
            key={group.config.value}
            className="rounded-3xl border border-line/80 bg-slate-50/70 p-3"
            open={!group.config.isTerminal}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <PropertyInterestStatusBadge
                  status={group.config.value}
                  decisionStatuses={decisionStatuses}
                />
                <span className="text-sm font-semibold text-ink">
                  {group.interests.length} {group.interests.length === 1 ? "property" : "properties"}
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-500">Expand</span>
            </summary>

            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {group.interests.map((propertyInterest) => {
                const fit = getPropertyPreferenceFit(propertyInterest, lead);
                const fitSignal = getDecisionFitSignal(fit.label, propertyInterest.id === bestFitId);

                return (
                  <div
                    key={propertyInterest.id}
                    className="rounded-2xl border border-line/80 bg-white px-3 py-3"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-sm font-semibold text-ink">
                          {propertyInterest.listingTitle}
                        </p>
                        <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                          {propertyInterest.address}
                        </p>
                      </div>
                      <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${fitSignal.className}`}>
                        {fitSignal.label}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {propertyInterest.rent ? <span className="app-chip">{propertyInterest.rent}</span> : null}
                      {propertyInterest.beds || propertyInterest.baths ? (
                        <span className="app-chip">
                          {propertyInterest.beds || "?"} bd / {propertyInterest.baths || "?"} ba
                        </span>
                      ) : null}
                      {propertyInterest.neighborhood ? (
                        <span className="app-chip">{propertyInterest.neighborhood}</span>
                      ) : null}
                      <LoadingLink
                        href={`/leads/${lead.id}/properties/${propertyInterest.id}`}
                        className="app-chip hover:border-accent hover:text-accent"
                      >
                        Open
                      </LoadingLink>
                    </div>
                  </div>
                );
              })}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

function getDecisionFitSignal(label: string, isBestFit: boolean) {
  if (isBestFit && label === "Good fit") {
    return {
      label: "Best fit",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700"
    };
  }

  if (label === "Good fit") {
    return {
      label: "Strong match",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700"
    };
  }

  if (label === "Outside budget") {
    return {
      label: "Outside budget",
      className: "border-rose-200 bg-rose-50 text-rose-700"
    };
  }

  return {
    label: "Needs review",
    className: "border-amber-200 bg-amber-50 text-amber-700"
  };
}

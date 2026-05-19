import { LoadingLink } from "@/components/loading-link";
import { PropertyDecisionForm } from "@/components/property-decision-form";
import { PropertyFitBadges } from "@/components/property-fit-badges";
import { PropertyRatingStars } from "@/components/property-rating-stars";
import { formatDateTimeLabel } from "@/lib/date";
import { getPropertyInterestSourceLabel } from "@/lib/property-interest-utils";
import { getPropertyListingTypeLabel, getPropertyListingTypeTone } from "@/lib/property-listing-utils";
import type { PropertyDecisionStatusConfig } from "@/lib/property-decision-statuses";
import { LeadWithProperties, PropertyInterest } from "@/lib/types";

export function PropertyInterestCard({
  lead,
  leadId,
  propertyInterest,
  decisionStatuses,
  listingType,
  isTopRated = false,
  isPreviewReadonly = false
}: {
  lead: LeadWithProperties;
  leadId: string;
  propertyInterest: PropertyInterest;
  decisionStatuses?: PropertyDecisionStatusConfig[];
  listingType?: string;
  isTopRated?: boolean;
  isPreviewReadonly?: boolean;
}) {
  return (
    <article
      className={`rounded-4xl border p-5 shadow-soft ${
        isTopRated
          ? "border-amber-200/90 bg-[linear-gradient(180deg,rgba(255,251,235,0.98),rgba(255,255,255,0.94))]"
          : "border-line/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))]"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-semibold tracking-tight text-ink">{propertyInterest.listingTitle}</p>
            {isTopRated ? (
              <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-800">
                Top Rated
              </span>
            ) : null}
            {listingType ? (
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${getPropertyListingTypeTone(
                  listingType
                )}`}
              >
                {getPropertyListingTypeLabel(listingType)}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-slate-500">{propertyInterest.address}</p>
        </div>
        <PropertyDecisionForm
          leadId={leadId}
          propertyInterest={propertyInterest}
          redirectTo={`/leads/${leadId}#decision-tracker`}
          decisionStatuses={decisionStatuses}
          isPreviewReadonly={isPreviewReadonly}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <PropertyRatingStars rating={propertyInterest.rating} />
        <div className="app-chip">{getPropertyInterestSourceLabel(propertyInterest.source)}</div>
        {propertyInterest.neighborhood ? <div className="app-chip">{propertyInterest.neighborhood}</div> : null}
      </div>

      <div className="mt-4 rounded-3xl border border-line/70 bg-white/80 px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Property Fit
        </p>
        <div className="mt-3">
          <PropertyFitBadges lead={lead} propertyInterest={propertyInterest} compact />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <InfoRow label="Rent" value={propertyInterest.rent || "Not set"} />
        <InfoRow label="Layout" value={formatLayout(propertyInterest)} />
        <InfoRow label="Neighborhood" value={propertyInterest.neighborhood || "Not set"} />
        <InfoRow
          label="Showing"
          value={
            propertyInterest.showingDate && propertyInterest.showingTime
              ? formatDateTimeLabel(propertyInterest.showingDate, propertyInterest.showingTime)
              : "Not scheduled"
          }
        />
        <InfoRow label="Client Rating" value={`${propertyInterest.rating}/5`} />
        <InfoRow label="Client Feedback" value={propertyInterest.clientFeedback || "No feedback yet"} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <InfoRow label="Pros" value={propertyInterest.pros || "No pros added"} />
        <InfoRow label="Cons" value={propertyInterest.cons || "No cons added"} />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <LoadingLink
          href={`/leads/${leadId}/properties/${propertyInterest.id}`}
          className="app-button-primary"
        >
          Open Report
        </LoadingLink>
        {propertyInterest.listingUrl ? (
          <a
            href={propertyInterest.listingUrl}
            target="_blank"
            rel="noreferrer"
            className="app-button-secondary"
          >
            Listing
          </a>
        ) : null}
      </div>
    </article>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line/70 bg-white/85 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium leading-6 text-slate-700">{value}</p>
    </div>
  );
}

function formatLayout(propertyInterest: PropertyInterest) {
  if (!propertyInterest.beds && !propertyInterest.baths) {
    return "Not set";
  }

  return `${propertyInterest.beds || "?"} bd / ${propertyInterest.baths || "?"} ba`;
}

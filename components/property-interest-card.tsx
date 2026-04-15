import Link from "next/link";
import { PropertyRatingStars } from "@/components/property-rating-stars";
import { PropertyInterestStatusBadge } from "@/components/property-interest-status-badge";
import { getPropertyInterestSourceLabel } from "@/lib/property-interest-utils";
import { PropertyInterest } from "@/lib/types";

export function PropertyInterestCard({
  leadId,
  propertyInterest
}: {
  leadId: string;
  propertyInterest: PropertyInterest;
}) {
  return (
    <article className="rounded-4xl border border-line/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] p-5 shadow-soft">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-lg font-semibold tracking-tight text-ink">{propertyInterest.listingTitle}</p>
          <p className="mt-1 text-sm text-slate-500">{propertyInterest.address}</p>
        </div>
        <PropertyInterestStatusBadge status={propertyInterest.status} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <PropertyRatingStars rating={propertyInterest.rating} />
        <div className="app-chip">{getPropertyInterestSourceLabel(propertyInterest.source)}</div>
        {propertyInterest.neighborhood ? <div className="app-chip">{propertyInterest.neighborhood}</div> : null}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <InfoRow label="Rent" value={propertyInterest.rent || "Not set"} />
        <InfoRow label="Layout" value={formatLayout(propertyInterest)} />
        <InfoRow label="Pros" value={propertyInterest.pros || "No pros added"} />
        <InfoRow label="Cons" value={propertyInterest.cons || "No cons added"} />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link href={`/leads/${leadId}/properties/${propertyInterest.id}`} className="app-button-primary">
          Open Report
        </Link>
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
    <div className="rounded-2xl border border-line/70 bg-white/80 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}

function formatLayout(propertyInterest: PropertyInterest) {
  if (!propertyInterest.beds && !propertyInterest.baths) {
    return "Not set";
  }

  return `${propertyInterest.beds || "?"} bd / ${propertyInterest.baths || "?"} ba`;
}

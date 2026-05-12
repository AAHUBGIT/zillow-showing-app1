"use client";

import { useState } from "react";
import { LoadingLink } from "@/components/loading-link";
import { SidePanel } from "@/components/side-panel";
import { formatDateTimeLabel } from "@/lib/date";
import { getSourceLabel } from "@/lib/lead-utils";
import { buildGoogleMapsSearchLink } from "@/lib/property-interest-utils";
import {
  formatPropertyListingPrice,
  getPropertyListingLayout,
  getPropertyListingStatusLabel,
  getPropertyListingStatusTone
} from "@/lib/property-listing-utils";
import type { LeadSource, PropertyListing } from "@/lib/types";

type PropertyPanelLead = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  status: string;
  interestStatus?: string;
  showingDate?: string;
  showingTime?: string;
};

export function PropertyListingSidePanel({
  listing,
  relatedLeads,
  scheduledCount,
  activeInterestCount,
  triggerLabel = "Quick View",
  triggerClassName = "app-button-secondary"
}: {
  listing: PropertyListing;
  relatedLeads: PropertyPanelLead[];
  scheduledCount: number;
  activeInterestCount: number;
  triggerLabel?: string;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={triggerClassName}
        onClick={(event) => {
          event.stopPropagation();
          setOpen(true);
        }}
      >
        {triggerLabel}
      </button>

      <SidePanel
        open={open}
        onClose={() => setOpen(false)}
        eyebrow="Property Quick View"
        title={listing.title}
        footer={
          <div className="grid gap-2 sm:grid-cols-2">
            <LoadingLink href={`/properties/${listing.id}`} className="app-button-primary w-full">
              Open Property
            </LoadingLink>
            <LoadingLink href={`/properties/${listing.id}#edit-property`} className="app-button-secondary w-full">
              Edit Property
            </LoadingLink>
          </div>
        }
      >
        <div className="space-y-5">
          <section className="rounded-3xl border border-line/80 bg-slate-50/80 p-4">
            <p className="text-sm leading-6 text-slate-600">{listing.address}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${getPropertyListingStatusTone(
                  listing.status
                )}`}
              >
                {getPropertyListingStatusLabel(listing.status)}
              </span>
              <span className="app-chip">{formatPropertyListingPrice(listing.price)}</span>
              <span className="app-chip">{getPropertyListingLayout(listing)}</span>
              {listing.neighborhood ? <span className="app-chip">{listing.neighborhood}</span> : null}
              <span className="app-chip">{getSourceLabel(listing.source as LeadSource)}</span>
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-3">
            <QuickMetric label="Customers" value={String(relatedLeads.length)} />
            <QuickMetric label="Showings" value={String(scheduledCount)} />
            <QuickMetric label="Active" value={String(activeInterestCount)} />
          </section>

          <section className="rounded-3xl border border-line/80 bg-white p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="app-kicker">Property Actions</p>
                <p className="mt-1 text-sm text-slate-500">Map, listing link, and full record.</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={buildGoogleMapsSearchLink(listing.address)}
                target="_blank"
                rel="noreferrer"
                className="app-button-secondary min-h-[42px] px-3 py-2 text-xs"
              >
                Open Map
              </a>
              {listing.listingUrl ? (
                <a
                  href={listing.listingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="app-button-secondary min-h-[42px] px-3 py-2 text-xs"
                >
                  Open Listing
                </a>
              ) : null}
            </div>
          </section>

          <section className="rounded-3xl border border-line/80 bg-white p-4">
            <p className="app-kicker">Customers and Showings</p>
            <div className="mt-3 grid gap-2">
              {relatedLeads.length > 0 ? (
                relatedLeads.slice(0, 6).map((lead) => (
                  <div key={lead.id} className="rounded-2xl border border-line/70 bg-slate-50 px-3 py-2">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">{lead.fullName}</p>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {lead.phone || lead.email || "No contact saved"}
                        </p>
                        {lead.showingDate && lead.showingTime ? (
                          <p className="mt-1 text-xs font-medium text-slate-500">
                            Showing {formatDateTimeLabel(lead.showingDate, lead.showingTime)}
                          </p>
                        ) : null}
                      </div>
                      <LoadingLink href={`/leads/${lead.id}`} className="app-button-secondary min-h-[34px] px-3 py-1.5 text-xs">
                        View
                      </LoadingLink>
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-line bg-slate-50 px-3 py-4 text-sm text-slate-500">
                  No customers are attached to this inventory property yet.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-line/80 bg-white p-4">
            <p className="app-kicker">Inventory Notes</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {listing.notes || "No inventory notes yet."}
            </p>
          </section>
        </div>
      </SidePanel>
    </>
  );
}

function QuickMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line/80 bg-white px-3 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-ink">{value}</p>
    </div>
  );
}

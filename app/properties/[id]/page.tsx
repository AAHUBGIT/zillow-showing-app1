import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { LoadingLink } from "@/components/loading-link";
import { PropertyListingEditForm } from "@/components/property-listing-edit-form";
import { PropertyInterestStatusBadge } from "@/components/property-interest-status-badge";
import { ShowingLifecycleBadge } from "@/components/showing-lifecycle-badge";
import { getSessionUser } from "@/lib/auth";
import { formatDateTimeLabel } from "@/lib/date";
import { isPreviewReadonlyMode } from "@/lib/deployment";
import { getSourceLabel } from "@/lib/lead-utils";
import {
  getAllDecisionStatusOptions,
  isDecisionStatusTerminal,
  normalizeDecisionStatus,
  type PropertyDecisionStatusConfig
} from "@/lib/property-decision-statuses";
import { buildGoogleMapsSearchLink } from "@/lib/property-interest-utils";
import {
  formatPropertyListingPrice,
  getPropertyListingLayout,
  getPropertyListingStatusLabel,
  getPropertyListingStatusTone,
  normalizePropertyListingAddress,
  normalizePropertyListingUrl
} from "@/lib/property-listing-utils";
import { getPropertyListingByIdForUser } from "@/lib/property-listings";
import { getLeads } from "@/lib/storage";
import { getWorkflowSettingsForUser } from "@/lib/workflow-settings";
import type { LeadSource, LeadWithProperties, PropertyInterest, PropertyListing } from "@/lib/types";

type RelatedInterest = {
  lead: LeadWithProperties;
  propertyInterest: PropertyInterest;
};

type ShowingRow = {
  key: string;
  lead: LeadWithProperties;
  propertyInterest?: PropertyInterest;
  date: string;
  time: string;
  source: "lead" | "interest";
};

function matchesListing(
  listing: Pick<PropertyListing, "address" | "listingUrl" | "title">,
  input: Pick<PropertyInterest, "address" | "listingUrl" | "listingTitle">
) {
  const listingAddress = normalizePropertyListingAddress(listing.address);
  const inputAddress = normalizePropertyListingAddress(input.address);
  const listingUrl = normalizePropertyListingUrl(listing.listingUrl);
  const inputUrl = normalizePropertyListingUrl(input.listingUrl);

  return (
    (listingAddress && inputAddress && listingAddress === inputAddress) ||
    (listingUrl && inputUrl && listingUrl === inputUrl) ||
    (listing.title.trim().toLowerCase() === input.listingTitle.trim().toLowerCase() &&
      Boolean(input.listingTitle.trim()))
  );
}

function getRelatedInterests(listing: PropertyListing, leads: LeadWithProperties[]) {
  return leads.flatMap((lead) =>
    lead.propertyInterests
      .filter((propertyInterest) => matchesListing(listing, propertyInterest))
      .map((propertyInterest) => ({ lead, propertyInterest }))
  );
}

function getShowingRows(
  listing: PropertyListing,
  leads: LeadWithProperties[],
  relatedInterests: RelatedInterest[]
) {
  const listingAddress = normalizePropertyListingAddress(listing.address);
  const rows = new Map<string, ShowingRow>();

  for (const lead of leads) {
    const leadAddress = normalizePropertyListingAddress(lead.propertyAddress);

    if (lead.showingDate && lead.showingTime && listingAddress && leadAddress === listingAddress) {
      const key = `${lead.id}-${lead.showingDate}-${lead.showingTime}`;

      rows.set(key, {
        key,
        lead,
        date: lead.showingDate,
        time: lead.showingTime,
        source: "lead"
      });
    }
  }

  for (const { lead, propertyInterest } of relatedInterests) {
    if (!propertyInterest.showingDate || !propertyInterest.showingTime) {
      continue;
    }

    const key = `${lead.id}-${propertyInterest.showingDate}-${propertyInterest.showingTime}`;
    rows.set(key, {
      key,
      lead,
      propertyInterest,
      date: propertyInterest.showingDate,
      time: propertyInterest.showingTime,
      source: "interest"
    });
  }

  return Array.from(rows.values()).sort((first, second) =>
    `${first.date}T${first.time}` < `${second.date}T${second.time}` ? -1 : 1
  );
}

function getUniqueLeadCount(relatedInterests: RelatedInterest[], showingRows: ShowingRow[]) {
  return new Set([
    ...relatedInterests.map(({ lead }) => lead.id),
    ...showingRows.map(({ lead }) => lead.id)
  ]).size;
}

function groupRelatedInterestsByDecisionStatus(
  relatedInterests: RelatedInterest[],
  decisionStatuses?: PropertyDecisionStatusConfig[]
) {
  return getAllDecisionStatusOptions(decisionStatuses)
    .sort((first, second) => first.order - second.order)
    .map((config) => ({
      config,
      relatedInterests: relatedInterests.filter(
        ({ propertyInterest }) =>
          normalizeDecisionStatus(propertyInterest.status, decisionStatuses) === config.value
      )
    }))
    .filter((group) => group.relatedInterests.length > 0);
}

export default async function PropertyListingDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/login");
  }

  const [listing, leads, workflowSettings] = await Promise.all([
    getPropertyListingByIdForUser(sessionUser.id, id),
    getLeads(),
    getWorkflowSettingsForUser(sessionUser.id)
  ]);

  if (!listing) {
    notFound();
  }

  const relatedInterests = getRelatedInterests(listing, leads);
  const showingRows = getShowingRows(listing, leads, relatedInterests);
  const uniqueLeadCount = getUniqueLeadCount(relatedInterests, showingRows);
  const isPreviewReadonly = isPreviewReadonlyMode();
  const activeInterestCount = relatedInterests.filter(
    ({ propertyInterest }) => !isDecisionStatusTerminal(propertyInterest.status, workflowSettings.decisionStatuses)
  ).length;
  const relatedInterestGroups = groupRelatedInterestsByDecisionStatus(
    relatedInterests,
    workflowSettings.decisionStatuses
  );

  return (
    <main className="space-y-6">
      <section className="app-panel p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="app-eyebrow">Property Record</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              {listing.title}
            </h1>
            <p className="app-copy mt-3 max-w-3xl">{listing.address}</p>
            <div className="mt-4 flex flex-wrap gap-2">
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
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/properties" className="app-button-secondary">
              Back to Properties
            </Link>
            <a href="#edit-property" className="app-button-secondary">
              Edit Property
            </a>
            <a href={buildGoogleMapsSearchLink(listing.address)} target="_blank" rel="noreferrer" className="app-button-secondary">
              Open Map
            </a>
            {listing.listingUrl ? (
              <a href={listing.listingUrl} target="_blank" rel="noreferrer" className="app-button-primary">
                Open Listing
              </a>
            ) : null}
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="app-grid-card">
            <p className="app-kicker">Interested Customers</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{uniqueLeadCount}</p>
          </div>
          <div className="app-grid-card">
            <p className="app-kicker">Scheduled Showings</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{showingRows.length}</p>
          </div>
          <div className="app-grid-card">
            <p className="app-kicker">Active Interests</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{activeInterestCount}</p>
          </div>
        </div>

        {listing.notes ? (
          <div className="mt-5 rounded-3xl border border-line/80 bg-slate-50/80 p-4">
            <p className="app-kicker">Inventory Notes</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{listing.notes}</p>
          </div>
        ) : null}
      </section>

      <section id="edit-property" className="app-panel scroll-mt-28 p-5 sm:p-6">
        <details>
          <summary className="cursor-pointer list-none">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="app-eyebrow">Edit Property</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">
                  Update inventory details
                </h2>
                <p className="app-copy mt-2 max-w-3xl">
                  Open only when price, layout, listing link, status, or notes need changes.
                </p>
              </div>
              <span className="app-chip">Expand editor</span>
            </div>
          </summary>
          <PropertyListingEditForm
            listing={listing}
            isPreviewReadonly={isPreviewReadonly}
            redirectTo={`/properties/${listing.id}`}
            buttonLabel="Save Property"
          />
        </details>
      </section>

      <section className="app-panel p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="app-eyebrow">Showings</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">
              Scheduled showings for this property
            </h2>
          </div>
          <span className="app-chip">{showingRows.length} scheduled</span>
        </div>

        {showingRows.length > 0 ? (
          <div className="mt-5 grid gap-3">
            {showingRows.map((row) => (
              <div
                key={row.key}
                className="rounded-3xl border border-line/80 bg-white/85 px-4 py-3"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-ink">{formatDateTimeLabel(row.date, row.time)}</p>
                    <p className="mt-1 text-sm text-slate-600">{row.lead.fullName}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <ShowingLifecycleBadge lead={row.lead} />
                    <LoadingLink href={`/leads/${row.lead.id}`} className="app-button-secondary">
                      View Lead
                    </LoadingLink>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-3xl border border-dashed border-line bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
            No scheduled showings are linked to this property yet.
          </div>
        )}
      </section>

      <section className="app-panel p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="app-eyebrow">Customer Interest</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">
              Leads comparing this property
            </h2>
          </div>
          <span className="app-chip">{relatedInterests.length} interest records</span>
        </div>

        {relatedInterests.length > 0 ? (
          <div className="mt-5 space-y-4">
            {relatedInterestGroups.map((group) => (
              <div key={group.config.value} className="rounded-3xl border border-line/80 bg-slate-50/80 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <PropertyInterestStatusBadge
                    status={group.config.value}
                    decisionStatuses={workflowSettings.decisionStatuses}
                  />
                  <span className="app-chip">
                    {group.relatedInterests.length} {group.relatedInterests.length === 1 ? "renter" : "renters"}
                  </span>
                </div>

                <div className="mt-3 grid gap-3 xl:grid-cols-2">
                  {group.relatedInterests.map(({ lead, propertyInterest }) => {
                    const showingLabel =
                      propertyInterest.showingDate && propertyInterest.showingTime
                        ? formatDateTimeLabel(propertyInterest.showingDate, propertyInterest.showingTime)
                        : lead.showingDate && lead.showingTime
                          ? formatDateTimeLabel(lead.showingDate, lead.showingTime)
                          : "No showing scheduled";

                    return (
                      <article
                        key={`${lead.id}-${propertyInterest.id}`}
                        className="rounded-2xl border border-line/80 bg-white px-4 py-3"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-base font-semibold text-ink">{lead.fullName}</p>
                            <p className="mt-1 text-sm text-slate-600">{lead.phone || lead.email}</p>
                          </div>
                          <span className="app-chip">Rating {propertyInterest.rating}/5</span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="app-chip">Showing {showingLabel}</span>
                        </div>
                        {propertyInterest.clientFeedback ? (
                          <p className="mt-3 text-sm leading-6 text-slate-600">{propertyInterest.clientFeedback}</p>
                        ) : null}
                        {propertyInterest.agentNotes ? (
                          <p className="mt-3 line-clamp-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600">
                            {propertyInterest.agentNotes}
                          </p>
                        ) : null}
                        <div className="mt-4 flex flex-wrap gap-2">
                          <LoadingLink href={`/leads/${lead.id}`} className="app-button-secondary">
                            Open Lead
                          </LoadingLink>
                          <LoadingLink
                            href={`/leads/${lead.id}/properties/${propertyInterest.id}`}
                            className="app-button-secondary"
                          >
                            View Interest
                          </LoadingLink>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-3xl border border-dashed border-line bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
            No customers have this inventory property attached yet.
          </div>
        )}
      </section>
    </main>
  );
}

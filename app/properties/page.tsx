import Link from "next/link";
import { PropertyListingSidePanel } from "@/components/property-listing-side-panel";
import { PropertyListingEditForm } from "@/components/property-listing-edit-form";
import { PropertyListingCreateForm } from "@/components/property-listing-create-form";
import { isPreviewReadonlyMode } from "@/lib/deployment";
import { getSourceLabel } from "@/lib/lead-utils";
import {
  formatPropertyListingPrice,
  getPropertyListingLayout,
  getPropertyListingStatusLabel,
  getPropertyListingStatusTone,
  normalizePropertyListingAddress,
  normalizePropertyListingUrl,
  propertyListingStatusOptions
} from "@/lib/property-listing-utils";
import { getPropertyListings } from "@/lib/property-listings";
import { getLeads } from "@/lib/storage";
import type { LeadSource, LeadWithProperties, PropertyInterest, PropertyListing } from "@/lib/types";

type PropertySearchParams = {
  q?: string;
  neighborhood?: string;
  maxPrice?: string;
  beds?: string;
  status?: string;
};

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function getFilters(searchParams?: Record<string, string | string[] | undefined>): PropertySearchParams {
  return {
    q: getParam(searchParams?.q),
    neighborhood: getParam(searchParams?.neighborhood),
    maxPrice: getParam(searchParams?.maxPrice),
    beds: getParam(searchParams?.beds),
    status: getParam(searchParams?.status)
  };
}

function getNumericValue(value: string) {
  const numeric = Number(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

function filterListings(listings: PropertyListing[], filters: PropertySearchParams) {
  const query = (filters.q || "").trim().toLowerCase();
  const neighborhood = (filters.neighborhood || "").trim().toLowerCase();
  const maxPrice = getNumericValue(filters.maxPrice || "");
  const beds = getNumericValue(filters.beds || "");
  const status = filters.status || "";

  return listings.filter((listing) => {
    const searchableText = [listing.title, listing.address, listing.neighborhood]
      .join(" ")
      .toLowerCase();
    const listingPrice = getNumericValue(listing.price);
    const listingBeds = getNumericValue(listing.beds);

    return (
      (!query || searchableText.includes(query)) &&
      (!neighborhood || listing.neighborhood.toLowerCase() === neighborhood) &&
      (!status || listing.status === status) &&
      (maxPrice === null || listingPrice === null || listingPrice <= maxPrice) &&
      (beds === null || listingBeds === null || listingBeds >= beds)
    );
  });
}

export default async function PropertiesPage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const [listings, leads] = await Promise.all([getPropertyListings(), getLeads()]);
  const filters = getFilters(searchParams);
  const filteredListings = filterListings(listings, filters);
  const isPreviewReadonly = isPreviewReadonlyMode();
  const neighborhoods = Array.from(
    new Set(listings.map((listing) => listing.neighborhood).filter(Boolean))
  ).sort((first, second) => first.localeCompare(second));

  return (
    <main className="space-y-6">
      <section className="app-panel p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="app-eyebrow">Properties</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Property inventory
            </h1>
            <p className="app-copy mt-3 max-w-3xl">
              Build the internal property pool agents can search when scheduling showings. Zillow
              and portal feed imports can populate this inventory later.
            </p>
          </div>
          <a href="#add-property-listing" className="app-button-primary">
            Add Property Listing
          </a>
        </div>

        <form className="mt-5 grid gap-4 border-t border-line/70 pt-5 lg:grid-cols-[1.4fr_1fr_0.8fr_0.8fr_0.8fr_auto] lg:items-end">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Search</span>
            <input
              name="q"
              defaultValue={filters.q}
              placeholder="Title, address, neighborhood"
              className="app-input"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Neighborhood</span>
            <select name="neighborhood" defaultValue={filters.neighborhood} className="app-input">
              <option value="">Any neighborhood</option>
              {neighborhoods.map((neighborhood) => (
                <option key={neighborhood} value={neighborhood}>
                  {neighborhood}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Max price</span>
            <input name="maxPrice" defaultValue={filters.maxPrice} inputMode="numeric" className="app-input" />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Beds</span>
            <input name="beds" defaultValue={filters.beds} inputMode="numeric" className="app-input" />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Status</span>
            <select name="status" defaultValue={filters.status} className="app-input">
              <option value="">Any status</option>
              {propertyListingStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {getPropertyListingStatusLabel(status)}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap gap-2">
            <button type="submit" className="app-button-primary">
              Search
            </button>
            <Link href="/properties" className="app-button-secondary">
              Reset
            </Link>
          </div>
        </form>
      </section>

      <PropertyListingCreateForm
        propertyListings={listings}
        isPreviewReadonly={isPreviewReadonly}
      />

      <section className="grid gap-4 xl:grid-cols-2">
        {filteredListings.length > 0 ? (
          filteredListings.map((listing) => (
            <PropertyListingCard
              key={listing.id}
              listing={listing}
              quickContext={getPropertyListingQuickContext(listing, leads)}
              isPreviewReadonly={isPreviewReadonly}
            />
          ))
        ) : (
          <div className="app-panel p-8 text-center text-sm text-slate-600 xl:col-span-2">
            No property listings match the current filters.
          </div>
        )}
      </section>
    </main>
  );
}

function PropertyListingCard({
  listing,
  quickContext,
  isPreviewReadonly
}: {
  listing: PropertyListing;
  quickContext: ReturnType<typeof getPropertyListingQuickContext>;
  isPreviewReadonly: boolean;
}) {
  return (
    <article id={`property-listing-${listing.id}`} className="app-panel scroll-mt-28 p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link
            href={`/properties/${listing.id}`}
            className="block truncate text-lg font-semibold tracking-tight text-ink hover:text-accent"
          >
            {listing.title}
          </Link>
          <p className="mt-1 text-sm leading-6 text-slate-600">{listing.address}</p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${getPropertyListingStatusTone(
            listing.status
          )}`}
        >
          {getPropertyListingStatusLabel(listing.status)}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="app-chip">{formatPropertyListingPrice(listing.price)}</span>
        <span className="app-chip">{getPropertyListingLayout(listing)}</span>
        {listing.neighborhood ? <span className="app-chip">{listing.neighborhood}</span> : null}
        <span className="app-chip">{getSourceLabel(listing.source as LeadSource)}</span>
      </div>

      {listing.notes ? (
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{listing.notes}</p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <PropertyListingSidePanel
          listing={listing}
          relatedLeads={quickContext.relatedLeads}
          scheduledCount={quickContext.scheduledCount}
          activeInterestCount={quickContext.activeInterestCount}
          triggerClassName="app-button-secondary"
        />
        <Link href={`/properties/${listing.id}`} className="app-button-primary">
          View Property
        </Link>
        <Link href={`/properties/${listing.id}#edit-property`} className="app-button-secondary">
          Edit Property
        </Link>
        {listing.listingUrl ? (
          <a href={listing.listingUrl} target="_blank" rel="noreferrer" className="app-button-secondary">
            Open Listing
          </a>
        ) : null}
      </div>

      <details className="mt-5 rounded-3xl border border-line/80 bg-slate-50/80 p-4">
        <summary className="cursor-pointer list-none">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink">Edit property</p>
              <p className="mt-1 text-xs text-slate-500">Update price, layout, status, notes, or listing link.</p>
            </div>
            <span className="app-chip">Edit</span>
          </div>
        </summary>
        <PropertyListingEditForm listing={listing} isPreviewReadonly={isPreviewReadonly} />
      </details>
    </article>
  );
}

function getPropertyListingQuickContext(listing: PropertyListing, leads: LeadWithProperties[]) {
  const relatedLeadMap = new Map<
    string,
    {
      id: string;
      fullName: string;
      phone: string;
      email: string;
      status: string;
      interestStatus?: string;
      showingDate?: string;
      showingTime?: string;
    }
  >();
  const scheduledKeys = new Set<string>();
  let activeInterestCount = 0;
  const listingAddress = normalizePropertyListingAddress(listing.address);

  for (const lead of leads) {
    const leadAddress = normalizePropertyListingAddress(lead.propertyAddress);

    if (lead.showingDate && lead.showingTime && listingAddress && leadAddress === listingAddress) {
      scheduledKeys.add(`${lead.id}-${lead.showingDate}-${lead.showingTime}`);
      relatedLeadMap.set(lead.id, {
        id: lead.id,
        fullName: lead.fullName,
        phone: lead.phone,
        email: lead.email,
        status: lead.status,
        showingDate: lead.showingDate,
        showingTime: lead.showingTime
      });
    }

    for (const propertyInterest of lead.propertyInterests) {
      if (!matchesListing(listing, propertyInterest)) {
        continue;
      }

      if (propertyInterest.status !== "rejected") {
        activeInterestCount += 1;
      }

      if (propertyInterest.showingDate && propertyInterest.showingTime) {
        scheduledKeys.add(`${lead.id}-${propertyInterest.showingDate}-${propertyInterest.showingTime}`);
      }

      relatedLeadMap.set(lead.id, {
        id: lead.id,
        fullName: lead.fullName,
        phone: lead.phone,
        email: lead.email,
        status: lead.status,
        interestStatus: propertyInterest.status,
        showingDate: propertyInterest.showingDate || lead.showingDate,
        showingTime: propertyInterest.showingTime || lead.showingTime
      });
    }
  }

  return {
    relatedLeads: Array.from(relatedLeadMap.values()),
    scheduledCount: scheduledKeys.size,
    activeInterestCount
  };
}

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

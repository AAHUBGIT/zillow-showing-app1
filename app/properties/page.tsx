import Link from "next/link";
import { PropertyListingCreateForm } from "@/components/property-listing-create-form";
import { isPreviewReadonlyMode } from "@/lib/deployment";
import { getSourceLabel } from "@/lib/lead-utils";
import {
  formatPropertyListingPrice,
  getPropertyListingLayout,
  getPropertyListingStatusLabel,
  getPropertyListingStatusTone,
  propertyListingStatusOptions
} from "@/lib/property-listing-utils";
import { getPropertyListings } from "@/lib/property-listings";
import type { LeadSource, PropertyListing } from "@/lib/types";

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
  const listings = await getPropertyListings();
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
      </section>

      <section className="app-panel p-5 sm:p-6">
        <form className="grid gap-4 lg:grid-cols-[1.4fr_1fr_0.8fr_0.8fr_0.8fr_auto] lg:items-end">
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
          filteredListings.map((listing) => <PropertyListingCard key={listing.id} listing={listing} />)
        ) : (
          <div className="app-panel p-8 text-center text-sm text-slate-600 xl:col-span-2">
            No property listings match the current filters.
          </div>
        )}
      </section>
    </main>
  );
}

function PropertyListingCard({ listing }: { listing: PropertyListing }) {
  return (
    <article className="app-panel p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold tracking-tight text-ink">{listing.title}</h2>
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

      {listing.listingUrl ? (
        <a href={listing.listingUrl} target="_blank" rel="noreferrer" className="app-button-secondary mt-5">
          Open Listing
        </a>
      ) : null}
    </article>
  );
}

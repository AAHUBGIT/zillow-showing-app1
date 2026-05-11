import type { LeadSource, PropertyInterest, PropertyListing, PropertyListingStatus } from "./types";

export const propertyListingStatusOptions: PropertyListingStatus[] = [
  "available",
  "unavailable",
  "unknown"
];

const propertyListingStatusTone: Record<PropertyListingStatus, string> = {
  available: "border-emerald-200 bg-emerald-50 text-emerald-700",
  unavailable: "border-rose-200 bg-rose-50 text-rose-700",
  unknown: "border-amber-200 bg-amber-50 text-amber-700"
};

export function normalizePropertyListingStatus(value: string): PropertyListingStatus {
  return propertyListingStatusOptions.includes(value as PropertyListingStatus)
    ? (value as PropertyListingStatus)
    : "unknown";
}

export function normalizePropertyListingAddress(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\b(united states|usa)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function normalizePropertyListingUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const path = url.pathname.replace(/\/+$/, "");

    return `${host}${path}`.toLowerCase();
  } catch {
    return trimmed
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/[?#].*$/, "")
      .replace(/\/+$/, "");
  }
}

export function findDuplicatePropertyListing<T extends Pick<PropertyListing, "id" | "title" | "address" | "source" | "listingUrl">>(
  listings: T[],
  input: { address: string; listingUrl?: string; ignoreId?: string }
) {
  const normalizedAddress = normalizePropertyListingAddress(input.address);
  const normalizedUrl = normalizePropertyListingUrl(input.listingUrl || "");

  if (!normalizedAddress && !normalizedUrl) {
    return undefined;
  }

  return listings.find((listing) => {
    if (input.ignoreId && listing.id === input.ignoreId) {
      return false;
    }

    const listingAddress = normalizePropertyListingAddress(listing.address);
    const listingUrl = normalizePropertyListingUrl(listing.listingUrl);

    return (
      (normalizedAddress && listingAddress && normalizedAddress === listingAddress) ||
      (normalizedUrl && listingUrl && normalizedUrl === listingUrl)
    );
  });
}

export function getPropertyListingStatusLabel(status: string) {
  const normalized = normalizePropertyListingStatus(status);

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function getPropertyListingStatusTone(status: string) {
  return propertyListingStatusTone[normalizePropertyListingStatus(status)];
}

export function formatPropertyListingPrice(value: string) {
  const numeric = Number(value.replace(/[^\d.]/g, ""));

  if (!Number.isFinite(numeric) || numeric <= 0) {
    return "Price not set";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(numeric);
}

export function getPropertyListingLayout(listing: Pick<PropertyListing, "beds" | "baths">) {
  if (!listing.beds && !listing.baths) {
    return "Layout not set";
  }

  return `${listing.beds || "?"} bd / ${listing.baths || "?"} ba`;
}

export function propertyListingToFitPropertyInterest(
  listing: PropertyListing,
  leadId = ""
): PropertyInterest {
  return {
    id: listing.id,
    leadId,
    address: listing.address,
    listingTitle: listing.title,
    source: listing.source as LeadSource,
    listingUrl: listing.listingUrl,
    rent: listing.price,
    beds: listing.beds,
    baths: listing.baths,
    neighborhood: listing.neighborhood,
    status: "interested",
    rating: 3,
    clientFeedback: "",
    pros: "",
    cons: "",
    agentNotes: listing.notes,
    showingDate: "",
    showingTime: "",
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt
  };
}

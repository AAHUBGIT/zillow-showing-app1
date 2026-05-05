import type { LeadSource, PropertyListing } from "./types";

export type PropertyWorkflowDraft = {
  listingTitle?: string;
  address?: string;
  rent?: string;
  beds?: string;
  baths?: string;
  neighborhood?: string;
  source?: LeadSource;
  listingUrl?: string;
  agentNotes?: string;
  propertyListingId?: string;
};

const knownPortalSources: Array<{ source: LeadSource; patterns: string[] }> = [
  { source: "Zillow", patterns: ["zillow.com"] },
  { source: "Homes.com", patterns: ["homes.com"] },
  { source: "StreetEasy", patterns: ["streeteasy.com"] },
  { source: "Apartments.com", patterns: ["apartments.com"] }
];

const addressWords = [
  "ave",
  "avenue",
  "blvd",
  "boulevard",
  "circle",
  "court",
  "ct",
  "drive",
  "dr",
  "lane",
  "ln",
  "place",
  "pl",
  "road",
  "rd",
  "street",
  "st",
  "terrace",
  "ter",
  "way"
];

export function propertyListingToWorkflowDraft(listing: PropertyListing): PropertyWorkflowDraft {
  return {
    listingTitle: listing.title,
    address: listing.address,
    rent: listing.price,
    beds: listing.beds,
    baths: listing.baths,
    neighborhood: listing.neighborhood,
    source: normalizeWorkflowSource(listing.source),
    listingUrl: listing.listingUrl,
    agentNotes: listing.notes,
    propertyListingId: listing.id
  };
}

export function normalizeWorkflowSource(value: string): LeadSource {
  const source = value.trim();

  if (knownPortalSources.some((item) => item.source === source)) {
    return source as LeadSource;
  }

  if (["referral", "Facebook", "repeat client", "phone inquiry", "other"].includes(source)) {
    return source as LeadSource;
  }

  return "other";
}

export function detectListingSourceFromUrl(value: string): LeadSource {
  const hostname = getUrlHostname(value);

  if (!hostname) {
    return "other";
  }

  return knownPortalSources.find((item) =>
    item.patterns.some((pattern) => hostname === pattern || hostname.endsWith(`.${pattern}`))
  )?.source || "other";
}

export function parseListingUrlDraft(value: string): PropertyWorkflowDraft {
  const listingUrl = value.trim();
  const source = detectListingSourceFromUrl(listingUrl);
  const title = getReadableTitleFromUrl(listingUrl);
  const address = title && looksLikeAddress(title) ? title : "";

  return {
    listingTitle: title,
    address,
    source,
    listingUrl
  };
}

export function getAddressTitleFallback(address: string) {
  return address.trim();
}

function getUrlHostname(value: string) {
  try {
    return new URL(ensureUrlProtocol(value)).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

function getReadableTitleFromUrl(value: string) {
  try {
    const url = new URL(ensureUrlProtocol(value));
    const segments = url.pathname
      .split("/")
      .map((segment) => segment.trim())
      .filter(Boolean)
      .filter((segment) => !/^\d+$/.test(segment))
      .filter((segment) => !["apartments", "building", "homedetails", "property", "rentals"].includes(segment.toLowerCase()));
    const candidate = segments.at(-1) || "";

    return humanizeSlug(candidate);
  } catch {
    return "";
  }
}

function ensureUrlProtocol(value: string) {
  const trimmed = value.trim();

  if (!trimmed || /^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function humanizeSlug(value: string) {
  return decodeURIComponent(value)
    .replace(/\.(html?|aspx?)$/i, "")
    .replace(/[_+]+/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function looksLikeAddress(value: string) {
  const normalized = value.toLowerCase();

  return /\d/.test(value) && addressWords.some((word) => new RegExp(`\\b${word}\\b`).test(normalized));
}

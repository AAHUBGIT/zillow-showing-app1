import type { Lead, LeadWithProperties, PropertyInterest } from "./types";

export const moveInUrgencyOptions = ["", "flexible", "soon", "urgent"] as const;

export type MoveInUrgencyOption = (typeof moveInUrgencyOptions)[number];

export type ClientPreferenceFields = Pick<
  Lead,
  | "budgetMin"
  | "budgetMax"
  | "bedrooms"
  | "bathrooms"
  | "preferredNeighborhoods"
  | "moveInUrgency"
  | "mustHaves"
  | "dealBreakers"
  | "pets"
  | "incomeQualified"
  | "creditConcern"
  | "hasGuarantor"
  | "applicationReady"
  | "preScreeningNotes"
>;

export type PropertyPreferenceFitStatus = "match" | "miss" | "review" | "unknown";
export type PropertyPreferenceFitLabel =
  | "Good fit"
  | "Partial fit"
  | "Needs review"
  | "Outside budget"
  | "Bed mismatch"
  | "Neighborhood mismatch"
  | "Possible dealbreaker";

export type PropertyPreferenceFitItem = {
  key: "budget" | "bedrooms" | "neighborhood" | "dealBreakers";
  label: PropertyPreferenceFitLabel;
  status: PropertyPreferenceFitStatus;
  detail: string;
};

export const defaultClientPreferenceFields: ClientPreferenceFields = {
  budgetMin: "",
  budgetMax: "",
  bedrooms: "",
  bathrooms: "",
  preferredNeighborhoods: "",
  moveInUrgency: "",
  mustHaves: "",
  dealBreakers: "",
  pets: "",
  incomeQualified: false,
  creditConcern: false,
  hasGuarantor: false,
  applicationReady: false,
  preScreeningNotes: ""
};

export function withClientPreferenceDefaults<T extends Partial<ClientPreferenceFields>>(
  lead: T
): T & ClientPreferenceFields {
  return {
    ...lead,
    budgetMin: lead.budgetMin || "",
    budgetMax: lead.budgetMax || "",
    bedrooms: lead.bedrooms || "",
    bathrooms: lead.bathrooms || "",
    preferredNeighborhoods: lead.preferredNeighborhoods || "",
    moveInUrgency: lead.moveInUrgency || "",
    mustHaves: lead.mustHaves || "",
    dealBreakers: lead.dealBreakers || "",
    pets: lead.pets || "",
    incomeQualified: lead.incomeQualified === true,
    creditConcern: lead.creditConcern === true,
    hasGuarantor: lead.hasGuarantor === true,
    applicationReady: lead.applicationReady === true,
    preScreeningNotes: lead.preScreeningNotes || ""
  };
}

export function isMoveInUrgencyOption(value: string): value is MoveInUrgencyOption {
  return moveInUrgencyOptions.includes(value as MoveInUrgencyOption);
}

export function getMoveInUrgencyLabel(value: string) {
  switch (value) {
    case "flexible":
      return "Flexible";
    case "soon":
      return "Within 30 days";
    case "urgent":
      return "ASAP";
    default:
      return "Not set";
  }
}

export function getBudgetLabel(lead: Pick<Lead, "budgetMin" | "budgetMax">) {
  const min = formatBudgetValue(lead.budgetMin);
  const max = formatBudgetValue(lead.budgetMax);

  if (min && max) {
    return `${min} - ${max}`;
  }

  if (min) {
    return `From ${min}`;
  }

  if (max) {
    return `Up to ${max}`;
  }

  return "Budget not set";
}

export function getBedroomBathroomLabel(lead: Pick<Lead, "bedrooms" | "bathrooms">) {
  const bedrooms = lead.bedrooms.trim();
  const bathrooms = lead.bathrooms.trim();

  if (bedrooms && bathrooms) {
    return `${bedrooms} bd / ${bathrooms} ba`;
  }

  if (bedrooms) {
    return `${bedrooms} bd`;
  }

  if (bathrooms) {
    return `${bathrooms} ba`;
  }

  return "Beds/baths not set";
}

export function isLeadQualified(
  lead: Pick<Lead, "incomeQualified" | "creditConcern" | "hasGuarantor">
) {
  return lead.incomeQualified && (!lead.creditConcern || lead.hasGuarantor);
}

export function getPreScreenStatus(
  lead: Pick<Lead, "incomeQualified" | "creditConcern" | "hasGuarantor">
) {
  return isLeadQualified(lead) ? "Qualified" : "Needs review";
}

export function hasClientPreferences(lead: ClientPreferenceFields) {
  return Boolean(
    lead.budgetMin ||
      lead.budgetMax ||
      lead.bedrooms ||
      lead.bathrooms ||
      lead.preferredNeighborhoods ||
      lead.moveInUrgency ||
      lead.mustHaves ||
      lead.dealBreakers ||
      lead.pets ||
      lead.incomeQualified ||
      lead.creditConcern ||
      lead.hasGuarantor ||
      lead.applicationReady ||
      lead.preScreeningNotes
  );
}

export function splitPreferenceList(value: string) {
  return value
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parsePreferenceNumber(value: string) {
  const numeric = Number(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

export function getPropertyPreferenceFit(
  propertyInterest: PropertyInterest,
  lead: LeadWithProperties
) {
  const items: PropertyPreferenceFitItem[] = [];
  const propertyText = [
    propertyInterest.listingTitle,
    propertyInterest.address,
    propertyInterest.neighborhood,
    propertyInterest.pros,
    propertyInterest.cons,
    propertyInterest.clientFeedback,
    propertyInterest.agentNotes
  ]
    .join(" ")
    .toLowerCase();
  const dealBreakerText = [
    propertyInterest.address,
    propertyInterest.pros,
    propertyInterest.cons,
    propertyInterest.clientFeedback,
    propertyInterest.agentNotes
  ]
    .join(" ")
    .toLowerCase();

  const minBudget = parsePreferenceNumber(lead.budgetMin);
  const maxBudget = parsePreferenceNumber(lead.budgetMax);
  const rent = parsePreferenceNumber(propertyInterest.rent);

  if (minBudget === null && maxBudget === null) {
    items.push({
      key: "budget",
      label: "Needs review",
      status: "unknown",
      detail: "Budget not set"
    });
  } else if (rent === null) {
    items.push({
      key: "budget",
      label: "Needs review",
      status: "unknown",
      detail: "Price missing"
    });
  } else if (
      (minBudget === null || rent >= minBudget) &&
      (maxBudget === null || rent <= maxBudget)
    ) {
    items.push({
      key: "budget",
      label: "Good fit",
      status: "match",
      detail: `${formatBudgetValue(propertyInterest.rent)} within ${getBudgetLabel(lead)}`
    });
  } else {
    items.push({
      key: "budget",
      label: "Outside budget",
      status: "miss",
      detail: `${formatBudgetValue(propertyInterest.rent)} outside ${getBudgetLabel(lead)}`
    });
  }

  const desiredBedrooms = parsePreferenceNumber(lead.bedrooms);
  const propertyBedrooms = parsePreferenceNumber(propertyInterest.beds);

  if (desiredBedrooms === null) {
    items.push({
      key: "bedrooms",
      label: "Needs review",
      status: "unknown",
      detail: "Bedroom preference missing"
    });
  } else if (propertyBedrooms === null) {
    items.push({
      key: "bedrooms",
      label: "Needs review",
      status: "unknown",
      detail: "Bedroom count missing"
    });
  } else if (propertyBedrooms === desiredBedrooms) {
    items.push({
      key: "bedrooms",
      label: "Good fit",
      status: "match",
      detail: `${propertyInterest.beds} bd matches preference`
    });
  } else {
    items.push({
      key: "bedrooms",
      label: "Bed mismatch",
      status: "miss",
      detail: `${propertyInterest.beds} bd does not match ${lead.bedrooms} bd`
    });
  }

  const preferredNeighborhoods = splitPreferenceList(lead.preferredNeighborhoods);

  if (preferredNeighborhoods.length === 0) {
    items.push({
      key: "neighborhood",
      label: "Needs review",
      status: "unknown",
      detail: "Neighborhood preference missing"
    });
  } else if (!propertyInterest.neighborhood && !propertyInterest.address) {
    items.push({
      key: "neighborhood",
      label: "Needs review",
      status: "unknown",
      detail: "Neighborhood missing"
    });
  } else {
    const matchedNeighborhood = preferredNeighborhoods.find((neighborhood) =>
      propertyText.includes(neighborhood.toLowerCase())
    );

    items.push({
      key: "neighborhood",
      label: matchedNeighborhood ? "Good fit" : "Neighborhood mismatch",
      status: matchedNeighborhood ? "match" : "miss",
      detail: matchedNeighborhood
        ? `Matches ${matchedNeighborhood}`
        : `Does not match ${formatList(preferredNeighborhoods.slice(0, 3))}`
    });
  }

  const dealBreakers = splitPreferenceList(lead.dealBreakers);

  if (dealBreakers.length > 0) {
    const triggeredDealBreakers = dealBreakers.filter((item) =>
      dealBreakerText.includes(item.toLowerCase())
    );

    items.push({
      key: "dealBreakers",
      label: triggeredDealBreakers.length === 0 ? "Good fit" : "Possible dealbreaker",
      status: triggeredDealBreakers.length === 0 ? "match" : "miss",
      detail:
        triggeredDealBreakers.length === 0
          ? "No dealbreakers detected"
          : `Check ${formatList(triggeredDealBreakers.slice(0, 3))}`
    });
  }

  const matches = items.filter((item) => item.status === "match").length;
  const misses = items.filter((item) => item.status === "miss").length;
  const reviews = items.filter((item) => item.status === "review").length;
  const unknowns = items.filter((item) => item.status === "unknown").length;
  const score = matches * 2 - misses * 3 - reviews - unknowns;
  const outsideBudget = items.some((item) => item.label === "Outside budget");
  const possibleDealbreaker = items.some((item) => item.label === "Possible dealbreaker");
  const label =
    outsideBudget
      ? "Outside budget"
      : possibleDealbreaker
        ? "Needs review"
        : misses > 0
          ? "Partial fit"
          : unknowns > 0 || reviews > 0
            ? "Needs review"
            : "Good fit";

  return {
    label,
    items,
    matches,
    misses,
    reviews,
    unknowns,
    score
  };
}

function formatBudgetValue(value: string) {
  const numeric = parsePreferenceNumber(value);

  if (numeric === null) {
    return value.trim();
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(numeric);
}

function formatList(items: string[]) {
  if (items.length === 0) {
    return "";
  }

  if (items.length === 1) {
    return items[0];
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

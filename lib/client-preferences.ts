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

export type PropertyPreferenceFitStatus = "match" | "miss" | "review";

export type PropertyPreferenceFitItem = {
  key: "budget" | "bedrooms" | "neighborhood" | "mustHaves" | "dealBreakers";
  label: string;
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
  const positivePropertyText = [
    propertyInterest.listingTitle,
    propertyInterest.address,
    propertyInterest.neighborhood,
    propertyInterest.pros,
    propertyInterest.clientFeedback,
    propertyInterest.agentNotes
  ]
    .join(" ")
    .toLowerCase();
  const propertyText = `${positivePropertyText} ${propertyInterest.cons}`.toLowerCase();

  const minBudget = parsePreferenceNumber(lead.budgetMin);
  const maxBudget = parsePreferenceNumber(lead.budgetMax);
  const rent = parsePreferenceNumber(propertyInterest.rent);

  if (minBudget !== null || maxBudget !== null) {
    if (rent === null) {
      items.push({
        key: "budget",
        label: "Budget",
        status: "review",
        detail: "Price missing"
      });
    } else if (
      (minBudget === null || rent >= minBudget) &&
      (maxBudget === null || rent <= maxBudget)
    ) {
      items.push({
        key: "budget",
        label: "Budget",
        status: "match",
        detail: `${formatBudgetValue(propertyInterest.rent)} fits ${getBudgetLabel(lead)}`
      });
    } else {
      items.push({
        key: "budget",
        label: "Budget",
        status: "miss",
        detail: `${formatBudgetValue(propertyInterest.rent)} outside ${getBudgetLabel(lead)}`
      });
    }
  }

  const desiredBedrooms = parsePreferenceNumber(lead.bedrooms);
  const propertyBedrooms = parsePreferenceNumber(propertyInterest.beds);

  if (desiredBedrooms !== null) {
    if (propertyBedrooms === null) {
      items.push({
        key: "bedrooms",
        label: "Bedrooms",
        status: "review",
        detail: "Bedroom count missing"
      });
    } else if (propertyBedrooms >= desiredBedrooms) {
      items.push({
        key: "bedrooms",
        label: "Bedrooms",
        status: "match",
        detail: `${propertyInterest.beds} bd meets ${lead.bedrooms} bd preference`
      });
    } else {
      items.push({
        key: "bedrooms",
        label: "Bedrooms",
        status: "miss",
        detail: `${propertyInterest.beds} bd below ${lead.bedrooms} bd preference`
      });
    }
  }

  const preferredNeighborhoods = splitPreferenceList(lead.preferredNeighborhoods);

  if (preferredNeighborhoods.length > 0) {
    const matchedNeighborhood = preferredNeighborhoods.find((neighborhood) =>
      propertyText.includes(neighborhood.toLowerCase())
    );

    items.push({
      key: "neighborhood",
      label: "Neighborhood",
      status: matchedNeighborhood ? "match" : "miss",
      detail: matchedNeighborhood
        ? `Matches ${matchedNeighborhood}`
        : `Outside ${formatList(preferredNeighborhoods.slice(0, 3))}`
    });
  }

  const mustHaves = splitPreferenceList(lead.mustHaves);

  if (mustHaves.length > 0) {
    const missingMustHaves = mustHaves.filter((item) => !positivePropertyText.includes(item.toLowerCase()));

    items.push({
      key: "mustHaves",
      label: "Must-haves",
      status: missingMustHaves.length === 0 ? "match" : "review",
      detail:
        missingMustHaves.length === 0
          ? "All must-haves appear covered"
          : `Review ${formatList(missingMustHaves.slice(0, 3))}`
    });
  }

  const dealBreakers = splitPreferenceList(lead.dealBreakers);

  if (dealBreakers.length > 0) {
    const triggeredDealBreakers = dealBreakers.filter((item) =>
      propertyText.includes(item.toLowerCase())
    );

    items.push({
      key: "dealBreakers",
      label: "Dealbreakers",
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
  const score = matches * 2 + reviews - misses * 2;
  const label =
    items.length === 0
      ? "Add preferences"
      : misses > 0
        ? "Review fit"
        : reviews > 0
          ? "Likely fit"
          : "Strong fit";

  return {
    label,
    items,
    matches,
    misses,
    reviews,
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

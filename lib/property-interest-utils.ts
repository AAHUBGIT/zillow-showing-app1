import { LeadSource, PropertyInterest, PropertyInterestStatus } from "./types";
import {
  getAllDecisionStatusOptions,
  getDecisionStatusLabel,
  getDecisionStatusOrder,
  getDecisionStatusTone,
  isDecisionStatusTerminal,
  normalizeDecisionStatus
} from "./property-decision-statuses";

export const propertyInterestStatusOptions: PropertyInterestStatus[] = getAllDecisionStatusOptions().map(
  (status) => status.value
);

export function getPropertyInterestStatusLabel(status: PropertyInterestStatus) {
  return getDecisionStatusLabel(status);
}

export function getPropertyInterestStatusTone(status: PropertyInterestStatus) {
  return getDecisionStatusTone(status);
}

export function normalizePropertyInterestStatus(status: string): PropertyInterestStatus {
  return normalizeDecisionStatus(status);
}

export function isRejectedPropertyInterest(propertyInterest: PropertyInterest) {
  return isDecisionStatusTerminal(propertyInterest.status);
}

export function isActivePropertyInterest(propertyInterest: PropertyInterest) {
  return !isRejectedPropertyInterest(propertyInterest);
}

export function sortPropertyInterests(propertyInterests: PropertyInterest[]) {
  return [...propertyInterests]
    .map((propertyInterest) => ({
      ...propertyInterest,
      status: normalizePropertyInterestStatus(propertyInterest.status),
      clientFeedback: propertyInterest.clientFeedback || "",
      showingDate: propertyInterest.showingDate || "",
      showingTime: propertyInterest.showingTime || ""
    }))
    .sort((first, second) => {
      const byStatus =
        getDecisionStatusOrder(first.status) -
        getDecisionStatusOrder(second.status);
    if (byStatus !== 0) {
      return byStatus;
    }

    const byRating = second.rating - first.rating;
    if (byRating !== 0) {
      return byRating;
    }

      const firstShowing = first.showingDate && first.showingTime ? `${first.showingDate}T${first.showingTime}` : "";
      const secondShowing =
        second.showingDate && second.showingTime ? `${second.showingDate}T${second.showingTime}` : "";

      if (firstShowing && secondShowing && firstShowing !== secondShowing) {
        return firstShowing < secondShowing ? -1 : 1;
      }

      return first.updatedAt < second.updatedAt ? 1 : -1;
    });
}

export function getPropertyInterestCountLabel(count: number) {
  return `${count} ${count === 1 ? "property" : "properties"}`;
}

export function buildGoogleMapsSearchLink(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export function getPropertyInterestSourceLabel(source: LeadSource) {
  return source.charAt(0).toUpperCase() + source.slice(1);
}

export function getTopRatedProperty(propertyInterests: PropertyInterest[]) {
  const activeProperties = propertyInterests.filter(isActivePropertyInterest);
  const candidates = activeProperties.length > 0 ? activeProperties : propertyInterests;

  return [...candidates].sort((first, second) => {
    if (second.rating !== first.rating) {
      return second.rating - first.rating;
    }

    return first.updatedAt < second.updatedAt ? 1 : -1;
  })[0] || null;
}

export function getSuggestedPropertyShowing(propertyInterest: PropertyInterest, leadShowingDate = "", leadShowingTime = "") {
  if (propertyInterest.showingDate && propertyInterest.showingTime) {
    return {
      date: propertyInterest.showingDate,
      time: propertyInterest.showingTime
    };
  }

  if (leadShowingDate && leadShowingTime) {
    return {
      date: leadShowingDate,
      time: leadShowingTime
    };
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const day = String(tomorrow.getDate()).padStart(2, "0");

  return {
    date: `${year}-${month}-${day}`,
    time: "10:00"
  };
}

export function syncLeadShowingToPropertyInterests(
  propertyInterests: PropertyInterest[],
  leadPropertyAddress: string,
  leadShowingDate: string,
  leadShowingTime: string
) {
  return sortPropertyInterests(
    propertyInterests.map((propertyInterest) => {
      const normalizedStatus = normalizePropertyInterestStatus(propertyInterest.status);

      if (
        !propertyInterest.showingDate &&
        !propertyInterest.showingTime &&
        leadShowingDate &&
        leadShowingTime &&
        propertyInterest.address === leadPropertyAddress &&
        normalizedStatus === "interested"
      ) {
        return {
          ...propertyInterest,
          status: "scheduled",
          showingDate: leadShowingDate,
          showingTime: leadShowingTime
        };
      }

      return propertyInterest;
    })
  );
}

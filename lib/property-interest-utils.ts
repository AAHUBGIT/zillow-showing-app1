import { LeadSource, PropertyInterest, PropertyInterestStatus } from "./types";

export const propertyInterestStatusOptions: PropertyInterestStatus[] = [
  "interested",
  "scheduled",
  "toured",
  "rejected",
  "applying",
  "approved"
];

const propertyStatusRank: Record<PropertyInterestStatus, number> = {
  applying: 0,
  scheduled: 1,
  approved: 2,
  toured: 3,
  interested: 4,
  rejected: 5,
  closed: 6
};

const propertyStatusTone: Record<PropertyInterestStatus, string> = {
  interested: "border-blue-200 bg-blue-50 text-blue-700",
  scheduled: "border-indigo-200 bg-indigo-50 text-indigo-700",
  toured: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
  applying: "border-amber-200 bg-amber-50 text-amber-700",
  approved: "border-emerald-300 bg-emerald-100 text-emerald-800",
  closed: "border-slate-200 bg-slate-100 text-slate-700"
};

export function getPropertyInterestStatusLabel(status: PropertyInterestStatus) {
  return normalizePropertyInterestStatus(status) === "approved"
    ? "Approved"
    : normalizePropertyInterestStatus(status).charAt(0).toUpperCase() +
        normalizePropertyInterestStatus(status).slice(1);
}

export function getPropertyInterestStatusTone(status: PropertyInterestStatus) {
  return propertyStatusTone[normalizePropertyInterestStatus(status)];
}

export function normalizePropertyInterestStatus(status: string): PropertyInterestStatus {
  if (status === "closed") {
    return "approved";
  }

  if (propertyInterestStatusOptions.includes(status as PropertyInterestStatus)) {
    return status as PropertyInterestStatus;
  }

  return "interested";
}

export function isRejectedPropertyInterest(propertyInterest: PropertyInterest) {
  return normalizePropertyInterestStatus(propertyInterest.status) === "rejected";
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
        propertyStatusRank[normalizePropertyInterestStatus(first.status)] -
        propertyStatusRank[normalizePropertyInterestStatus(second.status)];
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

import { LeadSource, PropertyInterest, PropertyInterestStatus } from "./types";

export const propertyInterestStatusOptions: PropertyInterestStatus[] = [
  "interested",
  "toured",
  "rejected",
  "applying",
  "closed"
];

const propertyStatusRank: Record<PropertyInterestStatus, number> = {
  interested: 0,
  toured: 1,
  applying: 2,
  rejected: 3,
  closed: 4
};

const propertyStatusTone: Record<PropertyInterestStatus, string> = {
  interested: "border-blue-200 bg-blue-50 text-blue-700",
  toured: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
  applying: "border-amber-200 bg-amber-50 text-amber-700",
  closed: "border-slate-200 bg-slate-100 text-slate-700"
};

export function getPropertyInterestStatusLabel(status: PropertyInterestStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function getPropertyInterestStatusTone(status: PropertyInterestStatus) {
  return propertyStatusTone[status];
}

export function sortPropertyInterests(propertyInterests: PropertyInterest[]) {
  return [...propertyInterests].sort((first, second) => {
    const byStatus = propertyStatusRank[first.status] - propertyStatusRank[second.status];
    if (byStatus !== 0) {
      return byStatus;
    }

    const byRating = second.rating - first.rating;
    if (byRating !== 0) {
      return byRating;
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

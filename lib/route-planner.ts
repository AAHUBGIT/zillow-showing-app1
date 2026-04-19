import { sortDateAndTime } from "./date";
import { LeadWithProperties } from "./types";

type AddressMeta = {
  street: string;
  streetName: string;
  city: string;
  state: string;
  zip: string;
};

export type RouteSegmentEstimate = {
  minutes: number;
  label: string;
  unrealistic: boolean;
  warning: string;
};

function parseAddressMeta(address: string): AddressMeta {
  const [street = "", city = "", stateZip = ""] = address.split(",").map((part) => part.trim());
  const [state = "", zip = ""] = stateZip.split(/\s+/);

  return {
    street,
    streetName: street.replace(/^\d+\s+/, "").toLowerCase(),
    city: city.toLowerCase(),
    state: state.toUpperCase(),
    zip
  };
}

export function sortRouteStops(leads: LeadWithProperties[]) {
  const hasManualOrder = leads.some((lead) => (lead.routeStopOrder || 0) > 0);

  return [...leads].sort((first, second) => {
    if (hasManualOrder) {
      const firstOrder = first.routeStopOrder || Number.MAX_SAFE_INTEGER;
      const secondOrder = second.routeStopOrder || Number.MAX_SAFE_INTEGER;

      if (firstOrder !== secondOrder) {
        return firstOrder - secondOrder;
      }
    }

    return sortDateAndTime(first.showingDate, first.showingTime, second.showingDate, second.showingTime);
  });
}

export function buildRoutePreviewEmbedLink(addresses: string[]) {
  if (addresses.length === 0) {
    return "";
  }

  const query =
    addresses.length === 1 ? addresses[0] : `${addresses[0]} to ${addresses.slice(1).join(" to ")}`;

  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

export function estimateTravelBetweenStops(firstAddress: string, secondAddress: string): RouteSegmentEstimate {
  const first = parseAddressMeta(firstAddress);
  const second = parseAddressMeta(secondAddress);

  if (first.state && second.state && first.state !== second.state) {
    return {
      minutes: 180,
      label: "~3 hr+ drive",
      unrealistic: true,
      warning: "These stops appear to be in different states."
    };
  }

  if (first.city && second.city && first.city !== second.city) {
    return {
      minutes: 75,
      label: "~75 min drive",
      unrealistic: true,
      warning: `This route jumps from ${toTitleCase(first.city)} to ${toTitleCase(second.city)}.`
    };
  }

  if (first.streetName && first.streetName === second.streetName) {
    return {
      minutes: 8,
      label: "~8 min drive",
      unrealistic: false,
      warning: ""
    };
  }

  if (first.zip && second.zip && first.zip === second.zip) {
    return {
      minutes: 12,
      label: "~12 min drive",
      unrealistic: false,
      warning: ""
    };
  }

  if (first.zip && second.zip && first.zip.slice(0, 3) === second.zip.slice(0, 3)) {
    return {
      minutes: 22,
      label: "~22 min drive",
      unrealistic: false,
      warning: ""
    };
  }

  return {
    minutes: 38,
    label: "~38 min drive",
    unrealistic: false,
    warning: ""
  };
}

export function getRouteDaySummary(stops: LeadWithProperties[]) {
  const segments = stops.slice(1).map((stop, index) =>
    estimateTravelBetweenStops(stops[index].propertyAddress, stop.propertyAddress)
  );
  const totalDriveMinutes = segments.reduce((total, segment) => total + segment.minutes, 0);
  const unrealisticSegments = segments.filter((segment) => segment.unrealistic);

  return {
    segments,
    totalDriveMinutes,
    totalDriveLabel: totalDriveMinutes > 0 ? `~${totalDriveMinutes} min total drive` : "Single-stop day",
    unrealisticSegments,
    warning:
      unrealisticSegments[0]?.warning ||
      (totalDriveMinutes >= 90 ? "This route looks unusually spread out for one touring block." : "")
  };
}

function toTitleCase(value: string) {
  return value.replace(/\b\w/g, (character) => character.toUpperCase());
}

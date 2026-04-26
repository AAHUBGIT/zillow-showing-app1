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

export function isRouteReadyLead(
  lead: Pick<LeadWithProperties, "showingDate" | "showingTime" | "propertyAddress">
) {
  return Boolean(lead.showingDate && lead.showingTime && lead.propertyAddress);
}

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
  return [...leads].filter(isRouteReadyLead).sort((first, second) => {
    const firstOrder = first.routeStopOrder > 0 ? first.routeStopOrder : Number.MAX_SAFE_INTEGER;
    const secondOrder = second.routeStopOrder > 0 ? second.routeStopOrder : Number.MAX_SAFE_INTEGER;

    if (firstOrder !== secondOrder) {
      return firstOrder - secondOrder;
    }

    const byShowingTime = sortDateAndTime(
      first.showingDate,
      first.showingTime,
      second.showingDate,
      second.showingTime
    );

    if (byShowingTime !== 0) {
      return byShowingTime;
    }

    return (
      first.fullName.localeCompare(second.fullName, undefined, { sensitivity: "base" }) ||
      first.id.localeCompare(second.id)
    );
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

export function buildGoogleMapsDirectionsLink(addresses: string[]) {
  if (addresses.length === 0) {
    return "https://www.google.com/maps";
  }

  if (addresses.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addresses[0])}`;
  }

  const origin = encodeURIComponent(addresses[0]);
  const destination = encodeURIComponent(addresses[addresses.length - 1]);
  const waypoints = addresses
    .slice(1, -1)
    .map((address) => encodeURIComponent(address))
    .join("|");

  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving${
    waypoints ? `&waypoints=${waypoints}` : ""
  }`;
}

export function estimateTravelBetweenStops(firstAddress: string, secondAddress: string): RouteSegmentEstimate {
  const first = parseAddressMeta(firstAddress);
  const second = parseAddressMeta(secondAddress);

  if (first.state && second.state && first.state !== second.state) {
    return {
      minutes: 180,
      label: "~3 hr+ drive",
      unrealistic: true,
      warning:
        "These stops look like they are in different states, so this pairing is probably too far apart for one smooth showing run."
    };
  }

  if (first.city && second.city && first.city !== second.city) {
    return {
      minutes: 75,
      label: "~75 min drive",
      unrealistic: true,
      warning: `This route jumps from ${toTitleCase(first.city)} to ${toTitleCase(second.city)}, so consider moving one of these stops into a separate time block.`
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
      (totalDriveMinutes >= 90
        ? "This day adds up to a long drive window. Consider splitting it into two smaller touring runs to keep the schedule realistic."
        : "")
  };
}

function toTitleCase(value: string) {
  return value.replace(/\b\w/g, (character) => character.toUpperCase());
}

import { getSessionUser } from "./auth";
import { getDemoLeads } from "./demo-leads";
import { canUseDatabase } from "./deployment";
import { sortLeads } from "./lead-utils";
import { prisma } from "./prisma";
import { Lead } from "./types";

export async function getLeads() {
  if (!canUseDatabase()) {
    return sortLeads(getDemoLeads());
  }

  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return [];
  }

  const leads = await prisma.lead.findMany({
    where: {
      userId: sessionUser.id
    }
  });

  return sortLeads(leads as Lead[]);
}

export async function getLeadById(id: string) {
  if (!canUseDatabase()) {
    return getDemoLeads().find((lead) => lead.id === id) ?? null;
  }

  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return null;
  }

  const lead = await prisma.lead.findUnique({
    where: { id }
  });

  if (!lead || lead.userId !== sessionUser.id) {
    return null;
  }

  return lead as Lead;
}

export async function saveLeads(leads: Lead[]) {
  if (!canUseDatabase()) {
    return;
  }

  await prisma.$transaction([
    prisma.lead.deleteMany(),
    prisma.lead.createMany({
      data: leads
    })
  ]);
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

  const waypointQuery = waypoints ? `&waypoints=${waypoints}` : "";

  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypointQuery}&travelmode=driving`;
}

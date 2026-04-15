import { getSessionUser } from "./auth";
import { getDemoLeads } from "./demo-leads";
import { canUseDatabase } from "./deployment";
import { sortLeads } from "./lead-utils";
import { buildGoogleMapsSearchLink, sortPropertyInterests } from "./property-interest-utils";
import { prisma } from "./prisma";
import { LeadWithProperties, PropertyInterest } from "./types";

export async function getLeads(): Promise<LeadWithProperties[]> {
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
    },
    include: {
      propertyInterests: true
    }
  });

  return sortLeads(
    (leads as unknown as LeadWithProperties[]).map((lead) => ({
      ...lead,
      propertyInterests: sortPropertyInterests(lead.propertyInterests || [])
    }))
  );
}

export async function getLeadById(id: string): Promise<LeadWithProperties | null> {
  if (!canUseDatabase()) {
    return getDemoLeads().find((lead) => lead.id === id) ?? null;
  }

  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return null;
  }

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      propertyInterests: true
    }
  });

  if (!lead || lead.userId !== sessionUser.id) {
    return null;
  }

  return {
    ...(lead as unknown as LeadWithProperties),
    propertyInterests: sortPropertyInterests((lead as any).propertyInterests || [])
  };
}

export async function getPropertyInterestById(
  leadId: string,
  propertyInterestId: string
): Promise<PropertyInterest | null> {
  const lead = await getLeadById(leadId);
  if (!lead) {
    return null;
  }

  return lead.propertyInterests.find((propertyInterest) => propertyInterest.id === propertyInterestId) ?? null;
}

export async function saveLeads(leads: LeadWithProperties[]) {
  if (!canUseDatabase()) {
    return;
  }

  await prisma.$transaction([
    prisma.propertyInterest.deleteMany(),
    prisma.lead.deleteMany(),
    ...leads.map((lead) =>
      prisma.lead.create({
        data: {
          id: lead.id,
          userId: lead.userId,
          fullName: lead.fullName,
          phone: lead.phone,
          email: lead.email,
          propertyAddress: lead.propertyAddress,
          desiredMoveInDate: lead.desiredMoveInDate,
          notes: lead.notes,
          status: lead.status,
          priority: lead.priority,
          source: lead.source,
          nextFollowUpDate: lead.nextFollowUpDate,
          showingDate: lead.showingDate,
          showingTime: lead.showingTime,
          agentNotes: lead.agentNotes,
          createdAt: lead.createdAt,
          updatedAt: lead.updatedAt,
          propertyInterests: {
            create: (lead.propertyInterests || []).map((propertyInterest) => ({
              id: propertyInterest.id,
              address: propertyInterest.address,
              listingTitle: propertyInterest.listingTitle,
              source: propertyInterest.source,
              listingUrl: propertyInterest.listingUrl,
              rent: propertyInterest.rent,
              beds: propertyInterest.beds,
              baths: propertyInterest.baths,
              neighborhood: propertyInterest.neighborhood,
              status: propertyInterest.status,
              rating: propertyInterest.rating,
              pros: propertyInterest.pros,
              cons: propertyInterest.cons,
              agentNotes: propertyInterest.agentNotes,
              createdAt: propertyInterest.createdAt,
              updatedAt: propertyInterest.updatedAt
            }))
          }
        }
      })
    )
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

export function buildPropertyGoogleMapsLink(address: string) {
  return buildGoogleMapsSearchLink(address);
}

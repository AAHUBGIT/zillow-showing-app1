import { getSessionUser } from "./auth";
import {
  getDefaultCommunicationTemplates,
  getDemoCommunicationActivities
} from "./communication";
import { getDemoLeads } from "./demo-leads";
import { canUseDatabase, shouldUseDemoData } from "./deployment";
import { sortLeads } from "./lead-utils";
import {
  buildGoogleMapsSearchLink,
  syncLeadShowingToPropertyInterests
} from "./property-interest-utils";
import { getPrismaClient } from "./prisma";
import {
  CommunicationActivity,
  CommunicationTemplate,
  LeadWithProperties,
  PropertyInterest
} from "./types";

export type LeadCommunicationWorkspace = {
  templates: CommunicationTemplate[];
  activities: CommunicationActivity[];
};

export async function getLeads(): Promise<LeadWithProperties[]> {
  if (shouldUseDemoData()) {
    return sortLeads(getDemoLeads());
  }

  if (!canUseDatabase()) {
    return [];
  }

  const prisma = getPrismaClient();

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
      propertyInterests: syncLeadShowingToPropertyInterests(
        lead.propertyInterests || [],
        lead.propertyAddress,
        lead.showingDate,
        lead.showingTime
      )
    }))
  );
}

export async function getLeadById(id: string): Promise<LeadWithProperties | null> {
  if (shouldUseDemoData()) {
    return getDemoLeads().find((lead) => lead.id === id) ?? null;
  }

  if (!canUseDatabase()) {
    return null;
  }

  const prisma = getPrismaClient();

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
    propertyInterests: syncLeadShowingToPropertyInterests(
      (lead as any).propertyInterests || [],
      lead.propertyAddress,
      lead.showingDate,
      lead.showingTime
    )
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

export async function getCommunicationWorkspace(leadId: string): Promise<LeadCommunicationWorkspace> {
  if (shouldUseDemoData()) {
    const lead = getDemoLeads().find((currentLead) => currentLead.id === leadId);

    return {
      templates: getDefaultCommunicationTemplates(lead?.userId || "demo-user"),
      activities: lead ? getDemoCommunicationActivities(lead) : []
    };
  }

  const sessionUser = await getSessionUser();
  const fallbackTemplates = getDefaultCommunicationTemplates(sessionUser?.id || "demo-user");

  if (!sessionUser || !canUseDatabase()) {
    return {
      templates: fallbackTemplates,
      activities: []
    };
  }

  const prisma = getPrismaClient();

  let lead;

  try {
    lead = await prisma.lead.findUnique({
      where: { id: leadId }
    });
  } catch {
    return {
      templates: fallbackTemplates,
      activities: []
    };
  }

  if (!lead || lead.userId !== sessionUser.id) {
    return {
      templates: fallbackTemplates,
      activities: []
    };
  }

  try {
    const [savedTemplates, activities] = await Promise.all([
      prisma.$queryRaw<CommunicationTemplate[]>`
        SELECT
          "id",
          "userId",
          "name",
          "channel",
          "subject",
          "body",
          "sortOrder",
          "createdAt",
          "updatedAt"
        FROM "CommunicationTemplate"
        WHERE "userId" = ${sessionUser.id}
        ORDER BY "sortOrder" ASC, "createdAt" ASC
      `,
      prisma.$queryRaw<CommunicationActivity[]>`
        SELECT
          "id",
          "leadId",
          "userId",
          "templateId",
          "channel",
          "direction",
          "subject",
          "body",
          "outcome",
          "occurredAt",
          "createdAt"
        FROM "CommunicationActivity"
        WHERE "leadId" = ${leadId} AND "userId" = ${sessionUser.id}
        ORDER BY "occurredAt" DESC, "createdAt" DESC
        LIMIT 30
      `
    ]);

    return {
      templates: [...fallbackTemplates, ...savedTemplates],
      activities
    };
  } catch (error) {
    console.error(error);
    return {
      templates: fallbackTemplates,
      activities: []
    };
  }
}

export async function saveLeads(leads: LeadWithProperties[]) {
  if (!canUseDatabase()) {
    return;
  }

  const prisma = getPrismaClient();

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
          routeStopOrder: lead.routeStopOrder || 0,
          routeCompleted: lead.routeCompleted || false,
          routeNote: lead.routeNote || "",
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
              clientFeedback: propertyInterest.clientFeedback || "",
              pros: propertyInterest.pros,
              cons: propertyInterest.cons,
              agentNotes: propertyInterest.agentNotes,
              showingDate: propertyInterest.showingDate || "",
              showingTime: propertyInterest.showingTime || "",
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

import leads from "@/data/leads.json";
import { syncLeadShowingToPropertyInterests } from "./property-interest-utils";
import { LeadWithProperties } from "./types";

export function getDemoLeads() {
  return [...(leads as LeadWithProperties[])]
    .map((lead) => ({
      ...lead,
      userId: lead.userId || "demo-user",
      routeStopOrder: Number(lead.routeStopOrder || 0),
      routeCompleted: Boolean(lead.routeCompleted || false),
      routeNote: lead.routeNote || "",
      propertyInterests: syncLeadShowingToPropertyInterests(
        lead.propertyInterests || [],
        lead.propertyAddress,
        lead.showingDate,
        lead.showingTime
      )
    }))
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

import leads from "@/data/leads.json";
import { sortPropertyInterests } from "./property-interest-utils";
import { LeadWithProperties } from "./types";

export function getDemoLeads() {
  return [...(leads as LeadWithProperties[])]
    .map((lead) => ({
      ...lead,
      userId: lead.userId || "demo-user",
      propertyInterests: sortPropertyInterests(lead.propertyInterests || [])
    }))
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

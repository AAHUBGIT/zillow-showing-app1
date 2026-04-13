import leads from "@/data/leads.json";
import { Lead } from "./types";

export function getDemoLeads() {
  return [...(leads as Lead[])]
    .map((lead) => ({ ...lead, userId: lead.userId || "demo-user" }))
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

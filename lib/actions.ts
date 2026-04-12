"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getLeads, saveLeads } from "./storage";
import { Lead, LeadStatus } from "./types";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function createLead(formData: FormData) {
  const leads = await getLeads();
  const now = new Date().toISOString();
  const showingDate = getString(formData, "showingDate");
  const showingTime = getString(formData, "showingTime");

  const lead: Lead = {
    id: crypto.randomUUID(),
    fullName: getString(formData, "fullName"),
    phone: getString(formData, "phone"),
    email: getString(formData, "email"),
    propertyAddress: getString(formData, "propertyAddress"),
    desiredMoveInDate: getString(formData, "desiredMoveInDate"),
    notes: getString(formData, "notes"),
    status: getString(formData, "status") as LeadStatus,
    showingDate,
    showingTime,
    agentNotes: getString(formData, "agentNotes"),
    createdAt: now,
    updatedAt: now
  };

  if (showingDate && showingTime && lead.status === "new") {
    lead.status = "scheduled";
  }

  await saveLeads([lead, ...leads]);
  revalidatePath("/");
  revalidatePath("/routes");
  redirect("/");
}

export async function updateLeadSchedule(formData: FormData) {
  const id = getString(formData, "id");
  const leads = await getLeads();
  const showingDate = getString(formData, "showingDate");
  const showingTime = getString(formData, "showingTime");

  const updatedLeads = leads.map((lead) => {
    if (lead.id !== id) {
      return lead;
    }

    const nextStatus = getString(formData, "status") as LeadStatus;

    return {
      ...lead,
      status: showingDate && showingTime && nextStatus === "new" ? "scheduled" : nextStatus,
      showingDate,
      showingTime,
      agentNotes: getString(formData, "agentNotes"),
      updatedAt: new Date().toISOString()
    };
  });

  await saveLeads(updatedLeads);
  revalidatePath("/");
  revalidatePath(`/leads/${id}`);
  revalidatePath("/routes");
}

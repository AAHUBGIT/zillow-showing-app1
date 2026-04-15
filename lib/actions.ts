"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearSessionCookie, getDemoUser, getSessionUser, isValidLogin, setSessionCookie } from "./auth";
import { canUseDatabase, isPreviewReadonlyMode } from "./deployment";
import { leadPriorityOptions, leadSourceOptions } from "./lead-utils";
import { prisma } from "./prisma";
import { propertyInterestStatusOptions } from "./property-interest-utils";
import { Lead, LeadPriority, LeadSource, LeadStatus, PropertyInterest, PropertyInterestStatus } from "./types";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function withToast(path: string, toastKey: string) {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}toast=${toastKey}`;
}

function getPriority(formData: FormData) {
  const value = getString(formData, "priority") as LeadPriority;
  return leadPriorityOptions.includes(value) ? value : "medium";
}

function getSource(formData: FormData) {
  const value = getString(formData, "source") as LeadSource;
  return leadSourceOptions.includes(value) ? value : "other";
}

function getPropertyInterestStatus(formData: FormData) {
  const value = getString(formData, "status") as PropertyInterestStatus;
  return propertyInterestStatusOptions.includes(value) ? value : "interested";
}

function getPropertyInterestRating(formData: FormData) {
  const value = Number(getString(formData, "rating"));

  if (Number.isNaN(value)) {
    return 3;
  }

  return Math.max(1, Math.min(5, value));
}

export async function loginUser(formData: FormData) {
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const next = getString(formData, "next") || "/";

  if (!isValidLogin(email, password)) {
    redirect(withToast("/login", "login-error"));
  }

  await setSessionCookie(getDemoUser());
  redirect(withToast(next, "login-success"));
}

export async function logoutUser() {
  await clearSessionCookie();
  redirect(withToast("/login", "logout-success"));
}

export async function createLead(formData: FormData) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect("/login");
  }

  if (!canUseDatabase()) {
    redirect(withToast("/", isPreviewReadonlyMode() ? "preview-readonly" : "database-unavailable"));
  }

  const now = new Date().toISOString();
  const showingDate = getString(formData, "showingDate");
  const showingTime = getString(formData, "showingTime");

  const lead: Lead = {
    id: crypto.randomUUID(),
    userId: sessionUser.id,
    fullName: getString(formData, "fullName"),
    phone: getString(formData, "phone"),
    email: getString(formData, "email"),
    propertyAddress: getString(formData, "propertyAddress"),
    desiredMoveInDate: getString(formData, "desiredMoveInDate"),
    notes: getString(formData, "notes"),
    status: getString(formData, "status") as LeadStatus,
    priority: getPriority(formData),
    source: getSource(formData),
    nextFollowUpDate: getString(formData, "nextFollowUpDate"),
    showingDate,
    showingTime,
    agentNotes: getString(formData, "agentNotes"),
    createdAt: now,
    updatedAt: now
  };

  if (showingDate && showingTime && lead.status === "new") {
    lead.status = "scheduled";
  }

  await prisma.lead.create({
    data: lead
  });

  revalidatePath("/");
  revalidatePath("/routes");
  redirect(withToast("/", "lead-created"));
}

export async function updateLeadSchedule(formData: FormData) {
  const id = getString(formData, "id");
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect("/login");
  }

  if (!canUseDatabase()) {
    redirect(
      withToast(`/leads/${id}`, isPreviewReadonlyMode() ? "preview-readonly" : "database-unavailable")
    );
  }

  const showingDate = getString(formData, "showingDate");
  const showingTime = getString(formData, "showingTime");
  const nextStatus = getString(formData, "status") as LeadStatus;

  const result = await prisma.lead.updateMany({
    where: { id, userId: sessionUser.id },
    data: {
      status: showingDate && showingTime && nextStatus === "new" ? "scheduled" : nextStatus,
      priority: getPriority(formData),
      source: getSource(formData),
      nextFollowUpDate: getString(formData, "nextFollowUpDate"),
      showingDate,
      showingTime,
      agentNotes: getString(formData, "agentNotes"),
      updatedAt: new Date().toISOString()
    }
  });

  if (result.count === 0) {
    redirect(withToast("/", "status-updated"));
  }

  revalidatePath("/");
  revalidatePath(`/leads/${id}`);
  revalidatePath("/routes");
  redirect(withToast(`/leads/${id}`, showingDate && showingTime ? "showing-scheduled" : "status-updated"));
}

export async function updateLeadStatus(formData: FormData) {
  const id = getString(formData, "id");
  const status = getString(formData, "status") as LeadStatus;
  const redirectTo = getString(formData, "redirectTo") || "/";
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/login");
  }

  if (!canUseDatabase()) {
    redirect(withToast(redirectTo, isPreviewReadonlyMode() ? "preview-readonly" : "database-unavailable"));
  }

  const result = await prisma.lead.updateMany({
    where: { id, userId: sessionUser.id },
    data: {
      status,
      updatedAt: new Date().toISOString()
    }
  });

  if (result.count === 0) {
    redirect(withToast(redirectTo, "status-updated"));
  }

  revalidatePath("/");
  revalidatePath("/routes");
  revalidatePath(`/leads/${id}`);
  redirect(withToast(redirectTo, "status-updated"));
}

export async function createPropertyInterest(formData: FormData) {
  const sessionUser = await getSessionUser();
  const leadId = getString(formData, "leadId");

  if (!sessionUser) {
    redirect("/login");
  }

  if (!canUseDatabase()) {
    redirect(
      withToast(`/leads/${leadId}`, isPreviewReadonlyMode() ? "preview-readonly" : "database-unavailable")
    );
  }

  const lead = await prisma.lead.findUnique({
    where: { id: leadId }
  });

  if (!lead || lead.userId !== sessionUser.id) {
    redirect(withToast("/", "property-updated"));
  }

  const now = new Date().toISOString();
  const propertyInterest: PropertyInterest = {
    id: crypto.randomUUID(),
    leadId,
    address: getString(formData, "address"),
    listingTitle: getString(formData, "listingTitle"),
    source: getSource(formData),
    listingUrl: getString(formData, "listingUrl"),
    rent: getString(formData, "rent"),
    beds: getString(formData, "beds"),
    baths: getString(formData, "baths"),
    neighborhood: getString(formData, "neighborhood"),
    status: getPropertyInterestStatus(formData),
    rating: getPropertyInterestRating(formData),
    pros: getString(formData, "pros"),
    cons: getString(formData, "cons"),
    agentNotes: getString(formData, "agentNotes"),
    createdAt: now,
    updatedAt: now
  };

  await prisma.propertyInterest.create({
    data: propertyInterest
  });

  revalidatePath("/");
  revalidatePath(`/leads/${leadId}`);
  revalidatePath(`/leads/${leadId}/properties/${propertyInterest.id}`);
  redirect(withToast(`/leads/${leadId}`, "property-added"));
}

export async function updatePropertyInterest(formData: FormData) {
  const sessionUser = await getSessionUser();
  const leadId = getString(formData, "leadId");
  const propertyInterestId = getString(formData, "propertyInterestId");

  if (!sessionUser) {
    redirect("/login");
  }

  if (!canUseDatabase()) {
    redirect(
      withToast(
        `/leads/${leadId}/properties/${propertyInterestId}`,
        isPreviewReadonlyMode() ? "preview-readonly" : "database-unavailable"
      )
    );
  }

  const propertyInterest = await prisma.propertyInterest.findUnique({
    where: { id: propertyInterestId },
    include: {
      lead: true
    }
  });

  if (!propertyInterest || propertyInterest.leadId !== leadId || propertyInterest.lead.userId !== sessionUser.id) {
    redirect(withToast(`/leads/${leadId}`, "property-updated"));
  }

  await prisma.propertyInterest.update({
    where: { id: propertyInterestId },
    data: {
      address: getString(formData, "address"),
      listingTitle: getString(formData, "listingTitle"),
      source: getSource(formData),
      listingUrl: getString(formData, "listingUrl"),
      rent: getString(formData, "rent"),
      beds: getString(formData, "beds"),
      baths: getString(formData, "baths"),
      neighborhood: getString(formData, "neighborhood"),
      status: getPropertyInterestStatus(formData),
      rating: getPropertyInterestRating(formData),
      pros: getString(formData, "pros"),
      cons: getString(formData, "cons"),
      agentNotes: getString(formData, "agentNotes"),
      updatedAt: new Date().toISOString()
    }
  });

  revalidatePath("/");
  revalidatePath(`/leads/${leadId}`);
  revalidatePath(`/leads/${leadId}/properties/${propertyInterestId}`);
  redirect(withToast(`/leads/${leadId}/properties/${propertyInterestId}`, "property-updated"));
}

export async function markPropertyInterestToured(formData: FormData) {
  const sessionUser = await getSessionUser();
  const leadId = getString(formData, "leadId");
  const propertyInterestId = getString(formData, "propertyInterestId");

  if (!sessionUser) {
    redirect("/login");
  }

  if (!canUseDatabase()) {
    redirect(
      withToast(
        `/leads/${leadId}/properties/${propertyInterestId}`,
        isPreviewReadonlyMode() ? "preview-readonly" : "database-unavailable"
      )
    );
  }

  const propertyInterest = await prisma.propertyInterest.findUnique({
    where: { id: propertyInterestId },
    include: {
      lead: true
    }
  });

  if (!propertyInterest || propertyInterest.leadId !== leadId || propertyInterest.lead.userId !== sessionUser.id) {
    redirect(withToast(`/leads/${leadId}`, "property-toured"));
  }

  await prisma.propertyInterest.update({
    where: { id: propertyInterestId },
    data: {
      status: "toured",
      updatedAt: new Date().toISOString()
    }
  });

  revalidatePath("/");
  revalidatePath(`/leads/${leadId}`);
  revalidatePath(`/leads/${leadId}/properties/${propertyInterestId}`);
  redirect(withToast(`/leads/${leadId}/properties/${propertyInterestId}`, "property-toured"));
}

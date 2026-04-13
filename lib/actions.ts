"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearSessionCookie, getDemoUser, getSessionUser, isValidLogin, setSessionCookie } from "./auth";
import { canUseDatabase, isPreviewReadonlyMode } from "./deployment";
import { leadPriorityOptions, leadSourceOptions } from "./lead-utils";
import { prisma } from "./prisma";
import { Lead, LeadPriority, LeadSource, LeadStatus } from "./types";

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

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearSessionCookie, getDemoUser, getSessionUser, isValidLogin, setSessionCookie } from "./auth";
import { getEmailError, getNumericError, getPhoneError, getRequiredSelectError, getRequiredTextError } from "./form-validation";
import { canUseDatabase, isPreviewReadonlyMode } from "./deployment";
import { leadPriorityOptions, leadSourceOptions, leadStatusOptions } from "./lead-utils";
import { prisma } from "./prisma";
import { propertyInterestStatusOptions } from "./property-interest-utils";
import { sortRouteStops } from "./route-planner";
import {
  Lead,
  LeadPriority,
  LeadSource,
  LeadStatus,
  LeadWithProperties,
  PropertyInterest,
  PropertyInterestStatus
} from "./types";

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

function getStatus(formData: FormData) {
  const value = getString(formData, "status") as LeadStatus;
  return leadStatusOptions.includes(value) ? value : "new";
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

function isIsoDate(value: string) {
  return !value || /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isTwentyFourHourTime(value: string) {
  return !value || /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function hasScheduleMismatch(showingDate: string, showingTime: string) {
  return (showingDate && !showingTime) || (showingTime && !showingDate);
}

function getNormalizedPropertyStatus(status: PropertyInterestStatus, showingDate: string, showingTime: string) {
  if (showingDate && showingTime && status === "interested") {
    return "scheduled";
  }

  return status;
}

function redirectValidation(path: string): never {
  redirect(withToast(path, "validation-error"));
}

function redirectSaveError(path: string, error: unknown): never {
  console.error(error);
  redirect(withToast(path, "save-error"));
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
    redirect(
      withToast("/leads/new", isPreviewReadonlyMode() ? "preview-readonly" : "database-unavailable")
    );
  }

  const now = new Date().toISOString();
  const showingDate = getString(formData, "showingDate");
  const showingTime = getString(formData, "showingTime");
  const fullName = getString(formData, "fullName");
  const phone = getString(formData, "phone");
  const email = getString(formData, "email");
  const propertyAddress = getString(formData, "propertyAddress");
  const desiredMoveInDate = getString(formData, "desiredMoveInDate");
  const status = getStatus(formData);
  const priority = getPriority(formData);
  const source = getSource(formData);

  if (
    getRequiredTextError(fullName) ||
    getPhoneError(phone) ||
    getEmailError(email) ||
    getRequiredTextError(propertyAddress) ||
    getRequiredTextError(desiredMoveInDate) ||
    getRequiredSelectError(status) ||
    getRequiredSelectError(priority) ||
    getRequiredSelectError(source) ||
    !isIsoDate(desiredMoveInDate) ||
    !isIsoDate(showingDate) ||
    !isTwentyFourHourTime(showingTime) ||
    hasScheduleMismatch(showingDate, showingTime)
  ) {
    redirectValidation("/leads/new");
  }

  const lead: Lead = {
    id: crypto.randomUUID(),
    userId: sessionUser.id,
    fullName,
    phone,
    email,
    propertyAddress,
    desiredMoveInDate,
    notes: getString(formData, "notes"),
    status,
    priority,
    source,
    nextFollowUpDate: getString(formData, "nextFollowUpDate"),
    showingDate,
    showingTime,
    routeStopOrder: 0,
    routeCompleted: false,
    routeNote: "",
    agentNotes: getString(formData, "agentNotes"),
    createdAt: now,
    updatedAt: now
  };

  if (showingDate && showingTime && lead.status === "new") {
    lead.status = "scheduled";
  }

  try {
    await prisma.lead.create({
      data: lead
    });
  } catch (error) {
    redirectSaveError("/leads/new", error);
  }

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
  const nextStatus = getStatus(formData);
  const priority = getPriority(formData);
  const source = getSource(formData);

  if (
    getRequiredSelectError(nextStatus) ||
    getRequiredSelectError(priority) ||
    getRequiredSelectError(source) ||
    !isIsoDate(getString(formData, "nextFollowUpDate")) ||
    !isIsoDate(showingDate) ||
    !isTwentyFourHourTime(showingTime) ||
    hasScheduleMismatch(showingDate, showingTime)
  ) {
    redirectValidation(`/leads/${id}`);
  }

  let result;

  try {
    result = await prisma.lead.updateMany({
      where: { id, userId: sessionUser.id },
      data: {
        status: showingDate && showingTime && nextStatus === "new" ? "scheduled" : nextStatus,
        priority,
        source,
        nextFollowUpDate: getString(formData, "nextFollowUpDate"),
        showingDate,
        showingTime,
        routeCompleted: false,
        routeStopOrder: 0,
        agentNotes: getString(formData, "agentNotes"),
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    redirectSaveError(`/leads/${id}`, error);
  }

  if (result.count === 0) {
    redirect(withToast(`/leads/${id}`, "save-error"));
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

  if (!leadStatusOptions.includes(status)) {
    redirectValidation(redirectTo);
  }

  let result;

  try {
    result = await prisma.lead.updateMany({
      where: { id, userId: sessionUser.id },
      data: {
        status,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    redirectSaveError(redirectTo, error);
  }

  if (result.count === 0) {
    redirect(withToast(redirectTo, "save-error"));
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

  const listingTitle = getString(formData, "listingTitle");
  const address = getString(formData, "address");
  const source = getSource(formData);
  const rent = getString(formData, "rent");
  const beds = getString(formData, "beds");
  const baths = getString(formData, "baths");
  const showingDate = getString(formData, "showingDate");
  const showingTime = getString(formData, "showingTime");
  const status = getNormalizedPropertyStatus(getPropertyInterestStatus(formData), showingDate, showingTime);

  if (
    getRequiredTextError(listingTitle) ||
    getRequiredTextError(address) ||
    getRequiredSelectError(source) ||
    getRequiredSelectError(status) ||
    getNumericError(rent) ||
    getNumericError(beds) ||
    getNumericError(baths) ||
    !isIsoDate(showingDate) ||
    !isTwentyFourHourTime(showingTime) ||
    hasScheduleMismatch(showingDate, showingTime) ||
    (status === "scheduled" && (!showingDate || !showingTime))
  ) {
    redirectValidation(`/leads/${leadId}/properties/new`);
  }

  let lead;

  try {
    lead = await prisma.lead.findUnique({
      where: { id: leadId }
    });
  } catch (error) {
    redirectSaveError(`/leads/${leadId}`, error);
  }

  if (!lead || lead.userId !== sessionUser.id) {
    redirect(withToast("/", "save-error"));
  }

  const now = new Date().toISOString();
  const propertyInterest: PropertyInterest = {
    id: crypto.randomUUID(),
    leadId,
    address,
    listingTitle,
    source,
    listingUrl: getString(formData, "listingUrl"),
    rent,
    beds,
    baths,
    neighborhood: getString(formData, "neighborhood"),
    status,
    rating: getPropertyInterestRating(formData),
    clientFeedback: getString(formData, "clientFeedback"),
    pros: getString(formData, "pros"),
    cons: getString(formData, "cons"),
    agentNotes: getString(formData, "agentNotes"),
    showingDate,
    showingTime,
    createdAt: now,
    updatedAt: now
  };

  try {
    await prisma.propertyInterest.create({
      data: propertyInterest
    });
  } catch (error) {
    redirectSaveError(`/leads/${leadId}`, error);
  }

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

  const listingTitle = getString(formData, "listingTitle");
  const address = getString(formData, "address");
  const source = getSource(formData);
  const rent = getString(formData, "rent");
  const beds = getString(formData, "beds");
  const baths = getString(formData, "baths");
  const showingDate = getString(formData, "showingDate");
  const showingTime = getString(formData, "showingTime");
  const status = getNormalizedPropertyStatus(getPropertyInterestStatus(formData), showingDate, showingTime);

  if (
    getRequiredTextError(listingTitle) ||
    getRequiredTextError(address) ||
    getRequiredSelectError(source) ||
    getRequiredSelectError(status) ||
    getNumericError(rent) ||
    getNumericError(beds) ||
    getNumericError(baths) ||
    !isIsoDate(showingDate) ||
    !isTwentyFourHourTime(showingTime) ||
    hasScheduleMismatch(showingDate, showingTime) ||
    (status === "scheduled" && (!showingDate || !showingTime))
  ) {
    redirectValidation(`/leads/${leadId}/properties/${propertyInterestId}`);
  }

  let propertyInterest;

  try {
    propertyInterest = await prisma.propertyInterest.findUnique({
      where: { id: propertyInterestId },
      include: {
        lead: true
      }
    });
  } catch (error) {
    redirectSaveError(`/leads/${leadId}/properties/${propertyInterestId}`, error);
  }

  if (!propertyInterest || propertyInterest.leadId !== leadId || propertyInterest.lead.userId !== sessionUser.id) {
    redirect(withToast(`/leads/${leadId}`, "save-error"));
  }

  try {
    await prisma.propertyInterest.update({
      where: { id: propertyInterestId },
      data: {
        address,
        listingTitle,
        source,
        listingUrl: getString(formData, "listingUrl"),
        rent,
        beds,
        baths,
        neighborhood: getString(formData, "neighborhood"),
        status,
        rating: getPropertyInterestRating(formData),
        clientFeedback: getString(formData, "clientFeedback"),
        pros: getString(formData, "pros"),
        cons: getString(formData, "cons"),
        agentNotes: getString(formData, "agentNotes"),
        showingDate,
        showingTime,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    redirectSaveError(`/leads/${leadId}/properties/${propertyInterestId}`, error);
  }

  revalidatePath("/");
  revalidatePath(`/leads/${leadId}`);
  revalidatePath(`/leads/${leadId}/properties/${propertyInterestId}`);
  redirect(withToast(`/leads/${leadId}/properties/${propertyInterestId}`, "property-updated"));
}

export async function quickUpdatePropertyInterest(formData: FormData) {
  const sessionUser = await getSessionUser();
  const leadId = getString(formData, "leadId");
  const propertyInterestId = getString(formData, "propertyInterestId");
  const nextStatus = getPropertyInterestStatus(formData);
  const redirectTo = getString(formData, "redirectTo") || `/leads/${leadId}/properties/${propertyInterestId}`;

  if (!sessionUser) {
    redirect("/login");
  }

  if (!canUseDatabase()) {
    redirect(withToast(redirectTo, isPreviewReadonlyMode() ? "preview-readonly" : "database-unavailable"));
  }

  const showingDate = getString(formData, "showingDate");
  const showingTime = getString(formData, "showingTime");

  if (
    !isIsoDate(showingDate) ||
    !isTwentyFourHourTime(showingTime) ||
    hasScheduleMismatch(showingDate, showingTime)
  ) {
    redirectValidation(redirectTo);
  }

  let propertyInterest;

  try {
    propertyInterest = await prisma.propertyInterest.findUnique({
      where: { id: propertyInterestId },
      include: {
        lead: true
      }
    });
  } catch (error) {
    redirectSaveError(redirectTo, error);
  }

  if (!propertyInterest || propertyInterest.leadId !== leadId || propertyInterest.lead.userId !== sessionUser.id) {
    redirect(withToast(redirectTo, "save-error"));
  }

  const effectiveShowingDate = showingDate || propertyInterest.showingDate;
  const effectiveShowingTime = showingTime || propertyInterest.showingTime;

  if (nextStatus === "scheduled" && (!effectiveShowingDate || !effectiveShowingTime)) {
    redirectValidation(redirectTo);
  }

  const nextToastKey =
    nextStatus === "scheduled"
      ? "property-scheduled"
      : nextStatus === "rejected"
        ? "property-rejected"
        : nextStatus === "applying"
          ? "property-applying"
          : nextStatus === "toured"
            ? "property-toured"
            : "property-updated";

  try {
    await prisma.propertyInterest.update({
      where: { id: propertyInterestId },
      data: {
        status: nextStatus,
        showingDate: effectiveShowingDate,
        showingTime: effectiveShowingTime,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    redirectSaveError(redirectTo, error);
  }

  revalidatePath("/");
  revalidatePath(`/leads/${leadId}`);
  revalidatePath(`/leads/${leadId}/properties/${propertyInterestId}`);
  redirect(withToast(redirectTo, nextToastKey));
}

export async function markPropertyInterestToured(formData: FormData) {
  const leadId = getString(formData, "leadId");
  const propertyInterestId = getString(formData, "propertyInterestId");
  const forwardedFormData = new FormData();
  forwardedFormData.set("leadId", leadId);
  forwardedFormData.set("propertyInterestId", propertyInterestId);
  forwardedFormData.set("status", "toured");
  forwardedFormData.set("redirectTo", `/leads/${leadId}/properties/${propertyInterestId}`);

  if (formData.get("showingDate")) {
    forwardedFormData.set("showingDate", getString(formData, "showingDate"));
  }

  if (formData.get("showingTime")) {
    forwardedFormData.set("showingTime", getString(formData, "showingTime"));
  }

  return quickUpdatePropertyInterest(forwardedFormData);
}

export async function toggleRouteStopCompleted(formData: FormData) {
  const leadId = getString(formData, "leadId");
  const completed = getString(formData, "completed") === "true";
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/login");
  }

  if (!canUseDatabase()) {
    redirect(withToast("/routes", isPreviewReadonlyMode() ? "preview-readonly" : "database-unavailable"));
  }

  let result;

  try {
    result = await prisma.lead.updateMany({
      where: { id: leadId, userId: sessionUser.id },
      data: {
        routeCompleted: completed,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    redirectSaveError("/routes", error);
  }

  if (result.count === 0) {
    redirect(withToast("/routes", "save-error"));
  }

  revalidatePath("/");
  revalidatePath("/routes");
  redirect(withToast("/routes", completed ? "route-stop-completed" : "route-stop-reopened"));
}

export async function updateRouteStopNote(formData: FormData) {
  const leadId = getString(formData, "leadId");
  const routeNote = getString(formData, "routeNote").slice(0, 160);
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/login");
  }

  if (!canUseDatabase()) {
    redirect(withToast("/routes", isPreviewReadonlyMode() ? "preview-readonly" : "database-unavailable"));
  }

  let result;

  try {
    result = await prisma.lead.updateMany({
      where: { id: leadId, userId: sessionUser.id },
      data: {
        routeNote,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    redirectSaveError("/routes", error);
  }

  if (result.count === 0) {
    redirect(withToast("/routes", "save-error"));
  }

  revalidatePath("/routes");
  redirect(withToast("/routes", "route-note-saved"));
}

export async function moveRouteStop(formData: FormData) {
  const leadId = getString(formData, "leadId");
  const showingDate = getString(formData, "showingDate");
  const direction = getString(formData, "direction");
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/login");
  }

  if (!canUseDatabase()) {
    redirect(withToast("/routes", isPreviewReadonlyMode() ? "preview-readonly" : "database-unavailable"));
  }

  if (!showingDate || !["up", "down"].includes(direction)) {
    redirectValidation("/routes");
  }

  let dayStops;

  try {
    dayStops = await prisma.lead.findMany({
      where: {
        userId: sessionUser.id,
        showingDate
      },
      include: {
        propertyInterests: true
      }
    });
  } catch (error) {
    redirectSaveError("/routes", error);
  }

  const orderedStops = sortRouteStops(dayStops as unknown as LeadWithProperties[]);
  const currentIndex = orderedStops.findIndex((stop) => stop.id === leadId);
  const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (currentIndex < 0 || nextIndex < 0 || nextIndex >= orderedStops.length) {
    redirect(withToast("/routes", "route-order-updated"));
  }

  const reorderedStops = [...orderedStops];
  [reorderedStops[currentIndex], reorderedStops[nextIndex]] = [
    reorderedStops[nextIndex],
    reorderedStops[currentIndex]
  ];

  try {
    await prisma.$transaction(
      reorderedStops.map((stop, index) =>
        prisma.lead.update({
          where: { id: stop.id },
          data: {
            routeStopOrder: index + 1,
            updatedAt: new Date().toISOString()
          }
        })
      )
    );
  } catch (error) {
    redirectSaveError("/routes", error);
  }

  revalidatePath("/routes");
  redirect(withToast("/routes", "route-order-updated"));
}

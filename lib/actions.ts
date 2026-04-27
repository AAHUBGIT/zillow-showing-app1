"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearSessionCookie, getDemoUser, getSessionUser, isValidLogin, setSessionCookie } from "./auth";
import {
  fieldMaxLengths,
  getEmailError,
  getMaxLengthError,
  getNumericError,
  getPhoneError,
  getRequiredSelectError,
  getRequiredTextError,
  isIsoDate,
  isPastIsoDate,
  isTwentyFourHourTime
} from "./form-validation";
import { communicationChannelOptions, communicationDirectionOptions } from "./communication";
import { canUseDatabase, isPreviewReadonlyMode } from "./deployment";
import { leadPriorityOptions, leadSourceOptions, leadStatusOptions } from "./lead-utils";
import { getPrismaClient } from "./prisma";
import { propertyInterestStatusOptions } from "./property-interest-utils";
import { isRouteReadyLead, sortRouteStops } from "./route-planner";
import {
  Lead,
  LeadPriority,
  LeadSource,
  LeadStatus,
  LeadWithProperties,
  CommunicationChannel,
  CommunicationDirection,
  PropertyInterest,
  PropertyInterestStatus
} from "./types";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getBoolean(formData: FormData, key: string) {
  return getString(formData, key) === "true";
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

function getCommunicationChannel(formData: FormData) {
  const value = getString(formData, "channel") as CommunicationChannel;
  return communicationChannelOptions.includes(value) ? value : "text";
}

function getCommunicationDirection(formData: FormData) {
  const value = getString(formData, "direction") as CommunicationDirection;
  return communicationDirectionOptions.includes(value) ? value : "outbound";
}

function getPropertyInterestRating(formData: FormData) {
  const value = Number(getString(formData, "rating"));

  if (Number.isNaN(value)) {
    return 3;
  }

  return Math.max(1, Math.min(5, value));
}

function hasScheduleMismatch(showingDate: string, showingTime: string) {
  return (showingDate && !showingTime) || (showingTime && !showingDate);
}

function hasBlockedPastShowingDate(showingDate: string, allowPastOverride: boolean) {
  return Boolean(showingDate) && isPastIsoDate(showingDate) && !allowPastOverride;
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

type LeadRouteFields = Pick<
  Lead,
  "propertyAddress" | "showingDate" | "showingTime" | "routeCompleted" | "routeStopOrder"
> & { status: string };

function getRouteResetData(
  lead: LeadRouteFields,
  nextRoute: Pick<LeadRouteFields, "propertyAddress" | "showingDate" | "showingTime">
) {
  const routeChanged =
    lead.propertyAddress !== nextRoute.propertyAddress ||
    lead.showingDate !== nextRoute.showingDate ||
    lead.showingTime !== nextRoute.showingTime;

  return routeChanged
    ? {
        routeCompleted: false,
        routeStopOrder: 0
      }
    : {};
}

function getScheduledLeadRouteData({
  lead,
  propertyAddress,
  showingDate,
  showingTime,
  updatedAt
}: {
  lead: LeadRouteFields;
  propertyAddress: string;
  showingDate: string;
  showingTime: string;
  updatedAt: string;
}) {
  return {
    propertyAddress,
    showingDate,
    showingTime,
    status: lead.status === "new" ? "scheduled" : lead.status,
    ...getRouteResetData(lead, { propertyAddress, showingDate, showingTime }),
    updatedAt
  };
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

  const prisma = getPrismaClient();

  const now = new Date().toISOString();
  const showingDate = getString(formData, "showingDate");
  const showingTime = getString(formData, "showingTime");
  const allowPastShowingDate = getBoolean(formData, "showingDateAllowPastOverride");
  const fullName = getString(formData, "fullName");
  const phone = getString(formData, "phone");
  const email = getString(formData, "email");
  const propertyAddress = getString(formData, "propertyAddress");
  const desiredMoveInDate = getString(formData, "desiredMoveInDate");
  const nextFollowUpDate = getString(formData, "nextFollowUpDate");
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
    !isIsoDate(nextFollowUpDate) ||
    !isIsoDate(showingDate) ||
    !isTwentyFourHourTime(showingTime) ||
    hasScheduleMismatch(showingDate, showingTime) ||
    hasBlockedPastShowingDate(showingDate, allowPastShowingDate)
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
    nextFollowUpDate,
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

  const prisma = getPrismaClient();

  const showingDate = getString(formData, "showingDate");
  const showingTime = getString(formData, "showingTime");
  const allowPastShowingDate = getBoolean(formData, "showingDateAllowPastOverride");
  const nextStatus = getStatus(formData);
  const priority = getPriority(formData);
  const source = getSource(formData);
  const nextFollowUpDate = getString(formData, "nextFollowUpDate");

  if (
    getRequiredSelectError(nextStatus) ||
    getRequiredSelectError(priority) ||
    getRequiredSelectError(source) ||
    !isIsoDate(nextFollowUpDate) ||
    !isIsoDate(showingDate) ||
    !isTwentyFourHourTime(showingTime) ||
    hasScheduleMismatch(showingDate, showingTime) ||
    hasBlockedPastShowingDate(showingDate, allowPastShowingDate)
  ) {
    redirectValidation(`/leads/${id}`);
  }

  let existingLead;

  try {
    existingLead = await prisma.lead.findUnique({
      where: { id }
    });
  } catch (error) {
    redirectSaveError(`/leads/${id}`, error);
  }

  if (!existingLead || existingLead.userId !== sessionUser.id) {
    redirect(withToast(`/leads/${id}`, "save-error"));
  }

  try {
    await prisma.lead.update({
      where: { id },
      data: {
        status: showingDate && showingTime && nextStatus === "new" ? "scheduled" : nextStatus,
        priority,
        source,
        nextFollowUpDate,
        showingDate,
        showingTime,
        ...getRouteResetData(existingLead, {
          propertyAddress: existingLead.propertyAddress,
          showingDate,
          showingTime
        }),
        agentNotes: getString(formData, "agentNotes"),
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    redirectSaveError(`/leads/${id}`, error);
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

  const prisma = getPrismaClient();

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

export async function createCommunicationActivity(formData: FormData) {
  const leadId = getString(formData, "leadId");
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/login");
  }

  if (!canUseDatabase()) {
    redirect(
      withToast(`/leads/${leadId}`, isPreviewReadonlyMode() ? "preview-readonly" : "database-unavailable")
    );
  }

  const prisma = getPrismaClient();
  const channel = getCommunicationChannel(formData);
  const direction = getCommunicationDirection(formData);
  const templateId = getString(formData, "templateId").slice(0, 120);
  const subject = getString(formData, "subject");
  const body = getString(formData, "body");
  const outcome = getString(formData, "outcome");

  if (
    !leadId ||
    getRequiredSelectError(channel) ||
    getRequiredSelectError(direction) ||
    getRequiredTextError(body) ||
    getMaxLengthError(subject, fieldMaxLengths.communicationSubject) ||
    getMaxLengthError(body, fieldMaxLengths.communicationBody) ||
    getMaxLengthError(outcome, fieldMaxLengths.communicationOutcome)
  ) {
    redirectValidation(`/leads/${leadId}`);
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
    redirect(withToast(`/leads/${leadId}`, "save-error"));
  }

  const now = new Date().toISOString();
  const nextStatus = lead.status === "new" && channel !== "note" ? "contacted" : lead.status;

  try {
    await prisma.$transaction([
      prisma.$executeRaw`
        INSERT INTO "CommunicationActivity" (
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
        )
        VALUES (
          ${crypto.randomUUID()},
          ${leadId},
          ${sessionUser.id},
          ${templateId},
          ${channel},
          ${direction},
          ${subject},
          ${body},
          ${outcome},
          ${now},
          ${now}
        )
      `,
      prisma.lead.update({
        where: { id: leadId },
        data: {
          status: nextStatus,
          updatedAt: now
        }
      })
    ]);
  } catch (error) {
    redirectSaveError(`/leads/${leadId}`, error);
  }

  revalidatePath("/");
  revalidatePath("/today");
  revalidatePath(`/leads/${leadId}`);
  redirect(withToast(`/leads/${leadId}`, "communication-logged"));
}

export async function createCommunicationTemplate(formData: FormData) {
  const leadId = getString(formData, "leadId");
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/login");
  }

  if (!canUseDatabase()) {
    redirect(
      withToast(`/leads/${leadId}`, isPreviewReadonlyMode() ? "preview-readonly" : "database-unavailable")
    );
  }

  const prisma = getPrismaClient();
  const channel = getCommunicationChannel(formData);
  const name = getString(formData, "templateName");
  const subject = getString(formData, "subject");
  const body = getString(formData, "body");

  if (
    !leadId ||
    getRequiredTextError(name) ||
    getRequiredSelectError(channel) ||
    getRequiredTextError(body) ||
    getMaxLengthError(name, fieldMaxLengths.communicationTemplateName) ||
    getMaxLengthError(subject, fieldMaxLengths.communicationSubject) ||
    getMaxLengthError(body, fieldMaxLengths.communicationBody)
  ) {
    redirectValidation(`/leads/${leadId}`);
  }

  const now = new Date().toISOString();

  try {
    await prisma.$executeRaw`
      INSERT INTO "CommunicationTemplate" (
        "id",
        "userId",
        "name",
        "channel",
        "subject",
        "body",
        "sortOrder",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${crypto.randomUUID()},
        ${sessionUser.id},
        ${name},
        ${channel},
        ${subject},
        ${body},
        ${1000},
        ${now},
        ${now}
      )
    `;
  } catch (error) {
    redirectSaveError(`/leads/${leadId}`, error);
  }

  revalidatePath(`/leads/${leadId}`);
  redirect(withToast(`/leads/${leadId}`, "template-saved"));
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

  const prisma = getPrismaClient();

  const listingTitle = getString(formData, "listingTitle");
  const address = getString(formData, "address");
  const source = getSource(formData);
  const rent = getString(formData, "rent");
  const beds = getString(formData, "beds");
  const baths = getString(formData, "baths");
  const showingDate = getString(formData, "showingDate");
  const showingTime = getString(formData, "showingTime");
  const allowPastShowingDate = getBoolean(formData, "showingDateAllowPastOverride");
  const status = getNormalizedPropertyStatus(getPropertyInterestStatus(formData), showingDate, showingTime);

  if (
    getRequiredTextError(listingTitle) ||
    getRequiredTextError(address) ||
    getRequiredSelectError(source) ||
    getRequiredSelectError(status) ||
    getNumericError(rent) ||
    getNumericError(beds, false) ||
    getNumericError(baths) ||
    !isIsoDate(showingDate) ||
    !isTwentyFourHourTime(showingTime) ||
    hasScheduleMismatch(showingDate, showingTime) ||
    hasBlockedPastShowingDate(showingDate, allowPastShowingDate) ||
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
    await prisma.$transaction([
      prisma.propertyInterest.create({
        data: propertyInterest
      }),
      ...(status === "scheduled" && showingDate && showingTime
        ? [
            prisma.lead.update({
              where: { id: lead.id },
              data: getScheduledLeadRouteData({
                lead,
                propertyAddress: address,
                showingDate,
                showingTime,
                updatedAt: now
              })
            })
          ]
        : [])
    ]);
  } catch (error) {
    redirectSaveError(`/leads/${leadId}`, error);
  }

  revalidatePath("/");
  revalidatePath("/routes");
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

  const prisma = getPrismaClient();

  const listingTitle = getString(formData, "listingTitle");
  const address = getString(formData, "address");
  const source = getSource(formData);
  const rent = getString(formData, "rent");
  const beds = getString(formData, "beds");
  const baths = getString(formData, "baths");
  const showingDate = getString(formData, "showingDate");
  const showingTime = getString(formData, "showingTime");
  const allowPastShowingDate = getBoolean(formData, "showingDateAllowPastOverride");
  const status = getNormalizedPropertyStatus(getPropertyInterestStatus(formData), showingDate, showingTime);

  if (
    getRequiredTextError(listingTitle) ||
    getRequiredTextError(address) ||
    getRequiredSelectError(source) ||
    getRequiredSelectError(status) ||
    getNumericError(rent) ||
    getNumericError(beds, false) ||
    getNumericError(baths) ||
    !isIsoDate(showingDate) ||
    !isTwentyFourHourTime(showingTime) ||
    hasScheduleMismatch(showingDate, showingTime) ||
    hasBlockedPastShowingDate(showingDate, allowPastShowingDate) ||
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

  const updatedAt = new Date().toISOString();

  try {
    await prisma.$transaction([
      prisma.propertyInterest.update({
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
          updatedAt
        }
      }),
      ...(status === "scheduled" && showingDate && showingTime
        ? [
            prisma.lead.update({
              where: { id: leadId },
              data: getScheduledLeadRouteData({
                lead: propertyInterest.lead,
                propertyAddress: address,
                showingDate,
                showingTime,
                updatedAt
              })
            })
          ]
        : [])
    ]);
  } catch (error) {
    redirectSaveError(`/leads/${leadId}/properties/${propertyInterestId}`, error);
  }

  revalidatePath("/");
  revalidatePath("/routes");
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

  const prisma = getPrismaClient();

  const showingDate = getString(formData, "showingDate");
  const showingTime = getString(formData, "showingTime");
  const allowPastShowingDate = getBoolean(formData, "showingDateAllowPastOverride");

  if (
    !isIsoDate(showingDate) ||
    !isTwentyFourHourTime(showingTime) ||
    hasScheduleMismatch(showingDate, showingTime) ||
    hasBlockedPastShowingDate(showingDate, allowPastShowingDate)
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

  const updatedAt = new Date().toISOString();

  try {
    await prisma.$transaction([
      prisma.propertyInterest.update({
        where: { id: propertyInterestId },
        data: {
          status: nextStatus,
          showingDate: effectiveShowingDate,
          showingTime: effectiveShowingTime,
          updatedAt
        }
      }),
      ...(nextStatus === "scheduled" && effectiveShowingDate && effectiveShowingTime
        ? [
            prisma.lead.update({
              where: { id: leadId },
              data: getScheduledLeadRouteData({
                lead: propertyInterest.lead,
                propertyAddress: propertyInterest.address,
                showingDate: effectiveShowingDate,
                showingTime: effectiveShowingTime,
                updatedAt
              })
            })
          ]
        : [])
    ]);
  } catch (error) {
    redirectSaveError(redirectTo, error);
  }

  revalidatePath("/");
  revalidatePath("/routes");
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

  const prisma = getPrismaClient();

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

  const prisma = getPrismaClient();

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

  const prisma = getPrismaClient();

  if (!showingDate || !["up", "down"].includes(direction)) {
    redirectValidation("/routes");
  }

  let dayStops;

  try {
    dayStops = await prisma.lead.findMany({
      where: {
        userId: sessionUser.id,
        showingDate,
        showingTime: { not: "" },
        propertyAddress: { not: "" }
      },
      include: {
        propertyInterests: true
      }
    });
  } catch (error) {
    redirectSaveError("/routes", error);
  }

  const orderedStops = sortRouteStops((dayStops as unknown as LeadWithProperties[]).filter(isRouteReadyLead));
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

export async function toggleRouteStopCompletedInline({
  leadId,
  completed
}: {
  leadId: string;
  completed: boolean;
}) {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/login");
  }

  if (!canUseDatabase()) {
    return {
      success: false,
      toastKey: isPreviewReadonlyMode() ? "preview-readonly" : "database-unavailable"
    } as const;
  }

  const prisma = getPrismaClient();

  try {
    const result = await prisma.lead.updateMany({
      where: { id: leadId, userId: sessionUser.id },
      data: {
        routeCompleted: completed,
        updatedAt: new Date().toISOString()
      }
    });

    if (result.count === 0) {
      return { success: false, toastKey: "save-error" } as const;
    }
  } catch (error) {
    console.error(error);
    return { success: false, toastKey: "save-error" } as const;
  }

  revalidatePath("/");
  revalidatePath("/routes");

  return {
    success: true,
    toastKey: completed ? "route-stop-completed" : "route-stop-reopened"
  } as const;
}

export async function updateRouteStopNoteInline({
  leadId,
  routeNote
}: {
  leadId: string;
  routeNote: string;
}) {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/login");
  }

  if (!canUseDatabase()) {
    return {
      success: false,
      toastKey: isPreviewReadonlyMode() ? "preview-readonly" : "database-unavailable"
    } as const;
  }

  const prisma = getPrismaClient();
  const nextRouteNote = routeNote.trim().slice(0, 160);

  try {
    const result = await prisma.lead.updateMany({
      where: { id: leadId, userId: sessionUser.id },
      data: {
        routeNote: nextRouteNote,
        updatedAt: new Date().toISOString()
      }
    });

    if (result.count === 0) {
      return { success: false, toastKey: "save-error" } as const;
    }
  } catch (error) {
    console.error(error);
    return { success: false, toastKey: "save-error" } as const;
  }

  revalidatePath("/routes");

  return {
    success: true,
    toastKey: "route-note-saved",
    routeNote: nextRouteNote
  } as const;
}

export async function moveRouteStopInline({
  leadId,
  showingDate,
  direction
}: {
  leadId: string;
  showingDate: string;
  direction: "up" | "down";
}) {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/login");
  }

  if (!canUseDatabase()) {
    return {
      success: false,
      toastKey: isPreviewReadonlyMode() ? "preview-readonly" : "database-unavailable"
    } as const;
  }

  if (!showingDate || !["up", "down"].includes(direction)) {
    return { success: false, toastKey: "save-error" } as const;
  }

  const prisma = getPrismaClient();
  let dayStops;

  try {
    dayStops = await prisma.lead.findMany({
      where: {
        userId: sessionUser.id,
        showingDate,
        showingTime: { not: "" },
        propertyAddress: { not: "" }
      },
      include: {
        propertyInterests: true
      }
    });
  } catch (error) {
    console.error(error);
    return { success: false, toastKey: "save-error" } as const;
  }

  const orderedStops = sortRouteStops((dayStops as unknown as LeadWithProperties[]).filter(isRouteReadyLead));
  const currentIndex = orderedStops.findIndex((stop) => stop.id === leadId);
  const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (currentIndex < 0 || nextIndex < 0 || nextIndex >= orderedStops.length) {
    return { success: false, toastKey: "save-error" } as const;
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
    console.error(error);
    return { success: false, toastKey: "save-error" } as const;
  }

  revalidatePath("/routes");

  return { success: true, toastKey: "route-order-updated" } as const;
}

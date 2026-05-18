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
import { isMoveInUrgencyOption, type ClientPreferenceFields } from "./client-preferences";
import { communicationChannelOptions, communicationDirectionOptions } from "./communication";
import { canUseDatabase, isPreviewReadonlyMode } from "./deployment";
import { leadPriorityOptions, leadSourceOptions, leadStatusOptions } from "./lead-utils";
import { getPrismaClient } from "./prisma";
import {
  findDuplicatePropertyListing,
  normalizePropertyListingStatus,
  propertyListingStatusOptions
} from "./property-listing-utils";
import { getPropertyListingByIdForUser, getPropertyListingsForUser } from "./property-listings";
import { propertyInterestStatusOptions } from "./property-interest-utils";
import { isRouteReadyLead, sortRouteStops } from "./route-planner";
import {
  getPropertyStatusForShowingOutcome,
  getShowingOutcomeLabel,
  normalizeShowingOutcome,
  normalizeShowingStatus,
  showingStatusOptions
} from "./showing-lifecycle";
import {
  Lead,
  LeadPriority,
  LeadSource,
  LeadStatus,
  LeadWithProperties,
  CommunicationActivity,
  CommunicationChannel,
  CommunicationDirection,
  PropertyInterest,
  PropertyListing,
  PropertyListingStatus,
  PropertyInterestStatus,
  ShowingOutcome,
  ShowingStatus
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

function getSafePropertyListingRedirect(formData: FormData, fallback = "/properties") {
  const redirectTo = getString(formData, "redirectTo");

  if (redirectTo === "/properties" || /^\/properties\/[A-Za-z0-9_-]+$/.test(redirectTo)) {
    return redirectTo;
  }

  return fallback;
}

function getPriority(formData: FormData) {
  const value = getString(formData, "priority") as LeadPriority;
  return leadPriorityOptions.includes(value) ? value : "medium";
}

function getStatus(formData: FormData) {
  const value = getString(formData, "status") as LeadStatus;
  return leadStatusOptions.includes(value) ? value : "new";
}

function normalizeLeadSource(value: string): LeadSource {
  return leadSourceOptions.includes(value as LeadSource) ? (value as LeadSource) : "other";
}

function getSource(formData: FormData) {
  return normalizeLeadSource(getString(formData, "source"));
}

function getPropertyListingStatus(formData: FormData): PropertyListingStatus {
  return normalizePropertyListingStatus(getString(formData, "status"));
}

function getShowingStatus(formData: FormData): ShowingStatus {
  const value = normalizeShowingStatus(getString(formData, "showingStatus"));
  return value || "scheduled";
}

function getClientPreferenceFields(formData: FormData): ClientPreferenceFields {
  const moveInUrgency = getString(formData, "moveInUrgency");

  return {
    budgetMin: getString(formData, "budgetMin"),
    budgetMax: getString(formData, "budgetMax"),
    bedrooms: getString(formData, "bedrooms"),
    bathrooms: getString(formData, "bathrooms"),
    preferredNeighborhoods: getString(formData, "preferredNeighborhoods"),
    moveInUrgency: isMoveInUrgencyOption(moveInUrgency) ? moveInUrgency : "",
    mustHaves: getString(formData, "mustHaves"),
    dealBreakers: getString(formData, "dealBreakers"),
    pets: getString(formData, "pets"),
    incomeQualified: getBoolean(formData, "incomeQualified"),
    creditConcern: getBoolean(formData, "creditConcern"),
    hasGuarantor: getBoolean(formData, "hasGuarantor"),
    applicationReady: getBoolean(formData, "applicationReady"),
    preScreeningNotes: getString(formData, "preScreeningNotes")
  };
}

function getClientPreferenceError(input: ClientPreferenceFields) {
  return (
    getNumericError(input.budgetMin) ||
    getNumericError(input.budgetMax) ||
    getNumericError(input.bedrooms, false) ||
    getNumericError(input.bathrooms) ||
    getMaxLengthError(input.budgetMin, fieldMaxLengths.budget) ||
    getMaxLengthError(input.budgetMax, fieldMaxLengths.budget) ||
    getMaxLengthError(input.bedrooms, fieldMaxLengths.bedrooms) ||
    getMaxLengthError(input.bathrooms, fieldMaxLengths.bathrooms) ||
    getMaxLengthError(input.preferredNeighborhoods, fieldMaxLengths.preferredNeighborhoods) ||
    getMaxLengthError(input.moveInUrgency, fieldMaxLengths.moveInUrgency) ||
    getMaxLengthError(input.mustHaves, fieldMaxLengths.mustHaves) ||
    getMaxLengthError(input.dealBreakers, fieldMaxLengths.dealBreakers) ||
    getMaxLengthError(input.pets, fieldMaxLengths.pets) ||
    getMaxLengthError(input.preScreeningNotes, fieldMaxLengths.preScreeningNotes)
  );
}

function getPropertyInterestStatus(formData: FormData) {
  const value = getString(formData, "status") as PropertyInterestStatus;
  return propertyInterestStatusOptions.includes(value) ? value : "interested";
}

function normalizeCommunicationChannel(value: string) {
  const nextValue = value as CommunicationChannel;
  return communicationChannelOptions.includes(nextValue) ? nextValue : "text";
}

function normalizeCommunicationDirection(value: string) {
  const nextValue = value as CommunicationDirection;
  return communicationDirectionOptions.includes(nextValue) ? nextValue : "outbound";
}

function getCommunicationChannel(formData: FormData) {
  return normalizeCommunicationChannel(getString(formData, "channel"));
}

function getCommunicationDirection(formData: FormData) {
  return normalizeCommunicationDirection(getString(formData, "direction"));
}

type CommunicationActivityInput = {
  leadId: string;
  channel: CommunicationChannel;
  direction: CommunicationDirection;
  templateId?: string;
  subject?: string;
  body: string;
  outcome?: string;
};

function getCommunicationActivityError(input: CommunicationActivityInput) {
  return (
    (!input.leadId ? "Lead is required." : "") ||
    getRequiredSelectError(input.channel) ||
    getRequiredSelectError(input.direction) ||
    getRequiredTextError(input.body) ||
    getMaxLengthError(input.subject || "", fieldMaxLengths.communicationSubject) ||
    getMaxLengthError(input.body, fieldMaxLengths.communicationBody) ||
    getMaxLengthError(input.outcome || "", fieldMaxLengths.communicationOutcome)
  );
}

function buildCommunicationActivityFromForm(formData: FormData): CommunicationActivityInput {
  return {
    leadId: getString(formData, "leadId"),
    channel: getCommunicationChannel(formData),
    direction: getCommunicationDirection(formData),
    templateId: getString(formData, "templateId").slice(0, 120),
    subject: getString(formData, "subject"),
    body: getString(formData, "body"),
    outcome: getString(formData, "outcome")
  };
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

async function saveCommunicationActivity(input: CommunicationActivityInput, userId: string) {
  const prisma = getPrismaClient();
  const now = new Date().toISOString();
  const activity: CommunicationActivity = {
    id: crypto.randomUUID(),
    leadId: input.leadId,
    userId,
    templateId: input.templateId || "",
    channel: input.channel,
    direction: input.direction,
    subject: input.subject || "",
    body: input.body,
    outcome: input.outcome || "",
    occurredAt: now,
    createdAt: now
  };

  const lead = await prisma.lead.findUnique({
    where: { id: input.leadId }
  });

  if (!lead || lead.userId !== userId) {
    return null;
  }

  const nextStatus = lead.status === "new" && input.channel !== "note" ? "contacted" : lead.status;

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
        ${activity.id},
        ${activity.leadId},
        ${activity.userId},
        ${activity.templateId},
        ${activity.channel},
        ${activity.direction},
        ${activity.subject},
        ${activity.body},
        ${activity.outcome},
        ${activity.occurredAt},
        ${activity.createdAt}
      )
    `,
    prisma.lead.update({
      where: { id: input.leadId },
      data: {
        status: nextStatus,
        updatedAt: now
      }
    })
  ]);

  revalidatePath("/");
  revalidatePath("/today");
  revalidatePath(`/leads/${input.leadId}`);

  return activity;
}

function buildCommunicationActivityWrite(
  input: CommunicationActivityInput,
  userId: string,
  occurredAt: string
) {
  const prisma = getPrismaClient();

  return prisma.$executeRaw`
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
      ${input.leadId},
      ${userId},
      ${input.templateId || ""},
      ${input.channel},
      ${input.direction},
      ${input.subject || ""},
      ${input.body},
      ${input.outcome || ""},
      ${occurredAt},
      ${occurredAt}
    )
  `;
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
    showingStatus:
      lead.showingDate && lead.showingTime && (lead.showingDate !== showingDate || lead.showingTime !== showingTime)
        ? "rescheduled"
        : "scheduled",
    showingOutcome: "",
    showingOutcomeNotes: "",
    showingCompletedAt: "",
    showingCanceledReason: "",
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
  const propertyListingId = getString(formData, "propertyListingId");
  const fullName = getString(formData, "fullName");
  const phone = getString(formData, "phone");
  const email = getString(formData, "email");
  const enteredPropertyAddress = getString(formData, "propertyAddress");
  const desiredMoveInDate = getString(formData, "desiredMoveInDate");
  const nextFollowUpDate = getString(formData, "nextFollowUpDate");
  const status = getStatus(formData);
  const priority = getPriority(formData);
  const source = getSource(formData);
  const clientPreferences = getClientPreferenceFields(formData);
  const selectedPropertyListing = propertyListingId
    ? await getPropertyListingByIdForUser(sessionUser.id, propertyListingId)
    : null;
  const propertyAddress = selectedPropertyListing?.address || enteredPropertyAddress;

  if (propertyListingId && !selectedPropertyListing) {
    redirectValidation("/leads/new");
  }

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
    hasBlockedPastShowingDate(showingDate, allowPastShowingDate) ||
    getClientPreferenceError(clientPreferences)
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
    ...clientPreferences,
    status,
    priority,
    source,
    nextFollowUpDate,
    showingDate,
    showingTime,
    showingStatus: showingDate && showingTime ? "scheduled" : "",
    showingOutcome: "",
    showingOutcomeNotes: "",
    showingCompletedAt: "",
    showingCanceledReason: "",
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

  const selectedPropertyInterest = selectedPropertyListing
    ? {
        id: crypto.randomUUID(),
        leadId: lead.id,
        address: selectedPropertyListing.address,
        listingTitle: selectedPropertyListing.title,
        source: normalizeLeadSource(selectedPropertyListing.source),
        listingUrl: selectedPropertyListing.listingUrl,
        rent: selectedPropertyListing.price,
        beds: selectedPropertyListing.beds,
        baths: selectedPropertyListing.baths,
        neighborhood: selectedPropertyListing.neighborhood,
        status: showingDate && showingTime ? "scheduled" : "interested",
        rating: 3,
        clientFeedback: "",
        pros: "",
        cons: "",
        agentNotes: selectedPropertyListing.notes || lead.agentNotes,
        showingDate,
        showingTime,
        createdAt: now,
        updatedAt: now
      }
    : null;

  try {
    await prisma.$transaction([
      prisma.lead.create({
        data: lead
      }),
      ...(selectedPropertyInterest
        ? [
            prisma.propertyInterest.create({
              data: selectedPropertyInterest as PropertyInterest
            })
          ]
        : [])
    ]);
  } catch (error) {
    redirectSaveError("/leads/new", error);
  }

  revalidatePath("/");
  revalidatePath("/today");
  revalidatePath("/routes");
  revalidatePath("/properties");
  redirect(withToast("/", "lead-created"));
}

export async function createImportedLead(formData: FormData) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect("/login");
  }

  if (!canUseDatabase()) {
    redirect(
      withToast("/import", isPreviewReadonlyMode() ? "preview-readonly" : "database-unavailable")
    );
  }

  const prisma = getPrismaClient();
  const now = new Date().toISOString();
  const fullName = getString(formData, "fullName");
  const phone = getString(formData, "phone");
  const email = getString(formData, "email");
  const propertyAddress = getString(formData, "propertyAddress");
  const desiredMoveInDate = getString(formData, "desiredMoveInDate");
  const source = getSource(formData);
  const message = getString(formData, "message");
  const rawText = getString(formData, "rawText");

  if (
    getRequiredTextError(fullName) ||
    getPhoneError(phone) ||
    getEmailError(email) ||
    getRequiredSelectError(source) ||
    getMaxLengthError(propertyAddress, fieldMaxLengths.propertyAddress) ||
    getMaxLengthError(message, fieldMaxLengths.notes) ||
    !isIsoDate(desiredMoveInDate)
  ) {
    redirectValidation("/import");
  }

  const leadId = crypto.randomUUID();
  const importedNotes = message || rawText;
  const agentNotes = rawText
    ? `Imported inquiry:\n${rawText}`.slice(0, fieldMaxLengths.agentNotes)
    : importedNotes.slice(0, fieldMaxLengths.agentNotes);
  const lead: Lead = {
    id: leadId,
    userId: sessionUser.id,
    fullName,
    phone,
    email,
    propertyAddress,
    desiredMoveInDate,
    notes: importedNotes.slice(0, fieldMaxLengths.notes),
    budgetMin: "",
    budgetMax: "",
    bedrooms: "",
    bathrooms: "",
    preferredNeighborhoods: "",
    moveInUrgency: "",
    mustHaves: "",
    dealBreakers: "",
    pets: "",
    incomeQualified: false,
    creditConcern: false,
    hasGuarantor: false,
    applicationReady: false,
    preScreeningNotes: "",
    status: "new",
    priority: "medium",
    source,
    nextFollowUpDate: "",
    showingDate: "",
    showingTime: "",
    showingStatus: "",
    showingOutcome: "",
    showingOutcomeNotes: "",
    showingCompletedAt: "",
    showingCanceledReason: "",
    routeStopOrder: 0,
    routeCompleted: false,
    routeNote: "",
    agentNotes,
    createdAt: now,
    updatedAt: now
  };

  const propertyInterest: PropertyInterest | null = propertyAddress
    ? {
        id: crypto.randomUUID(),
        leadId,
        address: propertyAddress,
        listingTitle: propertyAddress,
        source,
        listingUrl: "",
        rent: "",
        beds: "",
        baths: "",
        neighborhood: "",
        status: "interested",
        rating: 3,
        clientFeedback: "",
        pros: "",
        cons: "",
        agentNotes,
        showingDate: "",
        showingTime: "",
        createdAt: now,
        updatedAt: now
      }
    : null;

  try {
    await prisma.$transaction([
      prisma.lead.create({ data: lead }),
      ...(propertyInterest ? [prisma.propertyInterest.create({ data: propertyInterest })] : [])
    ]);
  } catch (error) {
    redirectSaveError("/import", error);
  }

  revalidatePath("/");
  revalidatePath("/today");
  revalidatePath("/routes");
  revalidatePath(`/leads/${leadId}`);
  redirect(withToast(`/leads/${leadId}`, "lead-imported"));
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
  const showingLocationType = getString(formData, "showingLocationType");
  const propertyInterestId = getString(formData, "propertyInterestId");
  const propertyListingId = getString(formData, "propertyListingId");
  const attachShowingLocationToLead = getBoolean(formData, "attachShowingLocationToLead");
  const manualShowingTitle = getString(formData, "manualShowingTitle");
  const manualShowingAddress = getString(formData, "manualShowingAddress");
  const manualShowingSource = normalizeLeadSource(getString(formData, "manualShowingSource"));
  const manualShowingUrl = getString(formData, "manualShowingUrl");
  const manualShowingPrice = getString(formData, "manualShowingPrice");
  const manualShowingBeds = getString(formData, "manualShowingBeds");
  const manualShowingBaths = getString(formData, "manualShowingBaths");
  const manualShowingNeighborhood = getString(formData, "manualShowingNeighborhood");
  const manualShowingNotes = getString(formData, "manualShowingNotes");

  if (
    getRequiredSelectError(nextStatus) ||
    getRequiredSelectError(priority) ||
    getRequiredSelectError(source) ||
    !isIsoDate(nextFollowUpDate) ||
    !isIsoDate(showingDate) ||
    !isTwentyFourHourTime(showingTime) ||
    hasScheduleMismatch(showingDate, showingTime) ||
    hasBlockedPastShowingDate(showingDate, allowPastShowingDate) ||
    getMaxLengthError(manualShowingTitle, fieldMaxLengths.listingTitle) ||
    getMaxLengthError(manualShowingAddress, fieldMaxLengths.address) ||
    getMaxLengthError(manualShowingUrl, fieldMaxLengths.listingUrl) ||
    getNumericError(manualShowingPrice) ||
    getNumericError(manualShowingBeds, false) ||
    getNumericError(manualShowingBaths) ||
    getMaxLengthError(manualShowingNeighborhood, fieldMaxLengths.neighborhood) ||
    getMaxLengthError(manualShowingNotes, fieldMaxLengths.agentNotes)
  ) {
    redirectValidation(`/leads/${id}`);
  }

  let existingLead;

  try {
    existingLead = await prisma.lead.findUnique({
      where: { id },
      include: {
        propertyInterests: true
      }
    });
  } catch (error) {
    redirectSaveError(`/leads/${id}`, error);
  }

  if (!existingLead || existingLead.userId !== sessionUser.id) {
    redirect(withToast(`/leads/${id}`, "save-error"));
  }

  const propertyInterests = ((existingLead as unknown as LeadWithProperties).propertyInterests || []) as PropertyInterest[];
  let showingLocationAddress = existingLead.propertyAddress;
  let selectedPropertyInterest: PropertyInterest | null = null;
  let selectedPropertyListing: PropertyListing | null = null;
  let manualPropertyDraft: PropertyInterest | null = null;

  if (showingLocationType === "propertyInterest") {
    selectedPropertyInterest =
      propertyInterests.find((propertyInterest) => propertyInterest.id === propertyInterestId) || null;
    showingLocationAddress = selectedPropertyInterest?.address || "";
  } else if (showingLocationType === "propertyListing") {
    selectedPropertyListing = propertyListingId
      ? await getPropertyListingByIdForUser(sessionUser.id, propertyListingId)
      : null;
    showingLocationAddress = selectedPropertyListing?.address || "";
  } else if (showingLocationType === "manualAddress") {
    showingLocationAddress = manualShowingAddress;
    manualPropertyDraft = {
      id: crypto.randomUUID(),
      leadId: existingLead.id,
      address: manualShowingAddress,
      listingTitle: manualShowingTitle || manualShowingAddress,
      source: manualShowingSource,
      listingUrl: manualShowingUrl,
      rent: manualShowingPrice,
      beds: manualShowingBeds,
      baths: manualShowingBaths,
      neighborhood: manualShowingNeighborhood,
      status: showingDate && showingTime ? "scheduled" : "interested",
      rating: 3,
      clientFeedback: "",
      pros: "",
      cons: "",
      agentNotes: manualShowingNotes,
      showingDate,
      showingTime,
      createdAt: "",
      updatedAt: ""
    };
  }

  if (getRequiredTextError(showingLocationAddress)) {
    redirectValidation(`/leads/${id}`);
  }

  const now = new Date().toISOString();
  const schedulePropertyUpdates = [];

  if (selectedPropertyInterest && showingDate && showingTime) {
    schedulePropertyUpdates.push(
      prisma.propertyInterest.update({
        where: { id: selectedPropertyInterest.id },
        data: {
          status: "scheduled",
          showingDate,
          showingTime,
          updatedAt: now
        }
      })
    );
  }

  if (selectedPropertyListing && attachShowingLocationToLead) {
    const normalizedListingAddress = selectedPropertyListing.address.trim().toLowerCase();
    const normalizedListingUrl = selectedPropertyListing.listingUrl.trim().toLowerCase();
    const existingInventoryInterest = propertyInterests.find((propertyInterest) => {
      const sameAddress = propertyInterest.address.trim().toLowerCase() === normalizedListingAddress;
      const sameListingUrl =
        normalizedListingUrl &&
        propertyInterest.listingUrl.trim().toLowerCase() === normalizedListingUrl;

      return sameAddress || sameListingUrl;
    });

    if (existingInventoryInterest && showingDate && showingTime) {
      schedulePropertyUpdates.push(
        prisma.propertyInterest.update({
          where: { id: existingInventoryInterest.id },
          data: {
            status: "scheduled",
            showingDate,
            showingTime,
            updatedAt: now
          }
        })
      );
    } else if (!existingInventoryInterest) {
      schedulePropertyUpdates.push(
        prisma.propertyInterest.create({
          data: {
            id: crypto.randomUUID(),
            leadId: existingLead.id,
            address: selectedPropertyListing.address,
            listingTitle: selectedPropertyListing.title,
            source: normalizeLeadSource(selectedPropertyListing.source),
            listingUrl: selectedPropertyListing.listingUrl,
            rent: selectedPropertyListing.price,
            beds: selectedPropertyListing.beds,
            baths: selectedPropertyListing.baths,
            neighborhood: selectedPropertyListing.neighborhood,
            status: showingDate && showingTime ? "scheduled" : "interested",
            rating: 3,
            clientFeedback: "",
            pros: "",
            cons: "",
            agentNotes: selectedPropertyListing.notes,
            showingDate,
            showingTime,
            createdAt: now,
            updatedAt: now
          }
        })
      );
    }
  }

  if (manualPropertyDraft && attachShowingLocationToLead) {
    const normalizedManualAddress = manualPropertyDraft.address.trim().toLowerCase();
    const normalizedManualUrl = manualPropertyDraft.listingUrl.trim().toLowerCase();
    const existingManualInterest = propertyInterests.find((propertyInterest) => {
      const sameAddress = propertyInterest.address.trim().toLowerCase() === normalizedManualAddress;
      const sameListingUrl =
        normalizedManualUrl &&
        propertyInterest.listingUrl.trim().toLowerCase() === normalizedManualUrl;

      return sameAddress || sameListingUrl;
    });

    if (existingManualInterest && showingDate && showingTime) {
      schedulePropertyUpdates.push(
        prisma.propertyInterest.update({
          where: { id: existingManualInterest.id },
          data: {
            status: "scheduled",
            showingDate,
            showingTime,
            updatedAt: now
          }
        })
      );
    } else if (!existingManualInterest) {
      schedulePropertyUpdates.push(
        prisma.propertyInterest.create({
          data: {
            ...manualPropertyDraft,
            createdAt: now,
            updatedAt: now
          }
        })
      );
    }
  }

  try {
    const showingWasMoved =
      Boolean(existingLead.showingDate && existingLead.showingTime && showingDate && showingTime) &&
      (existingLead.showingDate !== showingDate ||
        existingLead.showingTime !== showingTime ||
        existingLead.propertyAddress !== showingLocationAddress);
    const showingWasAdded = Boolean(!existingLead.showingDate && !existingLead.showingTime && showingDate && showingTime);
    const shouldLogScheduleChange = showingWasAdded || showingWasMoved;

    await prisma.$transaction([
      prisma.lead.update({
        where: { id },
        data: {
          propertyAddress: showingLocationAddress,
          status:
            showingDate && showingTime && nextStatus !== "closed"
              ? "scheduled"
              : nextStatus,
          priority,
          source,
          nextFollowUpDate,
          showingDate,
          showingTime,
          showingStatus: showingDate && showingTime ? (showingWasMoved ? "rescheduled" : "scheduled") : "",
          showingOutcome: "",
          showingOutcomeNotes: "",
          showingCompletedAt: "",
          showingCanceledReason: "",
          ...getRouteResetData(existingLead, {
            propertyAddress: showingLocationAddress,
            showingDate,
            showingTime
          }),
          agentNotes: getString(formData, "agentNotes"),
          updatedAt: now
        }
      }),
      ...schedulePropertyUpdates,
      ...(shouldLogScheduleChange
        ? [
            buildCommunicationActivityWrite(
              {
                leadId: id,
                channel: "note",
                direction: "internal",
                subject: showingWasMoved ? "Showing rescheduled" : "Showing scheduled",
                body: showingWasMoved
                  ? `Showing rescheduled for ${showingDate} at ${showingTime}.`
                  : `Showing scheduled for ${showingDate} at ${showingTime}.`,
                outcome: showingLocationAddress
              },
              sessionUser.id,
              now
            )
          ]
        : [])
    ]);
  } catch (error) {
    redirectSaveError(`/leads/${id}`, error);
  }

  revalidatePath("/");
  revalidatePath("/today");
  revalidatePath(`/leads/${id}`);
  revalidatePath("/routes");
  revalidatePath("/properties");
  redirect(
    withToast(
      `/leads/${id}`,
      showingDate && showingTime
        ? existingLead.showingDate && existingLead.showingTime
          ? "showing-rescheduled"
          : "showing-scheduled"
        : "status-updated"
    )
  );
}

function getLifecycleActivityText({
  status,
  outcome,
  outcomeNotes,
  canceledReason
}: {
  status: ShowingStatus;
  outcome: ShowingOutcome;
  outcomeNotes: string;
  canceledReason: string;
}) {
  if (status === "confirmed") {
    return {
      subject: "Showing confirmed",
      body: "Showing confirmed with the customer.",
      outcome: ""
    };
  }

  if (status === "completed") {
    const outcomeLabel = getShowingOutcomeLabel(outcome).toLowerCase();
    return {
      subject: "Showing completed",
      body: `Showing completed - customer ${outcomeLabel}.${outcomeNotes ? ` ${outcomeNotes}` : ""}`,
      outcome: outcomeLabel
    };
  }

  if (status === "no_show") {
    return {
      subject: "Showing marked no-show",
      body: `Showing marked no-show${outcomeNotes ? ` - ${outcomeNotes}` : "."}`,
      outcome: outcomeNotes
    };
  }

  if (status === "canceled") {
    return {
      subject: "Showing canceled",
      body: `Showing canceled${canceledReason ? ` - ${canceledReason}` : "."}`,
      outcome: canceledReason
    };
  }

  if (status === "rescheduled") {
    return {
      subject: "Showing rescheduled",
      body: "Showing moved back into rescheduling.",
      outcome: ""
    };
  }

  return {
    subject: "Showing scheduled",
    body: "Showing marked as scheduled.",
    outcome: ""
  };
}

function getMatchingShowingPropertyUpdates({
  lead,
  status,
  outcome,
  updatedAt
}: {
  lead: LeadWithProperties;
  status: ShowingStatus;
  outcome: ShowingOutcome;
  updatedAt: string;
}) {
  if (status !== "completed") {
    return [];
  }

  const nextPropertyStatus = getPropertyStatusForShowingOutcome(outcome);

  return (lead.propertyInterests || [])
    .filter((propertyInterest) => {
      const addressMatches = propertyInterest.address.trim().toLowerCase() === lead.propertyAddress.trim().toLowerCase();
      const dateMatches = !propertyInterest.showingDate || propertyInterest.showingDate === lead.showingDate;
      const timeMatches = !propertyInterest.showingTime || propertyInterest.showingTime === lead.showingTime;

      return addressMatches && dateMatches && timeMatches;
    })
    .map((propertyInterest) =>
      getPrismaClient().propertyInterest.update({
        where: { id: propertyInterest.id },
        data: {
          status: nextPropertyStatus,
          updatedAt
        }
      })
    );
}

export async function updateShowingLifecycle(formData: FormData) {
  const leadId = getString(formData, "leadId");
  const redirectTo = getString(formData, "redirectTo") || `/leads/${leadId}`;
  const nextShowingStatus = getShowingStatus(formData);
  const rawOutcome = getString(formData, "showingOutcome");
  const showingOutcome = nextShowingStatus === "completed" ? normalizeShowingOutcome(rawOutcome) : "";
  const showingOutcomeNotes = getString(formData, "showingOutcomeNotes");
  const showingCanceledReason = getString(formData, "showingCanceledReason");
  const requireLifecycleReason = getString(formData, "requireLifecycleReason") === "true";
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/login");
  }

  if (!canUseDatabase()) {
    redirect(withToast(redirectTo, isPreviewReadonlyMode() ? "preview-readonly" : "database-unavailable"));
  }

  if (
    !leadId ||
    !showingStatusOptions.includes(nextShowingStatus) ||
    (requireLifecycleReason && nextShowingStatus === "completed" && !rawOutcome) ||
    (requireLifecycleReason && nextShowingStatus === "no_show" && !showingOutcomeNotes) ||
    (requireLifecycleReason && nextShowingStatus === "canceled" && !showingCanceledReason) ||
    getMaxLengthError(showingOutcomeNotes, fieldMaxLengths.agentNotes) ||
    getMaxLengthError(showingCanceledReason, fieldMaxLengths.agentNotes)
  ) {
    redirectValidation(redirectTo);
  }

  const prisma = getPrismaClient();
  let lead;

  try {
    lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        propertyInterests: true
      }
    });
  } catch (error) {
    redirectSaveError(redirectTo, error);
  }

  if (!lead || lead.userId !== sessionUser.id) {
    redirect(withToast(redirectTo, "save-error"));
  }

  if (!lead.showingDate || !lead.showingTime) {
    redirectValidation(redirectTo);
  }

  const now = new Date().toISOString();
  const currentLead = lead as unknown as LeadWithProperties;
  const activity = getLifecycleActivityText({
    status: nextShowingStatus,
    outcome: showingOutcome || "undecided",
    outcomeNotes: showingOutcomeNotes,
    canceledReason: showingCanceledReason
  });
  const routeCompleted =
    nextShowingStatus === "completed" ||
    nextShowingStatus === "no_show" ||
    nextShowingStatus === "canceled";
  const nextLeadStatus =
    lead.status === "new" && (nextShowingStatus === "scheduled" || nextShowingStatus === "confirmed")
      ? "scheduled"
      : nextShowingStatus === "canceled" || nextShowingStatus === "no_show"
        ? "contacted"
        : lead.status;

  try {
    await prisma.$transaction([
      prisma.lead.update({
        where: { id: leadId },
        data: {
          showingStatus: nextShowingStatus,
          showingOutcome,
          showingOutcomeNotes: nextShowingStatus === "completed" ? showingOutcomeNotes : "",
          showingCompletedAt: nextShowingStatus === "completed" ? now : "",
          showingCanceledReason: nextShowingStatus === "canceled" ? showingCanceledReason : "",
          routeCompleted,
          status: nextLeadStatus,
          updatedAt: now
        }
      }),
      ...getMatchingShowingPropertyUpdates({
        lead: currentLead,
        status: nextShowingStatus,
        outcome: showingOutcome || "undecided",
        updatedAt: now
      }),
      buildCommunicationActivityWrite(
        {
          leadId,
          channel: "note",
          direction: "internal",
          subject: activity.subject,
          body: activity.body,
          outcome: activity.outcome
        },
        sessionUser.id,
        now
      )
    ]);
  } catch (error) {
    redirectSaveError(redirectTo, error);
  }

  revalidatePath("/");
  revalidatePath("/today");
  revalidatePath("/routes");
  revalidatePath(`/leads/${leadId}`);
  redirect(withToast(redirectTo, `showing-${nextShowingStatus}`));
}

export async function updateLeadPreferences(formData: FormData) {
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

  const clientPreferences = getClientPreferenceFields(formData);

  if (!id || getClientPreferenceError(clientPreferences)) {
    redirectValidation(`/leads/${id}`);
  }

  const prisma = getPrismaClient();
  let result;

  try {
    result = await prisma.lead.updateMany({
      where: { id, userId: sessionUser.id },
      data: {
        ...clientPreferences,
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
  revalidatePath("/today");
  revalidatePath(`/leads/${id}`);
  redirect(withToast(`/leads/${id}`, "preferences-updated"));
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

export async function updateLeadFollowUpDate(formData: FormData) {
  const id = getString(formData, "id");
  const nextFollowUpDate = getString(formData, "nextFollowUpDate");
  const redirectTo = getString(formData, "redirectTo") || "/";
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/login");
  }

  if (!canUseDatabase()) {
    redirect(withToast(redirectTo, isPreviewReadonlyMode() ? "preview-readonly" : "database-unavailable"));
  }

  if (!id || !isIsoDate(nextFollowUpDate)) {
    redirectValidation(redirectTo);
  }

  const prisma = getPrismaClient();
  let result;

  try {
    result = await prisma.lead.updateMany({
      where: { id, userId: sessionUser.id },
      data: {
        nextFollowUpDate,
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
  revalidatePath("/today");
  revalidatePath(`/leads/${id}`);
  redirect(withToast(redirectTo, "follow-up-updated"));
}

export async function markFollowUpCompleted(formData: FormData) {
  const leadId = getString(formData, "leadId");
  const redirectTo = getString(formData, "redirectTo") || "/today";
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/login");
  }

  if (!leadId) {
    redirectValidation(redirectTo);
  }

  if (!canUseDatabase()) {
    redirect(withToast(redirectTo, isPreviewReadonlyMode() ? "preview-readonly" : "database-unavailable"));
  }

  const prisma = getPrismaClient();
  const now = new Date().toISOString();
  let lead;

  try {
    lead = await prisma.lead.findUnique({
      where: { id: leadId }
    });
  } catch (error) {
    redirectSaveError(redirectTo, error);
  }

  if (!lead || lead.userId !== sessionUser.id) {
    redirect(withToast(redirectTo, "save-error"));
  }

  const activity: CommunicationActivity = {
    id: crypto.randomUUID(),
    leadId,
    userId: sessionUser.id,
    templateId: "",
    channel: "note",
    direction: "internal",
    subject: "Follow-up completed",
    body: lead.nextFollowUpDate
      ? `Follow-up due ${lead.nextFollowUpDate} was marked completed from Today.`
      : "Follow-up was marked completed from Today.",
    outcome: "Follow-up completed",
    occurredAt: now,
    createdAt: now
  };

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
          ${activity.id},
          ${activity.leadId},
          ${activity.userId},
          ${activity.templateId},
          ${activity.channel},
          ${activity.direction},
          ${activity.subject},
          ${activity.body},
          ${activity.outcome},
          ${activity.occurredAt},
          ${activity.createdAt}
        )
      `,
      prisma.lead.update({
        where: { id: leadId },
        data: {
          nextFollowUpDate: "",
          updatedAt: now
        }
      })
    ]);
  } catch (error) {
    redirectSaveError(redirectTo, error);
  }

  revalidatePath("/");
  revalidatePath("/today");
  revalidatePath(`/leads/${leadId}`);
  redirect(withToast(redirectTo, "follow-up-completed"));
}

export async function createPropertyListing(formData: FormData) {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/login");
  }

  if (!canUseDatabase()) {
    redirect(
      withToast("/properties", isPreviewReadonlyMode() ? "preview-readonly" : "database-unavailable")
    );
  }

  const title = getString(formData, "title");
  const address = getString(formData, "address") || getString(formData, "workflowAddress");
  const price = getString(formData, "price");
  const beds = getString(formData, "beds");
  const baths = getString(formData, "baths");
  const neighborhood = getString(formData, "neighborhood");
  const source = getSource(formData);
  const listingUrl = getString(formData, "listingUrl");
  const notes = getString(formData, "notes");
  const status = getPropertyListingStatus(formData);
  const allowDuplicate = getBoolean(formData, "allowDuplicate");

  if (
    getRequiredTextError(title) ||
    getRequiredTextError(address) ||
    !propertyListingStatusOptions.includes(status) ||
    getNumericError(price) ||
    getNumericError(beds, false) ||
    getNumericError(baths) ||
    getMaxLengthError(title, fieldMaxLengths.listingTitle) ||
    getMaxLengthError(address, fieldMaxLengths.address) ||
    getMaxLengthError(price, fieldMaxLengths.rent) ||
    getMaxLengthError(beds, fieldMaxLengths.beds) ||
    getMaxLengthError(baths, fieldMaxLengths.baths) ||
    getMaxLengthError(neighborhood, fieldMaxLengths.neighborhood) ||
    getMaxLengthError(listingUrl, fieldMaxLengths.listingUrl) ||
    getMaxLengthError(notes, fieldMaxLengths.notes)
  ) {
    redirectValidation("/properties");
  }

  const prisma = getPrismaClient();
  const now = new Date().toISOString();

  if (!allowDuplicate) {
    let duplicateListing: PropertyListing | undefined;

    try {
      const existingListings = await getPropertyListingsForUser(sessionUser.id);
      duplicateListing = findDuplicatePropertyListing(existingListings, { address, listingUrl });
    } catch (error) {
      redirectSaveError("/properties", error);
    }

    if (duplicateListing) {
      redirect(withToast("/properties", "property-duplicate"));
    }
  }

  try {
    await prisma.$executeRaw`
      INSERT INTO "PropertyListing" (
        "id",
        "userId",
        "title",
        "address",
        "neighborhood",
        "price",
        "beds",
        "baths",
        "source",
        "listingUrl",
        "status",
        "notes",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${crypto.randomUUID()},
        ${sessionUser.id},
        ${title},
        ${address},
        ${neighborhood},
        ${price},
        ${beds},
        ${baths},
        ${source},
        ${listingUrl},
        ${status},
        ${notes},
        ${now},
        ${now}
      )
    `;
  } catch (error) {
    redirectSaveError("/properties", error);
  }

  revalidatePath("/properties");
  redirect(withToast("/properties", "property-listing-added"));
}

export async function updatePropertyListing(formData: FormData) {
  const id = getString(formData, "id");
  const redirectPath = getSafePropertyListingRedirect(formData);
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/login");
  }

  if (!canUseDatabase()) {
    redirect(
      withToast(redirectPath, isPreviewReadonlyMode() ? "preview-readonly" : "database-unavailable")
    );
  }

  const title = getString(formData, "title");
  const address = getString(formData, "address");
  const price = getString(formData, "price");
  const beds = getString(formData, "beds");
  const baths = getString(formData, "baths");
  const neighborhood = getString(formData, "neighborhood");
  const source = getSource(formData);
  const listingUrl = getString(formData, "listingUrl");
  const notes = getString(formData, "notes");
  const status = getPropertyListingStatus(formData);

  if (
    !id ||
    getRequiredTextError(title) ||
    getRequiredTextError(address) ||
    !propertyListingStatusOptions.includes(status) ||
    getNumericError(price) ||
    getNumericError(beds, false) ||
    getNumericError(baths) ||
    getMaxLengthError(title, fieldMaxLengths.listingTitle) ||
    getMaxLengthError(address, fieldMaxLengths.address) ||
    getMaxLengthError(price, fieldMaxLengths.rent) ||
    getMaxLengthError(beds, fieldMaxLengths.beds) ||
    getMaxLengthError(baths, fieldMaxLengths.baths) ||
    getMaxLengthError(neighborhood, fieldMaxLengths.neighborhood) ||
    getMaxLengthError(listingUrl, fieldMaxLengths.listingUrl) ||
    getMaxLengthError(notes, fieldMaxLengths.notes)
  ) {
    redirectValidation(redirectPath);
  }

  const prisma = getPrismaClient();
  const now = new Date().toISOString();
  let updatedCount = 0;

  try {
    updatedCount = await prisma.$executeRaw`
      UPDATE "PropertyListing"
      SET
        "title" = ${title},
        "address" = ${address},
        "neighborhood" = ${neighborhood},
        "price" = ${price},
        "beds" = ${beds},
        "baths" = ${baths},
        "source" = ${source},
        "listingUrl" = ${listingUrl},
        "status" = ${status},
        "notes" = ${notes},
        "updatedAt" = ${now}
      WHERE "id" = ${id} AND "userId" = ${sessionUser.id}
    `;
  } catch (error) {
    redirectSaveError(redirectPath, error);
  }

  if (updatedCount === 0) {
    redirect(withToast(redirectPath, "save-error"));
  }

  revalidatePath("/properties");
  revalidatePath(`/properties/${id}`);
  revalidatePath("/today");
  revalidatePath("/routes");
  redirect(withToast(redirectPath, "property-updated"));
}

export async function createCommunicationActivity(formData: FormData) {
  const input = buildCommunicationActivityFromForm(formData);
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/login");
  }

  if (!canUseDatabase()) {
    redirect(
      withToast(`/leads/${input.leadId}`, isPreviewReadonlyMode() ? "preview-readonly" : "database-unavailable")
    );
  }

  if (getCommunicationActivityError(input)) {
    redirectValidation(`/leads/${input.leadId}`);
  }

  try {
    const activity = await saveCommunicationActivity(input, sessionUser.id);

    if (!activity) {
      redirect(withToast(`/leads/${input.leadId}`, "save-error"));
    }
  } catch (error) {
    redirectSaveError(`/leads/${input.leadId}`, error);
  }

  redirect(withToast(`/leads/${input.leadId}`, "activity-logged"));
}

export async function logCommunicationActivityInline(input: {
  leadId: string;
  channel: string;
  direction?: string;
  templateId?: string;
  subject?: string;
  body: string;
  outcome?: string;
}) {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    return { success: false, toastKey: "save-error" } as const;
  }

  if (!canUseDatabase()) {
    return {
      success: false,
      toastKey: isPreviewReadonlyMode() ? "preview-readonly" : "database-unavailable"
    } as const;
  }

  const activityInput: CommunicationActivityInput = {
    leadId: input.leadId,
    channel: normalizeCommunicationChannel(input.channel),
    direction: normalizeCommunicationDirection(input.direction || "outbound"),
    templateId: (input.templateId || "").trim().slice(0, 120),
    subject: (input.subject || "").trim(),
    body: input.body.trim(),
    outcome: (input.outcome || "").trim()
  };

  if (getCommunicationActivityError(activityInput)) {
    return { success: false, toastKey: "validation-error" } as const;
  }

  try {
    const activity = await saveCommunicationActivity(activityInput, sessionUser.id);

    if (!activity) {
      return { success: false, toastKey: "save-error" } as const;
    }

    return { success: true, toastKey: "activity-logged", activity } as const;
  } catch (error) {
    console.error(error);
    return { success: false, toastKey: "save-error" } as const;
  }
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
  revalidatePath("/today");
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
  revalidatePath("/today");
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

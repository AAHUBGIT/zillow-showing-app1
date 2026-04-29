import { revalidatePath } from "next/cache";
import { getSessionUser, SessionUser } from "./auth";
import { canUseDatabase, shouldUseDemoData } from "./deployment";
import { fieldMaxLengths } from "./form-validation";
import { parseLeadInquiryText } from "./lead-import-parser";
import { getPrismaClient } from "./prisma";
import { Lead, LeadSource, PropertyInterest } from "./types";

export type LeadCaptureStatus = "SUCCESS" | "LOW_CONFIDENCE" | "DUPLICATE" | "FAILED";

export type LeadInboxRecord = {
  id: string;
  userId: string;
  userEmail: string | null;
  inboxSlug: string;
  inboxEmail: string;
  createdAt: string;
};

export type LeadCaptureRecent = {
  id: string;
  userId: string;
  inboxSlug: string;
  recipient: string;
  fromEmail: string;
  fromName: string | null;
  subject: string | null;
  rawBody: string;
  parseStatus: LeadCaptureStatus;
  parsedLeadId: string | null;
  errorMessage: string | null;
  createdAt: string;
  parsedLeadName: string | null;
};

export type InboundEmailPayload = {
  recipient?: string;
  from?: string;
  fromName?: string;
  subject?: string;
  text?: string;
  html?: string;
  raw?: string;
  provider?: string;
};

type DuplicateLead = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
};

const leadCaptureDomain = "in.showingscrm.com";
const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

export function getBetaLeadInboxAddress() {
  return `demo@${leadCaptureDomain}`;
}

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

function getInboxSlugForUser(user: SessionUser) {
  if (user.id === "demo-user" || user.email === "demo@showingscrm.com") {
    return "demo";
  }

  const emailLocalPart = user.email.split("@")[0] || "agent";
  const baseSlug = normalizeSlug(emailLocalPart) || "agent";
  const idSuffix = normalizeSlug(user.id).slice(0, 8);

  return idSuffix ? `${baseSlug}-${idSuffix}`.slice(0, 48) : baseSlug;
}

function buildInboxEmail(inboxSlug: string) {
  return `${inboxSlug}@${leadCaptureDomain}`;
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

function stripHtml(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function getEmailAddress(value: string) {
  return emailPattern.exec(value)?.[0] || "";
}

function getDisplayNameFromAddress(value: string, email: string) {
  return value
    .replace(email, "")
    .replace(/[<>"']/g, "")
    .trim();
}

function getPayloadBody(payload: InboundEmailPayload) {
  return (
    (payload.text || "").trim() ||
    (payload.raw || "").trim() ||
    stripHtml(payload.html || "")
  );
}

function getPayloadRawBody(payload: InboundEmailPayload) {
  return [payload.text, payload.raw, stripHtml(payload.html || "")]
    .filter((value) => value && value.trim())
    .join("\n\n")
    .trim();
}

function extractInboxSlug(recipient: string) {
  const email = getEmailAddress(recipient) || recipient.trim();
  const [localPart] = email.split("@");
  return normalizeSlug(localPart || "");
}

async function selectLeadInboxByUserId(userId: string) {
  const prisma = getPrismaClient();

  return prisma.$queryRaw<LeadInboxRecord[]>`
    SELECT
      "id",
      "userId",
      "userEmail",
      "inboxSlug",
      "inboxEmail",
      "createdAt"
    FROM "LeadInbox"
    WHERE "userId" = ${userId}
    ORDER BY "createdAt" ASC
    LIMIT 1
  `;
}

export async function findLeadInboxBySlug(inboxSlug: string) {
  const prisma = getPrismaClient();
  const rows = await prisma.$queryRaw<LeadInboxRecord[]>`
    SELECT
      "id",
      "userId",
      "userEmail",
      "inboxSlug",
      "inboxEmail",
      "createdAt"
    FROM "LeadInbox"
    WHERE "inboxSlug" = ${inboxSlug}
    LIMIT 1
  `;

  return rows[0] || null;
}

export async function ensureLeadInboxForUser(user: SessionUser) {
  const fallbackSlug = getInboxSlugForUser(user);
  const fallbackInbox: LeadInboxRecord = {
    id: "",
    userId: user.id,
    userEmail: user.email,
    inboxSlug: fallbackSlug,
    inboxEmail: buildInboxEmail(fallbackSlug),
    createdAt: ""
  };

  if (!canUseDatabase() || shouldUseDemoData()) {
    return fallbackInbox;
  }

  const prisma = getPrismaClient();

  try {
    const [existingInbox] = await selectLeadInboxByUserId(user.id);
    if (existingInbox) {
      return existingInbox;
    }

    const now = new Date().toISOString();
    await prisma.$executeRaw`
      INSERT INTO "LeadInbox" (
        "id",
        "userId",
        "userEmail",
        "inboxSlug",
        "inboxEmail",
        "createdAt"
      )
      VALUES (
        ${crypto.randomUUID()},
        ${user.id},
        ${user.email},
        ${fallbackSlug},
        ${fallbackInbox.inboxEmail},
        ${now}
      )
    `;

    const [createdInbox] = await selectLeadInboxByUserId(user.id);
    return createdInbox || fallbackInbox;
  } catch (error) {
    console.error(error);
    return fallbackInbox;
  }
}

export async function getLeadCapturePageData() {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    return {
      inboxEmail: getBetaLeadInboxAddress(),
      recentCaptures: [] as LeadCaptureRecent[]
    };
  }

  const inbox = await ensureLeadInboxForUser(sessionUser);

  if (!canUseDatabase() || shouldUseDemoData()) {
    return {
      inboxEmail: inbox.inboxEmail,
      recentCaptures: [] as LeadCaptureRecent[]
    };
  }

  try {
    const prisma = getPrismaClient();
    const recentCaptures = await prisma.$queryRaw<LeadCaptureRecent[]>`
      SELECT
        "InboundEmail"."id",
        "InboundEmail"."userId",
        "InboundEmail"."inboxSlug",
        "InboundEmail"."recipient",
        "InboundEmail"."fromEmail",
        "InboundEmail"."fromName",
        "InboundEmail"."subject",
        "InboundEmail"."rawBody",
        "InboundEmail"."parseStatus",
        "InboundEmail"."parsedLeadId",
        "InboundEmail"."errorMessage",
        "InboundEmail"."createdAt",
        "Lead"."fullName" AS "parsedLeadName"
      FROM "InboundEmail"
      LEFT JOIN "Lead" ON "Lead"."id" = "InboundEmail"."parsedLeadId"
      WHERE "InboundEmail"."userId" = ${sessionUser.id}
      ORDER BY "InboundEmail"."createdAt" DESC
      LIMIT 10
    `;

    return {
      inboxEmail: inbox.inboxEmail,
      recentCaptures
    };
  } catch (error) {
    console.error(error);
    return {
      inboxEmail: inbox.inboxEmail,
      recentCaptures: [] as LeadCaptureRecent[]
    };
  }
}

async function findDuplicateLead(userId: string, email: string, phone: string) {
  const prisma = getPrismaClient();
  const leads = await prisma.$queryRaw<DuplicateLead[]>`
    SELECT
      "id",
      "fullName",
      "phone",
      "email"
    FROM "Lead"
    WHERE "userId" = ${userId}
  `;
  const normalizedEmail = normalizeEmail(email);
  const normalizedPhone = normalizePhone(phone);

  return (
    leads.find((lead) => {
      const leadEmail = normalizeEmail(lead.email);
      const leadPhone = normalizePhone(lead.phone);

      return Boolean(
        (normalizedEmail && normalizedEmail === leadEmail) ||
          (normalizedPhone && normalizedPhone === leadPhone)
      );
    }) || null
  );
}

async function createInboundEmailRecord({
  userId,
  inboxSlug,
  recipient,
  fromEmail,
  fromName,
  subject,
  rawBody,
  parseStatus,
  parsedLeadId,
  errorMessage
}: {
  userId: string;
  inboxSlug: string;
  recipient: string;
  fromEmail: string;
  fromName: string;
  subject: string;
  rawBody: string;
  parseStatus: LeadCaptureStatus;
  parsedLeadId?: string;
  errorMessage?: string;
}) {
  const prisma = getPrismaClient();
  await prisma.$executeRaw`
    INSERT INTO "InboundEmail" (
      "id",
      "userId",
      "inboxSlug",
      "recipient",
      "fromEmail",
      "fromName",
      "subject",
      "rawBody",
      "parseStatus",
      "parsedLeadId",
      "errorMessage",
      "createdAt"
    )
    VALUES (
      ${crypto.randomUUID()},
      ${userId},
      ${inboxSlug},
      ${recipient},
      ${fromEmail},
      ${fromName || null},
      ${subject || null},
      ${rawBody},
      ${parseStatus},
      ${parsedLeadId || null},
      ${errorMessage || null},
      ${new Date().toISOString()}
    )
  `;
}

function buildActivityInsert({
  leadId,
  userId,
  subject,
  body,
  outcome
}: {
  leadId: string;
  userId: string;
  subject: string;
  body: string;
  outcome: string;
}) {
  const now = new Date().toISOString();
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
      ${leadId},
      ${userId},
      ${""},
      ${"email"},
      ${"inbound"},
      ${subject || "Inbound lead captured"},
      ${body},
      ${outcome},
      ${now},
      ${now}
    )
  `;
}

async function createCapturedLead({
  userId,
  fullName,
  phone,
  email,
  propertyAddress,
  desiredMoveInDate,
  source,
  message,
  subject
}: {
  userId: string;
  fullName: string;
  phone: string;
  email: string;
  propertyAddress: string;
  desiredMoveInDate: string;
  source: LeadSource;
  message: string;
  subject: string;
}) {
  const prisma = getPrismaClient();
  const now = new Date().toISOString();
  const leadId = crypto.randomUUID();
  const agentNotes = `Captured from inbound email${subject ? `: ${subject}` : ""}`.slice(
    0,
    fieldMaxLengths.agentNotes
  );
  const lead: Lead = {
    id: leadId,
    userId,
    fullName,
    phone,
    email,
    propertyAddress,
    desiredMoveInDate,
    notes: message.slice(0, fieldMaxLengths.notes),
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

  await prisma.$transaction([
    prisma.lead.create({ data: lead }),
    ...(propertyInterest ? [prisma.propertyInterest.create({ data: propertyInterest })] : []),
    buildActivityInsert({
      leadId,
      userId,
      subject,
      body: message,
      outcome: "Lead captured from inbound email."
    })
  ]);

  revalidatePath("/");
  revalidatePath("/today");
  revalidatePath("/routes");
  revalidatePath(`/leads/${leadId}`);

  return leadId;
}

export async function processInboundEmail(payload: InboundEmailPayload) {
  const recipient = payload.recipient || "";
  const inboxSlug = extractInboxSlug(recipient);

  if (!inboxSlug) {
    return { ok: true, status: "ignored_unknown_inbox" as const };
  }

  const inbox = await findLeadInboxBySlug(inboxSlug);
  if (!inbox) {
    return { ok: true, status: "ignored_unknown_inbox" as const };
  }

  const fromEmail = getEmailAddress(payload.from || "") || "";
  const fromName = (payload.fromName || getDisplayNameFromAddress(payload.from || "", fromEmail)).trim();
  const subject = (payload.subject || "").trim();
  const rawBody = getPayloadRawBody(payload) || getPayloadBody(payload);
  const parseInput = [fromName ? `Name: ${fromName}` : "", fromEmail ? `Email: ${fromEmail}` : "", subject, rawBody]
    .filter(Boolean)
    .join("\n");

  if (!rawBody.trim() && !fromEmail) {
    await createInboundEmailRecord({
      userId: inbox.userId,
      inboxSlug,
      recipient,
      fromEmail,
      fromName,
      subject,
      rawBody,
      parseStatus: "FAILED",
      errorMessage: "Inbound email did not include readable body or sender email."
    });

    return { ok: true, status: "failed" as const };
  }

  try {
    const parsed = parseLeadInquiryText(parseInput);
    const email = parsed.email || fromEmail;
    const fullName = parsed.fullName || fromName;
    const phone = parsed.phone;
    const message = (parsed.message || rawBody || subject).slice(0, fieldMaxLengths.notes);
    const propertyAddress = parsed.propertyAddress;
    const duplicateLead = await findDuplicateLead(inbox.userId, email, phone);

    if (duplicateLead) {
      await buildActivityInsert({
        leadId: duplicateLead.id,
        userId: inbox.userId,
        subject,
        body: message,
        outcome: "Duplicate inbound lead capture matched this existing lead."
      });
      await createInboundEmailRecord({
        userId: inbox.userId,
        inboxSlug,
        recipient,
        fromEmail: email,
        fromName,
        subject,
        rawBody,
        parseStatus: "DUPLICATE",
        parsedLeadId: duplicateLead.id,
        errorMessage: "Matched an existing lead by email or phone."
      });
      revalidatePath(`/leads/${duplicateLead.id}`);

      return {
        ok: true,
        status: "duplicate" as const,
        leadId: duplicateLead.id
      };
    }

    if (!fullName || !email || !phone) {
      await createInboundEmailRecord({
        userId: inbox.userId,
        inboxSlug,
        recipient,
        fromEmail: email,
        fromName,
        subject,
        rawBody,
        parseStatus: "LOW_CONFIDENCE",
        errorMessage: "Missing required lead details: name, email, or phone."
      });

      return { ok: true, status: "low_confidence" as const };
    }

    const leadId = await createCapturedLead({
      userId: inbox.userId,
      fullName,
      phone,
      email,
      propertyAddress,
      desiredMoveInDate: parsed.desiredMoveInDate,
      source: parsed.source,
      message,
      subject
    });

    await createInboundEmailRecord({
      userId: inbox.userId,
      inboxSlug,
      recipient,
      fromEmail: email,
      fromName,
      subject,
      rawBody,
      parseStatus: "SUCCESS",
      parsedLeadId: leadId
    });

    return {
      ok: true,
      status: "success" as const,
      leadId
    };
  } catch (error) {
    console.error(error);
    await createInboundEmailRecord({
      userId: inbox.userId,
      inboxSlug,
      recipient,
      fromEmail,
      fromName,
      subject,
      rawBody,
      parseStatus: "FAILED",
      errorMessage: "Inbound email processing failed."
    });

    return { ok: false, status: "failed" as const };
  }
}

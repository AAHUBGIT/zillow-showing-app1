import type { Lead } from "./types";

export function normalizePhoneForHref(phone: string) {
  return phone.replace(/[^\d+]/g, "") || phone;
}

export function getFirstName(fullName: string) {
  return fullName.split(" ").filter(Boolean)[0] || fullName;
}

export function buildCallHref(phone: string) {
  return `tel:${normalizePhoneForHref(phone)}`;
}

export function buildLeadTextHref(lead: Pick<Lead, "fullName" | "phone" | "propertyAddress">) {
  const message = `Hi ${getFirstName(lead.fullName)}, following up on ${lead.propertyAddress}.`;
  return buildTextHref(lead.phone, message);
}

export function buildTextHref(phone: string, message: string) {
  const normalizedPhone = normalizePhoneForHref(phone);
  const trimmedMessage = message.trim();

  if (!trimmedMessage) {
    return `sms:${normalizedPhone}`;
  }

  return `sms:${normalizedPhone}?body=${encodeURIComponent(trimmedMessage)}`;
}

export function buildLeadEmailHref(lead: Pick<Lead, "fullName" | "email" | "propertyAddress">) {
  const subject = `Following up on ${lead.propertyAddress}`;
  const message = `Hi ${getFirstName(lead.fullName)},\n\nFollowing up on ${lead.propertyAddress}. Let me know what questions you have or what timing works best.\n\nBest,`;

  return buildEmailHref(lead.email, subject, message);
}

export function buildEmailHref(email: string, subject: string, message: string) {
  const normalizedEmail = normalizeEmailForHref(email);
  const trimmedSubject = subject.trim();
  const trimmedMessage = message.trim();
  const params: string[] = [];

  if (trimmedSubject) {
    params.push(`subject=${encodeMailtoParam(trimmedSubject)}`);
  }

  if (trimmedMessage) {
    params.push(`body=${encodeMailtoParam(trimmedMessage)}`);
  }

  const query = params.join("&");
  return query ? `mailto:${normalizedEmail}?${query}` : `mailto:${normalizedEmail}`;
}

function normalizeEmailForHref(email: string) {
  const trimmedEmail = email.trim();
  const bracketMatch = trimmedEmail.match(/<([^<>@\s]+@[^<>@\s]+)>/);

  if (bracketMatch) {
    return bracketMatch[1];
  }

  return trimmedEmail;
}

function encodeMailtoParam(value: string) {
  return encodeURIComponent(value).replace(/%0A/g, "%0D%0A");
}

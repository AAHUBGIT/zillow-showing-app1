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
  const params = new URLSearchParams();
  const trimmedSubject = subject.trim();
  const trimmedMessage = message.trim();

  if (trimmedSubject) {
    params.set("subject", trimmedSubject);
  }

  if (trimmedMessage) {
    params.set("body", trimmedMessage);
  }

  const query = params.toString();
  return query ? `mailto:${email}?${query}` : `mailto:${email}`;
}

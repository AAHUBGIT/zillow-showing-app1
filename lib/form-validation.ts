export const fieldMaxLengths = {
  fullName: 80,
  phone: 24,
  email: 120,
  propertyAddress: 180,
  listingTitle: 120,
  address: 180,
  listingUrl: 240,
  neighborhood: 80,
  rent: 32,
  beds: 12,
  baths: 12,
  notes: 1200,
  agentNotes: 1200,
  pros: 900,
  cons: 900
} as const;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const twentyFourHourTimePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

function normalizePhoneDigits(value: string) {
  return value.replace(/\D/g, "");
}

function normalizeNumericValue(value: string) {
  return value.trim().replace(/\s*\/\s*month$/i, "").replace(/[$,\s]/g, "");
}

export function isValidEmail(value: string) {
  return emailPattern.test(value.trim());
}

export function isValidPhone(value: string) {
  const digits = normalizePhoneDigits(value);
  return digits.length === 10 || (digits.length === 11 && digits.startsWith("1"));
}

export function isValidNumericValue(value: string, allowDecimal = true) {
  const normalized = normalizeNumericValue(value);

  if (!normalized) {
    return false;
  }

  return allowDecimal ? /^\d+(\.\d+)?$/.test(normalized) : /^\d+$/.test(normalized);
}

export function sanitizeNumericInput(value: string, allowDecimal = true) {
  const cleaned = value.replace(/[^\d.]/g, "");

  if (!allowDecimal) {
    return cleaned.replace(/\./g, "");
  }

  const [whole = "", ...fractionParts] = cleaned.split(".");
  const fraction = fractionParts.join("");

  return fraction ? `${whole}.${fraction}` : whole;
}

export function isIsoDate(value: string) {
  return !value || isoDatePattern.test(value);
}

export function isTwentyFourHourTime(value: string) {
  return !value || twentyFourHourTimePattern.test(value);
}

export function isPastIsoDate(value: string) {
  if (!value || !isIsoDate(value)) {
    return false;
  }

  const today = new Date();
  const todayAtMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const candidate = new Date(`${value}T00:00:00`);
  return candidate.getTime() < todayAtMidnight.getTime();
}

export function getRequiredTextError(value: string) {
  return value.trim() ? "" : "This field is required.";
}

export function getRequiredSelectError(value: string) {
  return value.trim() ? "" : "Please choose an option.";
}

export function getEmailError(value: string) {
  if (!value.trim()) {
    return "This field is required.";
  }

  return isValidEmail(value) ? "" : "Enter a valid email address.";
}

export function getPhoneError(value: string) {
  if (!value.trim()) {
    return "This field is required.";
  }

  return isValidPhone(value) ? "" : "Enter a valid US phone number.";
}

export function getNumericError(value: string, allowDecimal = true) {
  if (!value.trim()) {
    return "";
  }

  return isValidNumericValue(value, allowDecimal) ? "" : "Enter numbers only.";
}

export function getOptionalDateError(value: string) {
  if (!value.trim()) {
    return "";
  }

  return isIsoDate(value) ? "" : "Choose a valid date.";
}

export function getOptionalTimeError(value: string) {
  if (!value.trim()) {
    return "";
  }

  return isTwentyFourHourTime(value) ? "" : "Choose a valid time.";
}

export function getMaxLengthError(value: string, maxLength: number) {
  return value.length > maxLength ? `Keep this under ${maxLength} characters.` : "";
}

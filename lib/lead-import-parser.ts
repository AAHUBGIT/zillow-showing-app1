import { LeadSource } from "./types";

export type ParsedLeadImport = {
  fullName: string;
  phone: string;
  email: string;
  propertyAddress: string;
  message: string;
  desiredMoveInDate: string;
  source: LeadSource;
  confidenceNotes: string[];
};

const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const phonePattern = /(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}/;
const addressPattern =
  /\b\d{1,6}\s+[A-Za-z0-9.'# -]+?\s+(?:st|street|ave|avenue|rd|road|dr|drive|ln|lane|blvd|boulevard|pl|place|ct|court|way|terrace|ter|circle|cir)\b.*$/i;

function normalizeLine(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function getLines(input: string) {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getLabeledValue(lines: string[], labels: string[]) {
  for (const line of lines) {
    for (const label of labels) {
      const match = line.match(new RegExp(`^${escapeRegex(label)}\\s*[:\\-]\\s*(.+)$`, "i"));

      if (match?.[1]) {
        return normalizeLine(match[1]);
      }
    }
  }

  return "";
}

function getMessageValue(lines: string[]) {
  const messageStart = lines.findIndex((line) => /^(message|comments?|notes?|inquiry)\s*[:\-]/i.test(line));

  if (messageStart < 0) {
    return "";
  }

  const firstLine = lines[messageStart].replace(/^(message|comments?|notes?|inquiry)\s*[:\-]\s*/i, "").trim();
  const continuation = lines
    .slice(messageStart + 1)
    .filter((line) => !/^(name|full name|email|phone|property|address|listing|source)\s*[:\-]/i.test(line));

  return normalizeLine([firstLine, ...continuation].filter(Boolean).join(" "));
}

function getNameValue(lines: string[], email: string) {
  const labeledName = getLabeledValue(lines, ["Full name", "Name", "Contact", "From"]);

  if (!labeledName) {
    return "";
  }

  const withoutEmail = normalizeLine(
    labeledName
      .replace(email, "")
      .replace(/<[^>]+>/g, "")
      .replace(/\([^)]*\)/g, "")
  );

  if (!withoutEmail || emailPattern.test(withoutEmail)) {
    return "";
  }

  return withoutEmail;
}

function parseDateCandidate(value: string) {
  const isoMatch = value.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  const slashMatch = value.match(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/);
  if (slashMatch) {
    const month = Number(slashMatch[1]);
    const day = Number(slashMatch[2]);
    const year = Number(slashMatch[3].length === 2 ? `20${slashMatch[3]}` : slashMatch[3]);
    return normalizeDateParts(year, month, day);
  }

  const wordMatch = value.match(
    /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\.?\s+(\d{1,2})(?:,\s*(\d{4}))?/i
  );
  if (wordMatch) {
    const month = getMonthNumber(wordMatch[1]);
    const day = Number(wordMatch[2]);
    const year = Number(wordMatch[3] || new Date().getFullYear());
    return normalizeDateParts(year, month, day);
  }

  return "";
}

function normalizeDateParts(year: number, month: number, day: number) {
  const candidate = new Date(Date.UTC(year, month - 1, day));
  const isValid =
    candidate.getUTCFullYear() === year &&
    candidate.getUTCMonth() === month - 1 &&
    candidate.getUTCDate() === day;

  if (!isValid) {
    return "";
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getMonthNumber(value: string) {
  const normalized = value.slice(0, 3).toLowerCase();
  const monthMap: Record<string, number> = {
    jan: 1,
    feb: 2,
    mar: 3,
    apr: 4,
    may: 5,
    jun: 6,
    jul: 7,
    aug: 8,
    sep: 9,
    oct: 10,
    nov: 11,
    dec: 12
  };

  return monthMap[normalized] || 0;
}

function getSource(input: string): LeadSource {
  if (/zillow/i.test(input)) {
    return "Zillow";
  }

  if (/facebook/i.test(input)) {
    return "Facebook";
  }

  if (/phone/i.test(input)) {
    return "phone inquiry";
  }

  return "Zillow";
}

function getFallbackMessage(input: string, lines: string[]) {
  const unlabeledLines = lines.filter(
    (line) =>
      !/^(name|full name|from|email|phone|property|address|listing|interested in|move.?in|desired move.?in|source)\s*[:\-]/i.test(
        line
      )
  );

  return normalizeLine((unlabeledLines.join(" ") || input).slice(0, 900));
}

export function parseLeadInquiryText(input: string): ParsedLeadImport {
  const trimmedInput = input.trim();
  const lines = getLines(trimmedInput);
  const email = emailPattern.exec(trimmedInput)?.[0] || "";
  const phone = phonePattern.exec(trimmedInput)?.[0] || "";
  const fullName = getNameValue(lines, email);
  const labeledProperty = getLabeledValue(lines, [
    "Property",
    "Property Address",
    "Address",
    "Listing",
    "Interested in"
  ]);
  const looseAddress = lines.map((line) => addressPattern.exec(line)?.[0] || "").find(Boolean) || "";
  const propertyAddress = labeledProperty || looseAddress;
  const moveInValue = getLabeledValue(lines, [
    "Desired move-in date",
    "Desired move in date",
    "Move-in date",
    "Move in date",
    "Move-in",
    "Move in"
  ]);
  const desiredMoveInDate = parseDateCandidate(moveInValue || trimmedInput);
  const message = getMessageValue(lines) || getFallbackMessage(trimmedInput, lines);
  const source = getSource(trimmedInput);
  const confidenceNotes = [
    email ? "Found an email address." : "Email was not found.",
    phone ? "Found a phone number." : "Phone number was not found.",
    propertyAddress ? "Found a property address candidate." : "Review the address before saving.",
    desiredMoveInDate ? "Found a desired move-in date." : "Desired move-in date was not found."
  ];

  return {
    fullName,
    phone,
    email,
    propertyAddress,
    message,
    desiredMoveInDate,
    source,
    confidenceNotes
  };
}

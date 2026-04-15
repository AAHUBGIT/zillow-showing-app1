export function formatDateLabel(dateString: string) {
  if (!dateString) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${dateString}T00:00:00`));
}

export function formatDateTimeLabel(dateString: string, timeString: string) {
  if (!dateString || !timeString) {
    return "Not scheduled";
  }

  const date = new Date(`${dateString}T${timeString}`);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

export function sortDateAndTime(
  firstDate: string,
  firstTime: string,
  secondDate: string,
  secondTime: string
) {
  const first = new Date(`${firstDate}T${firstTime}`).getTime();
  const second = new Date(`${secondDate}T${secondTime}`).getTime();
  return first - second;
}

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

export function formatDateForManualEntry(dateString: string) {
  if (!dateString) {
    return "";
  }

  const [year, month, day] = dateString.split("-");
  if (!year || !month || !day) {
    return "";
  }

  return `${month}/${day}/${year}`;
}

export function parseManualDateInput(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) {
    return null;
  }

  const month = Number(match[1]);
  const day = Number(match[2]);
  const year = Number(match[3]);

  const candidate = new Date(Date.UTC(year, month - 1, day));
  const isValidDate =
    candidate.getUTCFullYear() === year &&
    candidate.getUTCMonth() === month - 1 &&
    candidate.getUTCDate() === day;

  if (!isValidDate) {
    return null;
  }

  return `${year}-${padDatePart(month)}-${padDatePart(day)}`;
}

export function formatTimeForManualEntry(timeString: string) {
  if (!timeString) {
    return "";
  }

  const [hoursText, minutes] = timeString.split(":");
  if (!hoursText || !minutes) {
    return "";
  }

  const hours = Number(hoursText);
  if (Number.isNaN(hours)) {
    return "";
  }

  const meridiem = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  return `${displayHours}:${minutes} ${meridiem}`;
}

export function parseManualTimeInput(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])$/);
  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3].toUpperCase();

  if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
    return null;
  }

  const normalizedHours =
    meridiem === "PM" ? (hours === 12 ? 12 : hours + 12) : hours === 12 ? 0 : hours;

  return `${padDatePart(normalizedHours)}:${padDatePart(minutes)}`;
}

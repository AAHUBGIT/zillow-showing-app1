export function formatDateLabel(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${dateString}T00:00:00`));
}

export function formatDateTimeLabel(dateString: string, timeString: string) {
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

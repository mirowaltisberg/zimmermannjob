const swissDateFormatter = new Intl.DateTimeFormat("de-CH", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

const swissDateTimeFormatter = new Intl.DateTimeFormat("de-CH", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Zurich",
});

export function formatSwissDate(value: string): string {
  const parsed = Date.parse(`${value}T12:00:00.000Z`);
  return Number.isFinite(parsed) ? swissDateFormatter.format(new Date(parsed)) : "unbekannt";
}

export function formatSwissDateTime(value: string): string {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? swissDateTimeFormatter.format(new Date(parsed)) : "unbekannt";
}

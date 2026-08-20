export const PUBLIC_JOB_MAX_AGE_DAYS = 35;
export const PUBLIC_JOB_MAX_FUTURE_DAYS = 1;

export type PublicJobDateError = "invalid-date" | "stale-date" | "future-date";

const DAY_MS = 86_400_000;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function utcDayMs(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function parseIsoDateMs(value: unknown): number | null {
  if (typeof value !== "string" || !ISO_DATE_PATTERN.test(value)) return null;

  const parsed = Date.parse(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(parsed)) return null;

  return new Date(parsed).toISOString().slice(0, 10) === value ? parsed : null;
}

export function getPublicJobDateBounds(now = new Date()): {
  minDate: string;
  maxDate: string;
} {
  const todayMs = utcDayMs(now);
  return {
    minDate: new Date(todayMs - PUBLIC_JOB_MAX_AGE_DAYS * DAY_MS).toISOString().slice(0, 10),
    maxDate: new Date(todayMs + PUBLIC_JOB_MAX_FUTURE_DAYS * DAY_MS).toISOString().slice(0, 10),
  };
}

export function validatePublicJobDate(
  value: unknown,
  now = new Date(),
): PublicJobDateError | null {
  const postedMs = parseIsoDateMs(value);
  if (postedMs === null) return "invalid-date";

  const todayMs = utcDayMs(now);
  if (postedMs < todayMs - PUBLIC_JOB_MAX_AGE_DAYS * DAY_MS) return "stale-date";
  if (postedMs > todayMs + PUBLIC_JOB_MAX_FUTURE_DAYS * DAY_MS) return "future-date";
  return null;
}

export function isPublicJobNew(value: unknown, now = new Date()): boolean {
  const postedMs = parseIsoDateMs(value);
  if (postedMs === null || validatePublicJobDate(value, now)) return false;

  const ageDays = (utcDayMs(now) - postedMs) / DAY_MS;
  return ageDays >= -PUBLIC_JOB_MAX_FUTURE_DAYS && ageDays <= 3;
}

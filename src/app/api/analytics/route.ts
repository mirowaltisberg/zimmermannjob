import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE = "zimmermannjob.ch";
const MAX_BODY_BYTES = 16_384;
const MAX_EVENTS_PER_WINDOW = 180;
const RATE_WINDOW_MS = 5 * 60_000;

const EVENT_FIELDS: Record<string, ReadonlySet<string>> = {
  apply_click: new Set(["job_id", "destination"]),
  application_error: new Set(["job_id", "error_kind"]),
  application_file_selected: new Set(["job_id", "file_size_bucket"]),
  application_open: new Set(["job_id"]),
  application_submit: new Set(["job_id"]),
  application_success: new Set(["job_id"]),
  click: new Set(["target_kind", "action", "destination"]),
  details_toggle: new Set(["action", "open"]),
  direct_hire_contact: new Set(["profile_id"]),
  engagement: new Set(["seconds", "visibility"]),
  filter_reset: new Set(),
  filter_usage: new Set([
    "has_type_filter",
    "has_workload_filter",
    "remote",
    "posted_within_days",
    "radius_km",
    "sort",
  ]),
  form_submit: new Set(["form"]),
  job_open: new Set(["job_id", "position"]),
  job_view: new Set(["job_id"]),
  page_exit: new Set(["seconds", "max_scroll"]),
  page_view: new Set(["navigation"]),
  recent_job_open: new Set(["job_id"]),
  scroll_depth: new Set(["percent"]),
  search_submit: new Set([
    "has_query",
    "query_length_bucket",
    "has_location",
    "location_kind",
    "radius_km",
  ]),
  session_start: new Set([
    "viewport_width",
    "viewport_height",
    "device",
    "language",
    "dnt",
  ]),
  share_copy_link: new Set(["job_id"]),
  share_whatsapp: new Set(["job_id"]),
};

interface AnalyticsBody {
  sessionId?: unknown;
  sequence?: unknown;
  eventName?: unknown;
  path?: unknown;
  referrerHost?: unknown;
  properties?: unknown;
  occurredAt?: unknown;
  consentVersion?: unknown;
}

interface RateEntry {
  startedAt: number;
  count: number;
}

const rateState = new Map<string, RateEntry>();

function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[47][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
}

function isSafePath(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.startsWith("/") &&
    value.length <= 300 &&
    !/[?#\u0000-\u001f\u007f]/u.test(value)
  );
}

function isSafeHost(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= 180 &&
    /^(?:[a-z0-9-]+\.)*[a-z0-9-]+(?::\d{1,5})?$/i.test(value)
  );
}

function isSafePropertyValue(value: unknown): boolean {
  if (typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value) && Math.abs(value) <= 1_000_000;
  return (
    typeof value === "string" &&
    value.length <= 120 &&
    !/[\u0000-\u001f\u007f]/u.test(value)
  );
}

function validateProperties(
  eventName: string,
  value: unknown,
): Record<string, string | number | boolean> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const allowed = EVENT_FIELDS[eventName];
  if (!allowed) return null;

  const properties: Record<string, string | number | boolean> = {};
  for (const [key, nested] of Object.entries(value)) {
    if (!allowed.has(key) || !isSafePropertyValue(nested)) return null;
    properties[key] = nested;
  }
  return properties;
}

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const originHost = new URL(origin).host;
    const requestHost =
      request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    return Boolean(requestHost) && originHost === requestHost;
  } catch {
    return false;
  }
}

function acceptRate(sessionId: string): boolean {
  const now = Date.now();
  const current = rateState.get(sessionId);
  if (!current || now - current.startedAt >= RATE_WINDOW_MS) {
    rateState.set(sessionId, { startedAt: now, count: 1 });
    return true;
  }
  if (current.count >= MAX_EVENTS_PER_WINDOW) return false;
  current.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Ungültige Herkunft." }, { status: 403 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Anfrage zu gross." }, { status: 413 });
  }

  let body: AnalyticsBody;
  try {
    body = (await request.json()) as AnalyticsBody;
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  if (
    !isUuid(body.sessionId) ||
    typeof body.sequence !== "number" ||
    !Number.isInteger(body.sequence) ||
    (body.sequence as number) < 0 ||
    (body.sequence as number) > 1_000_000 ||
    typeof body.eventName !== "string" ||
    !EVENT_FIELDS[body.eventName] ||
    !isSafePath(body.path) ||
    body.consentVersion !== "analytics-v1"
  ) {
    return NextResponse.json({ error: "Ungültiges Ereignis." }, { status: 400 });
  }

  const properties = validateProperties(body.eventName, body.properties);
  if (!properties) {
    return NextResponse.json({ error: "Ungültige Eigenschaften." }, { status: 400 });
  }

  const occurredAt = typeof body.occurredAt === "string" ? new Date(body.occurredAt) : null;
  const occurredMs = occurredAt?.getTime() ?? Number.NaN;
  const now = Date.now();
  if (
    !Number.isFinite(occurredMs) ||
    occurredMs < now - 24 * 60 * 60_000 ||
    occurredMs > now + 5 * 60_000
  ) {
    return NextResponse.json({ error: "Ungültiger Zeitpunkt." }, { status: 400 });
  }

  const referrerHost =
    body.referrerHost === null || body.referrerHost === ""
      ? null
      : isSafeHost(body.referrerHost)
        ? body.referrerHost
        : null;

  if (!acceptRate(body.sessionId)) {
    return NextResponse.json({ accepted: false }, { status: 429 });
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("site_analytics_events").insert({
      site: SITE,
      session_id: body.sessionId,
      sequence: body.sequence,
      event_name: body.eventName,
      path: body.path,
      referrer_host: referrerHost,
      properties,
      occurred_at: occurredAt!.toISOString(),
      consent_version: "analytics-v1",
    });

    if (error && error.code !== "23505") {
      return NextResponse.json({ accepted: false }, { status: 503 });
    }
  } catch {
    return NextResponse.json({ accepted: false }, { status: 503 });
  }

  return NextResponse.json(
    { accepted: true },
    {
      status: 202,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

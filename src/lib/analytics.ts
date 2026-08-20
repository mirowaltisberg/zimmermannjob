"use client";

import { assertNoForbiddenPublicFields } from "@/lib/public-job-boundary";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

const ALLOWED_ANALYTICS_FIELDS: Record<string, ReadonlySet<string>> = {
  apply_click: new Set(["job_id", "destination"]),
  filter_reset: new Set(),
  filter_usage: new Set([
    "has_type_filter",
    "has_workload_filter",
    "remote",
    "posted_within_days",
    "radius_km",
    "sort",
  ]),
  job_open: new Set(["job_id", "position"]),
  job_view: new Set(["job_id"]),
  recent_job_open: new Set(["job_id"]),
  search_submit: new Set([
    "has_query",
    "query_length_bucket",
    "has_location",
    "location_kind",
    "radius_km",
  ]),
  share_copy_link: new Set(["job_id"]),
  share_whatsapp: new Set(["job_id"]),
};

export function trackEvent(eventName: string, payload: Record<string, unknown> = {}) {
  if (typeof window === "undefined") {
    return;
  }

  const allowedFields = ALLOWED_ANALYTICS_FIELDS[eventName] ?? new Set<string>();
  for (const field of Object.keys(payload)) {
    if (!allowedFields.has(field)) {
      throw new Error(`Analytics event ${eventName} contains an unreviewed field`);
    }
  }
  assertNoForbiddenPublicFields(payload, `analytics event ${eventName}`);
  const eventPayload = { event: eventName, ...payload };
  window.dataLayer?.push(eventPayload);
  window.gtag?.("event", eventName, payload);
}

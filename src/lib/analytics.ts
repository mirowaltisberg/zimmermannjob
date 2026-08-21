"use client";

import { assertNoForbiddenPublicFields } from "@/lib/public-job-boundary";

const ALLOWED_ANALYTICS_FIELDS: Record<string, ReadonlySet<string>> = {
  apply_click: new Set(["job_id", "destination"]),
  application_error: new Set(["job_id", "error_kind"]),
  application_file_selected: new Set(["job_id", "file_size_bucket"]),
  application_open: new Set(["job_id"]),
  application_submit: new Set(["job_id"]),
  application_success: new Set(["job_id"]),
  direct_hire_contact: new Set(["profile_id"]),
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
  if (window.localStorage.getItem("jobsite-analytics-consent") !== "accepted") {
    return;
  }
  window.dispatchEvent(
    new CustomEvent("jobsite:analytics", {
      detail: { eventName, payload },
    }),
  );
}

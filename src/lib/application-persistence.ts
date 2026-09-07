import { createHash, createHmac } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function isSubmissionId(value: string): boolean { return UUID.test(value); }

/** The existing application primary key makes identical concurrent retries atomic. */
export function applicationIdentity(secret: string, site: string, submissionId: string, fields: string[], bytes: Uint8Array): string {
  const digest = createHmac("sha256", secret)
    .update(JSON.stringify(["application-v1", site, submissionId, fields, createHash("sha256").update(bytes).digest("hex")]))
    .digest();
  digest[6] = (digest[6] & 0x0f) | 0x40;
  digest[8] = (digest[8] & 0x3f) | 0x80;
  const hex = digest.subarray(0, 16).toString("hex");
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}

export type ApplicationAnalytics = { sessionId: string; sequence: number; consentVersion: "analytics-v1"; synthetic: boolean };
export function parseApplicationAnalytics(value: string): ApplicationAnalytics | null {
  try {
    if (value.length > 512) return null;
    const data = JSON.parse(value);
    if (!data || !UUID.test(data.sessionId) || data.consentVersion !== "analytics-v1" ||
      !Number.isInteger(data.sequence) || data.sequence < 1 || data.sequence > 1_000_000 || typeof data.synthetic !== "boolean") return null;
    return { sessionId: data.sessionId, sequence: data.sequence, consentVersion: data.consentVersion, synthetic: data.synthetic };
  } catch { return null; }
}

export async function recordApplicationSaved(admin: SupabaseClient, context: ApplicationAnalytics | null, site: string, jobId: string, conversionId: string, synthetic: boolean): Promise<void> {
  if (!context) return;
  try {
    const { error } = await admin.from("site_analytics_events").insert({
      site, session_id: context.sessionId, sequence: context.sequence,
      event_name: "application_saved", path: `/jobs/${jobId}`,
      properties: { job_id: jobId, conversion_id: conversionId, synthetic: synthetic || context.synthetic },
      occurred_at: new Date().toISOString(), consent_version: context.consentVersion,
    });
    if (error && error.code !== "23505") console.error("[applications] saved_step_measurement_failed");
  } catch { console.error("[applications] saved_step_measurement_failed"); }
}

/** Resolve an ambiguous insert before deciding whether an uploaded CV is orphaned. */
export async function resolveApplicationInsert(admin: SupabaseClient, bucket: string, path: string | null, id: string): Promise<{ saved: boolean; unknown: boolean; cleanupFailed: boolean }> {
  const { data, error } = await admin.from("applications").select("id,cv_path").eq("id", id).maybeSingle();
  if (error) return { saved: false, unknown: true, cleanupFailed: false };
  if (data?.cv_path === path && data) return { saved: true, unknown: false, cleanupFailed: false };
  const { error: cleanupError } = path ? await admin.storage.from(bucket).remove([path]) : { error: null };
  return { saved: Boolean(data), unknown: false, cleanupFailed: Boolean(cleanupError) };
}

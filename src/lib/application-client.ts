"use client";

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Explicit test metadata survives navigation, and storage failure does not block applying. */
function readTestValue(parameter: string, key: string, valid: (value: string) => boolean): string | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get(parameter);
  if (value && valid(value)) {
    try { window.sessionStorage.setItem(key, value); } catch { /* Read URL without storage. */ }
    return value;
  }
  try { const stored = window.sessionStorage.getItem(key); return stored && valid(stored) ? stored : null; }
  catch { return null; }
}

export function getTestRunId(): string | null {
  return readTestValue("cro_test", "jobsite-cro-test", (value) => UUID.test(value));
}

export function getTestRunToken(): string | null {
  return readTestValue("cro_token", "jobsite-cro-token", (value) => /^\d{10}\.[A-Za-z0-9_-]{43}$/.test(value));
}

export function isSyntheticVisit(): boolean {
  return Boolean(getTestRunId()) ||
    (typeof navigator !== "undefined" && navigator.webdriver === true) ||
    (typeof window !== "undefined" && /^(localhost|127\.0\.0\.1)$|\.vercel\.app$/.test(window.location.hostname));
}

/** Reserved before submit; the server records this step only after a confirmed save. */
export function getApplicationAnalytics(): string {
  try {
    if (window.localStorage.getItem("jobsite-analytics-consent") !== "accepted") return "";
    let sessionId = window.sessionStorage.getItem("jobsite-analytics-session");
    if (!sessionId || !UUID.test(sessionId)) {
      sessionId = crypto.randomUUID();
      window.sessionStorage.setItem("jobsite-analytics-session", sessionId);
    }
    const sequence = Number(window.sessionStorage.getItem("jobsite-analytics-sequence") || 0) + 1;
    if (!Number.isSafeInteger(sequence) || sequence < 1 || sequence > 1_000_000) return "";
    window.sessionStorage.setItem("jobsite-analytics-sequence", String(sequence));
    return JSON.stringify({ sessionId, sequence, consentVersion: "analytics-v1", synthetic: isSyntheticVisit() });
  } catch { return ""; }
}

export async function readSavedApplication(response: Response): Promise<{ conversionId: string; synthetic: boolean }> {
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data && typeof data === "object" && "error" in data && typeof data.error === "string" ? data.error : "Speichern derzeit nicht möglich. Bitte versuche es erneut.";
    throw new Error(message);
  }
  if (!data || typeof data !== "object" || !("success" in data) || data.success !== true ||
    !("conversionId" in data) || typeof data.conversionId !== "string" || !UUID.test(data.conversionId)) {
    throw new Error("Die Speicherung konnte nicht bestätigt werden. Deine Angaben bleiben erhalten. Bitte sende sie erneut ab.");
  }
  return { conversionId: data.conversionId, synthetic: "synthetic" in data && data.synthetic === true };
}

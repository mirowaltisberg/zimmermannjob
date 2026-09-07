"use client";

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** An explicit test run survives navigation within this tab, without applicant data. */
export function getTestRunId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("cro_test");
    if (fromUrl && UUID.test(fromUrl)) {
      window.sessionStorage.setItem("jobsite-cro-test", fromUrl);
      return fromUrl;
    }
    const stored = window.sessionStorage.getItem("jobsite-cro-test");
    return stored && UUID.test(stored) ? stored : null;
  } catch { return null; }
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

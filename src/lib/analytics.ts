"use client";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(eventName: string, payload: Record<string, unknown> = {}) {
  if (typeof window === "undefined") {
    return;
  }

  const eventPayload = { event: eventName, ...payload };
  window.dataLayer?.push(eventPayload);
  window.gtag?.("event", eventName, payload);
}

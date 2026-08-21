"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

const CONSENT_KEY = "jobsite-analytics-consent";
const SESSION_KEY = "jobsite-analytics-session";
const SEQUENCE_KEY = "jobsite-analytics-sequence";
const STARTED_KEY = "jobsite-analytics-started";
const CONSENT_VERSION = "analytics-v1";
const CONSENT_EVENT = "jobsite:consent-change";

type ConsentChoice = "accepted" | "declined" | null;
type EventProperties = Record<string, string | number | boolean>;

function readConsentChoice(): ConsentChoice {
  const stored = window.localStorage.getItem(CONSENT_KEY);
  return stored === "accepted" || stored === "declined" ? stored : null;
}

function subscribeToConsent(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === CONSENT_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CONSENT_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CONSENT_EVENT, onChange);
  };
}

function getSessionId(): string {
  const existing = window.sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const created = crypto.randomUUID();
  window.sessionStorage.setItem(SESSION_KEY, created);
  return created;
}

function nextSequence(): number {
  const current = Number(window.sessionStorage.getItem(SEQUENCE_KEY) ?? "0");
  const sequence = Number.isSafeInteger(current) && current >= 0 ? current + 1 : 1;
  window.sessionStorage.setItem(SEQUENCE_KEY, String(sequence));
  return sequence;
}

function getReferrerHost(): string | null {
  if (!document.referrer) return null;
  try {
    return new URL(document.referrer).host.slice(0, 180) || null;
  } catch {
    return null;
  }
}

function classifyDestination(anchor: HTMLAnchorElement | null): {
  action: string;
  destination: string;
} {
  if (!anchor) return { action: "control", destination: "none" };
  const rawHref = anchor.getAttribute("href") ?? "";
  if (rawHref.startsWith("mailto:")) return { action: "email", destination: "mailto" };
  if (rawHref.startsWith("tel:")) return { action: "phone", destination: "tel" };

  try {
    const url = new URL(anchor.href, window.location.href);
    if (url.origin !== window.location.origin) {
      return { action: "external_link", destination: url.host.slice(0, 120) };
    }
    const path = url.pathname.slice(0, 120);
    if (path.startsWith("/jobs/")) return { action: "job_detail", destination: path };
    if (path === "/kontakt") return { action: "contact", destination: path };
    if (path.includes("/lohn-")) return { action: "salary_guide", destination: path };
    if (path.includes("-ausbildung")) return { action: "training_guide", destination: path };
    return { action: "internal_link", destination: path || "/" };
  } catch {
    return { action: "link", destination: "invalid" };
  }
}

export function PrivacyAnalytics() {
  const pathname = usePathname();
  const consent = useSyncExternalStore(
    subscribeToConsent,
    readConsentChoice,
    () => null,
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const pageStartedAt = useRef<number | null>(null);
  const currentPath = useRef<string | null>(null);
  const maxScroll = useRef(0);
  const sentMilestones = useRef(new Set<number>());

  const sendEvent = useCallback(
    (
      eventName: string,
      properties: EventProperties = {},
      options: { keepalive?: boolean; path?: string } = {},
    ) => {
      if (window.localStorage.getItem(CONSENT_KEY) !== "accepted") return;
      const payload = {
        sessionId: getSessionId(),
        sequence: nextSequence(),
        eventName,
        path: options.path ?? (window.location.pathname.slice(0, 300) || "/"),
        referrerHost: getReferrerHost(),
        properties,
        occurredAt: new Date().toISOString(),
        consentVersion: CONSENT_VERSION,
      };
      void fetch("/api/analytics", {
        method: "POST",
        credentials: "same-origin",
        keepalive: options.keepalive,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      }).catch(() => undefined);
    },
    [],
  );

  useEffect(() => {
    if (consent !== "accepted") return;

    const onCustomEvent = (event: Event) => {
      const detail = (event as CustomEvent<{
        eventName?: unknown;
        payload?: unknown;
      }>).detail;
      if (
        typeof detail?.eventName === "string" &&
        detail.payload &&
        typeof detail.payload === "object" &&
        !Array.isArray(detail.payload)
      ) {
        sendEvent(detail.eventName, detail.payload as EventProperties);
      }
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const interactive = target?.closest("a,button,summary");
      if (!interactive) return;
      const anchor = interactive instanceof HTMLAnchorElement
        ? interactive
        : interactive.closest("a");
      const destination = classifyDestination(anchor);
      sendEvent("click", {
        target_kind: interactive.tagName.toLowerCase(),
        action:
          interactive.getAttribute("data-analytics-action") ??
          destination.action,
        destination: destination.destination,
      });
    };

    const onSubmit = (event: SubmitEvent) => {
      const form = event.target instanceof HTMLFormElement ? event.target : null;
      if (!form) return;
      let formName = form.id || "form";
      try {
        formName = new URL(form.action, window.location.href).pathname || formName;
      } catch {
        // Keep the controlled form ID.
      }
      sendEvent("form_submit", { form: formName.slice(0, 120) });
    };

    const onToggle = (event: Event) => {
      const details = event.target instanceof HTMLDetailsElement ? event.target : null;
      if (!details) return;
      sendEvent("details_toggle", {
        action: details.getAttribute("data-analytics-action") ?? "details",
        open: details.open,
      });
    };

    const onScroll = () => {
      const available = document.documentElement.scrollHeight - window.innerHeight;
      const percent = available <= 0
        ? 100
        : Math.min(100, Math.max(0, Math.round((window.scrollY / available) * 100)));
      maxScroll.current = Math.max(maxScroll.current, percent);
      for (const milestone of [25, 50, 75, 100]) {
        if (percent >= milestone && !sentMilestones.current.has(milestone)) {
          sentMilestones.current.add(milestone);
          sendEvent("scroll_depth", { percent: milestone });
        }
      }
    };

    const onPageExit = () => {
      if (pageStartedAt.current === null) return;
      sendEvent(
        "page_exit",
        {
          seconds: Math.min(86_400, Math.max(0, Math.round((Date.now() - pageStartedAt.current) / 1000))),
          max_scroll: maxScroll.current,
        },
        {
          keepalive: true,
          ...(currentPath.current ? { path: currentPath.current } : {}),
        },
      );
    };

    window.addEventListener("jobsite:analytics", onCustomEvent);
    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    document.addEventListener("toggle", onToggle, true);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", onPageExit);

    const engagementTimer = window.setInterval(() => {
      if (document.visibilityState === "visible" && pageStartedAt.current !== null) {
        sendEvent("engagement", {
          seconds: Math.min(86_400, Math.round((Date.now() - pageStartedAt.current) / 1000)),
          visibility: "visible",
        });
      }
    }, 30_000);

    if (window.sessionStorage.getItem(STARTED_KEY) !== "yes") {
      window.sessionStorage.setItem(STARTED_KEY, "yes");
      sendEvent("session_start", {
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
        device: window.innerWidth < 768 ? "mobile" : window.innerWidth < 1024 ? "tablet" : "desktop",
        language: (navigator.language || "unknown").slice(0, 20),
        dnt: navigator.doNotTrack === "1",
      });
    }

    return () => {
      window.removeEventListener("jobsite:analytics", onCustomEvent);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
      document.removeEventListener("toggle", onToggle, true);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", onPageExit);
      window.clearInterval(engagementTimer);
    };
  }, [consent, sendEvent]);

  useEffect(() => {
    if (consent !== "accepted") return;
    const now = Date.now();
    if (pageStartedAt.current !== null && currentPath.current) {
      sendEvent(
        "page_exit",
        {
          seconds: Math.min(
            86_400,
            Math.max(0, Math.round((now - pageStartedAt.current) / 1000)),
          ),
          max_scroll: maxScroll.current,
        },
        { keepalive: true, path: currentPath.current },
      );
    }
    pageStartedAt.current = now;
    currentPath.current = window.location.pathname.slice(0, 300) || "/";
    maxScroll.current = 0;
    sentMilestones.current = new Set();
    sendEvent("page_view", { navigation: "app_router" });
  }, [consent, pathname, sendEvent]);

  const choose = (choice: Exclude<ConsentChoice, null>) => {
    window.localStorage.setItem(CONSENT_KEY, choice);
    if (choice === "declined") {
      window.sessionStorage.removeItem(SESSION_KEY);
      window.sessionStorage.removeItem(SEQUENCE_KEY);
      window.sessionStorage.removeItem(STARTED_KEY);
    }
    window.dispatchEvent(new Event(CONSENT_EVENT));
    setSettingsOpen(false);
  };

  const showDialog = consent === null || settingsOpen;

  return showDialog ? (
    <aside
      className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-3xl border border-border bg-background p-4 shadow-2xl sm:inset-x-6 sm:p-5"
      role="dialog"
      aria-modal="false"
      aria-labelledby="analytics-consent-title"
    >
      <h2 id="analytics-consent-title" className="text-base font-bold text-foreground">
        Anonyme Nutzungsanalyse
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Mit deiner Zustimmung erfassen wir Seitenaufrufe, Klicks, Filter,
        Scrolltiefe, Verweildauer und Bewerbungsschritte. Namen, Kontaktdaten,
        Lebensläufe, Eingaben und Suchbegriffe werden nicht analysiert.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          type="button"
          className="inline-flex min-h-11 items-center justify-center bg-primary px-5 font-semibold text-primary-foreground"
          onClick={() => choose("accepted")}
        >
          Analyse erlauben
        </button>
        <button
          type="button"
          className="inline-flex min-h-11 items-center justify-center border border-border px-5 font-semibold text-foreground"
          onClick={() => choose("declined")}
        >
          Nur notwendige Funktionen
        </button>
        <a className="px-2 py-2 text-sm underline" href="/datenschutz">
          Details zum Datenschutz
        </a>
      </div>
    </aside>
  ) : (
    <button
      type="button"
      className="fixed bottom-2 left-2 z-40 border border-border bg-background/95 px-3 py-2 text-xs font-medium text-foreground shadow-sm"
      onClick={() => setSettingsOpen(true)}
    >
      Tracking-Einstellungen
    </button>
  );
}

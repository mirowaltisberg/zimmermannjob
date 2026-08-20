"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Copy, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { useHaptic } from "@/hooks/use-haptic";

const ApplyModal = dynamic(
  () => import("@/components/apply-modal").then((m) => m.ApplyModal),
  {
    ssr: false,
    loading: () => (
      <Button className="w-full h-12 text-base sm:text-lg font-bold shadow-lg shadow-primary/20 rounded-xl btn-interactive" disabled>
        Bewerbungsfunktion wird geladen
      </Button>
    ),
  }
);

const RECENT_KEY = "zimmermannjob:recent-jobs:v3";
const SOURCE_BEARING_RECENT_KEYS = [
  "zimmermannjob:recent-jobs",
  "zimmermannjob:recent-jobs:v2",
];

interface RecentJobEntry {
  id: string;
  title: string;
  location: string;
  href: string;
  viewedAt: string;
}

function toRecentJobEntry(value: unknown): RecentJobEntry | null {
  if (!value || typeof value !== "object") return null;
  const entry = value as Record<string, unknown>;
  if (
    typeof entry.id !== "string" ||
    typeof entry.title !== "string" ||
    typeof entry.location !== "string" ||
    typeof entry.href !== "string" ||
    typeof entry.viewedAt !== "string"
  ) {
    return null;
  }

  return {
    id: entry.id,
    title: entry.title,
    location: entry.location,
    href: entry.href,
    viewedAt: entry.viewedAt,
  };
}

function readRecentJobs(): RecentJobEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    SOURCE_BEARING_RECENT_KEYS.forEach((key) => window.localStorage.removeItem(key));
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.map(toRecentJobEntry).filter((entry): entry is RecentJobEntry => entry !== null)
      : [];
  } catch {
    return [];
  }
}

interface JobPrimaryActionProps {
  jobId: string;
  jobTitle: string;
  applicationsAvailable: boolean;
}

export function JobPrimaryAction({
  jobId,
  jobTitle,
  applicationsAvailable,
}: JobPrimaryActionProps) {
  if (!applicationsAvailable) {
    return (
      <div className="space-y-2 text-center">
        <Button className="w-full h-12 rounded-xl font-bold" disabled>
          Online-Bewerbung nicht verfügbar
        </Button>
        <p className="text-xs text-slate-600">
          Derzeit werden über diese Website keine Bewerbungen entgegengenommen. Details stehen unter{" "}
          <Link href="/datenschutz" className="underline font-medium">
            Datenschutz
          </Link>.
        </p>
      </div>
    );
  }

  return (
    <ApplyModal
      jobId={jobId}
      jobTitle={jobTitle}
      onOpen={() =>
        trackEvent("apply_click", {
          job_id: jobId,
          destination: "modal",
        })
      }
    />
  );
}

interface JobShareActionsProps {
  jobId: string;
  jobTitle: string;
}

export function JobShareActions({ jobId, jobTitle }: JobShareActionsProps) {
  const { trigger } = useHaptic();
  const [isCopied, setIsCopied] = useState(false);

  const handleWhatsapp = () => {
    const pageUrl = window.location.href;
    const text = `Interessanter Job: ${jobTitle} - ${pageUrl}`;
    const whatsappHref = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappHref, "_blank", "noopener,noreferrer");
    trackEvent("share_whatsapp", { job_id: jobId });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.href);
    trigger("success");
    setIsCopied(true);
    trackEvent("share_copy_link", { job_id: jobId });
    window.setTimeout(() => setIsCopied(false), 1400);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 rounded-lg"
        onClick={handleWhatsapp}
      >
        <MessageCircle className="h-4 w-4 mr-1" />
        WhatsApp
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 rounded-lg"
        onClick={handleCopy}
      >
        <Copy className="h-4 w-4 mr-1" />
        {isCopied ? "Kopiert" : "Link kopieren"}
      </Button>
    </div>
  );
}

interface RecentlyViewedJobsProps {
  jobId: string;
  jobTitle: string;
  location: string;
  currentHref: string;
}

export function RecentlyViewedJobs({
  jobId,
  jobTitle,
  location,
  currentHref,
}: RecentlyViewedJobsProps) {
  const [recentJobs, setRecentJobs] = useState<RecentJobEntry[]>([]);

  useEffect(() => {
    SOURCE_BEARING_RECENT_KEYS.forEach((key) => window.localStorage.removeItem(key));

    const previousEntries = readRecentJobs().filter((entry) => entry.id !== jobId);
    const updateId = window.setTimeout(() => setRecentJobs(previousEntries.slice(0, 3)), 0);

    const currentEntry: RecentJobEntry = {
      id: jobId,
      title: jobTitle,
      location,
      href: currentHref,
      viewedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(
      RECENT_KEY,
      JSON.stringify([currentEntry, ...previousEntries].slice(0, 6))
    );
    trackEvent("job_view", { job_id: jobId });
    return () => window.clearTimeout(updateId);
  }, [currentHref, jobId, jobTitle, location]);

  if (recentJobs.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
      <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3">Zuletzt angesehen</h2>
      <ul className="space-y-2">
        {recentJobs.map((entry) => (
          <li key={entry.id}>
            <Link
              href={entry.href}
              className="block rounded-lg border border-slate-200 px-3 py-2 hover:border-primary/40 hover:bg-primary/5 transition-colors"
              onClick={() =>
                trackEvent("recent_job_open", {
                  job_id: entry.id,
                })
              }
            >
              <p className="text-sm font-semibold text-slate-900 line-clamp-1">{entry.title}</p>
              <p className="text-xs text-slate-500 line-clamp-1">{entry.location}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

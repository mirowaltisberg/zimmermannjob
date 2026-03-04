"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Copy, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApplyModal } from "@/components/apply-modal";
import type { JobListing } from "@/lib/job-types";
import { trackEvent } from "@/lib/analytics";
import { useHaptic } from "@/hooks/use-haptic";

const RECENT_KEY = "zimmermannjob:recent-jobs";

interface RecentJobEntry {
  id: string;
  title: string;
  company: string;
  location: string;
  href: string;
  source: string;
  viewedAt: string;
}

function readRecentJobs(): RecentJobEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as RecentJobEntry[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch {
    return [];
  }
}

interface JobPrimaryActionProps {
  job: JobListing;
}

export function JobPrimaryAction({ job }: JobPrimaryActionProps) {
  return (
    <ApplyModal
      jobId={job.id}
      jobTitle={job.title}
      company={job.company}
      onOpen={() =>
        trackEvent("apply_click", {
          job_id: job.id,
          source: job.source,
          destination: "modal",
        })
      }
    />
  );
}

interface JobShareActionsProps {
  job: JobListing;
}

export function JobShareActions({ job }: JobShareActionsProps) {
  const { trigger } = useHaptic();
  const [isCopied, setIsCopied] = useState(false);
  const pageUrl = typeof window === "undefined" ? "" : window.location.href;

  const whatsappHref = useMemo(() => {
    if (!pageUrl) {
      return "#";
    }

    const text = `Interessanter Job: ${job.title} bei ${job.company} - ${pageUrl}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }, [job.company, job.title, pageUrl]);

  const handleCopy = async () => {
    if (!pageUrl) {
      return;
    }

    await navigator.clipboard.writeText(pageUrl);
    trigger("success");
    setIsCopied(true);
    trackEvent("share_copy_link", { job_id: job.id, source: job.source });
    window.setTimeout(() => setIsCopied(false), 1400);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        asChild
        variant="outline"
        size="sm"
        className="h-9 rounded-lg"
      >
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("share_whatsapp", { job_id: job.id, source: job.source })}
        >
          <MessageCircle className="h-4 w-4 mr-1" />
          WhatsApp
        </a>
      </Button>
      <Button type="button" variant="outline" size="sm" className="h-9 rounded-lg" onClick={handleCopy}>
        <Copy className="h-4 w-4 mr-1" />
        {isCopied ? "Kopiert" : "Link kopieren"}
      </Button>
    </div>
  );
}

interface RecentlyViewedJobsProps {
  currentJob: JobListing;
  currentHref: string;
}

export function RecentlyViewedJobs({ currentJob, currentHref }: RecentlyViewedJobsProps) {
  const recentJobs = useMemo(
    () => readRecentJobs().filter((entry) => entry.id !== currentJob.id).slice(0, 3),
    [currentJob.id]
  );

  useEffect(() => {
    const currentEntry: RecentJobEntry = {
      id: currentJob.id,
      title: currentJob.title,
      company: currentJob.company,
      location: currentJob.location,
      href: currentHref,
      source: currentJob.source,
      viewedAt: new Date().toISOString(),
    };

    const previousEntries = readRecentJobs().filter((entry) => entry.id !== currentJob.id);
    const nextEntries = [currentEntry, ...previousEntries].slice(0, 6);

    window.localStorage.setItem(RECENT_KEY, JSON.stringify(nextEntries));
    trackEvent("job_view", { job_id: currentJob.id, source: currentJob.source });
  }, [currentHref, currentJob.company, currentJob.id, currentJob.location, currentJob.source, currentJob.title]);

  if (recentJobs.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
      <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3">Zuletzt angesehen</h2>
      <ul className="space-y-2">
        {recentJobs.map((entry) => (
          <li key={`${entry.source}-${entry.id}`}>
            <Link
              href={entry.href}
              className="block rounded-lg border border-slate-200 px-3 py-2 hover:border-primary/40 hover:bg-primary/5 transition-colors"
              onClick={() =>
                trackEvent("recent_job_open", {
                  job_id: entry.id,
                  source: entry.source,
                })
              }
            >
              <p className="text-sm font-semibold text-slate-900 line-clamp-1">{entry.title}</p>
              <p className="text-xs text-slate-500 line-clamp-1">{entry.company} · {entry.location}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

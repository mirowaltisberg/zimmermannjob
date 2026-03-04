"use client";

import { useState } from "react";
import { SlidersHorizontal, ArrowUpWideNarrow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useHaptic } from "@/hooks/use-haptic";
import type { JobFacets, JobSort, RemoteFilter } from "@/lib/job-types";

const RADIUS_OPTIONS = [
  { value: "5", label: "5 km" },
  { value: "10", label: "10 km" },
  { value: "15", label: "15 km" },
  { value: "25", label: "25 km" },
  { value: "35", label: "35 km" },
  { value: "50", label: "50 km" },
  { value: "80", label: "80 km" },
  { value: "120", label: "120 km" },
  { value: "all", label: "Beliebig" },
] as const;

const filterSelectClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30";

interface MobileFilterBarProps {
  typeFilter: string;
  setTypeFilter: (v: string) => void;
  workloadFilter: string;
  setWorkloadFilter: (v: string) => void;
  remoteFilter: RemoteFilter;
  setRemoteFilter: (v: RemoteFilter) => void;
  postedWithinDays: string;
  setPostedWithinDays: (v: string) => void;
  sortBy: JobSort;
  setSortBy: (v: JobSort) => void;
  radiusKm: string;
  setRadiusKm: (v: string) => void;
  hasLocationInput: boolean;
  facets: JobFacets;
  resetFilters: () => void;
}

export default function MobileFilterBar({
  typeFilter,
  setTypeFilter,
  workloadFilter,
  setWorkloadFilter,
  remoteFilter,
  setRemoteFilter,
  postedWithinDays,
  setPostedWithinDays,
  sortBy,
  setSortBy,
  radiusKm,
  setRadiusKm,
  hasLocationInput,
  facets,
  resetFilters,
}: MobileFilterBarProps) {
  const { trigger } = useHaptic();
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-white/95 backdrop-blur-sm border-t shadow-[0_-4px_12px_-2px_rgb(0,0,0,0.08)] z-20">
      <div className="grid grid-cols-2 gap-2">
        <Dialog open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-11">
              <SlidersHorizontal className="h-4 w-4 mr-1" />
              Filter
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[calc(100%-1rem)] max-w-none max-h-[85dvh] overflow-y-auto rounded-2xl p-4 top-auto bottom-2 translate-y-0">
            <DialogHeader>
              <DialogTitle>Filter</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {hasLocationInput && (
                <select
                  className={filterSelectClass}
                  value={radiusKm}
                  onChange={(event) => { trigger("selection"); setRadiusKm(event.target.value); }}
                >
                  {RADIUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.value === "all" ? "Umkreis: Beliebig" : `Umkreis: ${option.label}`}
                    </option>
                  ))}
                </select>
              )}
              <select
                className={filterSelectClass}
                value={typeFilter}
                onChange={(event) => { trigger("selection"); setTypeFilter(event.target.value); }}
              >
                <option value="all">Vertragsart</option>
                {facets.types.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.value} ({item.count})
                  </option>
                ))}
              </select>
              <select
                className={filterSelectClass}
                value={workloadFilter}
                onChange={(event) => { trigger("selection"); setWorkloadFilter(event.target.value); }}
              >
                <option value="all">Pensum</option>
                {facets.workloads.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.value} ({item.count})
                  </option>
                ))}
              </select>
              <select
                className={filterSelectClass}
                value={remoteFilter}
                onChange={(event) => { trigger("selection"); setRemoteFilter(event.target.value as RemoteFilter); }}
              >
                <option value="any">Remote</option>
                <option value="true">Nur Remote</option>
                <option value="false">Nur vor Ort</option>
              </select>
              <select
                className={filterSelectClass}
                value={postedWithinDays}
                onChange={(event) => { trigger("selection"); setPostedWithinDays(event.target.value); }}
              >
                <option value="7">Letzte 7 Tage</option>
                <option value="14">Letzte 14 Tage</option>
                <option value="30">Letzte 30 Tage</option>
                <option value="all">Alle Zeiträume</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <Button variant="outline" onClick={resetFilters}>
                Zurücksetzen
              </Button>
              <Button onClick={() => setIsFilterSheetOpen(false)}>Fertig</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isSortSheetOpen} onOpenChange={setIsSortSheetOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-11">
              <ArrowUpWideNarrow className="h-4 w-4 mr-1" />
              Sortieren
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[calc(100%-1rem)] max-w-none rounded-2xl p-4 top-auto bottom-2 translate-y-0">
            <DialogHeader>
              <DialogTitle>Sortieren nach</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 mt-1">
              {[
                { value: "newest", label: "Neueste zuerst" },
                { value: "relevance", label: "Relevanz" },
                { value: "oldest", label: "Älteste zuerst" },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors ${sortBy === item.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  onClick={() => {
                    trigger("selection");
                    setSortBy(item.value as JobSort);
                    setIsSortSheetOpen(false);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";

function parseSwissAmount(value: string): number | null {
  const normalized = value
    .normalize("NFKC")
    .replace(/['’\s]/g, "")
    .replace(",", ".");
  if (!/^\d{3,6}(?:\.\d{1,2})?$/.test(normalized)) return null;
  const amount = Number(normalized);
  return Number.isFinite(amount) && amount >= 1_000 && amount <= 50_000
    ? amount
    : null;
}

function formatChf(value: number): string {
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
    maximumFractionDigits: 0,
  }).format(value);
}

export function SalaryOrientationCalculator({
  profession,
}: {
  profession: string;
}) {
  const [input, setInput] = useState("");
  const amount = useMemo(() => parseSwissAmount(input), [input]);
  const target = amount === null ? null : amount * 1.1;

  return (
    <section className="container mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="trade-panel border-t-4 border-t-primary p-5 sm:p-7">
        <p className="eyebrow mb-2">Interaktive Lohnorientierung</p>
        <h2 className="text-2xl font-bold text-slate-900">
          Salarium-Wert transparent um 10&nbsp;% vergleichen
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Öffne zuerst das offizielle BFS Salarium, wähle die passende Region
          und das Berufsprofil {profession} und übertrage den dort angezeigten
          monatlichen Bruttolohn. Die Berechnung erfolgt nur in deinem Browser.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <label className="block">
            <span className="text-sm font-semibold text-slate-900">
              BFS-Salarium-Ergebnis pro Monat
            </span>
            <span className="mt-1 flex min-h-12 items-center border border-slate-300 bg-white px-3 focus-within:border-primary">
              <span className="mr-2 text-sm font-semibold text-slate-500">CHF</span>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={input}
                onChange={(event) => setInput(event.target.value.slice(0, 12))}
                placeholder="z. B. 6'200"
                className="min-w-0 flex-1 bg-transparent text-base font-semibold outline-none"
                aria-describedby="salary-orientation-help"
              />
            </span>
          </label>

          <div className="border border-primary/30 bg-primary/5 p-4" aria-live="polite">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Vergleichsziel +10&nbsp;%
            </p>
            <p className="mt-1 text-2xl font-black text-slate-900">
              {target === null ? "–" : formatChf(target)}
            </p>
            <p className="mt-1 text-xs text-slate-600">monatlicher Bruttowert</p>
          </div>
        </div>

        <p id="salary-orientation-help" className="mt-4 text-xs leading-relaxed text-slate-600">
          Diese Orientierung ist keine Lohnangabe eines Arbeitgebers, keine
          Garantie und kein Bestandteil eines Stelleninserats. Funktion,
          Erfahrung, Arbeitszeit, 13. Monatslohn, Zulagen und anwendbare GAV
          müssen separat geprüft werden. Eingaben werden nicht gespeichert.
        </p>
        <a
          href="https://www.salarium.bfs.admin.ch/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex min-h-11 items-center font-semibold text-primary underline"
          data-analytics-action="open_bfs_salarium"
        >
          BFS Salarium öffnen
        </a>
      </div>
    </section>
  );
}

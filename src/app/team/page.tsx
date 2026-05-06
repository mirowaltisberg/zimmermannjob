import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.zimmermannjob.ch";

export const metadata: Metadata = {
  title: "Über die Redaktion | zimmermannjob.ch",
  description:
    "Wer hinter den redaktionellen Inhalten von zimmermannjob.ch steht: Recherche, Quellen, Methodik und unser Anspruch an Schweizer Lohn- und Branchendaten.",
  alternates: {
    canonical: "/team",
    languages: { "de-CH": "/team" },
  },
  openGraph: {
    title: "Über die Redaktion | zimmermannjob.ch",
    description:
      "Wer hinter den redaktionellen Inhalten von zimmermannjob.ch steht: Recherche, Quellen, Methodik und unser Anspruch an Schweizer Lohn- und Branchendaten.",
    url: "/team",
    type: "website",
    siteName: "zimmermannjob.ch",
    locale: "de_CH",
  },
};

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b header-blur sticky top-0 z-30">
        <div className="container mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/logo.svg"
              alt="zimmermannjob.ch — Zimmermannjobs in der Schweiz"
              width={142}
              height={29}
              className="h-7 sm:h-8 w-auto"
              priority
            />
          </Link>
          <nav className="shrink-0">
            <Button
              size="sm"
              asChild
              className="text-xs sm:text-sm px-2.5 sm:px-4 h-8 sm:h-10 btn-interactive shadow-md shadow-primary/20"
            >
              <Link href="/">Alle Jobs suchen</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-3xl">
        <Breadcrumbs
          items={[
            { label: "Startseite", href: "/" },
            { label: "Über die Redaktion" },
          ]}
          className="mb-4"
        />

        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Über die Redaktion
        </h1>
        <p className="text-slate-600 mt-3 text-base sm:text-lg leading-relaxed">
          Die Redaktion von zimmermannjob.ch erstellt redaktionelle Inhalte zu Berufen,
          Löhnen und regionalen Arbeitsmärkten in der Schweizer Holzbau- und Zimmerei-Branche.
        </p>

        <section className="mt-10 space-y-6">
          <article>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
              Was wir publizieren
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Pro Berufsbild und Kanton schreiben wir kompakte, faktenbasierte
              Übersichten: Was die Tätigkeit konkret beinhaltet, mit welchen
              Löhnen und Aufstiegschancen zu rechnen ist, welche Betriebsformen
              typischerweise einstellen und worauf Bewerbende bei einem regionalen
              Wechsel achten sollten. Die Texte ergänzen die täglich aktualisierten
              Stellenanzeigen aus der Schweizer Holzbau- und Zimmerei-Branche und sollen
              Berufsleuten eine schnelle, ehrliche Standortbestimmung ermöglichen.
            </p>
          </article>

          <article>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
              Quellen und Methodik
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Lohnangaben aggregieren wir aus öffentlich publizierten Quellen
              der Schweizer Holzbau-Branche — insbesondere{" "}
              <a
                href="https://www.holzbau-schweiz.ch"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                Holzbau Schweiz
              </a>{" "}
              (Verband der Schweizer Zimmerei- und Holzbaubetriebe) sowie dem{" "}
              <a
                href="https://www.bfs.admin.ch"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                Bundesamt für Statistik (BFS)
              </a>
              . Ergänzend werten wir die täglich gesammelten öffentlichen
              Stellenausschreibungen aus, die auf zimmermannjob.ch indexiert sind. Die
              ausgewiesenen Lohnbänder sind Richtgrössen — der konkrete Lohn
              wird im Bewerbungsprozess individuell verhandelt und hängt von
              Erfahrung, Spezialisierung, Arbeitgebergrösse und Region ab.
            </p>
          </article>

          <article>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
              Aktualität und Korrekturen
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Jede redaktionelle Seite trägt ein sichtbares Stand-Datum. Wir
              überarbeiten die Inhalte regelmässig, sobald Branchenverbände neue
              Lohnempfehlungen veröffentlichen oder sich die Marktlage in einer
              Region merklich verändert. Stellst du eine inhaltliche Ungenauigkeit
              fest, melde dich über die{" "}
              <Link href="/kontakt" className="underline hover:text-primary">
                Kontaktseite
              </Link>{" "}
              — wir korrigieren zeitnah und transparent.
            </p>
          </article>

          <article>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
              Stellenvermittlung und Datenschutz
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Inserate werden auf zimmermannjob.ch grundsätzlich anonymisiert
              dargestellt — der konkrete Arbeitgeber wird im persönlichen
              Erstgespräch offengelegt. Diese Praxis schützt sowohl Bewerbende
              als auch einstellende Betriebe vor unerwünschter Reichweite.
            </p>
          </article>
        </section>

        <div className="mt-10">
          <Button asChild>
            <Link href="/">Zurück zur Stellenübersicht</Link>
          </Button>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

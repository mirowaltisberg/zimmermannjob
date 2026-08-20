import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import { SiteBrand } from "@/components/site-brand";

export const metadata: Metadata = {
  title: "Über die Redaktion",
  description:
    "Quellen, Methodik und Grenzen der redaktionellen Inhalte auf zimmermannjob.ch.",
  alternates: {
    canonical: "/team",
    languages: { "de-CH": "/team" },
  },
  openGraph: {
    title: "Über die Redaktion | zimmermannjob.ch",
    description:
      "Quellen, Methodik und Grenzen der redaktionellen Inhalte auf zimmermannjob.ch.",
    url: "/team",
    type: "website",
    siteName: "zimmermannjob.ch",
    locale: "de_CH",
  },
};

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="trade-header border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 sm:px-6 h-16 sm:h-[4.5rem] flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center shrink-0">
            <SiteBrand />
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

      <main id="main-content" className="flex-1 container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-3xl">
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
          zimmermannjob.ch ergänzt die Stellensuche mit kurzen Informationen zum
          Zimmermannberuf, zur Ausbildung und zur Einordnung von Lohnangaben.
        </p>

        <section className="mt-10 space-y-6">
          <article>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
              Was wir publizieren
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Wir publizieren Stellenlisten sowie redaktionelle Grundlagen zum
              Zimmermanngewerk. Pauschale Aussagen über regionale Nachfrage,
              Arbeitgeberverhalten oder marktübliche Lohnbänder werden nicht als
              eigene Fakten ausgegeben. Angaben aus einem Stelleninserat werden
              als inseratsbezogene Angaben behandelt.
            </p>
          </article>

          <article>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
              Quellen und Methodik
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Für Beruf und Ausbildung verweisen wir auf das offizielle Berufsprofil von{" "}
              <a
                href="https://www.berufsberatung.ch/de/berufe/zimmermann-in-efz"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                berufsberatung.ch
              </a>{" "}
              sowie die Ausbildungsinformationen von{" "}
              <a
                href="https://www.holzbau-schweiz.ch/de/bildung/grundbildung/zimmermann-zimmerin-efz/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                Holzbau Schweiz
              </a>
              . Zur Lohnorientierung verlinken wir den statistischen Lohnrechner{" "}
              <a
                href="https://www.salarium.bfs.admin.ch/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                Salarium des BFS
              </a>{" "}
              und die{" "}
              <a
                href="https://www.seco.admin.ch/de/gesamtarbeitsvertraege-bund"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                aktuelle GAV-Übersicht des SECO
              </a>
              . Wir berechnen daraus keine eigenen Lohnbänder.
            </p>
          </article>

          <article>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
              Aktualität und Korrekturen
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Die Ausbildungs- und Lohnseiten nennen ihr Prüfdatum und verlinken
              die verwendeten Quellen direkt. Stand dieser Methodikseite: 19.
              August 2026. Inhaltliche Hinweise kannst du über die{" "}
              <Link href="/kontakt" className="underline hover:text-primary">
                Kontaktseite
              </Link>{" "}
              melden. Hinweise werden geprüft; es gilt keine zugesicherte
              Bearbeitungszeit.
            </p>
          </article>

          <article>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
              Grenzen der Informationen
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Redaktionelle Inhalte ersetzen weder eine individuelle Lohnanalyse
              noch eine Rechtsberatung. Ob ein Gesamtarbeitsvertrag anwendbar ist,
              hängt unter anderem von Betrieb, Tätigkeit und Arbeitsort ab. Für
              verbindliche Auskünfte sind die zuständige paritätische Kommission
              oder eine qualifizierte Beratungsstelle zuständig.
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

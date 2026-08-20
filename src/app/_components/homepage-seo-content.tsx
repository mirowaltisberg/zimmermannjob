import Link from "next/link";
import { TOP_LANDING_PAGES, getLandingPath } from "@/lib/landing-pages";
import { JsonLd } from "@/components/json-ld";

const HOMEPAGE_FAQS = [
  {
    question: "Welche Stellen finde ich auf zimmermannjob.ch?",
    answer:
      "Die Suche bündelt öffentlich zugängliche Inserate für Zimmerleute und klar bezeichnete Funktionen in Holzrahmen- und Elementbau, Montage, Konstruktion, AVOR und Projektleitung Holzbau. Welche Treffer aktuell vorhanden sind, zeigt allein die Ergebnisliste; zimmermannjob.ch verspricht weder eine vollständige Marktabdeckung noch eine feste Inseratezahl.",
  },
  {
    question: "Wie suche ich nach einem Zimmermannjob?",
    answer:
      "Gib eine Berufsbezeichnung oder ein Zimmermann-Stichwort und bei Bedarf einen Ort ein. Die Ergebnisliste lässt sich mit den angebotenen Filtern weiter eingrenzen. Massgebend für Aufgaben, Qualifikation, Pensum, Arbeitsort und Lohn sind die Angaben im jeweiligen Inserat. Fehlt eine Angabe, ergänzt zimmermannjob.ch dafür keine pauschale Schätzung.",
  },
  {
    question: "Was bedeutet Direktanstellung in der Ergebnisliste?",
    answer:
      "Ein als Direktanstellung gekennzeichnetes Profil ist kein aktuelles Stelleninserat und nennt deshalb weder Arbeitgeber noch Lohn oder Bewerbungslink. Es zeigt ein kontrolliertes Holzbau-Berufsprofil, für das unser Team fortlaufend einen passenden Betrieb sucht. Kommt ein Kontakt zustande, erfolgt die Anstellung direkt beim jeweiligen Arbeitgeber; eine Vermittlung oder Anstellung durch zimmermannjob.ch wird damit nicht versprochen.",
  },
  {
    question: "Wie lange dauert die Lehre als Zimmermann EFZ?",
    answer:
      "Das offizielle Berufsprofil von berufsberatung.ch nennt für Zimmermann/Zimmerin EFZ vier Jahre und den Abschluss mit eidgenössischem Fähigkeitszeugnis. Holzbau Schweiz publiziert ergänzende Informationen zur Grundbildung, den Bildungsgrundlagen und Lehrmitteln.",
  },
  {
    question: "Wie kann ich einen Lohn für eine Zimmermannstelle vergleichen?",
    answer:
      "Eine einzelne pauschale Zahl bildet Beruf, Region, Erfahrung, Funktion und Betrieb nicht zuverlässig ab. Für eine statistische Orientierung eignet sich Salarium des Bundesamts für Statistik. Ob ein Mindestlohn aus einem Gesamtarbeitsvertrag gilt, muss anhand des konkreten Betriebs, der Tätigkeit und des Arbeitsorts geprüft werden. Die Lohnseite verlinkt die offiziellen Werkzeuge und die aktuelle GAV-Übersicht des SECO.",
  },
];

const faqPageSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HOMEPAGE_FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export function HomepageSeoContent() {
  return (
    <section className="editorial-surface" aria-label="Informationen für Zimmermann-Fachkräfte">
      <JsonLd data={faqPageSchema} />

      <div className="container mx-auto px-4 sm:px-6 py-14 sm:py-20 max-w-6xl">
        <div className="editorial-grid mb-16">
        <div className="self-start">
          <p className="eyebrow">Fachlich fokussiert</p>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-5">
            Zimmermannjobs in der Schweiz suchen
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-4">
            zimmermannjob.ch bündelt Stelleninserate mit klarem Bezug zum
            Zimmermanngewerk. Suche nach Beruf und Ort und prüfe auf der Detailseite
            die im Inserat veröffentlichten Aufgaben und Anforderungen.
          </p>
          <p className="text-slate-600 text-base leading-relaxed">
            Fehlende Lohn- oder Arbeitgeberangaben werden nicht durch eigene
            Schätzungen oder Offenlegungsversprechen ersetzt.
          </p>
        </div>

        <div className="source-panel p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
            Offizielle Quellen
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            Quellen zuletzt geprüft am 20. August 2026. Wir übernehmen keine
            pauschalen Erwachsenen-Lohnbänder aus allgemeinen Branchenseiten.
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href="https://www.berufsberatung.ch/de/berufe/zimmermann-in-efz"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                berufsberatung.ch: Zimmermann EFZ
              </a>
            </li>
            <li>
              <a
                href="https://www.holzbau-schweiz.ch/de/bildung/grundbildung/zimmermann-zimmerin-efz/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                Holzbau Schweiz: Zimmermann/Zimmerin EFZ
              </a>
            </li>
            <li>
              <a
                href="https://www.salarium.bfs.admin.ch/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                BFS Salarium: statistischer Lohnrechner
              </a>
            </li>
            <li>
              <a
                href="https://www.seco.admin.ch/de/gesamtarbeitsvertraege-bund"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                SECO: allgemeinverbindlich erklärte Gesamtarbeitsverträge
              </a>
            </li>
          </ul>
          <Link
            href="/lohn-zimmermann-schweiz"
            className="editorial-link mt-5 inline-block text-sm font-bold text-primary underline"
          >
            Lohnangaben und GAV richtig einordnen
          </Link>
        </div>
        </div>

        <div className="mb-14 border-y border-border py-10">
          <p className="eyebrow">Direktanstellung · transparenter Ablauf</p>
          <h2 className="mb-5 text-2xl font-black text-foreground sm:text-3xl">Vom Berufsprofil zum passenden Holzbaubetrieb</h2>
          <ol className="grid gap-3 md:grid-cols-3">
            {[
              ["1", "Profil einordnen", "Rolle, Region und kontrollierte Filterpräferenzen bestimmen das angezeigte Berufsprofil."],
              ["2", "Betrieb suchen", "Unser Team sucht fortlaufend nach einem Arbeitgeber, der zu diesem Profil passen kann."],
              ["3", "Direkt anstellen", "Ein möglicher Austausch führt nicht automatisch zu einer Stelle; eine Anstellung erfolgt direkt beim Arbeitgeber."],
            ].map(([step, title, copy]) => (
              <li key={step} className="source-panel min-w-0 p-5">
                <span className="font-mono text-xs font-bold text-primary">SCHRITT {step}</span>
                <h3 className="mt-2 font-bold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 [overflow-wrap:anywhere]">{copy}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="mb-14">
          <p className="eyebrow">Direkte Antworten</p>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-5">
            Häufig gestellte Fragen
          </h2>
          <div className="space-y-4">
            {HOMEPAGE_FAQS.map((faq) => (
              <details
                key={faq.question}
                className="faq-item group overflow-hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-bold text-foreground hover:bg-accent/35 transition-colors">
                  {faq.question}
                  <span
                    className="ml-2 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  >
                    ▾
                  </span>
                </summary>
                <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>

        <div className="mb-8 border-t border-border pt-10">
          <p className="eyebrow">Nach Gewerk und Region</p>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-3">
            Zimmermannstellen nach Beruf und Kanton
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Diese Suchseiten dienen der Navigation und sind bis zum Nachweis
            eigener Qualitäts- und Bestandsdaten nicht für Suchmaschinen indexiert.
          </p>
          <nav aria-label="Stellenangebote nach Beruf und Kanton">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {TOP_LANDING_PAGES.slice(0, 18).map((item) => (
                <Link
                  key={`${item.role}-${item.canton}`}
                  href={getLandingPath(item)}
                  className="link-tile flex items-center px-3 py-2 pr-9 text-sm text-foreground hover:border-primary/50 hover:text-primary transition-colors"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </section>
  );
}

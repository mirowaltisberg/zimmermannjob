import Link from "next/link";
import { TOP_LANDING_PAGES, getLandingPath } from "@/lib/landing-pages";
import { JsonLd } from "@/components/json-ld";

// SEO-DECISION: Server-rendered content for homepage crawlability.
// This content is always visible to search engines even though the
// main job search is client-rendered.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zimmermannjob.ch";

// FAQ answers target the AI-citation optimum band of 134-167 words per answer.
// Shorter answers get truncated by LLMs into low-context excerpts; longer ones
// get summarized away. The 134-167 range survives both ends intact.
const HOMEPAGE_FAQS = [
  {
    question: "Welche Zimmermannjobs gibt es auf zimmermannjob.ch?",
    answer:
      "Auf zimmermannjob.ch findest du alle relevanten Stellenprofile der Schweizer Holzbau- und Zimmerei-Branche. Dazu gehören die EFZ-Lehrabschluss-Berufe Zimmermann EFZ, Holzbau-Monteur und Elementbauer, dazu spezialisierte Profile wie Dachdecker Holzbau und Schreiner Holzbau für den Innenausbau in Holzgebäuden. Auf der Werkstatt- und Vorfertigungs-Ebene listen wir Stellen für Abbund-Operatoren an CNC-Anlagen sowie Element-Vorfertiger. Auf der Führungsebene findest du Holzbau-Vorarbeiter, Holzbau-Polier, Bauführer Holzbau und Holzbau-Projektleiter. Auf der Planungs- und Ingenieursebene listen wir Holzbau-Planer, Holzbautechniker HF und Holzbauingenieure FH/ETH. Lehrstellen, Trainee-Programme und Wiedereinsteigerangebote sind separat ausgewiesen, damit Berufsanfängerinnen, Quereinsteiger und Wiedereinsteigende die für sie passenden Inserate schnell finden. Über die Kartenansicht lokalisierst du Stellen zusätzlich nach Postleitzahl und Pendelradius — besonders nützlich in ländlichen Holzbau-Regionen mit wechselnder Werkstatt- und Baustellenlogik. Die Stellen werden täglich aktualisiert und auf alle 26 Schweizer Kantone verteilt, mit besonderer Dichte in Bern, Aargau, St. Gallen, Zürich und Luzern.",
  },
  {
    question: "Was verdient ein Zimmermann in der Schweiz?",
    answer:
      "Ein Zimmermann EFZ verdient in der Schweiz im Durchschnitt CHF 65'000 bis 85'000 pro Jahr. Das Gehalt variiert deutlich nach Kanton, Berufserfahrung, Arbeitgebergrösse und Spezialisierung. Im Kanton Zug, in Zürich und in Basel-Stadt liegen die Löhne tendenziell 5 bis 10 Prozent über dem Schweizer Mittel; in ländlicheren Kantonen wie Wallis, Freiburg oder Glarus 5 bis 8 Prozent darunter. Berufsanfänger nach EFZ-Abschluss starten meist im Bereich CHF 60'000 bis 68'000, mit drei bis fünf Jahren Erfahrung verschiebt sich der Marktwert in den Bereich CHF 72'000 bis 82'000. Spezialisierungen auf Element-Vorfertigung, Abbund-CNC, Sanierung historischer Bauten oder mehrgeschossigen Holzrahmenbau bringen zusätzliche 5 bis 12 Prozent. Vorarbeiter-Verantwortung und Polier-Status heben das Salärband weiter. Im Vergleich zum Nachbarland Deutschland liegen die Schweizer Bruttolöhne durchschnittlich 60 bis 80 Prozent höher; allerdings sind Lebenshaltungskosten und Krankenkassenprämien ebenfalls deutlich höher, sodass sich der direkte Nettovergleich nur über einen detaillierten Lohnrechner lohnt. Der 13. Monatslohn ist im Schweizer Holzbau Standard. Die vollständige Lohnübersicht findest du auf dieser Startseite.",
  },
  {
    question: "Wie finde ich einen Job als Zimmermann in der Schweiz?",
    answer:
      "Auf zimmermannjob.ch suchst du gezielt mit drei Filtern nach passenden Stellen: Beruf (12 EFZ-, Werkstatt-, Führungs- und Planungs-Profile vom Zimmermann EFZ bis zum Holzbauingenieur), Standort (alle 26 Schweizer Kantone plus Ortssuche mit Umkreis-Radius in Kilometern) und Pensum (Vollzeit, 80–100%, 60–80%, Teilzeit). Du kannst zusätzlich nach Anstellungsart (Festanstellung, Temporär, Praktikum, Lehre) filtern und Stellen mit konkretem Lohnband gezielt aufrufen. Der Bewerbungsprozess läuft direkt über die Plattform: Lebenslauf als PDF hochladen, Anschreiben in das Formular tippen oder ebenfalls als PDF beifügen, Sprache und Verfügbarkeit angeben, abschicken. Wir leiten dein Dossier anonymisiert an den Arbeitgeber weiter. Du kannst Suchprofile speichern und erhältst eine Benachrichtigung, sobald neue passende Stellen aufgeschaltet werden. Für regional konzentrierte Suchen empfehlen wir die Karte mit Umkreis-Filter — so findest du Werkstatt- und Baustellenstandorte innerhalb deines bevorzugten Pendelradius. Holzbau-Messen wie die Swissbau, das Internationale Holzbau-Forum sowie regionale Berufsbildungsmessen bieten zusätzliche Direktkontakte zu Arbeitgebern; viele Zimmereibetriebe haben offene Stellen, die noch nicht öffentlich ausgeschrieben sind.",
  },
  {
    question: "Welche Kantone haben die meisten Zimmermannjobs?",
    answer:
      "Die mit Abstand meisten offenen Stellen für Zimmermann und Holzbau-Fachkräfte gibt es in den Kantonen Bern, Aargau, St. Gallen, Zürich und Luzern. Diese fünf Kantone vereinen rund 60 Prozent aller publizierten Holzbau-Stellenausschreibungen in der Schweiz. Im Mittelfeld folgen Thurgau, Solothurn, Graubünden, Wallis und Waadt. Ländlichere Kantone wie Uri, Glarus, Appenzell Innerrhoden oder Jura haben deutlich weniger offene Stellen, dafür weniger Konkurrenz unter Bewerbern und oft tiefere Lebenshaltungskosten. Die regionale Verteilung folgt der Holzbautradition und der Bautätigkeit: Wo mehrgeschossiger Holzrahmenbau, Sanierung historischer Bauten und landwirtschaftliche Holzbauprojekte zusammenkommen, steigt die Nachfrage nach Zimmerleuten, Monteuren und Polieren spürbar. Für Pendlerregionen lohnt sich ein Blick auf die Nachbarkantone — Aargauer Betriebe rekrutieren häufig in Solothurn und Luzern, St. Galler in Thurgau und Appenzell, Berner im Mittelland und Oberland. Eine zweisprachige Bewerbung (Deutsch und Französisch) öffnet zusätzlich den Markt im Wallis, im Berner Jura und in Teilen von Fribourg. Die täglich aktualisierten Stellenzahlen pro Kanton siehst du in unserem Filter.",
  },
  {
    question:
      "Was ist der Unterschied zwischen Zimmermann und Schreiner?",
    answer:
      "Der Unterschied liegt in Arbeitsfeld, Werkstoff-Schwerpunkt und typischem Bauteilkatalog. Der Zimmermann EFZ absolviert eine 4-jährige Lehre und arbeitet vorwiegend am tragenden Holzbau: Dachstühle, Holzrahmen- und Holzelementwände, Decken, Aufstockungen sowie ganze mehrgeschossige Wohnhäuser in Holzbauweise. Werkzeug und Material sind robuster, Bauteile grösser, der Arbeitsplatz wechselt zwischen Werkstatt und Baustelle. Der Schreiner EFZ macht ebenfalls eine 4-jährige Lehre, ist aber auf den Innenausbau spezialisiert: Möbel, Türen, Fenster, Treppen, Einbauten und feine Oberflächen. Beide Berufe sind in der Schweiz sehr gefragt, der Lohnabstand ist im Einstieg gering, im Verlauf öffnet sich das Band zugunsten des Zimmermanns mit Polier- oder Bauführer-Profil. Wechsel ist möglich: Quereinstiege vom Schreiner in den Holzbau (zum Beispiel als Schreiner Holzbau für den Innenausbau in Holzgebäuden) oder vom Zimmermann zum Holzbau-Planer mit BIM-Schwerpunkt sind etablierte Pfade. Welcher Beruf besser passt, hängt von Vorliebe für tragende Konstruktion versus Feinarbeit und Möbelbau ab — eine Berufsberatung hilft.",
  },
  {
    question: "Gibt es auf zimmermannjob.ch auch Teilzeitstellen?",
    answer:
      "Ja, ein wachsender Teil der Stellen auf zimmermannjob.ch ist Teilzeitarbeit oder mit reduziertem Pensum verfügbar. Im Filter wählst du zwischen Vollzeit (90–100%), 80–100%, 60–80% oder Teilzeit unter 60%. Teilzeitmodelle sind besonders bei Holzbau-Planern, Holzbautechnikern und in der Werkstatt-Vorfertigung verbreitet — Elternzeit-Modelle, schrittweiser Wiedereinstieg nach Pause und Vorruhestand mit Reduzierung auf 60 oder 80 Prozent sind im Schweizer Holzbau zunehmend Standard. Auf der Aufrichtseite (Zimmermann EFZ, Holzbau-Monteur, Polier Holzbau) bleibt Vollzeit dominant, weil Equipen meist vollständig disponiert werden und eine Aufrichtetappe in einem Stück abgewickelt wird. In den Bereichen Planung, Projektleitung und Bauführung ist Teilzeit hingegen gut etabliert. Job-Sharing-Modelle (zwei Personen teilen sich eine Stelle) werden ebenfalls vereinzelt angeboten. Wer Elternzeit-Wiedereinstieg sucht, profitiert von einer wachsenden Akzeptanz für gestaffelte Pensumserhöhungen — also Start mit 60 Prozent und schrittweise Anhebung über 12 bis 24 Monate. Frage in Erstgesprächen explizit nach diesem Modell, viele Zimmereibetriebe bieten es ohne aktive Werbung an. Wir kennzeichnen jedes Inserat klar mit dem akzeptierten Pensumband.",
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

const SALARY_TABLE = [
  { role: "Holzbauingenieur", range: "CHF 90'000 – 120'000" },
  { role: "Holzbau-Projektleiter", range: "CHF 85'000 – 110'000" },
  { role: "Holzbautechniker", range: "CHF 80'000 – 100'000" },
  { role: "Holzbau-Polier", range: "CHF 78'000 – 95'000" },
  { role: "Holzbau-Vorarbeiter", range: "CHF 72'000 – 88'000" },
  { role: "Zimmermann EFZ", range: "CHF 65'000 – 85'000" },
  { role: "Elementbauer", range: "CHF 65'000 – 82'000" },
  { role: "Dachdecker Holzbau", range: "CHF 65'000 – 80'000" },
  { role: "Holzbau-Monteur", range: "CHF 62'000 – 78'000" },
  { role: "Schreiner Holzbau", range: "CHF 60'000 – 78'000" },
];

/**
 * Server-rendered SEO content for the homepage.
 * Crawlable by search engines even when JS is disabled.
 * Includes: intro text, FAQ section, salary table, landing page links.
 */
export function HomepageSeoContent() {
  return (
    <section className="bg-white border-t" aria-label="Informationen für Zimmermann und Holzbau-Fachkräfte">
      <JsonLd data={faqPageSchema} />

      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-5xl">
        {/* SEO intro paragraph — AI-citeable, entity-rich */}
        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
            Zimmermannjobs in der Schweiz finden
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-4">
            Auf zimmermannjob.ch finden Zimmermann und Holzbau-Fachkräfte aktuelle offene Stellen in der ganzen Schweiz
            — von Zimmermann EFZ über Holzbau-Vorarbeiter und Holzbau-Projektleiter bis hin zu
            Holzbautechniker, Holzbauingenieur und Elementbauer. Ob du deinen nächsten Zimmermannjob
            in Zürich, Bern oder Luzern suchst — unsere spezialisierte Jobbörse
            richtet sich an alle Berufsleute der Holzbaubranche.
          </p>
          <p className="text-slate-600 text-base leading-relaxed">
            Ob du in Zürich, Bern, Aargau, Luzern, St. Gallen oder einem anderen Schweizer Kanton
            suchst — mit unserer smarten Filterung nach Beruf, Ort, Umkreis und Pensum findest du
            schnell die passende Stelle. Bewirb dich direkt über die Plattform mit wenigen Klicks.
          </p>
        </div>

        {/* Salary table — highly citeable by AI. id="loehne" anchor lets editorial */}
        {/* sections on category pages deep-link via /#loehne. */}
        <div id="loehne" className="mb-12 scroll-mt-24">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
            Lohnübersicht Holzbauberufe Schweiz
          </h2>
          <p className="text-slate-500 text-sm mb-4">
            Durchschnittliche Jahresgehälter für Zimmermann und Holzbau-Fachkräfte in der Schweiz (2025/2026, Richtwerte).
            Quellen:{" "}
            <a href="https://www.holzbau-schweiz.ch" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-700">Holzbau Schweiz</a>,{" "}
            <a href="https://www.bfs.admin.ch" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-700">BFS</a>.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="py-3 pr-4 text-sm font-semibold text-slate-900">Beruf</th>
                  <th className="py-3 text-sm font-semibold text-slate-900">Jahreslohn (CHF)</th>
                </tr>
              </thead>
              <tbody>
                {SALARY_TABLE.map((row) => (
                  <tr key={row.role} className="border-b border-slate-100">
                    <td className="py-2.5 pr-4 text-sm text-slate-700">{row.role}</td>
                    <td className="py-2.5 text-sm font-medium text-slate-900">{row.range}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <details className="mt-4 group rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
            <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors">
              Methodologie — wie wir die Lohnbänder berechnen
              <span
                className="ml-2 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
                aria-hidden="true"
              >
                ▾
              </span>
            </summary>
            <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed space-y-2">
              <p>
                <strong>Stand:</strong> 2. Mai 2026.
              </p>
              <p>
                <strong>Quellen:</strong> Wir aggregieren öffentlich publizierte
                Lohndaten der Schweizer Holzbau-Branche aus den Jahres- und
                Branchenstatistiken von{" "}
                <a
                  href="https://www.holzbau-schweiz.ch"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-slate-800"
                >
                  Holzbau Schweiz
                </a>{" "}
                (Verband der Schweizer Zimmerei- und Holzbaubetriebe) und dem{" "}
                <a
                  href="https://www.bfs.admin.ch"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-slate-800"
                >
                  Bundesamt für Statistik (BFS)
                </a>
                . Ergänzend werten wir die täglich auf zimmermannjob.ch indexierten
                öffentlichen Stellenausschreibungen aus.
              </p>
              <p>
                <strong>Bandbreite und Mittelwert:</strong> Die Tabelle zeigt
                Richtbänder. Der konkrete Lohn wird im Bewerbungsprozess
                individuell verhandelt und hängt von Erfahrung, Spezialisierung,
                Arbeitgebergrösse, Branche und Region ab. Innerhalb eines Bands
                liegt die Mehrheit (rund zwei Drittel) der ausgewerteten
                Vergleichswerte.
              </p>
              <p>
                <strong>Aktualisierung:</strong> Wir überarbeiten die Lohnbänder
                jährlich beziehungsweise sofort, sobald ein Branchenverband neue
                Empfehlungen veröffentlicht oder sich die Marktlage in einer
                Region merklich verändert. Korrekturhinweise nehmen wir gerne
                über die Kontaktseite entgegen.
              </p>
            </div>
          </details>
        </div>

        {/* FAQ section — conversational query targets */}
        <div className="mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
            Häufig gestellte Fragen
          </h2>
          <div className="space-y-4">
            {HOMEPAGE_FAQS.map((faq, index) => (
              <details
                key={index}
                className="group rounded-lg border border-slate-200 bg-slate-50 overflow-hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors">
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

        {/* Landing page links — crawlable internal links */}
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
            Alle Zimmermannjobs nach Beruf und Kanton
          </h2>
          <nav aria-label="Beliebte Stellenangebote nach Beruf und Kanton">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {TOP_LANDING_PAGES.map((item) => (
                <Link
                  key={`${item.role}-${item.canton}`}
                  href={getLandingPath(item)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:border-primary/40 hover:text-primary transition-colors"
                >
                  {item.role} in {item.canton}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </section>
  );
}

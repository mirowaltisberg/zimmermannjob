import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Allgemeine Geschäftsbedingungen",
  description:
    "AGB von zimmermannjob.ch — Allgemeine Geschäftsbedingungen für die Nutzung der Jobbörse.",
  alternates: {
    canonical: "/agb",
  },
};

export default function AGBPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b header-blur sticky top-0 z-30">
        <div className="container mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center">
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/logo.svg"
              alt="zimmermannjob.ch"
              width={142}
              height={29}
              className="h-7 sm:h-8 w-auto"
              priority
            />
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-2xl">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-8">
          Allgemeine Geschäftsbedingungen (AGB)
        </h1>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">1. Geltungsbereich</h2>
            <p className="text-slate-600 leading-relaxed">
              Diese Allgemeinen Geschäftsbedingungen gelten für die Nutzung der Website
              zimmermannjob.ch, betrieben von der QERO AG, Ifangstrasse 91, 8153 Rümlang, Schweiz.
              Mit der Nutzung dieser Website erklären Sie sich mit diesen AGB einverstanden.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">2. Leistungsbeschreibung</h2>
            <p className="text-slate-600 leading-relaxed">
              zimmermannjob.ch ist eine Online-Jobbörse, die Arbeitgebern die Möglichkeit bietet,
              Stelleninserate zu veröffentlichen, und Stellensuchenden ermöglicht, nach offenen
              Stellen zu suchen und sich direkt zu bewerben. Die Plattform erhebt keinen
              Anspruch auf Vollständigkeit der dargestellten Stellenangebote.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">3. Nutzung durch Stellensuchende</h2>
            <p className="text-slate-600 leading-relaxed">
              Die Nutzung der Jobsuche und Bewerbungsfunktionen ist für Stellensuchende
              kostenlos. Mit dem Einreichen einer Bewerbung über die Plattform bestätigen Sie,
              dass Ihre Angaben wahrheitsgemäss und vollständig sind. Die QERO AG übernimmt
              keine Verantwortung für den weiteren Bewerbungsprozess beim Arbeitgeber.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">4. Nutzung durch Arbeitgeber</h2>
            <p className="text-slate-600 leading-relaxed">
              Arbeitgeber können Stelleninserate gegen Entgelt veröffentlichen. Die Preise
              und Konditionen werden individuell vereinbart. Die QERO AG behält sich das Recht
              vor, Inserate abzulehnen oder zu entfernen, die gegen geltendes Recht oder
              diese AGB verstossen.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">5. Haftung</h2>
            <p className="text-slate-600 leading-relaxed">
              Die QERO AG haftet nicht für die Richtigkeit, Vollständigkeit oder Aktualität
              der veröffentlichten Stelleninserate. Die Verantwortung für den Inhalt der
              Inserate liegt beim jeweiligen Arbeitgeber. Die QERO AG haftet nicht für
              Schäden, die aus der Nutzung oder Nichtnutzung der auf der Website
              bereitgestellten Informationen entstehen, sofern kein vorsätzliches oder
              grob fahrlässiges Verschulden vorliegt.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">6. Geistiges Eigentum</h2>
            <p className="text-slate-600 leading-relaxed">
              Alle Inhalte dieser Website (Texte, Bilder, Grafiken, Logos) sind Eigentum der
              QERO AG und urheberrechtlich geschützt. Jede Vervielfältigung, Verbreitung oder
              sonstige Nutzung bedarf der vorherigen schriftlichen Zustimmung.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">7. Anwendbares Recht und Gerichtsstand</h2>
            <p className="text-slate-600 leading-relaxed">
              Es gilt Schweizer Recht. Gerichtsstand ist Rümlang, Kanton Zürich, Schweiz.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">8. Änderungen der AGB</h2>
            <p className="text-slate-600 leading-relaxed">
              Die QERO AG behält sich das Recht vor, diese AGB jederzeit zu ändern.
              Die aktuelle Version ist auf dieser Seite einsehbar.
              Letzte Aktualisierung: März 2026.
            </p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-primary hover:underline">
            Zurück zur Startseite
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

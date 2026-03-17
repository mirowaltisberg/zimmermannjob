import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Impressum",
  description:
    "Impressum von zimmermannjob.ch — Angaben gemäss Schweizer Recht. Betreiberin: QERO AG, Ifangstrasse 91, 8153 Rümlang.",
  alternates: {
    canonical: "/impressum",
  },
};

export default function ImpressumPage() {
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
          Impressum
        </h1>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Betreiberin</h2>
            <p className="text-slate-600 leading-relaxed">
              QERO AG<br />
              Ifangstrasse 91<br />
              8153 Rümlang<br />
              Schweiz
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Vertretungsberechtigte Personen</h2>
            <p className="text-slate-600 leading-relaxed">
              Arbios Shtanaj, CEO
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Kontakt</h2>
            <p className="text-slate-600 leading-relaxed">
              E-Mail:{" "}
              <a href="mailto:m.waltisberg@qero.ch" className="text-primary hover:underline">
                m.waltisberg@qero.ch
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Verantwortlich für den Inhalt</h2>
            <p className="text-slate-600 leading-relaxed">
              Miró Maximilian Waltisberg
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Haftungsausschluss</h2>
            <p className="text-slate-600 leading-relaxed">
              Die Inhalte dieser Website werden mit grösster Sorgfalt erstellt. Die QERO AG übernimmt
              jedoch keine Gewähr für die Richtigkeit, Vollständigkeit und Aktualität der bereitgestellten
              Inhalte. Die Nutzung der Inhalte erfolgt auf eigenes Risiko. Beiträge Dritter sind als
              solche gekennzeichnet. Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine
              Haftung für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind
              ausschliesslich deren Betreiber verantwortlich.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Urheberrecht</h2>
            <p className="text-slate-600 leading-relaxed">
              Die durch die Betreiberin dieser Website erstellten Inhalte und Werke unterliegen dem
              Schweizer Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
              Verwertung ausserhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung
              der QERO AG.
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

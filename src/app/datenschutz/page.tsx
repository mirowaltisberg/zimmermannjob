import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description:
    "Datenschutzerklärung von zimmermannjob.ch — Informationen zur Erhebung und Verarbeitung personenbezogener Daten gemäss Schweizer DSG.",
  alternates: {
    canonical: "/datenschutz",
  },
};

export default function DatenschutzPage() {
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
          Datenschutzerklärung
        </h1>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">1. Verantwortliche Stelle</h2>
            <p className="text-slate-600 leading-relaxed">
              QERO AG<br />
              Ifangstrasse 91<br />
              8153 Rümlang<br />
              Schweiz<br />
              E-Mail:{" "}
              <a href="mailto:m.waltisberg@qero.ch" className="text-primary hover:underline">
                m.waltisberg@qero.ch
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">2. Erhebung und Verarbeitung von Daten</h2>
            <p className="text-slate-600 leading-relaxed">
              Beim Besuch unserer Website werden automatisch technische Daten erhoben, die Ihr Browser
              an unseren Server übermittelt. Dazu gehören: IP-Adresse, Datum und Uhrzeit der Anfrage,
              Zeitzonendifferenz zur GMT, Inhalt der Anforderung, Zugriffsstatus/HTTP-Statuscode,
              jeweils übertragene Datenmenge, Referrer-URL, Browsertyp und -version, Betriebssystem.
            </p>
            <p className="text-slate-600 leading-relaxed mt-2">
              Diese Daten werden ausschliesslich zur Sicherstellung eines reibungslosen Verbindungsaufbaus
              und zur Systemsicherheit verwendet. Eine Zusammenführung mit anderen Datenquellen
              findet nicht statt.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">3. Bewerbungen</h2>
            <p className="text-slate-600 leading-relaxed">
              Wenn Sie sich über zimmermannjob.ch auf eine Stelle bewerben, werden die von Ihnen
              eingegebenen Daten (Name, E-Mail, Lebenslauf, Anschreiben) direkt an den
              ausschreibenden Arbeitgeber weitergeleitet. Wir speichern diese Daten nicht dauerhaft
              auf unseren Servern. Die Verarbeitung Ihrer Bewerbungsdaten durch den Arbeitgeber
              unterliegt dessen eigener Datenschutzerklärung.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">4. Cookies und Analyse-Tools</h2>
            <p className="text-slate-600 leading-relaxed">
              Diese Website verwendet Cookies, um die Nutzererfahrung zu verbessern. Wir setzen
              Google Analytics und Vercel Analytics ein, um anonymisierte Nutzungsstatistiken zu
              erheben. Diese Daten helfen uns, die Website zu verbessern. Sie können Cookies in
              Ihren Browsereinstellungen jederzeit deaktivieren.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">5. Ihre Rechte</h2>
            <p className="text-slate-600 leading-relaxed">
              Gemäss dem Schweizer Datenschutzgesetz (DSG) haben Sie das Recht auf Auskunft über
              Ihre gespeicherten personenbezogenen Daten, das Recht auf Berichtigung, Löschung
              oder Einschränkung der Verarbeitung. Zur Ausübung dieser Rechte wenden Sie sich
              bitte an:{" "}
              <a href="mailto:m.waltisberg@qero.ch" className="text-primary hover:underline">
                m.waltisberg@qero.ch
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">6. Hosting</h2>
            <p className="text-slate-600 leading-relaxed">
              Diese Website wird bei Vercel Inc. (San Francisco, USA) gehostet. Vercel kann
              technische Daten (z.B. IP-Adressen) verarbeiten, um die Website bereitzustellen.
              Weitere Informationen finden Sie in der Datenschutzerklärung von Vercel.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">7. Änderungen</h2>
            <p className="text-slate-600 leading-relaxed">
              Wir behalten uns vor, diese Datenschutzerklärung jederzeit anzupassen. Die aktuelle
              Version ist auf dieser Seite einsehbar. Letzte Aktualisierung: März 2026.
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

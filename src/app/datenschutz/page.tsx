import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import {
  getApplicationControllerIdentity,
  getApplicationsConfig,
} from "@/lib/applications-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Datenschutz",
  description: "Datenschutzhinweise für zimmermannjob.ch",
  alternates: { canonical: "/datenschutz" },
  robots: { index: false, follow: false },
};

export default function DatenschutzPage() {
  const controller = getApplicationControllerIdentity();
  const applicationsConfig = getApplicationsConfig();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-slate-900">zimmermannjob.ch</Link>
          <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">Zur Startseite</Link>
        </div>
      </header>

      <main id="main-content" className="flex-1 container mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-14">
        <article className="rounded-2xl border bg-white p-6 sm:p-9 shadow-sm space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Datenschutz</h1>
            <p className="mt-3 text-slate-600">
              Diese Seite informiert über die Verarbeitung von Angaben im Bewerbungsbereich von zimmermannjob.ch.
            </p>
          </div>

          {!controller ? (
            <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h2 className="font-semibold text-amber-950">Bewerbungen sind deaktiviert</h2>
              <p className="mt-2 text-sm text-amber-900">
                Für den Bewerbungsbereich ist noch kein datenschutzrechtlich Verantwortlicher konfiguriert. Deshalb werden über diese Website keine Bewerbungsangaben oder Lebensläufe entgegengenommen. Es wird keine verantwortliche Person oder Organisation angenommen oder erfunden.
              </p>
            </section>
          ) : (
            <section>
              <h2 className="text-xl font-semibold text-slate-900">Verantwortlicher</h2>
              <address className="mt-3 not-italic text-slate-700 whitespace-pre-line">
                {controller.name}{"\n"}
                {controller.address}{"\n"}
                <a className="underline" href={`mailto:${controller.email}`}>{controller.email}</a>
              </address>
            </section>
          )}

          {controller && !applicationsConfig && (
            <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h2 className="font-semibold text-amber-950">Online-Einreichung derzeit nicht verfügbar</h2>
              <p className="mt-2 text-sm text-amber-900">
                Die erforderlichen technischen und organisatorischen Schutzmassnahmen sind noch nicht vollständig konfiguriert. Das Bewerbungsformular bleibt deshalb deaktiviert.
              </p>
            </section>
          )}

          <section>
            <h2 className="text-xl font-semibold text-slate-900">Verarbeitung bei aktivierter Einreichung</h2>
            <div className="mt-3 space-y-3 text-slate-700">
              <p>
                Erst nach ausdrücklicher Einwilligung werden Name, E-Mail-Adresse, Telefonnummer, Stellen-ID und ein PDF-Lebenslauf zur internen Prüfung gespeichert. Die Einwilligung wird mit Zeitpunkt und Textversion dokumentiert.
              </p>
              <p>
                Der Lebenslauf wird unter einem zufälligen Dateipfad in einem privaten Speicherbereich abgelegt. Die IP-Adresse wird nicht im Klartext gespeichert; für die Missbrauchsbegrenzung wird nur ein nicht rückrechenbarer, serverseitig geschützter Hash verwendet.
              </p>
              <p>
                Eine Einreichung über diese Website ist keine Bestätigung, dass Unterlagen an einen Arbeitgeber weitergeleitet wurden. Eine automatische Weiterleitung findet nicht statt.
              </p>
            </div>
          </section>

          {applicationsConfig && (
            <section>
              <h2 className="text-xl font-semibold text-slate-900">Aufbewahrung</h2>
              <p className="mt-3 text-slate-700">
                Für neue Einreichungen wird ein Löschprüfdatum nach {applicationsConfig.retentionDays} Tagen vermerkt. Die tatsächliche Löschung muss durch den verantwortlichen Betriebsprozess sichergestellt werden.
              </p>
            </section>
          )}

          <section>
            <h2 className="text-xl font-semibold text-slate-900">Auskunft und weitere Rechte</h2>
            <p className="mt-3 text-slate-700">
              Betroffene Personen können gegenüber dem konfigurierten Verantwortlichen Auskunft, Berichtigung oder Löschung verlangen und eine Einwilligung für die Zukunft widerrufen. Solange kein Verantwortlicher angegeben ist, bleibt die Online-Einreichung deaktiviert.
            </p>
          </section>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Preise & Pakete",
  description:
    "Erfahren Sie mehr über die Inseratepreise und Pakete auf zimmermannjob.ch — der spezialisierten Jobbörse für Holzbau-Fachkräfte.",
  alternates: {
    canonical: "/arbeitgeber/preise",
  },
};

export default function PreisePage() {
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

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4">
          Preise & Pakete
        </h1>
        <p className="text-slate-600 mb-8 leading-relaxed">
          Publizieren Sie Ihre offenen Stellen auf zimmermannjob.ch — der
          spezialisierten Jobbörse für Holzbau-Fachkräfte in der Schweiz. Wir
          bieten attraktive Konditionen für Einzelinserate und Firmenpakete.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-2">Einzelinserat</h2>
              <p className="text-slate-600 text-sm mb-4">
                Eine Stellenanzeige für 30 Tage, mit voller Sichtbarkeit auf
                allen relevanten Suchseiten.
              </p>
              <p className="text-sm text-slate-500">Preis auf Anfrage</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-2">Firmenpaket</h2>
              <p className="text-slate-600 text-sm mb-4">
                Mehrere Stellenanzeigen mit Mengenrabatt, Logo-Integration und
                bevorzugter Platzierung.
              </p>
              <p className="text-sm text-slate-500">Preis auf Anfrage</p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-slate-600 mb-4">Kontaktieren Sie uns für ein individuelles Angebot:</p>
          <Button asChild size="lg">
            <a href="mailto:info@zimmermannjob.ch">info@zimmermannjob.ch kontaktieren</a>
          </Button>
        </div>
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-primary hover:underline">
            Zurück zur Startseite
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

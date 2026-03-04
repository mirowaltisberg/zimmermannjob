import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Kontakt & Support",
  description:
    "Kontaktieren Sie das Team von zimmermannjob.ch — wir helfen Ihnen bei Fragen rund um Stelleninserate und Bewerbungen.",
};

export default function KontaktPage() {
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

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-lg">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4">
          Kontakt & Support
        </h1>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Haben Sie Fragen zu zimmermannjob.ch? Ob Sie als Arbeitgeber inserieren
          oder als Fachkraft nach einem neuen Job suchen — unser Team hilft
          Ihnen gerne weiter.
        </p>
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 mb-1">E-Mail</h2>
            <a
              href="mailto:info@zimmermannjob.ch"
              className="text-primary hover:underline text-sm"
            >
              info@zimmermannjob.ch
            </a>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 mb-1">Anliegen</h2>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>Stellenanzeige aufgeben</li>
              <li>Technischer Support</li>
              <li>Feedback & Verbesserungsvorschläge</li>
              <li>Partnerschaftsanfragen</li>
            </ul>
          </div>
          <Button asChild className="w-full">
            <a href="mailto:info@zimmermannjob.ch">E-Mail senden</a>
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

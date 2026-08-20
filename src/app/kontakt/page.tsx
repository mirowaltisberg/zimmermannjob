import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { SiteBrand } from "@/components/site-brand";

export const metadata: Metadata = {
  title: "Kontakt & Support",
  description:
    "Kontaktmöglichkeit für Fragen und Hinweise zu zimmermannjob.ch.",
  alternates: {
    canonical: "/kontakt",
  },
  openGraph: {
    title: "Kontakt & Support | zimmermannjob.ch",
    description: "Kontaktmöglichkeit für Fragen und Hinweise zu zimmermannjob.ch.",
    url: "/kontakt",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kontakt & Support | zimmermannjob.ch",
    description: "Kontaktmöglichkeit für Fragen und Hinweise zu zimmermannjob.ch.",
  },
};

export default function KontaktPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="trade-header border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 sm:px-6 h-16 sm:h-[4.5rem] flex items-center">
          <Link href="/" className="flex items-center shrink-0">
            <SiteBrand />
          </Link>
        </div>
      </header>

      <main id="main-content" className="flex-1 container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-lg">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4">
          Kontakt & Support
        </h1>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Haben Sie eine Frage oder einen Hinweis zu zimmermannjob.ch? Schreiben
          Sie uns per E-Mail. Es gilt keine zugesicherte Antwortzeit.
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
              <li>Fragen zum geplanten Arbeitgeber-Angebot</li>
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

import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { SiteBrand } from "@/components/site-brand";

export const metadata: Metadata = {
  title: "Angebot für Arbeitgeber im Aufbau",
  description:
    "Das Publikationsangebot für Arbeitgeber auf zimmermannjob.ch ist noch nicht buchbar.",
  alternates: {
    canonical: "/arbeitgeber/preise",
  },
  robots: { index: false, follow: true },
};

export default function PreisePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="trade-header border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 sm:px-6 h-16 sm:h-[4.5rem] flex items-center">
          <Link href="/" className="flex items-center shrink-0">
            <SiteBrand />
          </Link>
        </div>
      </header>

      <main id="main-content" className="flex-1 container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4">
          Angebot für Arbeitgeber
        </h1>
        <p className="text-slate-600 mb-8 leading-relaxed">
          Das Publikationsangebot für Arbeitgeber befindet sich im Aufbau.
          Derzeit sind weder Self-Service-Inserate noch veröffentlichte Pakete
          oder Preise buchbar.
        </p>

        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-slate-600 mb-4">
            Sie können uns Ihr Interesse mitteilen. Eine Kontaktaufnahme
            begründet noch keine Buchung oder Publikation.
          </p>
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

import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { SiteBrand } from "@/components/site-brand";

export const metadata: Metadata = {
  title: "Kandidatenzugang im Aufbau",
  description:
    "Der Kandidatenzugang von zimmermannjob.ch ist noch nicht verfügbar.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function KandidatenPage() {
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
          Kandidatenzugang
        </h1>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Dieser Bereich befindet sich im Aufbau. Derzeit gibt es keinen
          zugänglichen Kandidatenpool und keine buchbare Suchfunktion.
        </p>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-600 mb-4">
            Fragen zum geplanten Angebot beantworten wir per E-Mail:
          </p>
          <Button asChild className="w-full">
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

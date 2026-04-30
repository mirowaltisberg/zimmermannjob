import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { TOP_LANDING_PAGES, getLandingPath } from "@/lib/landing-pages";

export const metadata: Metadata = {
  title: "Seite nicht gefunden",
  description: "Die gewünschte Seite konnte nicht gefunden werden. Finde aktuelle Zimmermannjobs auf zimmermannjob.ch.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: null,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b header-blur">
        <div className="container mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center">
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/logo.svg"
              alt="zimmermannjob.ch — Zimmermannjobs in der Schweiz"
              width={142}
              height={29}
              className="h-7 sm:h-8 w-auto"
              priority
            />
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <p className="text-6xl font-black text-primary mb-4">404</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            Seite nicht gefunden
          </h1>
          <p className="text-slate-600 mb-8">
            Die gewünschte Seite existiert nicht oder wurde verschoben.
            Nutze die Suche, um aktuelle Zimmermannjobs zu finden.
          </p>
          <Button asChild size="lg" className="rounded-xl btn-interactive shadow-md shadow-primary/20">
            <Link href="/">Zur Startseite</Link>
          </Button>

          <div className="mt-12 text-left">
            <h2 className="text-lg font-bold text-slate-900 mb-3">Beliebte Suchseiten</h2>
            <nav aria-label="Beliebte Stellenangebote">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TOP_LANDING_PAGES.slice(0, 12).map((page) => (
                  <Link
                    key={`${page.role}-${page.canton}`}
                    href={getLandingPath(page)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:border-primary/40 hover:text-primary transition-colors"
                  >
                    {page.role} in {page.canton}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        </div>
      </main>
    </div>
  );
}

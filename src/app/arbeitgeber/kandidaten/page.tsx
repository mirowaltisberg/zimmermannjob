import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Kandidatenzugang",
  description:
    "Erhalten Sie Zugang zum Kandidatenpool von zimmermannjob.ch — qualifizierte Holzbau-Fachkräfte in der Schweiz.",
};

export default function KandidatenPage() {
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
          Kandidatenzugang
        </h1>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Mit dem Kandidatenzugang von zimmermannjob.ch finden Sie qualifizierte
          Holzbau-Fachkräfte in der ganzen Schweiz. Dieser Service befindet sich
          derzeit im Aufbau.
        </p>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-600 mb-4">
            Kontaktieren Sie uns für weitere Informationen:
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

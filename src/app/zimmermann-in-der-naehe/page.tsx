import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { ZIMMERMANN_CITIES } from "@/lib/zimmermann-cities";

export const metadata: Metadata = {
  title: "Zimmermann in der Nähe | Jobs in deiner Stadt finden",
  description:
    "Zimmermannstellen nach ausgewählten Schweizer Städten und Regionen durchsuchen.",
  alternates: { canonical: "/zimmermann-in-der-naehe" },
  openGraph: {
    title: "Zimmermann in der Nähe | Jobs in deiner Stadt finden",
    description: "Zimmermannstellen nach ausgewählten Schweizer Städten und Regionen durchsuchen.",
    url: "/zimmermann-in-der-naehe",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zimmermann in der Nähe | Jobs in deiner Stadt finden",
    description: "Zimmermannstellen nach ausgewählten Schweizer Städten und Regionen durchsuchen.",
  },
};

export const revalidate = 86400;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zimmermannjob.ch";

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Startseite", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Zimmermann in der Nähe", item: `${SITE_URL}/zimmermann-in-der-naehe` },
  ],
};

export default function NaehePage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema} />

      <main id="main-content" className="bg-background">
        <section className="trade-hero">
          <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-4xl">
            <nav className="text-sm text-slate-500 mb-3" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-primary">Startseite</Link>
              <span className="mx-2">/</span>
              <span className="text-slate-700">Zimmermann in der Nähe</span>
            </nav>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight mb-4">
              Zimmermann <span className="text-primary">in deiner Nähe</span>
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed max-w-3xl">
              Wähle eine Stadt als Ausgangspunkt für die Stellensuche. Die
              Trefferzahl und der genaue Arbeitsort ergeben sich aus dem
              aktuellen Inseratebestand.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 py-10 max-w-5xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Städte durchsuchen</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            { ZIMMERMANN_CITIES.map((c) => (
              <Link
                key={c.slug}
                href={`/zimmermann-jobs/${c.slug}`}
                className="link-tile block p-4 pr-10 hover:border-primary/50 transition"
              >
                <div className="font-semibold text-slate-900 mb-1">Zimmermann Jobs {c.name}</div>
                <div className="text-sm text-slate-600 mb-2">{c.region} · {c.cantonAbbr}</div>
                <div className="text-xs text-slate-500">Orte in der Region: {c.nearbyPlaces.slice(0, 3).join(", ")}</div>
              </Link>
            ))}
          </div>
        </section>

        <section className="editorial-surface border-y">
          <div className="container mx-auto px-4 sm:px-6 py-10 max-w-4xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">So findest du Stellen in deiner Nähe</h2>
            <ol className="space-y-3 text-slate-700 list-decimal list-inside">
              <li>Wähle eine Stadt als Ausgangspunkt.</li>
              <li>Prüfe den genauen Arbeitsort im jeweiligen Inserat.</li>
              <li>Erweitere den Ortsfilter bei Bedarf auf umliegende Orte oder den Kanton.</li>
              <li>Verlasse dich bei Pensum, Lohn und Mobilität auf die Angaben des Inserats.</li>
            </ol>
          </div>
        </section>

        <section className="bg-primary/5 border-t">
          <div className="container mx-auto px-4 sm:px-6 py-10 max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Direkt zur Stellensuche</h2>
            <p className="text-slate-600 mb-5">
              Durchsuche den aktuell verfügbaren Inseratebestand.
            </p>
            <Button asChild>
              <Link href="/">Jetzt Stellen durchsuchen</Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

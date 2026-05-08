import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ZIMMERMANN_CITIES, findZimmermannCity } from "@/lib/zimmermann-cities";
import { searchJobListings } from "@/lib/job-catalog";
import { buildJobPostingSchema } from "@/lib/job-schema";
import { MapPin, Wallet } from "lucide-react";

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.zimmermannjob.ch";

interface PageProps {
  params: Promise<{ city: string }>;
}

const ROLE_LINKS: { slug: string; label: string }[] = [
  { slug: "zimmermann-efz", label: "Zimmermann EFZ" },
  { slug: "holzbauer-efz", label: "Holzbauer EFZ" },
  { slug: "holzbau-vorarbeiter", label: "Holzbau-Vorarbeiter" },
  { slug: "holzbau-polier", label: "Holzbau-Polier" },
  { slug: "holzbauplaner", label: "Holzbauplaner" },
  { slug: "projektleiter-holzbau", label: "Projektleiter Holzbau" },
];

export async function generateStaticParams() {
  return ZIMMERMANN_CITIES.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = findZimmermannCity(citySlug);
  if (!city) return { title: "Zimmermann Jobs" };

  const title = `Zimmermann Jobs ${city.name} 2026 | Stellen für Zimmermann in ${city.name}`;
  const description = `Offene Zimmermann Stellen in ${city.name} (${city.cantonAbbr}). Lohn ${city.salaryBand}, tägliche Updates aus der ${city.region}.`;

  return {
    title,
    description,
    alternates: { canonical: `/zimmermann-jobs/${city.slug}` },
    openGraph: {
      title,
      description,
      url: `/zimmermann-jobs/${city.slug}`,
      type: "website",
      locale: "de_CH",
    },
  };
}

export default async function ZimmermannCityPage({ params }: PageProps) {
  const { city: citySlug } = await params;
  const city = findZimmermannCity(citySlug);
  if (!city) notFound();

  const result = await searchJobListings({
    q: "Zimmermann",
    loc: city.name,
    limit: 18,
    offset: 0,
    sort: "newest",
  });

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Startseite", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: `Zimmermann Jobs ${city.name}`,
        item: `${SITE_URL}/zimmermann-jobs/${city.slug}`,
      },
    ],
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Zimmermann Jobs ${city.name}`,
    description: `Offene Zimmermann Stellen in ${city.name}`,
    numberOfItems: result.jobs.length,
    itemListElement: result.jobs.slice(0, 15).map((job, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/jobs/${job.id}`,
      name: job.title,
    })),
  };

  const FAQS = [
    {
      question: `Wie viele Zimmermann Stellen gibt es aktuell in ${city.name}?`,
      answer: `In ${city.name} und Umgebung sind regelmässig zwischen 20 und 120 offene Zimmermann Stellen ausgeschrieben. Die Zahl schwankt mit Saison, Bautätigkeit und Auftragslage. Pendelbereite Bewerbende erweitern den Suchradius typischerweise auf ${city.commuterTowns.slice(0, 3).join(", ")} und finden so 2- bis 3-mal mehr passende Stellen.`,
    },
    {
      question: `Was verdient ein Zimmermann in ${city.name}?`,
      answer: `Ein Zimmermann verdient in ${city.name} typischerweise ${city.salaryBand} pro Jahr (12 × Monatslohn). Berufseinsteiger starten am unteren Ende, mit fünf Jahren Erfahrung und Spezialisierungen verschiebt sich der Lohn deutlich nach oben. Detaillierte Vergleichstabellen findest du auf der Lohnübersicht.`,
    },
    {
      question: `Welche Arbeitgeber suchen Zimmermann in ${city.name}?`,
      answer: `${city.intro} Typische Arbeitgeber sind klassische Schweizer KMU mit 5 bis 80 Mitarbeitenden, spezialisierte Servicefirmen und grössere Industriearbeitgeber. Ergänzt wird das Angebot durch Personaldienstleister mit Temporär- und Vermittlungsstellen.`,
    },
    {
      question: `Wie pendle ich am besten zu einem Zimmermann Job in ${city.name}?`,
      answer: `${city.name} ist gut mit ÖV erreichbar — Arbeitsplätze liegen im Stadtgebiet (${city.districts.slice(0, 3).join(", ")}) oder in Industrie- und Gewerbezonen am Stadtrand. Pendelorte ${city.commuterTowns.join(", ")} sind typische Wohnorte für ${city.name}-Fachkräfte.`,
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={itemListSchema} />
      <JsonLd data={faqSchema} />
      {result.jobs.slice(0, 10).map((job) => (
        <JsonLd key={`schema-${job.source}-${job.id}`} data={buildJobPostingSchema(job)} />
      ))}

      <main className="bg-white">
        <section className="bg-primary/5 border-b">
          <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-14 max-w-5xl">
            <nav className="text-sm text-slate-500 mb-3" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-primary">Startseite</Link>
              <span className="mx-2">/</span>
              <span className="text-slate-700">Zimmermann Jobs {city.name}</span>
            </nav>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight mb-4">
              Zimmermann Jobs <span className="text-primary">{city.name}</span>
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed mb-4 max-w-3xl">{city.intro}</p>
            <div className="flex flex-wrap gap-2 text-xs text-slate-600 mb-6">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                Region: {city.region}
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                Lohn-Band: {city.salaryBand}
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                {result.total}+ offene Stellen
              </span>
            </div>
            <Button asChild>
              <Link href={`/?loc=${encodeURIComponent(city.name)}`}>
                Jetzt in {city.name} suchen
              </Link>
            </Button>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 py-10 max-w-5xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Offene Zimmermann Stellen in {city.name}
          </h2>
          {result.jobs.length === 0 ? (
            <p className="text-slate-600">
              Aktuell laden wir die Inserate. Schau gleich auf der{" "}
              <Link href="/" className="text-primary underline">Startseite</Link> vorbei.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {result.jobs.slice(0, 12).map((job) => (
                <Card key={`${job.source}-${job.id}`} className="hover:border-primary/40 transition">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2">
                      <Link href={`/jobs/${job.id}`} className="hover:text-primary">
                        {job.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-slate-600 mb-2 line-clamp-1">
                      {job.company || "Schweizer Zimmerei / Holzbau-Betrieb"}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.location || city.name}
                      </span>
                      {job.salary && (
                        <span className="inline-flex items-center gap-1">
                          <Wallet className="h-3 w-3" />
                          {job.salary}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="bg-slate-50 border-y">
          <div className="container mx-auto px-4 sm:px-6 py-10 max-w-5xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Zimmermann Berufe in {city.name}
            </h2>
            <p className="text-slate-600 mb-5">
              Spezifische Profile in {city.name} und im Kanton {city.cantonAbbr}:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {ROLE_LINKS.map((r) => (
                <span
                  key={r.slug}
                  className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                >
                  {r.label} — {city.name}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 py-10 max-w-4xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Pendeln: Wohnorte rund um {city.name}
          </h2>
          <p className="text-slate-600 mb-4">
            Pendelbereite Fachkräfte wohnen typischerweise in einem dieser Orte und arbeiten in {city.name}:
          </p>
          <div className="flex flex-wrap gap-2">
            {city.commuterTowns.map((town) => (
              <span key={town} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700">
                {town}
              </span>
            ))}
          </div>
          <p className="text-slate-500 text-sm mt-4">
            Stadtteile mit hoher Nachfrage: {city.districts.join(", ")}.
          </p>
        </section>

        <section className="bg-slate-50 border-t">
          <div className="container mx-auto px-4 sm:px-6 py-10 max-w-4xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-5">
              Häufig gestellte Fragen — Zimmermann Jobs {city.name}
            </h2>
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <details key={i} className="group rounded-lg border border-slate-200 bg-white overflow-hidden">
                  <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                    {faq.question}
                    <span className="ml-2 shrink-0 text-slate-400 transition-transform group-open:rotate-180" aria-hidden>▾</span>
                  </summary>
                  <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed">{faq.answer}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 py-10 max-w-4xl">
          <h2 className="text-xl font-bold text-slate-900 mb-3">Andere Schweizer Städte</h2>
          <div className="flex flex-wrap gap-2">
            { ZIMMERMANN_CITIES.filter((c) => c.slug !== city.slug).map((c) => (
              <Link
                key={c.slug}
                href={`/zimmermann-jobs/${c.slug}`}
                className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:border-primary/40 hover:text-primary transition"
              >
                Zimmermann Jobs {c.name}
              </Link>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

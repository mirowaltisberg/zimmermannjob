import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Wallet } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ZIMMERMANN_CITIES, findZimmermannCity } from "@/lib/zimmermann-cities";
import { searchJobListings } from "@/lib/job-catalog";

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zimmermannjob.ch";

interface PageProps {
  params: Promise<{ city: string }>;
}

const ROLE_LABELS = [
  "Zimmermann EFZ",
  "Holzbauer Montage",
  "Holzbau-Fachperson",
  "Konstrukteur Holzbau",
  "Projektleiter Holzbau",
  "Vorarbeiter Holzbau",
];

export async function generateStaticParams() {
  return ZIMMERMANN_CITIES.map((city) => ({ city: city.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = findZimmermannCity(citySlug);
  if (!city) return { title: "Zimmermann Jobs" };

  const title = `Zimmermann Jobs ${city.name}`;
  const description = `Stelleninserate mit Zimmermannbezug für ${city.name} und Umgebung. Arbeitsort und Anforderungen im jeweiligen Inserat prüfen.`;

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
    // No real inventory/editorial gate exists for these generated city pages.
    robots: { index: false, follow: true },
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
    numberOfItems: result.jobs.length,
    itemListElement: result.jobs.slice(0, 15).map((job, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/jobs/${job.id}`,
      name: job.title,
    })),
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={itemListSchema} />

      <main id="main-content" className="bg-background">
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
            <p className="text-slate-600 text-lg leading-relaxed mb-4 max-w-3xl">
              Diese Seite zeigt Suchtreffer mit Zimmermannbezug für {city.name}.
              Sie erhebt keinen Anspruch auf Vollständigkeit. Prüfe den genauen
              Arbeitsort und den Einsatzradius im jeweiligen Inserat.
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-slate-600 mb-6">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                Region: {city.region}
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                {result.total} {result.total === 1 ? "Treffer" : "Treffer"}
              </span>
            </div>
            <Button asChild>
              <Link href={`/?loc=${encodeURIComponent(city.name)}`}>
                In {city.name} suchen
              </Link>
            </Button>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 py-10 max-w-5xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Suchtreffer für {city.name}
          </h2>
          {result.jobs.length === 0 ? (
            <p className="text-slate-600">
              Für diese Abfrage sind derzeit keine Treffer verfügbar. Nutze die{" "}
              <Link href="/" className="text-primary underline">Stellensuche</Link>{" "}
              mit einem anderen Ort oder ohne Ortsfilter.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {result.jobs.slice(0, 12).map((job) => (
                <Card key={job.id} className="hover:border-primary/40 transition">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2">
                      <Link href={`/jobs/${job.id}`} className="hover:text-primary">
                        {job.title}
                      </Link>
                    </h3>
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
              Zimmermann-Berufsbezeichnungen in der Suche
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ROLE_LABELS.map((role) => (
                <span
                  key={role}
                  className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 py-10 max-w-4xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Weitere Orte in der Region
          </h2>
          <p className="text-slate-600 mb-4">
            Diese Orte können als separate Suchbegriffe verwendet werden; damit
            wird keine Aussage über Pendelverhalten oder Nachfrage gemacht.
          </p>
          <div className="flex flex-wrap gap-2">
            {city.nearbyPlaces.map((place) => (
              <span key={place} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700">
                {place}
              </span>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 pb-10 max-w-4xl">
          <h2 className="text-xl font-bold text-slate-900 mb-3">Andere Städte</h2>
          <div className="flex flex-wrap gap-2">
            {ZIMMERMANN_CITIES.filter((item) => item.slug !== city.slug).map((item) => (
              <Link
                key={item.slug}
                href={`/zimmermann-jobs/${item.slug}`}
                className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:border-primary/40 hover:text-primary transition"
              >
                Zimmermann Jobs {item.name}
              </Link>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

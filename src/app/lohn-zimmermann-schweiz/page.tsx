import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { ZIMMERMANN_CITIES } from "@/lib/zimmermann-cities";

export const metadata: Metadata = {
  title: "Lohn Zimmermann Schweiz 2026 | Gehalt nach Beruf, Kanton & Erfahrung",
  description:
    "Wie viel verdient ein Zimmermann in der Schweiz? Lohn nach Beruf, Kanton, Erfahrung und Spezialisierung — Daten 2026.",
  alternates: { canonical: "/lohn-zimmermann-schweiz" },
};

export const revalidate = 86400;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.zimmermannjob.ch";

const ROLE_SALARIES: { role: string; entry: string; mid: string; senior: string; slug: string }[] = [
  { role: "Zimmermann EFZ", entry: "62'000 – 70'000", mid: "72'000 – 85'000", senior: "82'000 – 95'000", slug: "zimmermann-efz" },
  { role: "Holzbauer EFZ", entry: "62'000 – 70'000", mid: "72'000 – 85'000", senior: "82'000 – 95'000", slug: "holzbauer-efz" },
  { role: "Holzbau-Vorarbeiter", entry: "75'000 – 85'000", mid: "88'000 – 100'000", senior: "100'000 – 115'000", slug: "holzbau-vorarbeiter" },
  { role: "Holzbau-Polier", entry: "82'000 – 92'000", mid: "95'000 – 110'000", senior: "110'000 – 130'000", slug: "holzbau-polier" },
  { role: "Holzbauplaner", entry: "70'000 – 80'000", mid: "82'000 – 100'000", senior: "98'000 – 120'000", slug: "holzbauplaner" },
  { role: "Projektleiter Holzbau", entry: "82'000 – 92'000", mid: "95'000 – 115'000", senior: "110'000 – 140'000", slug: "projektleiter-holzbau" },
];

const FAQS = [
  {
    question: "Wie viel verdient ein Zimmermann in der Schweiz?",
    answer:
      "Ein Zimmermann in der Schweiz verdient im Durchschnitt zwischen CHF 68'000 – 88'000 pro Jahr — abhängig von Beruf, Erfahrung, Kanton und Arbeitgeber. Berufseinsteiger nach EFZ-Lehrabschluss starten am unteren Ende, mit drei bis fünf Jahren Erfahrung verschiebt sich das Salärband nach oben. Spezialisierungen, Weiterbildungen und der 13. Monatslohn (in der Branche Standard) erhöhen das Jahreseinkommen zusätzlich.",
  },
  {
    question: "Welcher Kanton zahlt Zimmermann am besten?",
    answer:
      "Die höchsten Löhne zahlen Zug, Zürich und Basel-Stadt — typisch 5 bis 12 Prozent über dem Schweizer Mittel. Im Mittelfeld liegen Bern, Aargau und Luzern. Tendenziell tiefer (−3 bis −5 Prozent) sind Fribourg, Solothurn und Graubünden — dafür sind dort die Lebenshaltungskosten und Mietpreise spürbar tiefer. Der Nettolohn-Vergleich lohnt sich also immer mit Steuer- und Lebenskostenrechner.",
  },
  {
    question: "Wie viel verdient ein Lehrling im Beruf Zimmermann EFZ?",
    answer:
      "Lehrlinge verdienen je nach Kanton, Branche und Lehrjahr zwischen CHF 700 und CHF 1'600 pro Monat. Genaue Empfehlungen veröffentlicht der Branchenverband Holzbau Schweiz jährlich. In den meisten Lehrverhältnissen ist der 13. Monatslohn Standard. Die Lehre dauert 4 Jahre (Zimmermann EFZ); alternativ gibt es Holzbearbeiter EBA (2 Jahre).",
  },
  {
    question: "Welche Spezialisierungen erhöhen den Lohn am stärksten?",
    answer:
      "Drei Hebel funktionieren am besten: Erstens eine technische Spezialisierung (5 bis 12 Prozent mehr). Zweitens Weiterbildung — Vorarbeiter, Polier, Projektleiter oder eidg. dipl. Meister heben das Salärband um CHF 10'000 bis CHF 25'000. Drittens ein Wechsel des Arbeitgebers — bei intern blockierten Lohnerhöhungen ist ein Stellenwechsel oft der schnellste Weg, weil Konkurrenzunternehmen aktuell aktiv um Fachkräfte werben.",
  },
  {
    question: "Gilt der GAV für mich als Zimmermann in der Schweiz?",
    answer:
      "Der GAV Holzbau Schweiz regelt Mindestlöhne, Arbeitszeit, Ferien, Krankheits- und Unfalltaggeld sowie Spesen für die Branche. Allgemeinverbindlich erklärte GAV gelten für alle Betriebe der Branche unabhängig von Verbandsmitgliedschaft. Prüfe vor Vertragsunterschrift deinen Lohn gegen die aktuellen GAV-Mindestsätze und Erfahrungsstufen — bei Differenzen besteht Anspruch auf Nachzahlung.",
  },
];

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Startseite", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Lohn Zimmermann Schweiz", item: `${SITE_URL}/lohn-zimmermann-schweiz` },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Lohn Zimmermann Schweiz 2026",
  description: "Übersicht der Löhne für Zimmermann in der Schweiz — nach Beruf, Erfahrung und Kanton.",
  datePublished: "2026-05-08",
  dateModified: "2026-05-08",
  author: { "@type": "Organization", name: "zimmermannjob.ch" },
  publisher: {
    "@type": "Organization",
    name: "zimmermannjob.ch",
    logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.svg` },
  },
};

export default function LohnPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={articleSchema} />

      <main className="bg-white">
        <section className="bg-primary/5 border-b">
          <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-4xl">
            <nav className="text-sm text-slate-500 mb-3" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-primary">Startseite</Link>
              <span className="mx-2">/</span>
              <span className="text-slate-700">Lohn Zimmermann Schweiz</span>
            </nav>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight mb-4">
              Lohn <span className="text-primary">Zimmermann</span> Schweiz 2026
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed max-w-3xl">
              Aktuelle Löhne für Zimmermann in der Schweiz — nach Beruf, Erfahrungsstufe und Kanton. Daten Stand 2026, basierend auf GAV Holzbau Schweiz, Lohnstrukturerhebung BFS und unseren eigenen Auswertungen von Stelleninseraten.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 py-10 max-w-5xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Lohn nach Beruf & Erfahrung</h2>
          <p className="text-slate-600 mb-6">
            Bruttojahreslöhne in CHF (12 × Monatslohn, ohne 13. ML und Boni) für die wichtigsten Berufe der Zimmerei-Branche in der Schweiz.
          </p>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-slate-700">
                  <th className="px-4 py-3 font-semibold">Beruf</th>
                  <th className="px-4 py-3 font-semibold">Einsteiger</th>
                  <th className="px-4 py-3 font-semibold">Mit Erfahrung</th>
                  <th className="px-4 py-3 font-semibold">Senior / Spezialist</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {ROLE_SALARIES.map((r) => (
                  <tr key={r.slug} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{r.role}</td>
                    <td className="px-4 py-3 text-slate-600">CHF {r.entry}</td>
                    <td className="px-4 py-3 text-slate-600">CHF {r.mid}</td>
                    <td className="px-4 py-3 text-slate-600">CHF {r.senior}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-slate-500 text-xs mt-3">
            Werte sind Schätzungen auf Basis von Stelleninseraten und GAV Holzbau Schweiz. Konkrete Saläre hängen von Arbeitgeber, Region und Spezialisierung ab.
          </p>
        </section>

        <section className="bg-slate-50 border-y">
          <div className="container mx-auto px-4 sm:px-6 py-10 max-w-5xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Lohn nach Stadt</h2>
            <p className="text-slate-600 mb-5">
              Lohn-Bandbreiten für Zimmermann in den grössten Schweizer Städten:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              { ZIMMERMANN_CITIES.map((c) => (
                <Link
                  key={c.slug}
                  href={`/zimmermann-jobs/${c.slug}`}
                  className="rounded-lg border border-slate-200 bg-white p-4 hover:border-primary/40 transition"
                >
                  <div className="font-semibold text-slate-900">{c.name}</div>
                  <div className="text-sm text-slate-600">{c.salaryBand}</div>
                  <div className="text-xs text-slate-500 mt-1">{c.region}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 py-10 max-w-4xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-5">Häufig gestellte Fragen zum Lohn</h2>
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
        </section>

        <section className="bg-primary/5 border-t">
          <div className="container mx-auto px-4 sm:px-6 py-10 max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Bereit für den nächsten Schritt?</h2>
            <p className="text-slate-600 mb-5">
              Stöbere durch tausende offene Zimmermann Stellen in der Schweiz — täglich aktualisiert.
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

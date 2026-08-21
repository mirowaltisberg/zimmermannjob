import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SalaryOrientationCalculator } from "@/components/salary-orientation-calculator";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Lohn Zimmermann Schweiz | GAV & Salarium",
  description:
    "Zimmermann-Lohn mit offiziellen Schweizer Quellen einordnen: BFS Salarium, SECO-GAV und Lehrlingslohn-Empfehlungen.",
  alternates: { canonical: "/lohn-zimmermann-schweiz" },
  openGraph: {
    title: "Lohn Zimmermann Schweiz | GAV & Salarium",
    description:
      "Zimmermann-Lohn mit offiziellen Schweizer Quellen einordnen: BFS Salarium, SECO-GAV und Lehrlingslohn-Empfehlungen.",
    url: "/lohn-zimmermann-schweiz",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lohn Zimmermann Schweiz | GAV & Salarium",
    description:
      "Zimmermann-Lohn mit offiziellen Schweizer Quellen einordnen: BFS Salarium, SECO-GAV und Lehrlingslohn-Empfehlungen.",
  },
};

export const revalidate = 86400;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zimmermannjob.ch";
const REVIEW_DATE = "20. August 2026";

const APPRENTICE_RECOMMENDATIONS = [
  { year: "1. Lehrjahr", amount: "CHF 814.– pro Monat" },
  { year: "2. Lehrjahr", amount: "CHF 1'061.– pro Monat" },
  { year: "3. Lehrjahr", amount: "CHF 1'440.– pro Monat" },
  { year: "4. Lehrjahr", amount: "CHF 1'838.– pro Monat" },
];

const FAQS = [
  {
    question: "Wie viel verdient ein Zimmermann in der Schweiz?",
    answer:
      "zimmermannjob.ch nennt dafür keine pauschale Zahl. Ein belastbarer Vergleich muss mindestens Berufsfunktion, Region, Erfahrung, Ausbildung, Arbeitszeit, betriebliche Merkmale und allfällige Zulagen berücksichtigen. Salarium des Bundesamts für Statistik erlaubt eine statistische Schätzung für ein konkret gewähltes Profil. Das Ergebnis ist eine Modellschätzung und keine Lohnempfehlung.",
  },
  {
    question: "Gilt für jede Zimmermannstelle derselbe GAV?",
    answer:
      "Nein. Ob ein Gesamtarbeitsvertrag gilt, hängt von dessen sachlichem, betrieblichem und territorialem Geltungsbereich ab. Entscheidend sind unter anderem Betrieb, Tätigkeit und Arbeitsort. Die SECO-Übersicht dient zur Orientierung; für eine verbindliche Einordnung ist die zuständige Vertrags- oder paritätische Stelle zu kontaktieren.",
  },
  {
    question: "Wie hoch ist der Lehrlingslohn für Zimmermann EFZ?",
    answer:
      "Das am 20. August 2026 geprüfte Berufsprofil von berufsberatung.ch nennt Empfehlungen von CHF 814 im ersten, CHF 1'061 im zweiten, CHF 1'440 im dritten und CHF 1'838 im vierten Lehrjahr. Es handelt sich um Empfehlungen, nicht um eine pauschale Zusicherung für jeden Lehrvertrag.",
  },
  {
    question: "Kann ich Kantone mit einem festen Prozentaufschlag vergleichen?",
    answer:
      "Ein fixer Zuschlag oder Abschlag pro Kanton ist ohne ein definiertes Vergleichsprofil nicht belastbar. Nutze im BFS-Lohnrechner dasselbe Berufs- und Personenprofil und ändere nur die Region. So bleibt sichtbar, welche Annahmen dem Vergleich zugrunde liegen.",
  },
];

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Startseite", item: SITE_URL },
    {
      "@type": "ListItem",
      position: 2,
      name: "Lohn Zimmermann Schweiz",
      item: `${SITE_URL}/lohn-zimmermann-schweiz`,
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Lohn Zimmermann Schweiz: GAV und Lohnrechner",
  description:
    "Methodischer Leitfaden zur Einordnung von Lohnangaben mit offiziellen Schweizer Quellen.",
  datePublished: "2026-08-19",
  dateModified: "2026-08-20",
  author: { "@type": "Organization", name: "Redaktion zimmermannjob.ch" },
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

      <main id="main-content" className="bg-background">
        <section className="trade-hero">
          <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-4xl">
            <nav className="text-sm text-slate-600 mb-3" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-primary">Startseite</Link>
              <span className="mx-2">/</span>
              <span className="text-slate-700">Lohn Zimmermann Schweiz</span>
            </nav>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight mb-4">
              Lohn als <span className="text-primary">Zimmermann</span> einordnen
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed max-w-3xl">
              Statt eines erfundenen Schweizer Durchschnitts zeigt diese Seite,
              wie du ein konkretes Lohnangebot mit offiziellen Quellen prüfst.
            </p>
            <p className="mt-4 text-sm text-slate-600">Quellen geprüft am {REVIEW_DATE}.</p>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 py-10 max-w-4xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Drei belastbare Bezugspunkte</h2>
          <div className="space-y-4">
            <article className="trade-panel p-5">
              <h3 className="font-bold text-slate-900 mb-2">1. BFS Salarium für eine statistische Schätzung</h3>
              <p className="text-slate-600 leading-relaxed mb-3">
                Salarium verwendet Daten der Schweizerischen Lohnstrukturerhebung
                2024 und schätzt den Bruttomonatslohn samt Bandbreite für ein
                ausgewähltes Profil. Das BFS weist ausdrücklich darauf hin, dass
                die Resultate Modellschätzungen und keine Lohnempfehlungen sind.
              </p>
              <a
                href="https://www.salarium.bfs.admin.ch/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                BFS Salarium öffnen
              </a>
            </article>

            <article className="trade-panel p-5">
              <h3 className="font-bold text-slate-900 mb-2">2. SECO für den anwendbaren GAV</h3>
              <p className="text-slate-600 leading-relaxed mb-3">
                Die SECO-Übersicht führt die allgemeinverbindlich erklärten
                Gesamtarbeitsverträge des Bundes auf. Eine Liste allein beweist
                keine Unterstellung: Branche, Betrieb, konkrete Tätigkeit,
                Arbeitsort und der im Vertrag definierte Geltungsbereich müssen
                für jede Zimmermannstelle separat geprüft werden.
              </p>
              <a
                href="https://www.seco.admin.ch/de/gesamtarbeitsvertraege-bund"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                SECO-Übersicht der GAV öffnen
              </a>
            </article>

            <article className="trade-panel p-5">
              <h3 className="font-bold text-slate-900 mb-2">3. Das konkrete Inserat und der Arbeitsvertrag</h3>
              <p className="text-slate-600 leading-relaxed">
                Vergleiche Grundlohn, Anzahl Monatslöhne, Wochenarbeitszeit,
                Pensum, Zulagen, Spesen, Pikettregelung und Ferien getrennt.
                Fehlende Angaben werden auf zimmermannjob.ch nicht geschätzt.
              </p>
            </article>
          </div>
        </section>

        <section className="editorial-surface border-y">
          <div className="container mx-auto px-4 sm:px-6 py-10 max-w-4xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Offizielle Lehrlingslohn-Empfehlungen
            </h2>
            <p className="text-slate-600 mb-5">
              Das Berufsprofil von berufsberatung.ch nennt die folgenden
              monatlichen Empfehlungen für Zimmermann EFZ. Diese
              Werte sind keine Zusicherung für jeden Lehrvertrag.
            </p>
            <div className="trade-panel overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-100">
                  <tr className="text-left text-slate-700">
                    <th className="px-4 py-3 font-semibold">Lehrjahr</th>
                    <th className="px-4 py-3 font-semibold">Empfehlung</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {APPRENTICE_RECOMMENDATIONS.map((item) => (
                    <tr key={item.year}>
                      <td className="px-4 py-3 text-slate-700">{item.year}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{item.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <a
              href="https://www.berufsberatung.ch/de/berufe/zimmermann-in-efz"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-primary underline"
            >
              Quelle: Berufsprofil Zimmermann EFZ
            </a>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 py-10 max-w-4xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-5">Häufig gestellte Fragen</h2>
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details key={faq.question} className="faq-item group overflow-hidden">
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
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Stellen mit publizierten Angaben vergleichen</h2>
            <p className="text-slate-600 mb-5">
              Durchsuche den aktuell verfügbaren Inseratebestand. Eine Lohnangabe
              erscheint nur, wenn sie im Inserat vorhanden ist.
            </p>
            <Button asChild>
              <Link href="/">Stellen durchsuchen</Link>
            </Button>
          </div>
        </section>
        <SalaryOrientationCalculator profession="Zimmermann" />
      </main>

      <SiteFooter />
    </>
  );
}

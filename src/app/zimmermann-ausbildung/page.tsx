import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Zimmermann Ausbildung Schweiz | Lehre, EFZ, EBA & Weiterbildung",
  description:
    "Alles zur Zimmermann Ausbildung in der Schweiz: Lehre (Zimmermann EFZ), Lehrstellen, Lohn, Berufsschule, EBA und Weiterbildungen — kompakter Guide 2026.",
  alternates: { canonical: "/zimmermann-ausbildung" },
};

export const revalidate = 86400;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.zimmermannjob.ch";

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Startseite", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Zimmermann Ausbildung", item: `${SITE_URL}/zimmermann-ausbildung` },
  ],
};

const FAQS = [
  {
    question: "Wie lange dauert die Zimmermann Lehre in der Schweiz?",
    answer:
      "Die Grundbildung Zimmermann EFZ dauert 4 Jahre. Sie schliesst mit dem eidgenössischen Fähigkeitszeugnis (EFZ) ab — der schweizweit anerkannte Berufsabschluss. Alternativ gibt es die kürzere Ausbildung Holzbearbeiter EBA (2 Jahre), die mehr auf praktische Tätigkeiten fokussiert.",
  },
  {
    question: "Wie hoch ist der Lehrlingslohn?",
    answer:
      "Lehrlinge verdienen je nach Kanton, Branche und Lehrjahr zwischen CHF 700 und CHF 1'600 pro Monat. Die Empfehlungen werden vom Branchenverband Holzbau Schweiz jährlich publiziert. In den meisten Lehrverhältnissen ist der 13. Monatslohn Standard. Mit Lehrabschluss steigt der Lohn auf den Einstiegslohn — typischerweise CHF 55'000 bis CHF 70'000 pro Jahr je nach Beruf.",
  },
  {
    question: "Welche Voraussetzungen brauche ich?",
    answer:
      "Für die EFZ-Lehre brauchst du den abgeschlossenen Sek-1-Schulabschluss (Realschule, Sekundarschule oder gymnasiale Vorbildung). Wichtig sind handwerkliches Geschick, räumliches Vorstellungsvermögen, Teamfähigkeit und körperliche Belastbarkeit. Eine Schnupperlehre vor der Bewerbung ist Standard und wird von praktisch allen Lehrbetrieben erwartet.",
  },
  {
    question: "Welche Weiterbildungen gibt es nach dem EFZ?",
    answer:
      "Nach dem EFZ stehen mehrere Wege offen: Berufsprüfung (BP) zum Vorarbeiter, Polier oder Servicetechniker; höhere Fachprüfung (HFP) zum eidg. dipl. Meister oder Bauleiter; höhere Fachschule (HF) als Techniker HF; Fachhochschule (FH) als Bachelor in Bauingenieurwesen oder Gebäudetechnik. Berufsbegleitende Bildungsgänge sind in der Schweiz Standard und werden vom Arbeitgeber oft finanziell unterstützt.",
  },
  {
    question: "Wie finde ich eine Lehrstelle?",
    answer:
      "Lehrstellen findest du auf yousty.ch, berufsberatung.ch und direkt auf den Websites von Lehrbetrieben. Wir empfehlen, mindestens 5 bis 10 Schnupperlehren zu absolvieren, bevor du dich entscheidest. Die Bewerbungssaison startet typischerweise im August/September für das übernächste Jahr — gute Lehrbetriebe sind 12 bis 18 Monate im Voraus ausgebucht.",
  },
  {
    question: "Wie viel verdient ein Zimmermann nach der Lehre?",
    answer:
      "Direkt nach der Lehre verdienst du als ausgebildeter Zimmermann typischerweise zwischen CHF 60'000 und CHF 75'000 pro Jahr. Mit drei bis fünf Jahren Erfahrung und ersten Spezialisierungen verschiebt sich der Lohn auf CHF 75'000 bis CHF 95'000. Detaillierte Lohnübersichten findest du auf unserer Seite Lohn Zimmermann Schweiz.",
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

export default function AusbildungPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />

      <main className="bg-white">
        <section className="bg-primary/5 border-b">
          <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-4xl">
            <nav className="text-sm text-slate-500 mb-3" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-primary">Startseite</Link>
              <span className="mx-2">/</span>
              <span className="text-slate-700">Zimmermann Ausbildung</span>
            </nav>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight mb-4">
              Zimmermann Ausbildung <span className="text-primary">Schweiz</span>
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed max-w-3xl">
              Dein Guide zur Zimmermann Lehre in der Schweiz — Voraussetzungen, Dauer, Lohn, Berufsschule und Weiterbildungswege. Stand 2026.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 py-10 max-w-4xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Die Lehre Zimmermann EFZ</h2>
          <p className="text-slate-600 mb-3 leading-relaxed">
            Die Grundbildung Zimmermann EFZ dauert 4 Jahre und schliesst mit dem eidgenössischen Fähigkeitszeugnis (EFZ) ab. Der Lehrbetrieb übernimmt die praktische Ausbildung, die Berufsfachschule den schulischen Teil (1 bis 2 Tage pro Woche) und die überbetrieblichen Kurse (üK) ergänzen mit Spezialthemen.
          </p>
          <p className="text-slate-600 mb-3 leading-relaxed">
            Alternativ steht die kürzere Ausbildung Holzbearbeiter EBA (2 Jahre) offen — mit eidgenössischem Berufsattest (EBA) abschliessend, fokussiert auf praktische Tätigkeiten und ein Sprungbrett in die EFZ-Lehre.
          </p>
          <p className="text-slate-600 leading-relaxed">
            Die Branche unterliegt dem GAV Holzbau Schweiz — dieser regelt Lehrlingslöhne, Ferien, Arbeitszeiten und Spesen. Der Branchenverband Holzbau Schweiz koordiniert Bildungsverordnung und überbetriebliche Kurse.
          </p>
        </section>

        <section className="bg-slate-50 border-y">
          <div className="container mx-auto px-4 sm:px-6 py-10 max-w-4xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Weiterbildungswege nach dem EFZ</h2>
            <ul className="space-y-3 text-slate-700">
              <li className="rounded-lg border border-slate-200 bg-white p-4">
                <strong className="text-slate-900">Berufsprüfung (BP)</strong> — Vorarbeiter, Polier oder Servicetechniker mit eidg. Fachausweis. Berufsbegleitend, 1 bis 2 Jahre. Lohnsprung +CHF 5'000 bis +CHF 15'000.
              </li>
              <li className="rounded-lg border border-slate-200 bg-white p-4">
                <strong className="text-slate-900">Höhere Fachprüfung (HFP)</strong> — eidg. dipl. Meister, Bauleiter oder Projektleiter. 2 bis 3 Jahre, Lohnsprung +CHF 15'000 bis +CHF 30'000.
              </li>
              <li className="rounded-lg border border-slate-200 bg-white p-4">
                <strong className="text-slate-900">Höhere Fachschule (HF)</strong> — Techniker HF in Bautechnik oder Gebäudetechnik. 3 Jahre berufsbegleitend, breites technisches Profil.
              </li>
              <li className="rounded-lg border border-slate-200 bg-white p-4">
                <strong className="text-slate-900">Fachhochschule (FH)</strong> — Bachelor in Bauingenieurwesen, Gebäudetechnik oder Holzbau. 3 bis 4 Jahre, Voraussetzung Berufsmaturität.
              </li>
            </ul>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 py-10 max-w-4xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-5">Häufig gestellte Fragen</h2>
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
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Schon ausgelernt? Jetzt Stellen finden.</h2>
            <p className="text-slate-600 mb-5">
              Tausende offene Zimmermann Stellen in der Schweiz — täglich aktualisiert.
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

import Link from "next/link";
import Image from "next/image";
import { TOP_LANDING_PAGES, getLandingPath, toRoleSlug, toCantonSlug } from "@/lib/landing-pages";

const FOOTER_ROLES = [
  "Zimmermann EFZ",
  "Holzbau-Vorarbeiter",
  "Holzbau-Polier",
  "Holzbautechniker",
  "Holzbauingenieur",
  "Elementbauer",
  "Holzbau-Projektleiter",
  "Dachdecker Holzbau",
  "Schreiner Holzbau",
  "Holzbau-Monteur",
  "Bauführer Holzbau",
  "Holzbau-Planer",
];

const DEFAULT_CANTON = "ZH";
const DEFAULT_ROLE = "Zimmermann EFZ";

const FOOTER_CANTONS = [
  "Zürich", "Bern", "Basel", "Aargau", "St. Gallen", "Luzern",
  "Solothurn", "Zug", "Thurgau", "Graubünden", "Schaffhausen", "Fribourg",
];

/**
 * Shared site footer with SEO-optimized navigation links.
 * Server component — renders crawlable links to all major categories.
 */
export function SiteFooter() {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-12 pb-8">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <Image
              src="/logo.svg"
              alt="zimmermannjob.ch — Jobbörse für Zimmermann und Holzbau-Fachkräfte in der Schweiz"
              width={142}
              height={29}
              className="h-8 w-auto brightness-0 invert mb-4"
              loading="lazy"
            />
            <p className="text-sm leading-relaxed">
              Die spezialisierte Jobbörse für Zimmermann und Holzbau-Fachkräfte in der Schweiz.
              Finde offene Stellen, vergleiche Arbeitgeber und bewirb dich direkt.
            </p>
          </div>

          {/* Job roles — each links to its ZH landing page for maximum link equity */}
          <nav aria-label="Berufe">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">
              Berufe
            </h3>
            <ul className="space-y-1.5">
              {FOOTER_ROLES.map((role) => (
                <li key={role}>
                  <Link
                    href={`/zimmermannjobs/${toRoleSlug(role)}/${toCantonSlug(DEFAULT_CANTON)}`}
                    className="text-sm hover:text-white transition-colors duration-150"
                  >
                    {role}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Canton navigation — each links to the Zimmermann EFZ page for that canton */}
          <nav aria-label="Kantone">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">
              Jobs nach Kanton
            </h3>
            <ul className="space-y-1.5">
              {FOOTER_CANTONS.map((canton) => (
                <li key={canton}>
                  <Link
                    href={`/zimmermannjobs/${toRoleSlug(DEFAULT_ROLE)}/${toCantonSlug(canton)}`}
                    className="text-sm hover:text-white transition-colors duration-150"
                  >
                    Zimmermannjobs {canton}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Landing pages + info */}
          <div>
            <nav aria-label="Beliebte Suchseiten">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">
                Top-Suchseiten
              </h3>
              <ul className="space-y-1.5">
                {TOP_LANDING_PAGES.slice(0, 6).map((page) => (
                  <li key={`${page.role}-${page.canton}`}>
                    <Link
                      href={getLandingPath(page)}
                      className="text-sm hover:text-white transition-colors duration-150"
                    >
                      {page.role} in {page.canton}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-6">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">
                Für Arbeitgeber
              </h3>
              <ul className="space-y-1.5">
                <li>
                  <Link href="/arbeitgeber/preise" className="text-sm hover:text-white transition-colors duration-150">
                    Stelle ausschreiben
                  </Link>
                </li>
                <li>
                  <Link href="/arbeitgeber/preise" className="text-sm hover:text-white transition-colors duration-150">
                    Preise & Pakete
                  </Link>
                </li>
                <li>
                  <Link href="/kontakt" className="text-sm hover:text-white transition-colors duration-150">
                    Kontakt
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sister job boards — cross-linking network */}
        <div className="border-t border-slate-800 pt-6 mt-6">
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">
            Weitere Jobbörsen
          </h3>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            <a href="https://www.elektrojob.ch" target="_blank" rel="noopener" className="text-sm hover:text-white transition-colors">Elektrojobs</a>
            <a href="https://sanitaerjob.ch" target="_blank" rel="noopener" className="text-sm hover:text-white transition-colors">Sanitärjobs</a>
            <a href="https://heizungjob.ch" target="_blank" rel="noopener" className="text-sm hover:text-white transition-colors">Heizungsjobs</a>
            <a href="https://spenglerjob.ch" target="_blank" rel="noopener" className="text-sm hover:text-white transition-colors">Spenglerjobs</a>
            <a href="https://dachdeckerjob.ch" target="_blank" rel="noopener" className="text-sm hover:text-white transition-colors">Dachdeckerjobs</a>
            <a href="https://schreinerjob.ch" target="_blank" rel="noopener" className="text-sm hover:text-white transition-colors">Schreinerjobs</a>
            <a href="https://bodenlegerjob.ch" target="_blank" rel="noopener" className="text-sm hover:text-white transition-colors">Bodenlegerjobs</a>
            <a href="https://xn--grtnerjob-n2a.ch" target="_blank" rel="noopener" className="text-sm hover:text-white transition-colors">Gärtnerjobs</a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 pt-6 mt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <p>© {new Date().getFullYear()} zimmermannjob.ch — Alle Rechte vorbehalten.</p>
            <nav aria-label="Branchenverbände" className="flex items-center gap-4">
              <a href="https://www.holzbau-schweiz.ch" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Holzbau Schweiz</a>
              <a href="https://www.lignum.ch" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Lignum</a>
              <a href="https://www.suva.ch" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Suva</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://facebook.com/zimmermannjob" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-slate-400 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="https://instagram.com/zimmermannjob" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-slate-400 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
            </a>
            <a href="https://twitter.com/zimmermannjob" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="text-slate-400 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
            </a>
            <a href="https://linkedin.com/company/zimmermannjob" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-slate-400 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            </a>
            <a href="https://youtube.com/@zimmermannjob" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-slate-400 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7.1C2.5 5 4.5 3 7 3h10c2.5 0 4.5 2 4.5 4.1v9.8c0 2.1-2 4.1-4.5 4.1H7c-2.5 0-4.5-2-4.5-4.1V7.1z"></path><path d="m10 8 5 4-5 4V8z"></path></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

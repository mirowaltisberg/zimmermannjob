import Link from "next/link";
import { TOP_LANDING_PAGES, getLandingPath, toRoleSlug, toCantonSlug } from "@/lib/landing-pages";
import { SiteBrand } from "@/components/site-brand";

const FOOTER_ROLES = [
  "Zimmermann EFZ",
  "Holzbauer Montage",
  "Holzbau-Fachperson",
  "Konstrukteur Holzbau",
  "Projektleiter Holzbau",
  "Holzbaupolier",
];

const DEFAULT_CANTON = "ZH";
const DEFAULT_ROLE = "Zimmermann EFZ";

const FOOTER_CANTONS = [
  { key: "ZH", label: "Zürich" },
  { key: "BE", label: "Bern" },
  { key: "BS", label: "Basel-Stadt" },
  { key: "AG", label: "Aargau" },
  { key: "SG", label: "St. Gallen" },
  { key: "LU", label: "Luzern" },
  { key: "SO", label: "Solothurn" },
  { key: "ZG", label: "Zug" },
  { key: "TG", label: "Thurgau" },
  { key: "GR", label: "Graubünden" },
  { key: "SH", label: "Schaffhausen" },
  { key: "FR", label: "Freiburg" },
];

/**
 * Shared site footer with SEO-optimized navigation links.
 * Server component — renders crawlable links to all major categories.
 */
export function SiteFooter() {
  return (
    <footer className="trade-footer pt-14 pb-8">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.15fr_1fr_1fr_1fr] gap-9 lg:gap-12 mb-12">
          {/* Brand */}
          <div>
            <SiteBrand inverse className="mb-5" />
            <p className="max-w-xs text-sm leading-relaxed">
              Die spezialisierte Jobbörse für Zimmerleute und Holzbau-Fachkräfte in der Schweiz.
              Finde Stellen nach Beruf, Ort und Pensum.
            </p>
          </div>

          {/* Job roles — each links to its ZH landing page for maximum link equity */}
          <nav aria-label="Berufe">
            <h3 className="font-bold text-xs uppercase tracking-wider mb-4">
              Berufe
            </h3>
            <ul className="space-y-1.5">
              {FOOTER_ROLES.map((role) => (
                <li key={role}>
                  <Link
                    href={`/zimmermannjobs/${toRoleSlug(role)}/${toCantonSlug(DEFAULT_CANTON)}`}
                    className="text-sm transition-colors duration-150"
                  >
                    {role}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Canton navigation — each links to the Zimmermann page for that canton */}
          <nav aria-label="Kantone">
            <h3 className="font-bold text-xs uppercase tracking-wider mb-4">
              Jobs nach Kanton
            </h3>
            <ul className="space-y-1.5">
              {FOOTER_CANTONS.map((canton) => (
                <li key={canton.key}>
                  <Link
                    href={`/zimmermannjobs/${toRoleSlug(DEFAULT_ROLE)}/${toCantonSlug(canton.key)}`}
                    className="text-sm transition-colors duration-150"
                  >
                    Zimmermannjobs {canton.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Landing pages + info */}
          <div>
            <nav aria-label="Beliebte Suchseiten">
              <h3 className="font-bold text-xs uppercase tracking-wider mb-4">
                Top-Suchseiten
              </h3>
              <ul className="space-y-1.5">
                {TOP_LANDING_PAGES.slice(0, 6).map((page) => (
                  <li key={`${page.role}-${page.canton}`}>
                    <Link
                      href={getLandingPath(page)}
                      className="text-sm transition-colors duration-150"
                    >
                      {page.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-6">
              <h3 className="font-bold text-xs uppercase tracking-wider mb-4">
                Für Arbeitgeber
              </h3>
              <ul className="space-y-1.5">
                <li>
                  <Link href="/arbeitgeber/preise" className="text-sm transition-colors duration-150">
                    Angebot für Arbeitgeber
                  </Link>
                </li>
                <li>
                  <Link href="/arbeitgeber/preise" className="text-sm transition-colors duration-150">
                    Publikationsangebot im Aufbau
                  </Link>
                </li>
                <li>
                  <Link href="/kontakt" className="text-sm transition-colors duration-150">
                    Kontakt
                  </Link>
                </li>
                <li>
                  <Link href="/datenschutz" className="text-sm transition-colors duration-150">
                    Datenschutz
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-sidebar-border pt-6 mt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-sm">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <p>© {new Date().getFullYear()} zimmermannjob.ch — Alle Rechte vorbehalten.</p>
            <nav aria-label="Offizielle Quellen" className="flex items-center gap-4">
              <a href="https://www.berufsberatung.ch/de/berufe/zimmermann-in-efz" target="_blank" rel="noopener noreferrer" className="transition-colors">berufsberatung.ch</a>
              <a href="https://www.seco.admin.ch/de/gesamtarbeitsvertraege-bund" target="_blank" rel="noopener noreferrer" className="transition-colors">SECO</a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}

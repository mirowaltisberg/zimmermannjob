export interface LandingFaq {
  question: string;
  answer: string;
}

export interface LandingPageConfig {
  role: string;
  canton: string;
  title: string;
  description: string;
  intro: string;
  roleDescription: string;
  requirements: string;
  career: string;
  cantonContext: string;
  faqs: LandingFaq[];
}

interface RoleContent {
  label: string;
  roleDescription: string;
  requirements: string;
  career: string;
}

// Zimmermann-only search labels. Broad or neighbouring trades are deliberately
// excluded from public SEO navigation.
const ROLE_CONTENT: Record<string, RoleContent> = {
  "Zimmermann EFZ": {
    label: "Zimmermann EFZ",
    roleDescription:
      "Zimmerleute EFZ fertigen, montieren und sanieren Holzkonstruktionen, Rahmen- und Elementbauten, Dachstühle, Fassaden und weitere Bauteile im Holzbau.",
    requirements:
      "Für Stellen mit dem geschützten EFZ-Titel ist in der Regel ein entsprechender Abschluss oder eine im Inserat als gleichwertig bezeichnete Qualifikation erforderlich.",
    career:
      "Das offizielle Berufsprofil nennt Holzbau-Polier/in BP, Holzbau-Vorarbeiter/in BP, Holzbau-Meister/in HFP und verschiedene Bildungsgänge der höheren Fachschule als Weiterbildungswege.",
  },
  "Holzbauer Montage": {
    label: "Holzbauer Montage",
    roleDescription:
      "Montagefunktionen im Holzbau versetzen vorgefertigte Wand-, Decken- oder Dachelemente, verbinden sie nach Plan und kontrollieren Anschlüsse, Verankerungen und Bauteilfluchten.",
    requirements:
      "Massgebend sind die verlangte Holzbaugrundbildung, Baustellen- und Montagepraxis sowie Sicherheitsanforderungen für Hebemittel und Arbeiten in der Höhe.",
    career:
      "Weiterbildungen in Vorarbeit, Polierfunktion, Projektleitung oder Holzbautechnik hängen von Abschluss und Berufspraxis ab.",
  },
  "Holzbau-Fachperson": {
    label: "Holzbau-Fachperson",
    roleDescription:
      "Stellen unter der Sammelbezeichnung Holzbau-Fachperson können Fertigung, Elementbau, Abbund oder Montage umfassen. Die konkrete Funktion und verlangte Grundbildung stehen im Inserat.",
    requirements:
      "Massgebend sind die ausgeschriebene Holzbauqualifikation, Werkstatt- oder Baustellenpraxis und die für den Einsatz genannten Fachkenntnisse.",
    career:
      "Mögliche Entwicklungsschritte hängen vom vorhandenen Abschluss ab und können Vorarbeit, Polierfunktion, AVOR oder Holzbautechnik umfassen.",
  },
  "Konstrukteur Holzbau": {
    label: "Konstrukteur Holzbau",
    roleDescription:
      "Konstruktions- und AVOR-Stellen im Holzbau erstellen Werkstatt- und Montagepläne, koordinieren Anschlüsse und Materialaufbauten und bereiten Abbund- und Produktionsdaten vor.",
    requirements:
      "Massgebend sind die ausgeschriebene Holzbauausbildung sowie CAD-, Konstruktions- und Produktionskenntnisse.",
    career:
      "Je nach Vorbildung kommen Weiterbildungen in Holzbautechnik, Bauführung oder Projektleitung infrage.",
  },
  "Projektleiter Holzbau": {
    label: "Projektleiter Holzbau",
    roleDescription:
      "Projektleitungsstellen im Holzbau können Kalkulation, Konstruktion, Termin- und Kostensteuerung sowie die Abstimmung zwischen Planung, Produktion und Baustelle umfassen.",
    requirements:
      "Ausbildung, Fachpraxis und Führungserfahrung sind je nach Inserat unterschiedlich gewichtet.",
    career:
      "Die Funktion ist keine pauschale Zusage für eine bestimmte Weiterbildung, Verantwortung oder Vergütung.",
  },
  "Vorarbeiter Holzbau": {
    label: "Vorarbeiter Holzbau",
    roleDescription:
      "Vorarbeiterinnen und Vorarbeiter im Holzbau führen Teams auf Baustellen oder in der Produktion, teilen Arbeiten ein und kontrollieren Termine, Qualität und Arbeitssicherheit.",
    requirements:
      "Massgebend sind die im Inserat verlangte Holzbaugrundbildung, Berufspraxis, Führungserfahrung und gegebenenfalls der eidgenössische Fachausweis.",
    career:
      "Holzbau-Vorarbeiter/in BP ist ein offizieller Weiterbildungsweg; Zulassungsbedingungen sind beim Bildungsträger zu prüfen.",
  },
  "Holzbaupolier": {
    label: "Holzbaupolier",
    roleDescription:
      "Holzbaupoliere übernehmen fachliche und organisatorische Verantwortung, koordinieren Ausführung und Teams und bilden eine Schnittstelle zwischen Projektleitung, Produktion und Baustelle.",
    requirements:
      "Massgebend sind die im Inserat verlangte Grundbildung, Berufspraxis und gegebenenfalls die Berufsprüfung Holzbau-Polier/in.",
    career:
      "Als weiterer offizieller Weg wird unter anderem Holzbau-Meister/in HFP genannt; Zulassung und Praxisanforderungen sind separat zu prüfen.",
  },
};

interface CantonContent {
  name: string;
  abbr: string;
}

const CANTON_CONTENT: Record<string, CantonContent> = {
  ZH: { name: "Zürich", abbr: "ZH" },
  BE: { name: "Bern", abbr: "BE" },
  BS: { name: "Basel-Stadt", abbr: "BS" },
  AG: { name: "Aargau", abbr: "AG" },
  SG: { name: "St. Gallen", abbr: "SG" },
  LU: { name: "Luzern", abbr: "LU" },
  SO: { name: "Solothurn", abbr: "SO" },
  ZG: { name: "Zug", abbr: "ZG" },
  TG: { name: "Thurgau", abbr: "TG" },
  GR: { name: "Graubünden", abbr: "GR" },
  SH: { name: "Schaffhausen", abbr: "SH" },
  FR: { name: "Freiburg", abbr: "FR" },
};

const ALL_ROLES = Object.keys(ROLE_CONTENT);
const ALL_CANTONS = Object.keys(CANTON_CONTENT);

function buildLandingConfig(roleKey: string, cantonKey: string): LandingPageConfig {
  const role = ROLE_CONTENT[roleKey];
  const canton = CANTON_CONTENT[cantonKey];

  if (!role || !canton) {
    throw new Error(`Invalid role "${roleKey}" or canton "${cantonKey}"`);
  }

  const cantonContext = `Der Ortsfilter verwendet den Kanton ${canton.name} (${canton.abbr}). Der genaue Arbeitsort und ein allfälliger Einsatzradius ergeben sich aus dem jeweiligen Inserat.`;

  return {
    role: roleKey,
    canton: cantonKey,
    title: `${role.label} Jobs in ${canton.name}`,
    description: `Stelleninserate mit Bezug zu ${role.label} im Kanton ${canton.name}. Aufgaben, Anforderungen und Arbeitsort im jeweiligen Inserat prüfen.`,
    intro: `Diese Suchseite zeigt Treffer für ${role.label} mit Ortsbezug zum Kanton ${canton.name}. Sie erhebt keinen Anspruch auf Vollständigkeit. ${cantonContext}`,
    roleDescription: role.roleDescription,
    requirements: role.requirements,
    career: role.career,
    cantonContext,
    faqs: [
      {
        question: `Wie viele ${role.label} Stellen gibt es in ${canton.name}?`,
        answer: `Die Zahl der Treffer wird auf dieser Seite aus dem aktuellen öffentlichen Bestand berechnet und kann sich ändern. zimmermannjob.ch verspricht keine vollständige Marktabdeckung.`,
      },
      {
        question: `Welche Voraussetzungen gelten für ${role.label}?`,
        answer: role.requirements,
      },
      {
        question: `Was verdient ein ${role.label} in ${canton.name}?`,
        answer: `Massgebend ist eine Lohnangabe im konkreten Inserat oder Arbeitsvertrag. Für statistische Vergleiche verweist zimmermannjob.ch auf Salarium des Bundesamts für Statistik; eigene pauschale Lohnbänder werden nicht ergänzt.`,
      },
      {
        question: `Wo befindet sich die Stelle im Kanton ${canton.name}?`,
        answer: cantonContext,
      },
    ],
  };
}

export const TOP_LANDING_PAGES: LandingPageConfig[] = ALL_ROLES.flatMap((roleKey) =>
  ALL_CANTONS.map((cantonKey) => buildLandingConfig(roleKey, cantonKey))
);

const PRIORITY_PAIRS: Array<[string | undefined, string]> = [
  [ALL_ROLES[0], "ZH"],
  [ALL_ROLES[0], "BE"],
  [ALL_ROLES[1], "ZH"],
  [ALL_ROLES[1], "AG"],
  [ALL_ROLES[2], "ZH"],
  [ALL_ROLES[2], "SG"],
];

export const SEO_PRIORITY_LANDING_PAGES: LandingPageConfig[] = PRIORITY_PAIRS.flatMap(
  ([role, canton]) => {
    if (!role || !CANTON_CONTENT[canton]) return [];
    return [buildLandingConfig(role, canton)];
  },
);

function normalizeSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/\u00df/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function toRoleSlug(role: string): string {
  return normalizeSlug(role);
}

export function toCantonSlug(canton: string): string {
  return normalizeSlug(canton);
}

export function getLandingPath(config: LandingPageConfig): string {
  return `/zimmermannjobs/${toRoleSlug(config.role)}/${toCantonSlug(config.canton)}`;
}

export function isSeoPriorityLandingPage(config: LandingPageConfig): boolean {
  const path = getLandingPath(config);
  return SEO_PRIORITY_LANDING_PAGES.some(
    (candidate) => getLandingPath(candidate) === path,
  );
}

export function findLandingPageBySlug(roleSlug: string, cantonSlug: string): LandingPageConfig | null {
  return (
    TOP_LANDING_PAGES.find(
      (item) => toRoleSlug(item.role) === roleSlug && toCantonSlug(item.canton) === cantonSlug
    ) ?? null
  );
}

export function getRelatedLandingPages(config: LandingPageConfig, limit = 8): LandingPageConfig[] {
  const sameCantonDifferentRole = TOP_LANDING_PAGES.filter(
    (page) => page.canton === config.canton && page.role !== config.role
  );
  const sameRoleDifferentCanton = TOP_LANDING_PAGES.filter(
    (page) => page.role === config.role && page.canton !== config.canton
  );
  const maxPerGroup = Math.ceil(limit / 2);
  return [
    ...sameCantonDifferentRole.slice(0, maxPerGroup),
    ...sameRoleDifferentCanton.slice(0, maxPerGroup),
  ].slice(0, limit);
}

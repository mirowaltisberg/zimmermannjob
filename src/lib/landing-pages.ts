// SEO-DECISION: Comprehensive landing page matrix covering 12 roles × 12 cantons = 144 combinations.
// Each page has unique title, description, intro text, and FAQs for content depth and
// geographic targeting without keyword cannibalization.

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
  faqs: LandingFaq[];
}

// --- Role-specific content templates ---
// Used to generate unique content per role × canton combination.

interface RoleContent {
  /** Short role label for titles */
  label: string;
  /** Longer description of what this role does */
  roleDescription: string;
  /** Typical salary range string */
  salaryRange: string;
  /** Key requirements */
  requirements: string;
  /** Career progression options */
  career: string;
  /** Related roles */
  related: string[];
}

const ROLE_CONTENT: Record<string, RoleContent> = {
  "Zimmermann EFZ": {
    label: "Zimmermann EFZ",
    roleDescription:
      "Zimmerleute EFZ planen und erstellen Holzkonstruktionen wie Dachstühle, Wände und Böden in Wohn-, Gewerbe- und Industriebauten. Die 4-jährige Lehre vermittelt fundierte Kenntnisse in Holzbautechnik, Baustatik und modernen Fertigungsmethoden.",
    salaryRange: "CHF 65'000 – 85'000",
    requirements:
      "Abgeschlossene 4-jährige Lehre als Zimmermann EFZ, gute Kenntnisse der SIA-Normen und Holzbauvorschriften, körperliche Fitness und Schwindelfreiheit.",
    career:
      "Weiterbildung zum Holzbau-Vorarbeiter, Holzbau-Polier oder Holzbautechniker HF.",
    related: ["Holzbau-Vorarbeiter", "Elementbauer", "Holzbau-Monteur"],
  },
  "Holzbau-Vorarbeiter": {
    label: "Holzbau-Vorarbeiter",
    roleDescription:
      "Holzbau-Vorarbeiter leiten kleine Teams auf Baustellen und koordinieren die täglichen Holzbauarbeiten. Sie sind die Schnittstelle zwischen Polier und Montageteam und sorgen für fachgerechte Ausführung und Arbeitssicherheit.",
    salaryRange: "CHF 72'000 – 88'000",
    requirements:
      "Abgeschlossene Lehre als Zimmermann EFZ, mehrjährige Berufserfahrung, Vorarbeiter-Weiterbildung, Führungsqualitäten und gute Kommunikation.",
    career:
      "Aufstieg zum Holzbau-Polier, Bauführer Holzbau oder Spezialisierung auf anspruchsvolle Projekte.",
    related: ["Zimmermann EFZ", "Holzbau-Polier", "Holzbau-Monteur"],
  },
  "Holzbau-Polier": {
    label: "Holzbau-Polier",
    roleDescription:
      "Holzbau-Poliere überwachen mehrere Teams auf Holzbau-Baustellen und sind verantwortlich für Qualitätskontrolle, Terminplanung und die Einhaltung von Sicherheitsvorschriften. Sie koordinieren die Zusammenarbeit mit anderen Gewerken.",
    salaryRange: "CHF 78'000 – 95'000",
    requirements:
      "Abgeschlossene Lehre als Zimmermann EFZ, Weiterbildung zum Holzbau-Polier, mehrjährige Führungserfahrung auf Baustellen.",
    career:
      "Aufstieg zum Bauführer Holzbau, Holzbau-Projektleiter oder in die Geschäftsleitung eines Holzbaubetriebs.",
    related: ["Holzbau-Vorarbeiter", "Bauführer Holzbau", "Holzbau-Projektleiter"],
  },
  "Holzbautechniker": {
    label: "Holzbautechniker",
    roleDescription:
      "Holzbautechniker planen und berechnen Holzkonstruktionen für Neubauten, Umbauten und Aufstockungen. Sie erstellen statische Berechnungen, Werkpläne und arbeiten eng mit Architekten, Ingenieuren und der Produktion zusammen.",
    salaryRange: "CHF 80'000 – 100'000",
    requirements:
      "Abgeschlossene Lehre als Zimmermann EFZ mit Weiterbildung zum Holzbautechniker HF, Kenntnisse in CAD/BIM und Holzbau-Statik.",
    career:
      "Spezialisierung auf Ingenieurholzbau, Aufstieg zum Holzbau-Projektleiter oder Studium zum Holzbauingenieur FH.",
    related: ["Holzbau-Planer", "Holzbauingenieur", "Holzbau-Projektleiter"],
  },
  "Holzbauingenieur": {
    label: "Holzbauingenieur",
    roleDescription:
      "Holzbauingenieure entwerfen und berechnen komplexe Tragwerke aus Holz — von mehrgeschossigen Holzgebäuden über Brücken bis zu Hallenkonstruktionen. Sie verbinden ingenieurwissenschaftliches Wissen mit dem nachhaltigen Baustoff Holz.",
    salaryRange: "CHF 90'000 – 120'000",
    requirements:
      "Abschluss als Bauingenieur FH/ETH mit Vertiefung Holzbau oder Holzbautechniker HF mit Nachdiplomstudium, fundierte Statik- und Materialkenntnisse.",
    career:
      "Spezialisierung auf Grossholzbauprojekte, Forschung und Entwicklung, oder Gründung eines eigenen Ingenieurbüros.",
    related: ["Holzbautechniker", "Holzbau-Projektleiter", "Holzbau-Planer"],
  },
  "Elementbauer": {
    label: "Elementbauer",
    roleDescription:
      "Elementbauer fertigen Holzrahmenbauelemente wie Wände, Decken und Dachelemente in der Werkstatt vor. Sie arbeiten mit modernen CNC-Maschinen und sorgen für präzise Vorfertigung, die eine effiziente Montage auf der Baustelle ermöglicht.",
    salaryRange: "CHF 65'000 – 82'000",
    requirements:
      "Abgeschlossene Lehre als Zimmermann EFZ, Erfahrung in der Elementfertigung, Kenntnisse im Umgang mit CNC-Maschinen und Abbundanlagen.",
    career:
      "Spezialisierung auf CNC-Programmierung, Aufstieg zum Werkstattleiter oder Weiterbildung zum Holzbautechniker.",
    related: ["Zimmermann EFZ", "Holzbau-Monteur", "Holzbautechniker"],
  },
  "Holzbau-Projektleiter": {
    label: "Holzbau-Projektleiter",
    roleDescription:
      "Holzbau-Projektleiter verantworten Holzbauprojekte von der Offerte über die Arbeitsvorbereitung bis zur Abnahme. Sie führen Teams, kontrollieren Kosten und Termine und sind Ansprechpartner für Bauherren und Architekten.",
    salaryRange: "CHF 85'000 – 110'000",
    requirements:
      "Weiterbildung zum Holzbau-Projektleiter oder Holzbautechniker HF, Führungserfahrung, Verhandlungsgeschick und betriebswirtschaftliche Kenntnisse.",
    career:
      "Aufstieg zum Geschäftsführer, Bereichsleiter oder Gründung eines eigenen Holzbaubetriebs.",
    related: ["Bauführer Holzbau", "Holzbautechniker", "Holzbau-Polier"],
  },
  "Dachdecker Holzbau": {
    label: "Dachdecker Holzbau",
    roleDescription:
      "Dachdecker im Holzbau sind spezialisiert auf die Erstellung von Dachkonstruktionen, Dacheindeckungen und Abdichtungen. Sie arbeiten mit verschiedenen Materialien und sorgen für den Witterungsschutz von Gebäuden.",
    salaryRange: "CHF 65'000 – 80'000",
    requirements:
      "Abgeschlossene Lehre als Zimmermann EFZ oder Dachdecker EFZ, Schwindelfreiheit, Erfahrung mit Steildach- und Flachdachsystemen.",
    career:
      "Spezialisierung auf Dachbegrünung, Solarmontage oder Weiterbildung zum Holzbau-Vorarbeiter.",
    related: ["Zimmermann EFZ", "Holzbau-Monteur", "Holzbau-Vorarbeiter"],
  },
  "Schreiner Holzbau": {
    label: "Schreiner Holzbau",
    roleDescription:
      "Schreiner im Holzbau übernehmen den Innenausbau und die Feinarbeiten in Holzgebäuden — von Türen, Treppen und Einbaumöbeln bis zu Fassadenverkleidungen. Sie verbinden handwerkliche Präzision mit gestalterischem Gespür.",
    salaryRange: "CHF 60'000 – 78'000",
    requirements:
      "Abgeschlossene Lehre als Schreiner EFZ oder Zimmermann EFZ, Erfahrung im Innenausbau, Kenntnisse in Oberflächen- und Montagetechnik.",
    career:
      "Spezialisierung auf hochwertigen Innenausbau, Weiterbildung zum Schreinermeister oder Holzbautechniker.",
    related: ["Zimmermann EFZ", "Elementbauer", "Holzbau-Planer"],
  },
  "Holzbau-Monteur": {
    label: "Holzbau-Monteur",
    roleDescription:
      "Holzbau-Monteure montieren vorgefertigte Holzbauelemente auf der Baustelle — von Wand- und Deckenelementen bis zu kompletten Dachstühlen. Sie arbeiten im Team und sorgen für die sichere und präzise Aufrichtung der Konstruktionen.",
    salaryRange: "CHF 62'000 – 78'000",
    requirements:
      "Abgeschlossene Lehre als Zimmermann EFZ, Erfahrung in der Montage von Holzbauelementen, Schwindelfreiheit und Teamfähigkeit.",
    career:
      "Aufstieg zum Holzbau-Vorarbeiter, Spezialisierung auf Kranführung oder Weiterbildung zum Holzbau-Polier.",
    related: ["Zimmermann EFZ", "Holzbau-Vorarbeiter", "Elementbauer"],
  },
  "Bauführer Holzbau": {
    label: "Bauführer Holzbau",
    roleDescription:
      "Bauführer Holzbau leiten und koordinieren Holzbauprojekte auf der Baustelle. Sie sind verantwortlich für die Baustellenorganisation, Personalplanung, Kostenkontrolle und Qualitätssicherung und arbeiten eng mit Projektleitern und Bauherren zusammen.",
    salaryRange: "CHF 90'000 – 120'000",
    requirements:
      "Weiterbildung zum Bauführer Holzbau oder Holzbautechniker HF, mehrjährige Berufserfahrung, Führungskompetenz und Organisationstalent.",
    career:
      "Aufstieg zum Gesamtprojektleiter, Niederlassungsleiter oder Geschäftsführer eines Holzbaubetriebs.",
    related: ["Holzbau-Projektleiter", "Holzbau-Polier", "Holzbautechniker"],
  },
  "Holzbau-Planer": {
    label: "Holzbau-Planer",
    roleDescription:
      "Holzbau-Planer erstellen Konstruktions- und Werkpläne für Holzbauten mit CAD- und BIM-Software. Sie detaillieren Anschlüsse, planen die Vorfertigung und koordinieren die technische Umsetzung mit Werkstatt und Baustelle.",
    salaryRange: "CHF 78'000 – 95'000",
    requirements:
      "Abgeschlossene Lehre als Zimmermann EFZ mit Weiterbildung zum Holzbau-Planer oder Holzbautechniker, versiert in CAD/BIM-Anwendungen.",
    career:
      "Aufstieg zum Planungsleiter, Spezialisierung auf BIM-Management oder Weiterbildung zum Holzbauingenieur.",
    related: ["Holzbautechniker", "Holzbauingenieur", "Holzbau-Projektleiter"],
  },
};

// --- Canton-specific content ---

interface CantonContent {
  /** Full canton name for titles */
  name: string;
  /** Short canton abbreviation */
  abbr: string;
  /** Brief economic context for the Holzbau/Zimmermann industry */
  context: string;
}

const CANTON_CONTENT: Record<string, CantonContent> = {
  ZH: {
    name: "Zürich",
    abbr: "ZH",
    context:
      "Der Kanton Zürich ist der grösste Arbeitsmarkt der Schweiz mit zahlreichen Bauprojekten, starken Holzbau-Trends und einer hohen Dichte an Holzbaufirmen.",
  },
  BE: {
    name: "Bern",
    abbr: "BE",
    context:
      "Im Kanton Bern gibt es eine starke Nachfrage nach Zimmermann-Spezialisten, besonders im Berner Oberland mit Tourismus- und Wohnbauprojekten sowie einer langen Holzbautradition.",
  },
  BS: {
    name: "Basel",
    abbr: "BS",
    context:
      "Basel-Stadt und die Region Nordwestschweiz setzen zunehmend auf nachhaltigen Holzbau — zahlreiche Verdichtungsprojekte und Aufstockungen schaffen attraktive Stellen für Holzbau-Fachkräfte.",
  },
  AG: {
    name: "Aargau",
    abbr: "AG",
    context:
      "Der Kanton Aargau ist ein wichtiger Standort für die Holzbauindustrie mit vielen Zimmereibetrieben und einer hohen Nachfrage nach Fachkräften im Holz- und Elementbau.",
  },
  SG: {
    name: "St. Gallen",
    abbr: "SG",
    context:
      "Die Ostschweiz mit dem Kanton St. Gallen bietet vielfältige Möglichkeiten für Holzbau-Fachkräfte — von traditionsreichen Zimmereibetrieben bis zu innovativen Holzbauunternehmen.",
  },
  LU: {
    name: "Luzern",
    abbr: "LU",
    context:
      "Im Kanton Luzern wächst die Nachfrage nach Holzbau-Fachkräften stetig — getrieben durch Neubauprojekte, Tourismus-Infrastruktur und den Trend zum nachhaltigen Bauen mit Holz.",
  },
  SO: {
    name: "Solothurn",
    abbr: "SO",
    context:
      "Der Kanton Solothurn bietet zwischen Bern und Basel gute Karrierechancen für Holzbau-Fachkräfte, mit zahlreichen Zimmereibetrieben und Holzbauunternehmen in der Region.",
  },
  ZG: {
    name: "Zug",
    abbr: "ZG",
    context:
      "Der Kanton Zug bietet als wirtschaftsstarker Standort überdurchschnittliche Löhne und spannende Holzbauprojekte im Bereich hochwertiger Wohn- und Gewerbebau.",
  },
  TG: {
    name: "Thurgau",
    abbr: "TG",
    context:
      "Der Kanton Thurgau bietet als wachsender Holzbaustandort in der Ostschweiz zunehmend Chancen für Zimmermann-Fachkräfte — besonders im Wohnungsbau, landwirtschaftlichen Bauten und der Elementfertigung.",
  },
  GR: {
    name: "Graubünden",
    abbr: "GR",
    context:
      "Im Kanton Graubünden sind Holzbau-Fachkräfte gefragt — von Chaletbau und Tourismusinfrastruktur über Lawinenverbauungen bis zu modernen Holzbauprojekten in den Ferienorten.",
  },
  SH: {
    name: "Schaffhausen",
    abbr: "SH",
    context:
      "Der Kanton Schaffhausen bietet als kompakter Standort attraktive Stellen für Holzbau-Fachkräfte, insbesondere im Wohnungsbau und bei Sanierungsprojekten mit Holz.",
  },
  FR: {
    name: "Fribourg",
    abbr: "FR",
    context:
      "Der zweisprachige Kanton Fribourg wächst dynamisch und bietet Holzbau-Fachkräften vielfältige Möglichkeiten in Wohnungsbau, landwirtschaftlichen Bauten und öffentlichen Holzbauprojekten.",
  },
};

// --- All role keys ---
const ALL_ROLES = Object.keys(ROLE_CONTENT);
const ALL_CANTONS = Object.keys(CANTON_CONTENT);

// --- Content generation ---

function buildLandingConfig(roleKey: string, cantonKey: string): LandingPageConfig {
  const role = ROLE_CONTENT[roleKey];
  const canton = CANTON_CONTENT[cantonKey];

  if (!role || !canton) {
    throw new Error(`Invalid role "${roleKey}" or canton "${cantonKey}"`);
  }

  const relatedRolesList = role.related.join(", ");

  return {
    role: roleKey,
    canton: cantonKey,
    title: `${role.label} Jobs in ${canton.name}`,
    description: `Aktuelle ${role.label} Stellen im Kanton ${canton.name}. ${role.roleDescription.split(".")[0]}. Jetzt bewerben auf zimmermannjob.ch.`,
    intro: `Als ${role.label} in ${canton.name} findest du auf zimmermannjob.ch alle aktuellen Stellenangebote in deiner Region. ${role.roleDescription} ${canton.context} Die Nachfrage nach qualifizierten ${role.label}-Fachkräften im Kanton ${canton.name} ist hoch — Arbeitgeber suchen gezielt nach Kandidaten mit ${role.requirements.split(",")[0].toLowerCase()}. Das durchschnittliche Jahresgehalt für ${role.label} in der Schweiz liegt bei ${role.salaryRange}. Verwandte Berufe wie ${relatedRolesList} bieten zusätzliche Karrieremöglichkeiten in der Holzbaubranche. ${role.career} Nutze unsere smarte Filterung nach Pensum, Umkreis und Anstellungsart, um die passende Stelle zu finden. Bewirb dich direkt online und lade deinen Lebenslauf hoch.`,
    faqs: [
      {
        question: `Was verdient ein ${role.label} im Kanton ${canton.name}?`,
        answer: `Ein ${role.label} verdient in der Schweiz durchschnittlich ${role.salaryRange} pro Jahr. Im Kanton ${canton.name} können die Löhne je nach Arbeitgeber, Erfahrung und Spezialisierung variieren.`,
      },
      {
        question: `Welche Voraussetzungen braucht man als ${role.label}?`,
        answer: role.requirements,
      },
      {
        question: `Welche Karrieremöglichkeiten hat ein ${role.label}?`,
        answer: role.career,
      },
      {
        question: `Wie viele ${role.label} Jobs gibt es in ${canton.name}?`,
        answer: `Auf zimmermannjob.ch findest du aktuelle ${role.label} Stellen im Kanton ${canton.name}. Die Anzahl verfügbarer Jobs variiert — nutze unsere Suche für die aktuellsten Ergebnisse.`,
      },
    ],
  };
}

// --- Build full matrix ---
export const TOP_LANDING_PAGES: LandingPageConfig[] = ALL_ROLES.flatMap((roleKey) =>
  ALL_CANTONS.map((cantonKey) => buildLandingConfig(roleKey, cantonKey))
);

// --- Slug helpers ---

function normalizeSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
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

export function findLandingPageBySlug(roleSlug: string, cantonSlug: string): LandingPageConfig | null {
  return (
    TOP_LANDING_PAGES.find(
      (item) => toRoleSlug(item.role) === roleSlug && toCantonSlug(item.canton) === cantonSlug
    ) ?? null
  );
}

/**
 * Get landing pages for the same canton (different roles) or same role (different cantons).
 * Used for cross-linking on landing pages.
 */
export function getRelatedLandingPages(config: LandingPageConfig, limit = 8): LandingPageConfig[] {
  const sameCantonDifferentRole = TOP_LANDING_PAGES.filter(
    (p) => p.canton === config.canton && p.role !== config.role
  );
  const sameRoleDifferentCanton = TOP_LANDING_PAGES.filter(
    (p) => p.role === config.role && p.canton !== config.canton
  );

  // Mix: take some from same canton, some from same role
  const mixed: LandingPageConfig[] = [];
  const maxPerGroup = Math.ceil(limit / 2);
  mixed.push(...sameCantonDifferentRole.slice(0, maxPerGroup));
  mixed.push(...sameRoleDifferentCanton.slice(0, maxPerGroup));
  return mixed.slice(0, limit);
}

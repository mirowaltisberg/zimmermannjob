import type { GeneratedJob, SearchContext } from "@/lib/job-types";

const DEFAULT_QUERY = "Zimmermann";
const DEFAULT_LOCATION = "Schweiz";
const DEFAULT_COUNT = 150;
const MAX_COUNT = 500;
const MAX_INPUT_LENGTH = 80;
const REFERENCE_DATE_MS = Date.UTC(2026, 1, 25);
const GENERATED_ID_PATTERN = /^gen-([0-9a-f]+)-(\d+)$/i;
const SWISS_PLZ_PATTERN = /\b(\d{4})\b/;

const ROLE_TEMPLATES = [
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
];

const SPECIALIZATIONS = [
  "Neubau",
  "Umbau",
  "Dachkonstruktion",
  "Elementbau",
  "Hallenbau",
  "Sanierung",
  "Fassadenbau",
  "Innenausbau",
  "Minergie",
  "Aufstockung",
];

const COMPANY_PREFIXES = [
  "Holz",
  "Alpin",
  "Wald",
  "Balken",
  "Kraft",
  "Nova",
  "Swiss",
  "Aare",
  "Rhein",
  "Zenit",
  "Dach",
  "Span",
];

const COMPANY_SUFFIXES = [
  "Holzbau",
  "Zimmerei",
  "Holz AG",
  "Holzbau GmbH",
  "Holzbau AG",
  "Holzwerke",
  "Holzbau & Zimmerei",
  "Holzbau Partner AG",
  "Holzkonstruktionen AG",
];

const CONTRACT_TYPES = ["Vollzeit", "Teilzeit", "Festanstellung", "Temporär", "Unbefristet"];
const WORKLOADS = ["60-80%", "80-100%", "90-100%", "100%"];

const PROJECT_TYPES = [
  "Wohnbauprojekten",
  "Gewerbeobjekten",
  "Dachkonstruktionen",
  "Elementbauprojekten",
  "Hallenbau-Projekten",
  "Aufstockungen und Umbauten",
];

const RESPONSIBILITY_TEMPLATES = [
  "Aufrichtung und Montage von Holzkonstruktionen.",
  "Abbund und Vorfertigung von Holzbau-Elementen.",
  "Erstellen von Dachstühlen und Dachkonstruktionen.",
  "Montage von Holzrahmenbau- und Elementbauwänden.",
  "Dokumentation der ausgeführten Arbeiten.",
  "Zusammenarbeit mit Bauleitung und Projektleitung.",
  "Einhaltung von Sicherheits- und Qualitätsstandards.",
  "Mithilfe bei Materialdisposition und AVOR.",
  "Durchführung von Sanierungs- und Umbauarbeiten.",
  "Begleitung von Abnahmen und Übergaben.",
  "Einbau von Dämmungen und Abdichtungen.",
  "Mitarbeit bei Optimierung von Montageabläufen.",
];

const REQUIREMENT_TEMPLATES = [
  "Abgeschlossene Ausbildung als Zimmermann EFZ oder gleichwertig.",
  "Sorgfältige und selbstständige Arbeitsweise.",
  "Teamfähigkeit und klare Kommunikation auf Deutsch.",
  "Erfahrung im Holzbau und in Holzkonstruktionen von Vorteil.",
  "Kenntnisse der SIA-Normen und Holzbau-Vorschriften.",
  "Fahrausweis Kategorie B oder Bereitschaft dazu.",
  "Zuverlässigkeit und hohes Verantwortungsbewusstsein.",
  "Schwindelfreiheit und gute körperliche Fitness.",
  "Erfahrung mit Abbundmaschinen und modernen Holzbau-Techniken.",
  "Bereitschaft zur fachlichen Weiterbildung.",
  "Lösungsorientiertes Denken auch unter Zeitdruck.",
  "Sauberes und professionelles Auftreten.",
];

const BENEFIT_TEMPLATES = [
  "Moderne Arbeitsmittel und gut ausgerüstete Fahrzeuge.",
  "5 Wochen Ferien mit zusätzlichen Brückentagen.",
  "Überdurchschnittliche Entlohnung mit Bonusanteil.",
  "Klare Weiterbildungswege und Zertifizierungen.",
  "Kollegiales Team mit kurzen Entscheidungswegen.",
  "Flexible Einsatzplanung nach Absprache.",
  "Sehr gute Sozialleistungen und PK-Lösung.",
  "Strukturierte Einarbeitung durch erfahrene Kollegen.",
  "Spannende Projekte mit langfristiger Perspektive.",
  "Attraktive Zulagen für Pikett und Spezialaufträge.",
  "Regelmäßige Team-Events und Fachworkshops.",
  "Möglichkeit zur Spezialisierung in Zukunftsthemen.",
];

const SWISS_LOCATIONS = [
  { city: "Zürich", canton: "ZH" },
  { city: "Bern", canton: "BE" },
  { city: "Basel", canton: "BS" },
  { city: "Luzern", canton: "LU" },
  { city: "St. Gallen", canton: "SG" },
  { city: "Winterthur", canton: "ZH" },
  { city: "Aarau", canton: "AG" },
  { city: "Biel", canton: "BE" },
  { city: "Thun", canton: "BE" },
  { city: "Chur", canton: "GR" },
  { city: "Schaffhausen", canton: "SH" },
  { city: "Solothurn", canton: "SO" },
  { city: "Zug", canton: "ZG" },
  { city: "Fribourg", canton: "FR" },
  { city: "Neuchâtel", canton: "NE" },
  { city: "Lausanne", canton: "VD" },
  { city: "Sion", canton: "VS" },
  { city: "Lugano", canton: "TI" },
];

const COLLISION_SUFFIXES = ["(Team A)", "(Team B)", "(Nord)", "(Süd)", "(West)", "(Ost)"];

function sanitizeSearchValue(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, MAX_INPUT_LENGTH);
}

function resolveLocationFromPostalCode(location: string): string {
  return location;
}

function buildSeedKey(context: SearchContext): string {
  return `${context.query}::${context.location}`;
}

function hashFnv1a32(input: string): number {
  let hash = 0x811c9dc5;

  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }

  return hash >>> 0;
}

function createXorShift32(seed: number): () => number {
  let state = seed >>> 0;
  if (state === 0) {
    state = 0x9e3779b9;
  }

  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x100000000;
  };
}

function deriveSeed(baseHash: number, index: number): number {
  return hashFnv1a32(`${baseHash}:${index}`);
}

function pick<T>(rng: () => number, values: readonly T[]): T {
  return values[Math.floor(rng() * values.length)];
}

function pickUnique<T>(rng: () => number, values: readonly T[], count: number): T[] {
  const pool = [...values];
  const result: T[] = [];
  const targetCount = Math.min(count, pool.length);

  while (result.length < targetCount) {
    const idx = Math.floor(rng() * pool.length);
    const [selected] = pool.splice(idx, 1);
    result.push(selected);
  }

  return result;
}

function toIsoDate(ms: number): string {
  const date = new Date(ms);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function capitalizeWord(word: string): string {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function extractQueryTokens(query: string): string[] {
  const cleaned = query
    .replace(/[^A-Za-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 3);

  return cleaned.slice(0, 2).map(capitalizeWord);
}

function buildGeneratedJob(
  seed: number,
  index: number,
  context: SearchContext,
  seedHashHex: string
): GeneratedJob {
  const rng = createXorShift32(seed);
  const queryTokens = extractQueryTokens(context.query);
  const primaryFocus = queryTokens[0];
  const secondaryFocus = queryTokens[1];
  const role = pick(rng, ROLE_TEMPLATES);
  const specialization = pick(rng, SPECIALIZATIONS);
  const company = `${pick(rng, COMPANY_PREFIXES)} ${pick(rng, COMPANY_SUFFIXES)}`;
  const swissLocation = pick(rng, SWISS_LOCATIONS);
  const hasLocationHint = Boolean(context.location);
  const location = hasLocationHint && index % 2 === 0
    ? context.location
    : `${swissLocation.city}, ${swissLocation.canton}`;
  const workload = pick(rng, WORKLOADS);
  const type = pick(rng, CONTRACT_TYPES);
  const focusLabel = primaryFocus
    ? `${primaryFocus}${secondaryFocus ? ` & ${secondaryFocus}` : ""}`
    : specialization;
  const title = `${role} - ${focusLabel}`;
  const projectType = pick(rng, PROJECT_TYPES);
  const focusText = primaryFocus
    ? `mit Fokus auf ${primaryFocus}${secondaryFocus ? ` und ${secondaryFocus}` : ""}`
    : "mit Fokus auf moderne Holzbauprojekte";
  const regionText = hasLocationHint
    ? `im Raum ${context.location}`
    : `in ${swissLocation.city}`;

  const responsibilities = pickUnique(rng, RESPONSIBILITY_TEMPLATES, 4);
  responsibilities[0] = primaryFocus
    ? `Mitarbeit bei Projekten mit Schwerpunkt ${primaryFocus}.`
    : responsibilities[0];

  const requirements = pickUnique(rng, REQUIREMENT_TEMPLATES, 4);
  requirements[requirements.length - 1] = hasLocationHint
    ? `Bereitschaft für Einsätze im Raum ${context.location}.`
    : "Bereitschaft für Einsätze in der Deutschschweiz.";

  const benefits = pickUnique(rng, BENEFIT_TEMPLATES, 4);
  const daysAgo = Math.floor(rng() * 30);
  const datePosted = toIsoDate(REFERENCE_DATE_MS - daysAgo * 24 * 60 * 60 * 1000);

  return {
    id: `gen-${seedHashHex}-${index}`,
    title,
    company,
    location,
    type,
    workload,
    description: `Wir suchen eine motivierte Fachperson ${focusText}. Sie arbeiten in ${projectType} ${regionText} und begleiten Projekte von der Montage bis zur Übergabe.`,
    responsibilities,
    requirements,
    benefits,
    datePosted,
    isNew: daysAgo <= 2,
    isUrgent: rng() > 0.9,
    source: "generated",
    searchContext: context,
  };
}

function buildSignature(job: GeneratedJob): string {
  return `${job.title}|${job.company}|${job.location}`;
}

export function normalizeSearchInput(query: string, location: string): SearchContext {
  const normalizedQuery = sanitizeSearchValue(query);
  const normalizedLocation = sanitizeSearchValue(location);
  const resolvedLocation = resolveLocationFromPostalCode(normalizedLocation);

  if (!normalizedQuery && !normalizedLocation) {
    return {
      query: DEFAULT_QUERY,
      location: DEFAULT_LOCATION,
    };
  }

  return {
    query: normalizedQuery,
    location: resolvedLocation,
  };
}

export function generateFakeJobs(input: {
  query: string;
  location: string;
  count?: number;
}): GeneratedJob[] {
  const context = normalizeSearchInput(input.query, input.location);
  const safeCount = Math.max(1, Math.min(MAX_COUNT, Math.floor(input.count ?? DEFAULT_COUNT)));
  const seedKey = buildSeedKey(context);
  const baseHash = hashFnv1a32(seedKey);
  const seedHashHex = baseHash.toString(16);
  const usedSignatures = new Set<string>();
  const jobs: GeneratedJob[] = [];

  for (let index = 0; index < safeCount; index += 1) {
    const seed = deriveSeed(baseHash, index);
    let job = buildGeneratedJob(seed, index, context, seedHashHex);
    let signature = buildSignature(job);
    let collisionGuard = 0;

    while (usedSignatures.has(signature) && collisionGuard < COLLISION_SUFFIXES.length) {
      const suffix = COLLISION_SUFFIXES[(index + collisionGuard) % COLLISION_SUFFIXES.length];
      job = {
        ...job,
        title: `${job.title} ${suffix}`,
      };
      signature = buildSignature(job);
      collisionGuard += 1;
    }

    usedSignatures.add(signature);
    jobs.push(job);
  }

  return jobs;
}

export function generateFakeJobById(input: {
  query: string;
  location: string;
  id: string;
}): GeneratedJob | null {
  const match = GENERATED_ID_PATTERN.exec(input.id);
  if (!match) {
    return null;
  }

  const [, hashPartRaw, indexRaw] = match;
  const hashPart = hashPartRaw.toLowerCase();
  const index = Number.parseInt(indexRaw, 10);

  if (!Number.isFinite(index) || index < 0 || index > MAX_COUNT * 20) {
    return null;
  }

  const context = normalizeSearchInput(input.query, input.location);
  const seedKey = buildSeedKey(context);
  const baseHash = hashFnv1a32(seedKey);
  const expectedHash = baseHash.toString(16);

  if (expectedHash !== hashPart) {
    return null;
  }

  const seed = deriveSeed(baseHash, index);
  return buildGeneratedJob(seed, index, context, hashPart);
}

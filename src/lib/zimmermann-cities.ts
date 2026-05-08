export interface ZimmermannCity {
  slug: string;
  name: string;
  cantonAbbr: string;
  cantonSlug: string;
  population: string;
  intro: string;
  districts: string[];
  commuterTowns: string[];
  region: string;
  salaryBand: string;
}

export const ZIMMERMANN_CITIES: ZimmermannCity[] = [
  {
    slug: "zuerich",
    name: "Zürich",
    cantonAbbr: "ZH",
    cantonSlug: "zuerich",
    population: "ca. 440'000",
    region: "Grossraum Zürich",
    intro:
      "Zürich ist der grösste Schweizer Arbeitsmarkt für Zimmerei-Berufe. Banken, Tech-Konzerne, Spitäler, Wohnbau- und Gewerbeprojekte sorgen für konstante Nachfrage. Die Lohnniveaus liegen 5 bis 10 Prozent über dem Schweizer Mittel.",
    districts: ["City", "Oerlikon", "Altstetten", "Wiedikon", "Schwamendingen", "Affoltern"],
    commuterTowns: ["Winterthur", "Uster", "Dübendorf", "Wetzikon", "Wädenswil", "Bülach"],
    salaryBand: "CHF 74'000 – 96'000",
  },
  {
    slug: "basel",
    name: "Basel",
    cantonAbbr: "BS",
    cantonSlug: "basel",
    population: "ca. 175'000",
    region: "Nordwestschweiz",
    intro:
      "Basel ist Pharma- und Chemiestandort der Schweiz. Roche, Novartis, Syngenta und ihre Zulieferer beschäftigen Zimmerei-Fachkräfte mit überdurchschnittlichen Saläre. Der grenznahe Markt zu Frankreich und Deutschland macht trinationale Karrieren attraktiv.",
    districts: ["Innenstadt", "Kleinbasel", "Gundeldingen", "Bachletten", "St. Johann"],
    commuterTowns: ["Liestal", "Allschwil", "Münchenstein", "Riehen", "Reinach", "Pratteln"],
    salaryBand: "CHF 72'000 – 94'000",
  },
  {
    slug: "bern",
    name: "Bern",
    cantonAbbr: "BE",
    cantonSlug: "bern",
    population: "ca. 145'000",
    region: "Mittelland",
    intro:
      "Bern vereint Bundesverwaltung, kantonale Bauämter und ein breites Spektrum an Gewerbe- und Wohnbauprojekten. Zimmerei-Aufträge im öffentlichen Bau sind stabil und ganzjährig vorhanden, mit Lohnniveaus auf Schweizer Mittel.",
    districts: ["Innenstadt", "Länggasse", "Breitenrain", "Wankdorf", "Bümpliz"],
    commuterTowns: ["Biel", "Thun", "Köniz", "Münsingen", "Burgdorf", "Lyss"],
    salaryBand: "CHF 68'000 – 88'000",
  },
  {
    slug: "luzern",
    name: "Luzern",
    cantonAbbr: "LU",
    cantonSlug: "luzern",
    population: "ca. 83'000",
    region: "Zentralschweiz",
    intro:
      "Luzern und Zentralschweiz haben starke Zimmerei-Tradition (Bergchalets, Bauernhaus-Sanierungen) und einen modernen Holzelementbau-Markt — von Einfamilienhäusern bis zu mehrgeschossigen Wohnüberbauungen.",
    districts: ["Innenstadt", "Tribschen", "Sentimatt", "Würzenbach", "Maihof"],
    commuterTowns: ["Emmen", "Kriens", "Sursee", "Hochdorf", "Stans", "Zug"],
    salaryBand: "CHF 67'000 – 87'000",
  },
  {
    slug: "st-gallen",
    name: "St. Gallen",
    cantonAbbr: "SG",
    cantonSlug: "st-gallen",
    population: "ca. 80'000",
    region: "Ostschweiz",
    intro:
      "St. Gallen ist Industriestandort und Tor zur Ostschweiz. Maschinenindustrie, Lebensmittelverarbeitung (Bühler-Cluster) und ein wachsender Bildungssektor beschäftigen Zimmerei-Fachkräfte in stabilen Festanstellungen. Saläre liegen leicht unter dem Schweizer Mittel, dafür sind Mietpreise tiefer.",
    districts: ["Innenstadt", "St. Fiden", "Bruggen", "Riethüsli", "Heiligkreuz"],
    commuterTowns: ["Wil", "Rorschach", "Gossau", "Herisau", "Rapperswil", "Buchs SG"],
    salaryBand: "CHF 64'000 – 83'000",
  },
];

export function findZimmermannCity(slug: string): ZimmermannCity | null {
  return ZIMMERMANN_CITIES.find((c) => c.slug === slug) ?? null;
}

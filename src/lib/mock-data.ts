export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string; // e.g. "Full-time", "Part-time"
  workload: string; // e.g. "80-100%"
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  datePosted: string;
  isUrgent?: boolean;
  isNew?: boolean;
}

export const mockJobs: Job[] = [
  {
    id: "1",
    title: "Zimmermann EFZ (m/w/d)",
    company: "HolzBau Müller AG",
    location: "Zürich, ZH",
    type: "Full-time",
    workload: "100%",
    description: "Wir suchen einen engagierten Zimmermann für spannende Neubau- und Umbauprojekte im Raum Zürich.",
    responsibilities: [
      "Erstellen von Dachstühlen und Holzkonstruktionen",
      "Montage von Holzbauelementen auf der Baustelle",
      "Planlesen und selbständige Umsetzung auf der Baustelle",
      "Dokumentation der ausgeführten Arbeiten"
    ],
    requirements: [
      "Abgeschlossene Lehre als Zimmermann EFZ",
      "Einige Jahre Berufserfahrung von Vorteil",
      "Gute Deutschkenntnisse",
      "Führerausweis Kategorie B"
    ],
    benefits: [
      "Überdurchschnittliches Gehalt",
      "Modernes Firmenfahrzeug",
      "5 Wochen Ferien",
      "Weiterbildungsmöglichkeiten"
    ],
    datePosted: "2026-02-24",
    isNew: true,
  },
  {
    id: "2",
    title: "Holzbauer EFZ",
    company: "Zimmerei Schneider GmbH",
    location: "Bern, BE",
    type: "Full-time",
    workload: "80-100%",
    description: "Unterstützen Sie unser Team bei der Umsetzung von modernen Holzbauprojekten in Wohn- und Gewerbebauten.",
    responsibilities: [
      "Abbund und Vorfertigung von Holzkonstruktionen",
      "Montage von Dachstühlen und Wandelementen",
      "Mithilfe bei der Gebäudehülle in Holzbauweise",
      "Allgemeine Zimmerei- und Holzbauarbeiten"
    ],
    requirements: [
      "Abgeschlossene Ausbildung als Zimmermann/Holzbauer EFZ",
      "Handwerkliches Geschick und Zuverlässigkeit",
      "Teamfähigkeit und genaue Arbeitsweise"
    ],
    benefits: [
      "Junges und dynamisches Team",
      "Flache Hierarchien",
      "Gute Sozialleistungen"
    ],
    datePosted: "2026-02-20",
  },
  {
    id: "3",
    title: "Projektleiter Holzbau (w/m)",
    company: "SwissTimber Systems SA",
    location: "Basel, BS",
    type: "Full-time",
    workload: "100%",
    description: "Leiten Sie innovative Holzbauprojekte von der Planung bis zur Übergabe.",
    responsibilities: [
      "Projektleitung von A bis Z inklusive Kostenkontrolle",
      "Kundenberatung und Offertenerstellung",
      "Führung der Montageequipen",
      "Qualitätssicherung und Abnahme"
    ],
    requirements: [
      "Weiterbildung zum Holzbau-Vorarbeiter oder Holzbau-Polier",
      "Führungserfahrung in einer ähnlichen Position",
      "Kenntnisse in Holzbau-Software (Cadwork, Dietrich's)",
      "Verhandlungsgeschick und souveränes Auftreten"
    ],
    benefits: [
      "Attraktives Bonusmodell",
      "Geschäftsauto auch zur privaten Nutzung",
      "Flexible Arbeitszeiten"
    ],
    datePosted: "2026-02-23",
    isUrgent: true,
  },
  {
    id: "4",
    title: "Holzbau-Polier / Vorarbeiter",
    company: "Holzbau Partner AG",
    location: "Luzern, LU",
    type: "Full-time",
    workload: "100%",
    description: "Sie führen Ihr Team auf der Baustelle und sind verantwortlich für die fachgerechte Umsetzung von Holzbauprojekten.",
    responsibilities: [
      "Führung und Koordination des Montageteams",
      "Fachgerechte Ausführung von Holzkonstruktionen",
      "Qualitätskontrolle und Arbeitssicherheit",
      "Materialdisposition und Baustellenorganisation"
    ],
    requirements: [
      "Berufsabschluss als Zimmermann EFZ mit Weiterbildung zum Vorarbeiter/Polier",
      "Exaktes Lesen von Holzbauplänen",
      "Selbständige und präzise Arbeitsweise"
    ],
    benefits: [
      "Moderne Werkstatt und Maschinenpark",
      "Geregelte Arbeitszeiten",
      "Gute Anbindung an den ÖV"
    ],
    datePosted: "2026-02-18",
  },
  {
    id: "5",
    title: "Zimmermann / Dachdecker",
    company: "DachHolz Service 24",
    location: "St. Gallen, SG",
    type: "Part-time",
    workload: "60-80%",
    description: "Als Zimmermann/Dachdecker arbeiten Sie an Dachsanierungen und Neubauten direkt bei unseren Kunden vor Ort.",
    responsibilities: [
      "Dachsanierungen und Neueindeckungen",
      "Erstellen und Reparieren von Holzkonstruktionen",
      "Montage von Dachfenstern und Wärmedämmungen",
      "Kundenberatung vor Ort"
    ],
    requirements: [
      "Ausbildung als Zimmermann EFZ oder Dachdecker",
      "Freude am Kundenkontakt und gepflegtes Auftreten",
      "Schwindelfrei und wetterfest",
      "Gültiger Fahrausweis"
    ],
    benefits: [
      "Hohe Selbständigkeit",
      "Umfassend ausgerüstetes Servicefahrzeug",
      "Leistungsgerechte Entlöhnung"
    ],
    datePosted: "2026-02-25",
    isNew: true,
  }
];

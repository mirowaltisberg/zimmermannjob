// SEO-DECISION: Per-page editorial content for the highest-traffic role × canton
// combinations. Keyed by `${roleSlug}::${cantonSlug}`. The category page renders
// EditorialIntro only when an entry exists here — pages without an entry fall back
// to the default short layout. Word target per section: ~80 words. Total per
// page: 320+. Swiss orthography only — never use Eszett, always "ss".

export interface EditorialContent {
  /** "Was macht ein/e ROLE in CANTON?" — concrete day-to-day, regional context */
  whatDoes: string;
  /** "Lohn & Aufstiegschancen" — salary band + progression. Deep-links to /#loehne */
  salary: string;
  /** "Welche Betriebe stellen ein?" — anonymized, never names specific companies */
  employers: string;
  /** "Bewerbungs-Tipps" — practical, regional (ÖV, Pendlerregion, Sprache) */
  applicationTips: string;
}

const ENTRIES: Record<string, EditorialContent> = {
  "zimmermann-efz::zh": {
    whatDoes:
      "Ein Zimmermann EFZ im Kanton Zürich fertigt vorwiegend Holzbauelemente in der Werkstatt vor und richtet sie anschliessend auf der Baustelle auf. Der Tag teilt sich zwischen Abbund-CNC, Wand- und Deckenelementbau im Werk sowie Aufrichtarbeiten an Dachstühlen, mehrgeschossigen Wohnungsbauten und Aufstockungen in den Stadtkreisen 3, 4 und 5. Zürich treibt den Holzbau im Mehrfamilienhaus stark voran — Verdichtungsprojekte in Wipkingen, Altstetten und Glattpark gehören zum Auftragsbild. Sanierung historischer Bauten in der Altstadt ergänzt das Repertoire. Wer schwindelfrei arbeitet, BIM-Modelle liest und sauber misst, hat hier dauerhaft volle Auftragsbücher und überdurchschnittliche Stundenansätze.",
    salary:
      "Ein Zimmermann EFZ verdient im Kanton Zürich typisch CHF 70'000 bis 85'000 pro Jahr — am oberen Schweizer Band. Der Aufstieg zum Holzbau-Vorarbeiter hebt das Salär um rund 8 Prozent in den Bereich CHF 75'000 bis 90'000. Der eidg. dipl. Holzbau-Vorarbeiter sowie der Polier Holzbau erreichen CHF 85'000 bis 100'000 mit Verantwortung für Equipen, Termine und Sicherheit. Wer den Holzbaumeister oder die Höhere Fachschule abschliesst, landet im Raum Zürich häufig im Bereich CHF 100'000 bis 130'000. Berufsbegleitende Lehrgänge werden von vielen Zimmereibetrieben mitfinanziert. Die vollständige Lohnübersicht steht auf unserer Startseite.",
    employers:
      "Im Kanton Zürich rekrutieren vor allem Zimmerei-KMU mit 8 bis 40 Mitarbeitenden — typische Familienbetriebe mit Werkstatt im Zürcher Oberland, im Limmattal oder im Knonauer Amt. Daneben besetzen Holzbau-Generalunternehmer für mehrgeschossigen Wohnungsbau Stellen für Element- und Aufrichtequipen. Sanierungsspezialisten für Altstadt- und Riegelbauten sowie Industrie-Abbundwerke mit eigener CNC-Fertigung suchen regelmässig EFZ-Fachkräfte. Zudem rekrutieren Generalunternehmer für Schul-, Sport- und Verwaltungsbauten Holzbau-Equipen für Grossprojekte rund um Zürich. Wir nennen aus Datenschutz- und Vermittlungsgründen keine Firmennamen — die Inserate auf zimmermannjob.ch sind anonymisiert, der Arbeitgeber wird im Vorgespräch offengelegt.",
    applicationTips:
      "Hebe im Lebenslauf Höhentauglichkeit, körperliche Belastbarkeit und Wetterbeständigkeit ausdrücklich hervor — Personalverantwortliche im Kanton Zürich filtern explizit danach. Belege deine Maschinenkenntnis (Abbundanlage Hundegger oder Krüsi, Plattensäge, Kran B/F) sowie BIM- und CAD-Erfahrung mit konkret bearbeiteten Projekten: zum Beispiel «MFH Wipkingen, 18 Wohnungen, Holzelementbau in Vorfertigung». Ein PDF deiner EFZ-Urkunde beschleunigt die Vorauswahl, viele Betriebe schliessen Inserate ohne sichtbaren Lehrabschluss aus. Gib deinen ÖV-Knotenpunkt statt nur den Wohnort an, weil Werkstatt und Baustelle wechseln. Führerausweis Kategorie B ist Pflicht, BE oder C1 ein klares Plus für Materialtransporte.",
  },

  "holzbau-monteur::be": {
    whatDoes:
      "Ein Holzbau-Monteur im Kanton Bern montiert vorgefertigte Wand-, Decken- und Dachelemente direkt auf der Baustelle und ist Teil der Aufrichtequipe. Im Mittelland prägen Verdichtungs- und Aufstockungsprojekte in den Agglomerationsgemeinden den Auftragsmix, im Berner Oberland kommen Chaletbau, Tourismusinfrastruktur und Sanierung historischer Bauten dazu. Der Tag startet oft früh in der Werkstatt mit Kontrolle der vorgefertigten Elemente, gefolgt von Transport, Aufrichten mit Kran und Schlussmontage vor Ort. Holzrahmenbau für mehrgeschossige Wohnungsbauten gewinnt im Raum Bern, Thun und Burgdorf an Bedeutung. Wer schwindelfrei und teamfähig ist, hat dauerhaft sichere Aufträge.",
    salary:
      "Holzbau-Monteure verdienen im Kanton Bern typisch CHF 65'000 bis 78'000 pro Jahr. Aufrichtroutine, Kranbedienung und saubere Dokumentation bringen Zulagen im oberen Bandbereich. Der Aufstieg zum Holzbau-Vorarbeiter mit eigener Equipe hebt das Salär in den Bereich CHF 72'000 bis 88'000, der Polier Holzbau erreicht CHF 80'000 bis 95'000. Mit dem eidg. dipl. Holzbau-Vorarbeiter oder dem Holzbaumeister sind im Berner Mittelland CHF 95'000 bis 120'000 realistisch. Berufsbegleitende Weiterbildungen über Holzbau Schweiz werden von vielen Betrieben mitfinanziert. Die vollständige Lohnübersicht steht auf unserer Startseite.",
    employers:
      "Im Kanton Bern besetzen vor allem mittelgrosse Zimmerei-KMU mit 10 bis 60 Mitarbeitenden Monteur-Stellen. Daneben suchen Holzbau-Generalunternehmer für mehrgeschossigen Wohnbau in den Agglomerationsgürteln rund um Bern, Thun und Biel/Bienne ganze Aufrichtequipen. Industrie-Abbundwerke mit eigener Vorfertigung und Sanierungsspezialisten für Riegelbauten und Bauernhäuser im Emmental und Berner Oberland gehören ebenfalls zu den regelmässigen Arbeitgebern. Touristische Auftraggeber für Chaletbau und Berghütten beschäftigen Monteure für saisonale Spitzen. Wir nennen aus Datenschutz- und Vermittlungsgründen keine Firmennamen — die Inserate sind anonymisiert, den konkreten Arbeitgeber lernst du im persönlichen Erstgespräch kennen.",
    applicationTips:
      "Beton im Lebenslauf Höhentauglichkeit, körperliche Belastbarkeit und nachweisliche Wetterbeständigkeit — im Kanton Bern wird ganzjährig auch bei Regen oder Schnee aufgerichtet. Maschinenkenntnis hervorheben: Abbundanlage, Kran (Schein B oder F), Hubarbeitsbühne, Druckluftnagler. BIM- oder CAD-Erfahrung sowie Lesen von Werkplänen sind ein klares Plus, weil Vorfertigung dominiert. Ein PDF der EFZ-Urkunde anhängen, viele Betriebe sortieren Inserate ohne sichtbaren Lehrabschluss aus. Mundartverständnis ist im Berner Mittelland und Oberland Voraussetzung für die Equipe-Kommunikation. Gib Pendelradius und Führerausweis prominent an — Berner Betriebe rekrutieren oft im Umkreis von 40 bis 60 Kilometern um Werkstatt oder Baustelle.",
  },

  "holzbau-vorarbeiter::ag": {
    whatDoes:
      "Ein Holzbau-Vorarbeiter im Kanton Aargau führt eine kleine Equipe auf der Baustelle, koordiniert Material, Maschinen und Termine und ist Schnittstelle zwischen Polier und Monteuren. Der Aargau ist Holzbau-Hochburg mit zahlreichen Industrie-Abbundwerken entlang von Aare, Reuss und Limmat. Der Alltag wechselt zwischen Aufrichten von Holzelementbauten in den Agglomerationen Aarau, Baden und Wettingen, Dachstuhl-Sanierungen im ländlichen Mittelland sowie Holzrahmenbau für mehrgeschossige Wohnungsbauten. Sanierung historischer Bauten und landwirtschaftliche Holzbauprojekte ergänzen den Mix. Wer Werkpläne sicher liest, BIM-Modelle versteht und das Team motiviert, hat hier sehr breite Auswahl.",
    salary:
      "Holzbau-Vorarbeiter verdienen im Kanton Aargau typisch CHF 75'000 bis 90'000 pro Jahr. Mit der eidg. Berufsprüfung zum dipl. Holzbau-Vorarbeiter und mehrjähriger Führungserfahrung sind CHF 85'000 bis 95'000 realistisch. Der Aufstieg zum Polier Holzbau hebt das Band auf CHF 88'000 bis 105'000 mit Verantwortung für mehrere Equipen, Termine und Sicherheit. Der Holzbaumeister oder die HF-Ausbildung zum Holzbautechniker öffnet das Band CHF 100'000 bis 130'000. Berufsbegleitende Lehrgänge werden im Aargau von vielen Holzbaubetrieben anteilig mitfinanziert. Die vollständige Lohnübersicht für alle Holzbauberufe steht auf unserer Startseite.",
    employers:
      "Im Kanton Aargau besetzen Zimmerei-KMU mit 15 bis 80 Mitarbeitenden den Grossteil der Vorarbeiter-Stellen. Daneben rekrutieren Industrie-Abbundwerke mit eigener CNC-Fertigung sowie Holzbau-Generalunternehmer für mehrgeschossigen Wohnbau im Reusstal und Limmattal regelmässig Equipenleiter. Sanierungsspezialisten für Riegelbauten, historische Bauernhäuser und Stallbauten suchen Vorarbeiter mit Erfahrung im Bestand. Auch Generalunternehmer für Schul-, Sport- und Gewerbebauten in den Agglomerationen Aarau und Baden gehören zu den typischen Arbeitgebern. Wir nennen aus Datenschutz- und Vermittlungsgründen keine Firmennamen — die Inserate auf zimmermannjob.ch sind anonymisiert, den konkreten Arbeitgeber lernst du im Erstgespräch kennen.",
    applicationTips:
      "Hebe im Lebenslauf abgeschlossene Vorarbeiter-Module sowie konkrete Führungserfahrung mit Equipengrösse, Bauvolumen und Aufrichtdauer hervor — zum Beispiel «MFH Aarau Rohr, 24 Wohnungen, 6-köpfige Equipe, Aufrichten in 9 Werktagen». Höhentauglichkeit, körperliche Belastbarkeit und Wetterbeständigkeit gehören prominent in das Dossier. Personalverantwortliche im Aargau prüfen Maschinenkenntnis sehr genau: Abbundanlage Hundegger, Krüsi oder Weinmann, Kran F, Hubarbeitsbühne. BIM- und CAD-Erfahrung (cadwork, SEMA, Revit) wird zunehmend vorausgesetzt. Ein PDF der EFZ-Urkunde sowie der Vorarbeiter-Bescheinigung beschleunigt die Vorauswahl spürbar. Pendelbereitschaft und Führerausweis BE oder C1 sind im weitläufigen Aargau ein klares Plus.",
  },

  "holzbau-polier::zg": {
    whatDoes:
      "Ein Polier Holzbau im Kanton Zug überwacht mehrere Equipen auf Holzbau-Grossbaustellen, ist verantwortlich für Qualität, Termine und Arbeitssicherheit und koordiniert mit anderen Gewerken. Zug prägt einen anspruchsvollen Auftragsmix: hochwertige Wohnüberbauungen am Zugerberg und in Baar, Holzelementbau für Bürobauten in Rotkreuz sowie Aufstockungen und Verdichtungen entlang der Seeachse. Sanierung historischer Bauten im Stadtkern Zug ergänzt das Repertoire, Holzrahmenbau für mehrgeschossige Wohnungsbauten dominiert das Volumen. BIM-Modelle und Abbund-CNC sind Standardwerkzeuge in der Vorbereitung. Wer ruhig führt, präzise plant und die Sicherheit konsequent durchsetzt, hat in Zug überdurchschnittliche Aufstiegschancen.",
    salary:
      "Polier Holzbau verdienen im Kanton Zug typisch CHF 90'000 bis 105'000 pro Jahr — am oberen Schweizer Band. Hochwertige Wohnüberbauungen, Generalunternehmer-Aufträge und überdurchschnittliche Bauvolumen pro Baustelle treiben den Marktwert. Der eidg. dipl. Polier Holzbau mit Führungserfahrung und Sicherheitsverantwortung erreicht CHF 100'000 bis 115'000. Der Aufstieg zum Bauführer Holzbau oder Holzbaumeister öffnet das Band CHF 110'000 bis 140'000 in Zug. Hightech- und Pharmazulieferer-Bauherrschaften zahlen oft marktführend, dafür wird auch Bereitschaft für Wochenend-Aufrichten und enge Terminschienen erwartet. Die vollständige Lohnübersicht steht auf unserer Startseite.",
    employers:
      "Im Kanton Zug besetzen mittelgrosse Zimmerei-Betriebe mit 30 bis 120 Mitarbeitenden den Grossteil der Polier-Stellen. Holzbau-Generalunternehmer für mehrgeschossigen Wohnbau in Baar, Cham und Steinhausen rekrutieren regelmässig Poliere für Grossprojekte. Industrie-Abbundwerke mit eigener Vorfertigung im Raum Rotkreuz suchen Poliere für Aufricht- und Montagekoordination. Sanierungsspezialisten für historische Bauten in der Altstadt Zug sowie Generalunternehmer für Verwaltungs- und Schulbauten gehören ebenfalls zu den typischen Arbeitgebern. Datacenter- und Hightech-Bauherrschaften beauftragen Holzbau-Poliere für Schalungs- und Hilfskonstruktionen. Wir nennen aus Datenschutz- und Vermittlungsgründen keine Firmennamen — die Inserate sind anonymisiert, der Arbeitgeber wird im Erstgespräch offengelegt.",
    applicationTips:
      "Lege im Lebenslauf abgeschlossene Polier-Module, eidg. Berufsprüfung sowie Sicherheits- und Suva-Bescheinigungen prominent dar. Liste konkrete Bauvolumen, Equipengrössen und Aufrichtterminschienen auf — zum Beispiel «Wohnüberbauung Baar Lindencham, 64 Wohnungen, 3 Equipen parallel, Aufrichten in 6 Wochen». Höhentauglichkeit, körperliche Belastbarkeit und Wetterbeständigkeit bleiben Voraussetzung, dazu kommt nachweisliche Führungserfahrung. BIM- und CAD-Beherrschung (cadwork, SEMA) sowie Maschinenkenntnis (Abbundanlage, Kran F, Hubarbeitsbühne) gehören in den oberen Drittel des CV. Ein PDF der EFZ-Urkunde sowie aller Weiterbildungs-Bestätigungen beschleunigt die Vorauswahl. Mobilität ins Kantonsgebiet sowie Führerausweis BE werden in Zug regelmässig vorausgesetzt.",
  },

  "baufuehrer-holzbau::sg": {
    whatDoes:
      "Ein Bauführer Holzbau im Kanton St. Gallen leitet ganze Holzbauprojekte von der Arbeitsvorbereitung über die Baustellenorganisation bis zur Abnahme. Der Alltag teilt sich zwischen Büro (BIM-Modelle, Abbund-CNC-Vorbereitung, Terminplanung, Bauherrenkommunikation) und regelmässigen Baustellenbesuchen in der Ostschweiz, im Rheintal und im Toggenburg. Holzelementbau in der Werkstatt mit anschliessendem Aufrichten dominiert; Sanierung historischer Bauten in den Stadtkernen St. Gallen, Rapperswil und Wil sowie traditionsreicher Bauernhäuser im Appenzellischen ergänzt das Auftragsbild. Holzrahmenbau für mehrgeschossige Wohnungsbauten gewinnt entlang der A1-Achse stark an Bedeutung. Wer planungssicher führt, hat in der Ostschweiz dauerhaft volle Auftragsbücher.",
    salary:
      "Bauführer Holzbau verdienen im Kanton St. Gallen typisch CHF 95'000 bis 115'000 pro Jahr. Mit eidg. dipl. Holzbau-Vorarbeiter, Polier-Erfahrung und nachweislicher Verantwortung für Bauvolumen ab CHF 5 Millionen sind CHF 105'000 bis 120'000 realistisch. Der Aufstieg zum Holzbau-Projektleiter mit Verantwortung für Offerte, Kosten und Bauleitung hebt das Band CHF 110'000 bis 130'000. Der Holzbaumeister oder die HF-Ausbildung zum Holzbautechniker öffnet die Geschäftsleitung mittelgrosser Zimmereien mit individuell höheren Saläten. Berufsbegleitende Weiterbildungen über Holzbau Schweiz werden in der Ostschweiz von vielen Betrieben mitfinanziert. Die vollständige Lohnübersicht steht auf unserer Startseite.",
    employers:
      "Im Kanton St. Gallen besetzen vor allem traditionsreiche Zimmerei-KMU mit 20 bis 90 Mitarbeitenden Bauführer-Stellen — viele mit eigener Werkstatt und Abbundanlage. Holzbau-Generalunternehmer für mehrgeschossigen Wohnbau im Rheintal und entlang der A1 rekrutieren regelmässig Bauführer für Grossprojekte. Industrie-Abbundwerke mit überregionaler Tätigkeit, Sanierungsspezialisten für historische Bauten und Bauernhäuser im Toggenburg und Appenzellischen sowie Generalunternehmer für Schul-, Sport- und Verwaltungsbauten gehören ebenfalls zu den typischen Arbeitgebern. Touristische Auftraggeber für Berghotels und Chaletbau ergänzen den Mix. Wir nennen aus Datenschutz- und Vermittlungsgründen keine Firmennamen — die Inserate sind anonymisiert, der Arbeitgeber wird im Erstgespräch offengelegt.",
    applicationTips:
      "Lege im Dossier abgeschlossene Bauführer- oder Holzbautechniker-Module sowie konkrete Projektreferenzen mit Bauvolumen, Termin- und Budgettreue dar — zum Beispiel «Schulhaus-Erweiterung Wil, Holzbau CHF 4.2 Mio, Termin gehalten, Budget unterschritten». BIM- und CAD-Beherrschung (cadwork, SEMA, Revit) sowie Erfahrung mit Abbundanlagen und Vorfertigung gehören in den oberen Drittel. Höhentauglichkeit und Wetterbeständigkeit bleiben relevant für regelmässige Baustellenbesuche. Personalverantwortliche in der Ostschweiz fragen gezielt nach Mundartverständnis, Bauherrenkommunikation und Verhandlungsroutine mit Subunternehmern. Ein PDF der EFZ-Urkunde sowie aller Weiterbildungs-Bestätigungen beschleunigt die Vorauswahl. Pendelbereitschaft im Kanton sowie Führerausweis B sind Pflicht.",
  },
};

export function getEditorialContent(
  roleSlug: string,
  cantonSlug: string
): EditorialContent | null {
  return ENTRIES[`${roleSlug}::${cantonSlug}`] ?? null;
}

export const EDITORIAL_BYLINE = {
  name: "Redaktion zimmermannjob.ch",
  href: "/team",
  /** ISO date — formatted at render time */
  publishedAt: "2026-05-02",
} as const;

![Caine](caine-logo.svg)

# Caine · Einfacher Bewerbungsweg auf zimmermannjob.ch

**QER-241 · 7. September 2026 · Stand vor produktiver Auslieferung.**

Das Bewerbungsformular verlangt nur noch den vollständigen Namen, einen PDF-CV und die Einwilligung zur Prüfung. Separate E-Mail- und Telefonfelder entfallen. Der Hinweis bittet um einen CV mit Kontaktdaten; die Berater entnehmen diese dem Dossier. Die entsprechenden Datenbankfelder bleiben beim neuen Ablauf leer, statt erfundene Platzhalter zu erhalten. Ältere Clients dürfen während des Rollouts weiterhin gültige Kontaktfelder übermitteln.

## Sichtbare Verbesserungen

- «CV auswählen» öffnet auch mit Enter und Leertaste genau eine Dateiauswahl. «Anderen CV wählen» ersetzt eine Datei direkt; eine ungültige Ersatzdatei verwirft den bestehenden gültigen CV nicht. Entfernen während laufender Prüfung kann keine alte Auswahl wiederherstellen.
- PDF bis 4 MB, übliche Dateinamen und Handy-/Scanner-Dateitypen werden angenommen. Zu grosse, falsche, verschlüsselte oder erkennbar ausführbare PDFs erhalten verständliche Meldungen. Die Prüfung ist keine vollständige Schadsoftwareanalyse.
- Name und CV bleiben bei Netzfehlern, verlorener Speicherantwort und erneutem Öffnen erhalten. Während der abschliessenden Dateiprüfung und Speicherung sind Eingaben gesperrt. Schnelles Ausfüllen führt nicht mehr zu einer künstlichen Mindestwartezeit.
- «Bewerbung gespeichert» erscheint erst nach bestätigtem Datensatz. Identische und gleichzeitige Versuche desselben Formularvorgangs erzeugen ein Dossier. Änderungen am Dossier oder ein neuer Formularvorgang gelten als neue Bewerbung.
- Verantwortlicher Empfänger und interne Prüfung sind erklärt. Es wird keine automatische Arbeitgeberweiterleitung oder unbelegte Antwortzeit versprochen.
- «Später entscheiden» erlaubt die Bewerbung ohne Messzustimmung. Gesperrter Browserspeicher verhindert den Bewerbungsweg nicht. Auch 320 px breite Bildschirme bleiben ohne horizontalen Überlauf nutzbar.
- «Keine passenden offenen Stellen gefunden» bietet «Alle aktuellen Stellen anzeigen», auch wenn ergänzende Direktanstellungsprofile existieren. Profile sind keine konkreten offenen Stellen.
- Stellen-Seitentitel enthalten Beruf, Ort und die sichtbare Stellenreferenz; vorhandene Markengrafiken liefern Linkvorschauen. Elektro erhält JobPosting nur für echte Vakanzen und eine korrigierte Thurgau-Weiterleitung.

## Speicherung und Messung

Eine stabile serverseitige Bewerbungs-ID verhindert Doppelablagen nach Wiederholungen. Bei einem ungewissen Datenbankausgang bleibt die Datei erhalten, bis ihre Zuordnung geklärt ist; eine noch leere Nachschau beweist nach einem Verbindungsfehler keine fehlgeschlagene Speicherung. Bestätigte überschüssige Dateien aus parallelen Versuchen werden bereinigt. Zurückbehaltene Dateien erfordern vor einer späteren Löschung eine erneute Zuordnungsprüfung.

Die optionale Messung von `application_saved` wartet höchstens 1,5 Sekunden auf den Analysespeicher. Ein Ausfall dieser Messung darf die Bestätigung eines gespeicherten Dossiers nicht verhindern. Ein eindeutiger Index verhindert doppelte Speicherereignisse. Die Nutzungsübersicht umfasst nur zustimmende Besucher und keine Kontaktdaten oder CV-Inhalte. Dossiers ohne Messzustimmung werden separat gezählt; diese Zahl nicht durch die gemessenen Sitzungen teilen.

Produktionsprüfungen brauchen `cro_test=<UUID>` und einen kurz gültigen `cro_token`, der serverseitig an Website, Testlauf und Ablaufzeit gebunden geprüft wird. Eine frei gewählte Browser-Kennzeichnung macht eine Bewerbung nicht synthetisch. Vorschauen sind synthetisch; markierte Tests senden keine Google-Werbemessung. Signierte Tests beanspruchen nicht das Kontingent echter Bewerbungen. Zusätzlich begrenzt jede Serverinstanz Anfragen vor der Dateiverarbeitung auf 30 pro Minute und Client. Das ist kein verteilter globaler Zähler; die bestehende dauerhafte Begrenzung gespeicherter echter Bewerbungen bleibt separat bestehen.

Im gemeinsamen privaten Rolejobs-Projekt bereits einmal angewendete Migrationen:

- `20260907150828_cro_verified_application_funnel.sql`: private Sitzungsübersicht und eindeutiger Speicherereignis-Index, gültig und einsatzbereit. Bereits angewendete Migration nicht nachträglich für einen anderen Indexaufbau umschreiben.
- `20260907155803_cv_name_applications.sql`: E-Mail und Telefon dürfen leer bleiben; Name bleibt erforderlich. Alte Dossiers bleiben unverändert.

Beide Migrationen liegen identisch in allen zehn Repositories. Beim Rollout den gemeinsamen Datenbankstand beachten; keine wiederholte manuelle Migration pro Website. Bewerbungen, CVs und Nutzungsdaten erhalten keinen öffentlichen Zugriff.

## Abnahme

Je Website vier Browserabläufe mit 390 × 844 und 1440 × 1000, jeweils mit und ohne Messzustimmung: leere Suche samt Rückkehr, Stellenwahl, ungültige/zu grosse PDF, Netzfehler, verlorene Bestätigung, Wiederholung und Erfolg. Zusätzlich gleichzeitige Erstübermittlung, schnelle Übermittlung ohne Kontaktfelder und alte Clients mit Kontaktfeldern. Private CVs wurden heruntergeladen und auf Lesbarkeit geprüft; Browser-CVs zusätzlich bytegleich verglichen.

Gesonderter Ablauf bei 320 × 568 mit gesperrtem Browserspeicher: Tastatur-Dateiauswahl, Entfernen während verzögerter Prüfung, Eingabesperre während abschliessender Prüfung und Erhalt nach Netzfehler. Keine unerwarteten Browserfehler oder Messanfragen. Testdossiers und Dateien werden nur anhand des eigenen Testlaufs gezielt bereinigt.

`npm run check:applications` enthält 16 Prüfungen je Website, einschliesslich nie antwortender optionaler Messung, ungeklärter Speicherung, signierter Testfreigabe und Anfragebegrenzung. Dazu ESLint der geänderten Dateien, `check:public-jobs`, vorhandene Schema-/Analysegrenzen, Werbemesstests der drei Anzeigenziele und `npm run build`.

Die lokale Abnahme nutzt autorisierten privaten Speicher und einen Testadapter für den freigegebenen Origin. Produktionswerte wurden nicht durch Testkonfiguration ersetzt. Die tatsächliche Produktionsabnahme und deren Deployment-Zeitpunkt sind nach Zusammenführung im PR und im Arbeitsbereich-Bericht `marketing/cro-cv-name-2026-09-07/ABSCHLUSS.md` festzuhalten.

## Wirkung und Betrieb

CHF 5/3/2, «Conversions maximieren», 07.09.–06.10.2026 und die pausierte Alt-Kampagne bleiben unverändert. Bestehende Nachprüfungen verwenden, keine zusätzlichen Termine. Die privaten Abfragen in [ERFOLGSMESSUNG.sql](ERFOLGSMESSUNG.sql) trennen echte Dossiers von Prüfungen. Berater beurteilen Erreichbarkeit über den CV, fachliche Eignung und Bearbeitbarkeit separat. Eine höhere Bewerbungsrate ist erst nach ausreichend echten Daten beurteilbar.

Eine Löschfrist im Datensatz löscht selbst keine Daten. Bestehende Aufbewahrungsprüfung und interne Dossierbearbeitung bleiben operative Aufgaben.

![Caine](caine-logo.svg)

# Caine · Bewerbungsweg zimmermannjob.ch

**QER-241 · 7. September 2026 · Umsetzung und technische Abnahme, noch keine produktive Auslieferung und kein belegter Mehrertrag.**

Nach einer verlorenen Speicherbestätigung konnten erneute Versuche doppelte Dossiers erzeugen. Die neue Bestätigung setzt einen tatsächlichen Datensatz voraus. Identische Versuche innerhalb desselben Formularvorgangs nutzen eine stabile, undurchsichtige Bewerbungs-ID; auch gleichzeitige Versuche erzeugen einen Datensatz. Bei ungewissem Datenbankausgang bleibt ein möglicherweise bereits zugeordnetes CV erhalten. Ein verändertes Dossier oder ein neuer Formularvorgang gilt als neue Bewerbung.

## Sichtbare Änderungen

- «Bewerbung starten» führt zum beschrifteten Formular mit passender Tastatur und automatischer Vervollständigung. Eingaben und gültiges PDF bleiben bei Fehlern und erneutem Öffnen erhalten.
- PDF-Grenze 4 MB mit verständlicher Prüfung; übliche MIME-Angaben von Handys und Scannern werden einheitlich angenommen. Die bestehende CV-Pflicht bleibt erhalten.
- «Bewerbung zur Prüfung senden» erklärt die interne Bearbeitung. «Bewerbung gespeichert» erscheint nur nach gültiger Serverbestätigung; keine automatische Arbeitgeberweiterleitung oder unbelegte Antwortzeit.
- Bei keinen konkreten Treffern führt «Alle aktuellen Stellen anzeigen» zurück zur ungefilterten Suche, auch wenn ergänzend Direktanstellungsprofile vorhanden sind.
- «Später entscheiden» schliesst den Tracking-Dialog ohne Einwilligung. Die Auswahl bleibt über «Tracking-Einstellungen» erreichbar; Tracking ist keine Bewerbungsvoraussetzung.
- Stellen-Seitentitel enthalten Beruf, Ort und eine kurze Stellenreferenz; die vorhandene Markengrafik dient als erreichbares Vorschau-Bild.

## Messung und Datenbank

Die Migration `20260907150828_cro_verified_application_funnel.sql` wurde am 07.09.2026 einmal im gemeinsamen Rolejobs-Projekt angewendet. Sie erstellt eine private Sitzungsübersicht und einen eindeutigen Index für `application_saved`. Die identische Migration liegt in allen zehn Repositories; beim weiteren Rollout den bereits angewendeten gemeinsamen Stand beachten. Kein öffentlicher Zugriff wird erteilt.

`application_saved` wird nur vom Bewerbungsserver nach bestätigter Speicherung und nur mit übergebenem Messkontext nach Einwilligung geschrieben. Client-Anfragen dürfen dieses Ereignis nicht selbst melden. Alte `application_success`-Ereignisse zählen in der neuen Übersicht nicht als Speicherungen. Kontaktdaten, Suchbegriffe und CV-Inhalte gehören nicht in die Nutzungsereignisse.

Markierte Prüfungen nutzen `?cro_test=<UUID>` und Adressen unter `@example.invalid`; die Kennzeichnung bleibt innerhalb des Tabs erhalten. Vorschauen sind synthetisch. Automatisierte und markierte Besuche lösen keine Google-Werbemessung aus. Echte Tests in Produktion ebenfalls ausdrücklich markieren. Historische Testbesuche lassen sich dadurch nicht nachträglich zuverlässig trennen.

## Verifikation

- Je Website vier reale Browserdurchläufe: 390 × 844 und 1440 × 1000, jeweils Messung akzeptiert/abgelehnt. PDF-Fehler, Netzfehler, verlorene Bestätigung, erneutes Absenden und Erfolg geprüft. Je Vorgang genau ein Dossier und bei Zustimmung genau ein Speicherereignis; ohne Zustimmung keines. Keine Google-Anfragen in synthetischen Durchläufen.
- Zusätzlicher API-Durchlauf: zwei gleichzeitige Erstübermittlungen ergeben einen Datensatz mit weiterhin lesbarem privatem CV. Falscher Ursprung, ungültiges/verschlüsseltes PDF, fehlende Stelle und erfundene Speicherereignisse abgewiesen.
- Suche tatsächlich bedient, leeres Resultat zurückgesetzt, Stelle gewählt und Formular mit Tastatur geöffnet/geschlossen. Kein horizontaler Überlauf auf 390 px.
- Anwendungstests (12 pro Website), ESLint für geänderte Dateien, öffentliche Datenabgrenzung und vorhandene Schema-/Analyseprüfungen bestanden. Produktionsbuild bestanden.
- Synthetische Bewerbungen und zugeordnete Dateien gezielt entfernt; verbleibende Testdossiers: 0. Echte Dossiers blieben erhalten.

Die Browserabnahme lief auf lokalen Next-Servern gegen den vorhandenen privaten Speicher. Der Testadapter setzte den freigegebenen Produktions-Origin und reservierte Test-IP-Adressen; die Anwendung selbst behält ihre Ursprungsprüfung. Testkonfiguration und synthetische Empfängerangaben wurden nicht in Produktionsvariablen geschrieben. Das ist keine Abnahme eines bereits ausgerollten Produktionsdeployments.

Reproduzierbare lokale Prüfungen: `npm run check:applications`, `npm run check:public-jobs`, vorhandene `check:job-schema`/`check:analytics-boundary` sowie `npm run build`. Eine vollständige Speicherprobe benötigt autorisierte private Serverkonfiguration und anschliessende gezielte Bereinigung.

## Auslieferung und spätere Wirkung

PR prüfen und zusammenführen; danach das Vercel-Deployment und eine markierte Produktionsprobe kontrollieren. Den Auslieferungszeitpunkt pro Website festhalten. Kein neues Anzeigenbudget, keine neue Kampagne und keine zusätzlichen Kalendertermine angelegt.

Die vereinbarten CHF 5/3/2, «Conversions maximieren», 07.09.–06.10.2026 und die pausierte Alt-Kampagne bleiben unverändert. Bei vorhandenen Nachprüfungen echte Dossiers, zustimmungsabhängige Formularschritte und die separat durch Berater beurteilte Erreichbarkeit/Eignung vergleichen. Die gemessenen Sitzungen bilden nicht alle Besucher ab. Technische Fehlerbehebung ist kein Nachweis einer höheren Bewerbungsrate.

Eine Löschfrist im Datensatz führt selbst keine Löschung aus. Bestehende Aufbewahrungsprüfung und Dossierbearbeitung bleiben operative Aufgaben. Bei dauerhaft ungewissem Datenbankausgang zurückbehaltene Dateien müssen vor einer Bereinigung auf Zuordnung geprüft werden.

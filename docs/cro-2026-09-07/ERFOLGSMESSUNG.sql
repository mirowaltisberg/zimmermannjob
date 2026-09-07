-- Caine · QER-241 · nur im privaten Rolejobs-Projekt ausführen.
-- 1. Sitzungen nach Beginn (Schweizer Datum), getrennt nach markierten Prüfungen.
select * from public.analytics_application_funnel
where session_date >= date '2026-09-07'
order by session_date, site, synthetic;

-- 2. Tatsächlich gespeicherte Dossiers, unabhängig von Messzustimmung.
-- Nicht mit der Zahl der gemessenen Sitzungen zu einer allgemeinen Rate teilen.
select site, (submitted_at at time zone 'Europe/Zurich')::date as datum,
       source, status, count(*) as gespeicherte_dossiers
from public.applications
where submitted_at >= timestamptz '2026-09-07 00:00:00+02'
group by site, datum, source, status
order by datum, site, source, status;

-- 3. Wiederholungsprüfung der neuen serverseitigen Ereignisse: muss leer bleiben.
select site, properties->>'conversion_id' as conversion_id, count(*)
from public.site_analytics_events
where event_name='application_saved'
group by site, properties->>'conversion_id'
having count(*)>1;

-- 4. Operative Qualität separat erfassen: erreichbar / fachlich passend /
-- Dossier bearbeitbar / weiterführendes Gespräch. Nur autorisierte Berater
-- beurteilen dies im Bewerbungsprozess; keine Namen oder Kontaktangaben in
-- Nutzungsereignisse schreiben. «received» ist noch kein Qualitätsurteil.

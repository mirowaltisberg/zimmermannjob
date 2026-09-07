-- Gemeinsame Rolejobs-Datenbank: einmal vor der Auslieferung aller Websites anwenden.
-- Neue serverseitige Ereignisse werden anhand der gespeicherten Bewerbung dedupliziert.
create unique index if not exists site_analytics_application_saved_once
  on public.site_analytics_events (site, (properties->>'conversion_id'))
  where event_name = 'application_saved';

-- Private Sitzungsübersicht. Alte Browser-Erfolgsmeldungen zählen nicht als Speicherung.
create or replace view public.analytics_application_funnel
with (security_invoker = true) as
with sessions as (
  select site, session_id,
    (min(occurred_at) at time zone 'Europe/Zurich')::date as session_date,
    bool_or(coalesce(properties->>'synthetic', 'false') = 'true') as synthetic,
    bool_or(event_name = 'job_view') as viewed,
    bool_or(event_name = 'application_open') as opened,
    bool_or(event_name = 'application_submit') as submitted,
    bool_or(event_name = 'application_saved') as saved,
    count(distinct properties->>'conversion_id') filter (where event_name = 'application_saved') as saved_applications
  from public.site_analytics_events
  group by site, session_id
)
select site, session_date, synthetic,
  count(*) as sessions,
  count(*) filter (where viewed) as job_view_sessions,
  count(*) filter (where opened) as form_open_sessions,
  count(*) filter (where submitted) as submit_sessions,
  count(*) filter (where saved) as saved_sessions,
  sum(saved_applications) as saved_applications
from sessions group by site, session_date, synthetic;
revoke all on public.analytics_application_funnel from public, anon, authenticated;
grant select on public.analytics_application_funnel to service_role;

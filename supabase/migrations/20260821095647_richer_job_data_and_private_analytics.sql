-- Preserve richer vacancy facts only when they came from the source feed.
alter table public.jobs
  add column if not exists salary_min numeric,
  add column if not exists salary_max numeric,
  add column if not exists salary_currency text,
  add column if not exists salary_unit text;

alter table public.jobs
  drop constraint if exists jobs_salary_details_check;

alter table public.jobs
  add constraint jobs_salary_details_check check (
    (
      salary_min is null
      and salary_max is null
      and salary_currency is null
      and salary_unit is null
    )
    or (
      salary_currency = 'CHF'
      and salary_unit in ('HOUR', 'MONTH', 'YEAR')
      and coalesce(salary_min, salary_max) is not null
      and (salary_min is null or salary_min > 0)
      and (salary_max is null or salary_max > 0)
      and (salary_min is null or salary_max is null or salary_min <= salary_max)
    )
  ) not valid;

alter table public.jobs validate constraint jobs_salary_details_check;

-- Detailed analytics remain private. Browsers post to a validated same-origin
-- server route; only the service role can insert or read events.
create table if not exists public.site_analytics_events (
  id bigint generated always as identity primary key,
  site text not null check (char_length(site) between 3 and 80),
  session_id uuid not null,
  sequence integer not null check (sequence between 0 and 1000000),
  event_name text not null check (event_name ~ '^[a-z][a-z0-9_]{1,63}$'),
  path text not null check (char_length(path) between 1 and 300),
  referrer_host text check (referrer_host is null or char_length(referrer_host) <= 180),
  properties jsonb not null default '{}'::jsonb check (jsonb_typeof(properties) = 'object'),
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  consent_version text not null default 'analytics-v1',
  retention_expires_at timestamptz not null default (now() + interval '400 days')
);

alter table public.site_analytics_events enable row level security;
revoke all privileges on table public.site_analytics_events from anon, authenticated;
grant select, insert, delete on table public.site_analytics_events to service_role;
grant usage, select on sequence public.site_analytics_events_id_seq to service_role;

create index if not exists site_analytics_events_site_received_idx
  on public.site_analytics_events (site, received_at desc);
create unique index if not exists site_analytics_events_event_identity_idx
  on public.site_analytics_events (site, session_id, sequence);
create index if not exists site_analytics_events_retention_idx
  on public.site_analytics_events (retention_expires_at);
create index if not exists site_analytics_events_event_received_idx
  on public.site_analytics_events (site, event_name, received_at desc);

create or replace view public.analytics_session_journeys
with (security_invoker = true)
as
select
  site,
  session_id,
  min(received_at) as session_started_at,
  max(received_at) as session_last_seen_at,
  count(*)::integer as event_count,
  jsonb_agg(
    jsonb_build_object(
      'sequence', sequence,
      'event', event_name,
      'path', path,
      'occurredAt', occurred_at,
      'properties', properties
    )
    order by sequence, received_at
  ) as journey
from public.site_analytics_events
group by site, session_id;

revoke all privileges on table public.analytics_session_journeys from anon, authenticated;
grant select on table public.analytics_session_journeys to service_role;

create or replace view public.analytics_daily_summary
with (security_invoker = true)
as
select
  site,
  (received_at at time zone 'UTC')::date as event_day_utc,
  event_name,
  count(*)::bigint as event_count,
  count(distinct session_id)::bigint as session_count
from public.site_analytics_events
group by site, (received_at at time zone 'UTC')::date, event_name;

revoke all privileges on table public.analytics_daily_summary from anon, authenticated;
grant select on table public.analytics_daily_summary to service_role;

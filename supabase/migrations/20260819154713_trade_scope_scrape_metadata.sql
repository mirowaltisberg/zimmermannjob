-- Keep the legacy id=1 metadata row intact. A separate trade-keyed table avoids
-- cross-site freshness races without rewriting shared production history.
create table if not exists public.trade_scrape_metadata (
  trade text primary key,
  scraped_at timestamptz not null,
  total_jobs integer not null check (total_jobs >= 0)
);

alter table public.trade_scrape_metadata enable row level security;

revoke all privileges on table public.trade_scrape_metadata from anon, authenticated;
grant select, insert, update, delete on table public.trade_scrape_metadata to service_role;

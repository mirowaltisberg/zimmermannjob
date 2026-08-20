-- Preserve unknown salary truthfully when a source does not publish it.
-- Existing rows remain untouched; fresh snapshots can store NULL.
alter table public.jobs
  alter column salary drop default,
  alter column salary drop not null;

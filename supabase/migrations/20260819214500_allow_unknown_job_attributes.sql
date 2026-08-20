-- Missing source attributes must stay unknown instead of being converted into
-- Vollzeit, 100% or non-remote claims. Existing rows remain untouched; fresh
-- trade snapshots can now store NULL until a source explicitly provides data.
alter table public.jobs
  alter column type drop default,
  alter column type drop not null,
  alter column workload drop default,
  alter column workload drop not null,
  alter column is_remote drop default,
  alter column is_remote drop not null;

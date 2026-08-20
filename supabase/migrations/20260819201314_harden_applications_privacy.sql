-- Additive-only privacy and operations metadata. Existing applications and CV
-- objects remain untouched; old rows intentionally keep NULL in these fields.
alter table public.applications
  add column if not exists site text,
  add column if not exists status text,
  add column if not exists consent_version text,
  add column if not exists consented_at timestamptz,
  add column if not exists retention_expires_at timestamptz,
  add column if not exists ip_hash text,
  add column if not exists submitted_at timestamptz;

alter table public.applications enable row level security;
revoke all privileges on table public.applications from anon, authenticated;
grant select, insert, update, delete on table public.applications to service_role;

create index if not exists applications_site_ip_submitted_idx
  on public.applications (site, ip_hash, submitted_at desc)
  where ip_hash is not null and submitted_at is not null;

create index if not exists applications_retention_status_idx
  on public.applications (retention_expires_at, status)
  where retention_expires_at is not null;

-- Preserve the bucket and all existing files while forcing private access and
-- restricting all future standard uploads to the same server-side PDF limit.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cvs', 'cvs', false, 5242880, array['application/pdf']::text[])
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- The service role performs uploads. No browser role receives a CV policy.
drop policy if exists "Anyone can upload CVs" on storage.objects;

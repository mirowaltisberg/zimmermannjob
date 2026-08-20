-- Raw job sources and applicant data are accessed only by trusted server code.
-- Public pages receive an anonymised DTO through the Next.js API boundary.
revoke all privileges on table public.jobs from anon, authenticated;
revoke all privileges on table public.scrape_metadata from anon, authenticated;
revoke all privileges on table public.applications from anon, authenticated;

drop policy if exists "Jobs are publicly readable" on public.jobs;
drop policy if exists "Scrape metadata is publicly readable" on public.scrape_metadata;
drop policy if exists "Anyone can submit applications" on public.applications;

grant select, insert, update, delete on table public.jobs to service_role;
grant select, insert, update, delete on table public.scrape_metadata to service_role;
grant select, insert, update, delete on table public.applications to service_role;

-- The application route uploads with the service role; clients must never be
-- able to write directly to the private CV bucket.
drop policy if exists "Anyone can upload CVs" on storage.objects;

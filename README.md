# zimmermannjob.ch

Independent Swiss job discovery site for vacancies with a clear connection to carpentry and structural timber construction. The production site is [zimmermannjob.ch](https://zimmermannjob.ch).

## Product rules

- Every public vacancy must come from a real source listing. There is no generated, mock or demo inventory.
- Employer identities, raw descriptions, source URLs and internal source identifiers stay server-side.
- Browser-facing job data is created from a strict allowlist and controlled role profiles.
- Missing, expired, malformed or off-trade job IDs return a real 404.
- Applications are disabled unless the responsible controller and every security dependency are explicitly configured. No automatic employer forwarding is claimed.

## Stack

- Next.js 16, React 19 and Tailwind CSS 4
- Supabase Postgres and private Storage, accessed from server-only code
- Vercel hosting, Analytics and Speed Insights
- Pinned Python JobSpy scraper with secret-free workers and a single guarded publisher

## Local development

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

The site fails safely when the server-only Supabase credentials are absent: it does not manufacture replacement vacancies.

## Validation

```bash
npm run lint
npm run build
npm run check:job-safety
npm run check:public-jobs
```

`check:job-safety` verifies TypeScript/Python classifier parity and identity rules. `check:public-jobs` verifies that transformed browser data contains no forbidden employer or source fields.

## Scraper architecture

The scheduled workflow runs five isolated scrape workers with at most two workers in parallel. Workers receive no Supabase secret and upload short-lived JSON artifacts. A single publisher then validates the complete snapshot, deduplicates it, enforces absolute and retention thresholds, writes only `trade = zimmermann`, prunes only that trade and verifies the stored count and trade-scoped metadata.

Publishing is disabled by default. Scheduled runs can never enter the `publish` job. A manual workflow run must supply the exact per-run input `confirm_publish = PUBLISH` **and** a repository administrator must have set the Actions variable `ZIMMERMANN_PUBLISHING_APPROVED` to the exact value `true`. A push or scheduled scrape therefore cannot publish or prune, even when the variable and database secrets already exist.

The publisher reads the entire Zimmermann inventory, including legacy IDs. A stale row can be deleted only through a batch constrained by both `trade = zimmermann` and the exact validated stale-ID list; rows belonging to another trade are never in scope.

The publisher is intentionally fail-closed. Use `--dry-run` for an offline artifact check. Use `--plan` for aggregate, read-only comparison with the current Zimmermann inventory. Publishing or pruning production rows requires an intentional authorized run.

## Applications and privacy

Application intake is off by default. Enabling it requires a verified controller identity, allowed origin, retention and rate-limit settings, a strong IP-hash secret, private Supabase credentials and an approved malware-scanner adapter. The current adapter deliberately returns unavailable, so configuration alone cannot accidentally enable uploads.

Historical application rows and private CV objects are preserved. Do not delete or export them without explicit authorization.

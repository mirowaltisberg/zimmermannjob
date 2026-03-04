# Elektrojob.ch

Swiss job board for electrical trades — live at [elektrojob.ch](https://www.elektrojob.ch)

## Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Postgres + Storage)
- **Hosting**: Vercel
- **Scraper**: Python (jobspy) — LinkedIn, Indeed, Google Jobs

## Features

- **Live job listings** — 2000+ scraped Swiss electrical jobs, updated regularly
- **Search & filter** — by keyword, location (with radius), job type, workload, remote
- **SEO landing pages** — pre-rendered pages for top role/canton combos
- **CV upload & apply** — applicants submit name, email, phone + CV (PDF/DOCX), stored in Supabase Storage
- **Swiss postal code autocomplete** — location search with PLZ support
- **Vercel Analytics** — page view tracking

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── applications/   # POST — job applications + CV upload
│   │   ├── jobs/            # GET — search & detail endpoints
│   │   ├── postal-codes/    # GET — Swiss PLZ autocomplete
│   │   └── scrape/          # POST — trigger Python scraper
│   ├── elektrojobs/         # SEO landing pages
│   ├── jobs/[id]/           # Job detail page (SSR)
│   └── page.tsx             # Homepage with search
├── components/              # UI components (apply modal, search, etc.)
├── lib/
│   ├── supabase.ts          # Supabase client (public + admin)
│   ├── job-catalog.ts       # Core search, filter, sort, scoring logic
│   ├── scraped-jobs.ts      # Data layer (Supabase queries + JSON fallback)
│   └── ...                  # Utils, types, location, text cleaning
└── data/
    └── scraped-jobs.json    # Local backup of scraped data
scripts/
├── scrape-jobs.py           # Job scraper (dual-write: JSON + Supabase)
└── seed-supabase.ts         # One-time DB seed from JSON
```

## Database (Supabase)

| Table | Purpose |
|-------|---------|
| `jobs` | All scraped job listings |
| `applications` | Job applications with CV references |
| `scrape_metadata` | Last scrape timestamp + total count |
| `cvs` (storage) | Uploaded CV files (PDF/DOCX, max 10 MB) |

## Development

```bash
npm install
cp .env.local.example .env.local  # add your Supabase keys
npm run dev
```

## Scraping

```bash
cd scripts
python -m venv .venv && source .venv/bin/activate
pip install python-jobspy supabase
python scrape-jobs.py
```

## Deployment

```bash
vercel --prod
```

"""Scrape a fresh chunk of genuine Swiss Zimmermann and timber jobs into JSON.

This command is deliberately storage-only: it never connects to Supabase. CI
runs several isolated chunks in parallel and a separate publisher validates,
merges and publishes the complete snapshot exactly once.
"""

import json
import os
import re
import math
import hashlib
import argparse
import logging
import multiprocessing
import queue
from datetime import datetime, timezone

from jobspy import scrape_jobs
from job_safety import CONFIG as JOB_SAFETY_CONFIG, classify_zimmermann_title


def safe_str(val) -> str:
    """Convert a value to string, handling NaN/None from pandas."""
    if val is None:
        return ""
    if isinstance(val, float) and math.isnan(val):
        return ""
    return str(val).strip()


def safe_num(val):
    """Convert a value to number, handling NaN/None from pandas."""
    if val is None:
        return None
    if isinstance(val, float) and math.isnan(val):
        return None
    try:
        return float(val)
    except (ValueError, TypeError):
        return None


def safe_bool(val) -> bool | None:
    """Accept only real boolean values; strings and numbers are ambiguous."""
    if isinstance(val, bool):
        return val
    value_type = type(val)
    if value_type.__module__.startswith("numpy") and value_type.__name__ == "bool_":
        return bool(val)
    return None


# Map canton abbreviations to full names
CANTON_MAP = {
    "ZH": "Zürich", "BE": "Bern", "LU": "Luzern", "UR": "Uri",
    "SZ": "Schwyz", "OW": "Obwalden", "NW": "Nidwalden", "GL": "Glarus",
    "ZG": "Zug", "FR": "Freiburg", "SO": "Solothurn", "BS": "Basel-Stadt",
    "BL": "Basel-Landschaft", "SH": "Schaffhausen", "AR": "Appenzell Ausserrhoden",
    "AI": "Appenzell Innerrhoden", "SG": "St. Gallen", "GR": "Graubünden",
    "AG": "Aargau", "TG": "Thurgau", "TI": "Tessin", "VD": "Waadt",
    "VS": "Wallis", "NE": "Neuenburg", "GE": "Genf", "JU": "Jura",
}


def parse_location(raw_location: str) -> str:
    """Parse Indeed location format 'City, Canton, CH' into readable form."""
    if not raw_location:
        return "Schweiz"

    parts = [p.strip() for p in raw_location.split(",")]

    if len(parts) >= 2:
        city = parts[0]
        canton_abbr = parts[1].strip()
        canton_name = CANTON_MAP.get(canton_abbr, canton_abbr)
        return f"{city}, {canton_name}"

    return parts[0] if parts[0] else "Schweiz"


def extract_workload(description: str) -> str | None:
    """Try to extract workload percentage from the description text."""
    patterns = [
        r'(\d{2,3})\s*%',                    # "100%", "80 %"
        r'(\d{2,3})\s*-\s*(\d{2,3})\s*%',    # "80-100%"
        r'Pensum[:\s]*(\d{2,3})\s*%',         # "Pensum: 100%"
        r'Pensum[:\s]*(\d{2,3})\s*-\s*(\d{2,3})\s*%',  # "Pensum: 80-100%"
    ]

    # Check first 500 chars for workload info
    header = description[:500]

    # Range pattern first
    m = re.search(r'(\d{2,3})\s*-\s*(\d{2,3})\s*%', header)
    if m:
        lo, hi = int(m.group(1)), int(m.group(2))
        if 20 <= lo <= 100 and 20 <= hi <= 100:
            return f"{lo}-{hi}%"

    # Single percentage (look for "Pensum" context or standalone)
    m = re.search(r'(?:Pensum|Arbeitspensum|Beschäftigungsgrad)[:\s]*(\d{2,3})\s*%', header, re.IGNORECASE)
    if m:
        val = int(m.group(1))
        if 20 <= val <= 100:
            return f"{val}%"

    return None


def extract_sections(description: str) -> dict:
    """Extract structured sections (responsibilities, requirements, benefits) from description."""
    responsibilities = []
    requirements = []
    benefits = []

    if not description:
        return {"responsibilities": responsibilities, "requirements": requirements, "benefits": benefits}

    # Common section header patterns in German job postings
    resp_patterns = [
        r'(?:Ihre |Deine )?Aufgaben',
        r'(?:Ihre |Deine )?Tätigkeiten',
        r'(?:Das |Dies )(?:erwartet|sind|beinhaltet)',
        r'Was Sie (?:erwartet|tun)',
        r'(?:Ihre |Deine )?Hauptaufgaben',
    ]
    req_patterns = [
        r'(?:Ihr |Dein )?(?:Profil|Anforderungen?)',
        r'(?:Das |Was )(?:bringen Sie mit|bringst du mit|Sie mitbringen)',
        r'(?:Ihre |Deine )?(?:Qualifikationen?|Kompetenzen)',
        r'(?:Wir )?(?:erwarten|suchen|wünschen)',
        r'Voraussetzungen',
    ]
    ben_patterns = [
        r'(?:Wir |Unser )?(?:bieten|Angebot)',
        r'(?:Ihre |Deine )?(?:Vorteile|Benefits)',
        r'(?:Das |Was )(?:bieten wir|erwartet Sie)',
        r'(?:Wir )?bieten Ihnen',
        r'Ihre Perspektiven',
    ]

    def find_section(text: str, patterns: list[str]) -> tuple[int, int] | None:
        """Find the start position and end-of-header of a section."""
        for pat in patterns:
            m = re.search(rf'\*?\*?{pat}\*?\*?[:\s]*\n', text, re.IGNORECASE)
            if m:
                return m.start(), m.end()
        return None

    def extract_bullets(text: str) -> list[str]:
        """Extract bullet points or line items from a text block."""
        items = []
        for line in text.split('\n'):
            line = line.strip()
            # Skip separator lines (---, ***, ===, etc.)
            if re.match(r'^[-*=_]{3,}\s*$', line):
                continue
            # Remove markdown bold markers
            line = re.sub(r'\*\*', '', line)
            # Match bullet points: -, *, •, or numbered
            line = re.sub(r'^[-*•►▸◦‣]\s*', '', line)
            line = re.sub(r'^\d+[.)]\s*', '', line)
            line = line.strip()
            # Skip short lines, pure punctuation, or section headers
            if line and len(line) > 15 and not re.match(r'^[-=_*#]+$', line):
                items.append(line)
        return items

    # Find all section positions
    sections = []
    resp_pos = find_section(description, resp_patterns)
    if resp_pos:
        sections.append(('resp', resp_pos[0], resp_pos[1]))
    req_pos = find_section(description, req_patterns)
    if req_pos:
        sections.append(('req', req_pos[0], req_pos[1]))
    ben_pos = find_section(description, ben_patterns)
    if ben_pos:
        sections.append(('ben', ben_pos[0], ben_pos[1]))

    # Sort by position
    sections.sort(key=lambda s: s[1])

    # Extract text for each section (from header end to next section start)
    for i, (stype, start, header_end) in enumerate(sections):
        if i + 1 < len(sections):
            section_text = description[header_end:sections[i + 1][1]]
        else:
            section_text = description[header_end:header_end + 2000]

        bullets = extract_bullets(section_text)[:10]  # Max 10 items per section

        if stype == 'resp':
            responsibilities = bullets
        elif stype == 'req':
            requirements = bullets
        elif stype == 'ben':
            benefits = bullets

    return {"responsibilities": responsibilities, "requirements": requirements, "benefits": benefits}


def clean_description(description: str) -> str:
    """Clean up the description text, removing excessive markdown."""
    if not description:
        return ""
    # Remove excessive asterisks but keep basic structure
    text = re.sub(r'\*{3,}', '**', description)
    # Remove excessive newlines
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


# ── Relevance filter ──────────────────────────────────────────────────────────

# Swiss location whitelist — location must contain one of these to be kept
SWISS_LOCATION_MARKERS = [
    # Country
    "switzerland", "schweiz", "suisse", "svizzera",
    # Cantons (German + French + Italian names)
    "zurich", "zürich", "berne", "bern", "lucerne", "luzern",
    "uri", "schwyz", "obwalden", "nidwalden", "glarus", "zug",
    "fribourg", "freiburg", "solothurn", "basel", "schaffhausen",
    "appenzell", "st gallen", "st. gallen", "graubünden", "grisons",
    "aargau", "thurgau", "ticino", "tessin", "vaud", "waadt",
    "valais", "wallis", "neuchâtel", "neuenburg", "geneva", "genève", "genf",
    "jura",
    # Major cities not already covered by canton names
    "winterthur", "biel", "thun", "köniz", "chur", "uster",
    "sion", "lugano", "yverdon", "rapperswil", "dietikon",
    "olten", "aarau", "baden", "wil", "frauenfeld", "kreuzlingen",
    "langenthal", "burgdorf", "interlaken", "davos", "arbon",
    "emmen", "kriens", "horw", "wädenswil", "dübendorf",
    "wetzikon", "muttenz", "liestal", "rheinfelden", "brugg",
    "wohlen", "lenzburg", "gossau", "herisau", "sursee",
    "buchs", "lyss", "spiez", "spreitenbach", "pratteln",
    "regensdorf", "bremgarten", "sarnen", "altdorf", "stans",
    "rolle", "morges", "nyon", "montreux", "vevey", "lausanne",
    "bienne", "delémont", "locarno", "bellinzona", "mendrisio",
    "zollikofen", "ittigen", "münchenbuchsee", "ostermundigen",
    "birmensdorf", "birmenstorf", "unterentfelden",
    "emmenbrücke", "rotkreuz", "risch",
    "galgenen", "stäfa", "meilen", "küsnacht", "zollikon",
    "visp", "brig", "sierre", "martigny",
]


# Known non-Swiss regions that collide with Swiss city names
FALSE_POSITIVE_LOCATIONS = [
    "baden-württemberg", "baden württemberg",
    "niedersachsen", "lower saxony",
    "nordrhein", "north rhine",
    "bayern", "bavaria",
    "sachsen", "saxony",
    "hessen", "hesse",
    "rheinland-pfalz", "rhineland",
    "schleswig", "mecklenburg",
    "brandenburg", "thuringia", "thüringen",
    "vorarlberg", "oberösterreich", "niederösterreich",
    "steiermark", "kärnten", "burgenland",
    "lombardy", "piedmont", "veneto", "lazio", "campania", "tuscany",
]


def is_swiss_location(location: str) -> bool:
    """Return True if the location looks Swiss."""
    loc = location.lower()
    if not loc or loc == "schweiz":
        return True  # generic = keep (benefit of the doubt)
    # Reject known non-Swiss regions first (e.g. "Baden, Baden-Württemberg")
    if any(fp in loc for fp in FALSE_POSITIVE_LOCATIONS):
        return False
    return any(marker in loc for marker in SWISS_LOCATION_MARKERS)


def is_relevant_job(job: dict) -> bool:
    """Return True only for clearly timber-construction-related Swiss roles."""
    title = job.get("title", "").lower()
    location = job.get("location", "").lower()

    # 1) Must be in Switzerland
    if not is_swiss_location(location):
        return False

    # Public publication is deny-first: REVIEW is kept out together with REJECT.
    return classify_zimmermann_title(title)["disposition"] == "ACCEPT"


OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "src", "data")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "scraped-jobs.json")

TRADE = JOB_SAFETY_CONFIG["trade"]
DEFAULT_MAX_AGE_DAYS = 35
DEFAULT_COMBO_TIMEOUT_SECONDS = 180

DEFAULT_SEARCH_TERMS = [
    "Zimmermann EFZ",
    "Zimmerin EFZ",
    "Holzbau-Fachmann",
    "Holzbau-Fachfrau",
    "Holzbaupolier",
    "Holzbautechniker",
    "Projektleiter Holzbau",
    "Bauleiter Holzbau",
    "Vorarbeiter Holzbau",
    "Konstrukteur Holzbau",
    "AVOR Holzbau",
    "Holzbau Montage",
    "Elementbauer Holzbau",
    "Abbinder Holzbau",
    "Holzrahmenbau Zimmerei",
]

DEFAULT_LOCATIONS = [
    "Zürich, Schweiz",
    "Bern, Schweiz",
    "Basel, Schweiz",
    "Luzern, Schweiz",
    "St. Gallen, Schweiz",
    "Winterthur, Schweiz",
    "Aarau, Schweiz",
    "Biel, Schweiz",
    "Lausanne, Schweiz",
    "Lugano, Schweiz",
    "Chur, Schweiz",
    "Sion, Schweiz",
    "Olten, Schweiz",
    "Thun, Schweiz",
    "Frauenfeld, Schweiz",
    "Zug, Schweiz",
    "Schaffhausen, Schweiz",
    "Solothurn, Schweiz",
    "Rapperswil, Schweiz",
    "Baden, Schweiz",
]


def _scrape_jobs_worker(result_queue, scrape_kwargs: dict) -> None:
    """Run JobSpy outside the coordinator process so hung site threads are killable."""
    # JobSpy can log complete search URLs (including location/query) on upstream
    # errors even with verbose=0. Keep worker logs aggregate-only; structured
    # status still returns to the coordinator through result_queue.
    logging.disable(logging.CRITICAL)
    try:
        jobs_df = scrape_jobs(**scrape_kwargs)
        records = [] if jobs_df is None or jobs_df.empty else jobs_df.to_dict(orient="records")
        result_queue.put(("ok", records))
    except Exception as exc:
        result_queue.put(("error", type(exc).__name__))


def scrape_swiss_jobs(
    query: str,
    location: str,
    results_wanted: int = 50,
    max_age_days: int = DEFAULT_MAX_AGE_DAYS,
    combo_timeout_seconds: int = DEFAULT_COMBO_TIMEOUT_SECONDS,
) -> list[dict]:
    """Scrape jobs from Indeed for a given query + location."""
    # Keep CI logs aggregate-only. Titles, employers and source URLs can contain
    # identifying information and must stay inside the short-lived artifact.
    print(f"  Scraping one query/location pair (max {results_wanted})...")

    context = multiprocessing.get_context("spawn")
    result_queue = context.Queue(maxsize=1)
    process = context.Process(
        target=_scrape_jobs_worker,
        args=(
            result_queue,
            {
                "site_name": ["indeed", "google", "linkedin"],
                "search_term": query,
                "location": location,
                "results_wanted": results_wanted,
                "hours_old": max_age_days * 24,
                "country_indeed": "Switzerland",
                "verbose": 0,
            },
        ),
    )
    process.start()

    try:
        status, payload = result_queue.get(timeout=combo_timeout_seconds)
    except queue.Empty:
        print(f"    Scraper request timed out after {combo_timeout_seconds}s.")
        process.terminate()
        process.join(timeout=10)
        return []
    except KeyboardInterrupt:
        process.terminate()
        process.join(timeout=10)
        raise
    finally:
        result_queue.close()

    process.join(timeout=10)
    if process.is_alive():
        process.terminate()
        process.join(timeout=10)

    if status != "ok":
        print(f"    Scraper request failed: {payload}")
        return []

    records = payload
    if not records:
        print("    No results found.")
        return []

    print(f"    Found {len(records)} jobs.")
    return records


def normalize_job(raw: dict, idx: int) -> dict | None:
    """Convert a raw jobspy record to our app's Job format."""
    title = safe_str(raw.get("title"))
    company = safe_str(raw.get("company"))
    job_url = safe_str(raw.get("job_url"))

    if not title or not re.match(r"^https?://", job_url, re.IGNORECASE):
        return None

    # Location — Indeed returns "City, Canton, CH" in the `location` field
    raw_location = safe_str(raw.get("location"))
    location_str = parse_location(raw_location)

    # Description
    description = clean_description(safe_str(raw.get("description")))
    short_desc = description[:300].rsplit(" ", 1)[0] + "..." if len(description) > 300 else description

    # Job type / workload — Indeed can return "parttime, fulltime"
    job_type = safe_str(raw.get("job_type"))
    type_map = {
        "fulltime": "Vollzeit",
        "parttime": "Teilzeit",
        "contract": "Temporär",
        "internship": "Praktikum",
    }
    # Handle comma-separated types: pick the first recognized one
    job_type_display = ""
    for t in job_type.lower().split(","):
        t = t.strip()
        if t in type_map:
            job_type_display = type_map[t]
            break

    # Try to extract workload from description
    workload = extract_workload(description) or ""

    # Extract structured sections from description
    sections = extract_sections(description)

    # Date
    date_posted = raw.get("date_posted")
    date_str = ""
    if date_posted:
        try:
            if hasattr(date_posted, "strftime"):
                date_str = date_posted.strftime("%Y-%m-%d")
            else:
                s = safe_str(date_posted)
                date_str = s[:10] if s else ""
        except Exception:
            pass
    # An undated listing cannot satisfy the freshness guarantee. Do not invent a
    # publication date, because that would make an old listing look current.
    if not date_str:
        return None

    try:
        posted_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return None

    days_old = (datetime.now(timezone.utc).date() - posted_date).days
    if days_old < -1:
        return None

    # Salary
    salary_min = safe_num(raw.get("min_amount"))
    salary_max = safe_num(raw.get("max_amount"))
    salary_currency = safe_str(raw.get("currency")) or None
    salary_str = None
    if salary_currency and salary_min and salary_max:
        salary_str = f"{salary_currency} {int(salary_min):,} - {int(salary_max):,}"
    elif salary_currency and salary_min:
        salary_str = f"ab {salary_currency} {int(salary_min):,}"

    is_remote = safe_bool(raw.get("is_remote"))

    # Stable ID from job URL so dedup works across runs
    url_hash = hashlib.md5(job_url.encode()).hexdigest()[:12]
    stable_id = f"scraped-{TRADE}-{url_hash}"

    return {
        "trade": TRADE,
        "id": stable_id,
        "title": title,
        "company": company,
        "location": location_str,
        "type": job_type_display,
        "workload": workload,
        "description": short_desc,
        "fullDescription": description,
        "responsibilities": sections["responsibilities"],
        "requirements": sections["requirements"],
        "benefits": sections["benefits"],
        "datePosted": date_str,
        "isNew": days_old <= 3,
        "isUrgent": False,
        "salary": salary_str,
        "jobUrl": job_url,
        "source": safe_str(raw.get("site")) or "unknown",
        "isRemote": is_remote,
        "companyUrl": safe_str(raw.get("company_url")),
    }


def save_results(all_raw: list[dict], output_file: str, label: str = ""):
    """Normalize and write one isolated scrape chunk to disk."""
    normalized = []
    filtered_out = 0
    for i, raw in enumerate(all_raw):
        job = normalize_job(raw, i)
        if not job:
            continue

        if not is_relevant_job(job):
            filtered_out += 1
            continue

        normalized.append(job)

    normalized.sort(key=lambda j: j["datePosted"], reverse=True)

    output_path = os.path.abspath(output_file)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    scraped_at = datetime.now(timezone.utc).isoformat()
    output = {
        "scrapedAt": scraped_at,
        "totalJobs": len(normalized),
        "jobs": normalized,
    }

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    if label:
        print(f"    💾 Saved {len(normalized)} jobs ({filtered_out} filtered out) {label}")


def print_quality_summary(all_raw: list[dict]):
    """Print data quality stats."""
    normalized = []
    for i, raw in enumerate(all_raw):
        job = normalize_job(raw, i)
        if job:
            normalized.append(job)

    has_desc = sum(1 for j in normalized if len(j["fullDescription"]) > 50)
    has_location = sum(1 for j in normalized if j["location"] != "Schweiz")
    has_resp = sum(1 for j in normalized if j["responsibilities"])
    has_req = sum(1 for j in normalized if j["requirements"])
    has_ben = sum(1 for j in normalized if j["benefits"])
    has_salary = sum(1 for j in normalized if j["salary"])

    print(f"\n=== Data Quality ===")
    print(f"  With description:     {has_desc}/{len(normalized)}")
    print(f"  With city/canton:     {has_location}/{len(normalized)}")
    print(f"  With responsibilities: {has_resp}/{len(normalized)}")
    print(f"  With requirements:    {has_req}/{len(normalized)}")
    print(f"  With benefits:        {has_ben}/{len(normalized)}")
    print(f"  With salary:          {has_salary}/{len(normalized)}")


def main():
    parser = argparse.ArgumentParser(description="Scrape Swiss Zimmermann jobs")
    parser.add_argument("--query", type=str, help="Single search query")
    parser.add_argument("--location", type=str, help="Single location")
    parser.add_argument("--results", type=int, default=50, help="Results per query/location combo")
    parser.add_argument("--quick", action="store_true", help="Quick mode: single query only")
    parser.add_argument("--chunk", type=int, default=0, help="Chunk index (0-based) for splitting search terms")
    parser.add_argument("--total-chunks", type=int, default=1, help="Total number of chunks to split search terms into")
    parser.add_argument("--output", default=OUTPUT_FILE, help="JSON output path for this isolated chunk")
    parser.add_argument(
        "--max-age-days",
        type=int,
        default=DEFAULT_MAX_AGE_DAYS,
        help="Only request listings published within this many days",
    )
    parser.add_argument(
        "--combo-timeout-seconds",
        type=int,
        default=DEFAULT_COMBO_TIMEOUT_SECONDS,
        help="Terminate one hung query/location scrape after this many seconds",
    )
    args = parser.parse_args()

    if args.total_chunks < 1 or args.chunk < 0 or args.chunk >= args.total_chunks:
        parser.error("chunk must be in the range 0..total-chunks-1")
    if args.max_age_days < 1 or args.max_age_days > 90:
        parser.error("max-age-days must be in the range 1..90")
    if args.combo_timeout_seconds < 30 or args.combo_timeout_seconds > 600:
        parser.error("combo-timeout-seconds must be in the range 30..600")

    all_raw: list[dict] = []
    seen_urls: set[str] = set()
    combo_count = 0

    if args.query:
        queries = [args.query]
    else:
        queries = DEFAULT_SEARCH_TERMS

    if args.location:
        locations = [args.location]
    else:
        locations = DEFAULT_LOCATIONS

    if args.quick:
        queries = queries[:1]
        locations = locations[:1]

    # Split search terms into chunks for parallel CI runs
    if args.total_chunks > 1 and not args.query:
        chunk_size = math.ceil(len(queries) / args.total_chunks)
        start = args.chunk * chunk_size
        end = min(start + chunk_size, len(queries))
        queries = queries[start:end]
        print(f"Chunk {args.chunk + 1}/{args.total_chunks}: processing search terms {start+1}-{end} ({len(queries)} terms)\n")

    total_combos = len(queries) * len(locations)
    print(f"Starting scrape: {len(queries)} queries × {len(locations)} locations = {total_combos} combos\n")

    for q in queries:
        for loc in locations:
            combo_count += 1
            results = scrape_swiss_jobs(
                q,
                loc,
                args.results,
                args.max_age_days,
                args.combo_timeout_seconds,
            )
            new_count = 0
            for r in results:
                url = safe_str(r.get("job_url"))
                if url and url not in seen_urls:
                    seen_urls.add(url)
                    all_raw.append(r)
                    new_count += 1
            dupe_count = len(results) - new_count
            print(f"    Accepted {new_count} new records.")
            if dupe_count > 0:
                print(f"    ({dupe_count} duplicates skipped)")
            print(f"    → [{combo_count}/{total_combos}] {len(all_raw)} unique jobs\n")

            # Save after every query/location combo so progress is never lost
            save_results(all_raw, args.output, f"(combo {combo_count}/{total_combos})")

    print(f"\nDone! Total unique raw jobs: {len(all_raw)}")
    save_results(all_raw, args.output, "(final)")
    print_quality_summary(all_raw)


if __name__ == "__main__":
    main()

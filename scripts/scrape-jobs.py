"""
Scrape Swiss electrical jobs using python-jobspy and output JSON.
Usage: python scrape-jobs.py [--query "search term"] [--location "city"] [--results 50]
Output is written to ../src/data/scraped-jobs.json
"""

import json
import sys
import os
import re
import math
import hashlib
import argparse
from datetime import datetime

from jobspy import scrape_jobs

try:
    from supabase import create_client as create_supabase_client
    HAS_SUPABASE = True
except ImportError:
    HAS_SUPABASE = False


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

# Title must contain at least one of these (case-insensitive) to be kept
RELEVANT_TITLE_KEYWORDS = [
    # Core electrical trades
    "elektr", "electric", "èlectr", "elettric",
    "installat", "monteur", "montage",
    # Specializations
    "automat", "telemat", "telekom",
    "starkstrom", "schwachstrom", "niederspannung", "hochspannung", "mittelspannung",
    "schaltanlag", "steuerung", "sps ", "plc ",
    # Energy / power
    "energie", "energy", "strom", "power supply",
    "solar", "photovoltaik", "blitzschutz",
    # Building services
    "gebäudetechnik", "gebaudetechnik", "haustechnik",
    "heizung", "lüftung", "klima", "hvac", "sanitär", "kälte",
    "hlk", "hkls",
    # Roles
    "servicetechni", "wartung", "instandhalt",
    "bauleiter", "polier",
    "kontrolleur", "prüf", "mess",
    "netz", "kabel", "trafo", "transform",
    "kundendiensttechni", "field service",
    "techniker", "fachmann", "fachfrau", "fachperson",
    "projektleiter",
    # Broader but still relevant
    "elektronik", "mechatronik",
    "brandschutz", "brandmelde", "sicherheitstechnik",
    "licht", "beleuchtung",
    "werkstatt", "betriebselektri",
    "anlagenbau", "anlagenmech",
    "schlosser", "spengler",
    "emr ", "emr-",
]

# Titles containing any of these are always rejected
REJECT_TITLE_KEYWORDS = [
    "software", "developer", "frontend", "backend", "fullstack", "full-stack",
    "devops", "data scientist", "data engineer", "machine learning",
    "research scientist", "research engineer", "research associate", "research intern",
    "ux ", "ui ", "product manager", "product owner", "scrum",
    "marketing", "sales", "vertrieb", "verkauf",
    "buchhalt", "finanz", "accounting", "controller",
    "jurist", "rechts", "legal",
    "koch", "küche", "gastro", "pflege", "arzt", "ärzt",
    "lehrer", "dozent", "professor", "schulsozialarbeit",
    "nvidia", "intern -", "internship", "new grad",
    "chip design", "asic", "fpga",
    "automobilverkäufer", "automobilmechatroniker",
    "cloud ", "kubernetes", "azure", "aws ",
    "abacus", "sap ", "erp ",
    "marktmitarbeiter", "non food",
    "computational", "validation engineer",
    "application manager", "reliability engineer",
]

# French / Italian title markers → reject (site is German-language)
NON_GERMAN_MARKERS = [
    "ingénieur", "technicien", "alternance", "responsable", "chargé",
    "électricien", "confirmé", "h/f", " cdi ", " cdd ",
    "elettricista", "disegnatore", "praticante", "tecnico ",
]

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
    """Return True if the job belongs on a Swiss electrical jobs site."""
    title = job.get("title", "").lower()
    location = job.get("location", "").lower()

    # 1) Must be in Switzerland
    if not is_swiss_location(location):
        return False

    # 2) Reject non-German language titles
    if any(marker in title for marker in NON_GERMAN_MARKERS):
        return False

    # 3) Reject clearly irrelevant titles
    if any(kw in title for kw in REJECT_TITLE_KEYWORDS):
        return False

    # 4) Must have at least one relevant keyword in title
    if any(kw in title for kw in RELEVANT_TITLE_KEYWORDS):
        return True

    # 5) If title doesn't match, reject
    return False


OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "src", "data")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "scraped-jobs.json")

DEFAULT_SEARCH_TERMS = [
    "Elektroinstallateur",
    "Elektriker",
    "Montage-Elektriker",
    "Elektro",
    "Automatiker",
    "Elektroplaner",
    "Elektromonteur",
    "Servicetechniker Elektro",
    "Elektrotechniker",
    "Netzelektriker",
    "Elektro Projektleiter",
    "Telematiker",
    "Elektrokontrolleur",
    "Gebäudetechnik Elektro",
    "Starkstrom",
]

DEFAULT_LOCATIONS = [
    "Zürich, Schweiz",
    "Bern, Schweiz",
    "Basel, Schweiz",
    "Luzern, Schweiz",
    "St. Gallen, Schweiz",
    "Winterthur, Schweiz",
    "Aarau, Schweiz",
    "Solothurn, Schweiz",
    "Thun, Schweiz",
    "Zug, Schweiz",
    "Chur, Schweiz",
    "Schaffhausen, Schweiz",
    "Frauenfeld, Schweiz",
    "Olten, Schweiz",
    "Baden, Schweiz",
    "Biel, Schweiz",
    "Lausanne, Schweiz",
    "Genf, Schweiz",
    "Lugano, Schweiz",
    "Fribourg, Schweiz",
    "Sion, Schweiz",
    "Neuchâtel, Schweiz",
    "Rapperswil, Schweiz",
    "Wil, Schweiz",
    "Buchs, Schweiz",
    "Langenthal, Schweiz",
    "Burgdorf, Schweiz",
    "Interlaken, Schweiz",
    "Spiez, Schweiz",
    "Lyss, Schweiz",
    "Köniz, Schweiz",
    "Emmen, Schweiz",
    "Kriens, Schweiz",
    "Horw, Schweiz",
    "Wädenswil, Schweiz",
    "Uster, Schweiz",
    "Dübendorf, Schweiz",
    "Dietikon, Schweiz",
    "Wetzikon, Schweiz",
    "Muttenz, Schweiz",
    "Liestal, Schweiz",
    "Rheinfelden, Schweiz",
    "Brugg, Schweiz",
    "Wohlen, Schweiz",
    "Lenzburg, Schweiz",
    "Kreuzlingen, Schweiz",
    "Arbon, Schweiz",
    "Gossau, Schweiz",
    "Herisau, Schweiz",
    "Davos, Schweiz",
]


def scrape_swiss_jobs(query: str, location: str, results_wanted: int = 50) -> list[dict]:
    """Scrape jobs from Indeed for a given query + location."""
    print(f"  Scraping: '{query}' in '{location}' (max {results_wanted})...")

    try:
        jobs_df = scrape_jobs(
            site_name=["indeed", "google", "linkedin"],
            search_term=query,
            location=location,
            results_wanted=results_wanted,
            hours_old=720,  # last 30 days
            country_indeed="Switzerland",
            verbose=0,
        )

        if jobs_df is None or jobs_df.empty:
            print(f"    No results found.")
            return []

        print(f"    Found {len(jobs_df)} jobs.")
        return jobs_df.to_dict(orient="records")

    except Exception as e:
        print(f"    Error: {e}")
        return []


def normalize_job(raw: dict, idx: int) -> dict | None:
    """Convert a raw jobspy record to our app's Job format."""
    title = safe_str(raw.get("title"))
    company = safe_str(raw.get("company"))
    job_url = safe_str(raw.get("job_url"))

    if not title or not job_url:
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
    job_type_display = "Vollzeit"
    for t in job_type.lower().split(","):
        t = t.strip()
        if t in type_map:
            job_type_display = type_map[t]
            break

    # Try to extract workload from description
    workload = extract_workload(description)
    if not workload:
        workload = "100%" if job_type_display == "Vollzeit" else "60-100%"

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
    if not date_str:
        date_str = datetime.now().strftime("%Y-%m-%d")

    # Check if recent (within 3 days)
    try:
        days_old = (datetime.now() - datetime.strptime(date_str, "%Y-%m-%d")).days
    except Exception:
        days_old = 99

    # Salary
    salary_min = safe_num(raw.get("min_amount"))
    salary_max = safe_num(raw.get("max_amount"))
    salary_currency = safe_str(raw.get("currency")) or "CHF"
    salary_str = ""
    if salary_min and salary_max:
        salary_str = f"{salary_currency} {int(salary_min):,} - {int(salary_max):,}"
    elif salary_min:
        salary_str = f"ab {salary_currency} {int(salary_min):,}"

    # is_remote can also be NaN
    is_remote_val = raw.get("is_remote")
    is_remote = bool(is_remote_val) if is_remote_val is not None and not (isinstance(is_remote_val, float) and math.isnan(is_remote_val)) else False

    # Stable ID from job URL so dedup works across runs
    url_hash = hashlib.md5(job_url.encode()).hexdigest()[:12]
    stable_id = f"scraped-{url_hash}"

    return {
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


def sync_to_supabase(normalized: list[dict], scraped_at: str):
    """Upsert all normalized jobs into Supabase."""
    url = os.environ.get("SUPABASE_URL", "") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

    if not HAS_SUPABASE:
        print("    ⚠ supabase-py not installed, skipping DB sync")
        return
    if not url or not key:
        print("    ⚠ SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set, skipping DB sync")
        return

    try:
        sb = create_supabase_client(url, key)
    except Exception as e:
        print(f"    ⚠ Supabase client error: {e}")
        return

    def to_db_row(job: dict) -> dict:
        return {
            "id": job["id"],
            "title": job.get("title", ""),
            "company": job.get("company", ""),
            "location": job.get("location", ""),
            "type": job.get("type", "Vollzeit"),
            "workload": job.get("workload", "100%"),
            "description": job.get("description", ""),
            "full_description": job.get("fullDescription", ""),
            "responsibilities": job.get("responsibilities", []),
            "requirements": job.get("requirements", []),
            "benefits": job.get("benefits", []),
            "date_posted": job.get("datePosted") or None,
            "is_new": bool(job.get("isNew")),
            "is_urgent": bool(job.get("isUrgent")),
            "salary": job.get("salary", ""),
            "job_url": job.get("jobUrl", ""),
            "source": job.get("source", "linkedin"),
            "is_remote": bool(job.get("isRemote")),
            "company_url": job.get("companyUrl", ""),
        }

    BATCH_SIZE = 500
    inserted = 0

    for i in range(0, len(normalized), BATCH_SIZE):
        batch = [to_db_row(j) for j in normalized[i : i + BATCH_SIZE]]
        try:
            sb.table("jobs").upsert(batch, on_conflict="id").execute()
            inserted += len(batch)
        except Exception as e:
            print(f"    ⚠ Supabase upsert error (batch {i}): {e}")
            return

    # Update scrape metadata
    try:
        sb.table("scrape_metadata").update({
            "scraped_at": scraped_at,
            "total_jobs": len(normalized),
        }).eq("id", 1).execute()
    except Exception as e:
        print(f"    ⚠ Supabase metadata update error: {e}")

    print(f"    ☁ Synced {inserted} jobs to Supabase")


def save_results(all_raw: list[dict], label: str = ""):
    """Normalize all raw jobs, filter for relevance, and write to output file + Supabase."""
    normalized = []
    filtered_out = 0
    for i, raw in enumerate(all_raw):
        if raw.get("_already_normalized"):
            job = dict(raw["_job"])
        else:
            job = normalize_job(raw, i)
            if not job:
                continue

        if not is_relevant_job(job):
            filtered_out += 1
            continue

        normalized.append(job)

    normalized.sort(key=lambda j: j["datePosted"], reverse=True)

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    scraped_at = datetime.now().isoformat()
    output = {
        "scrapedAt": scraped_at,
        "totalJobs": len(normalized),
        "jobs": normalized,
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    if label:
        print(f"    💾 Saved {len(normalized)} jobs ({filtered_out} filtered out) {label}")

    # Sync to Supabase
    sync_to_supabase(normalized, scraped_at)


def print_quality_summary(all_raw: list[dict]):
    """Print data quality stats."""
    normalized = []
    for i, raw in enumerate(all_raw):
        if raw.get("_already_normalized"):
            normalized.append(raw["_job"])
        else:
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


def load_existing_jobs() -> tuple[list[dict], set[str]]:
    """Load previously scraped jobs from file so we accumulate across runs."""
    all_raw: list[dict] = []
    seen_urls: set[str] = set()

    if os.path.exists(OUTPUT_FILE):
        try:
            with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            existing = data.get("jobs", [])
            for job in existing:
                url = job.get("jobUrl", "")
                if url and url not in seen_urls:
                    seen_urls.add(url)
                    # Regenerate stable ID from URL
                    url_hash = hashlib.md5(url.encode()).hexdigest()[:12]
                    job["id"] = f"scraped-{url_hash}"
                    # Store as a pseudo-raw record so save_results can re-normalize
                    all_raw.append({
                        "_already_normalized": True,
                        "_job": job,
                        "job_url": url,
                    })
            print(f"Loaded {len(all_raw)} existing jobs from previous run.\n")
        except Exception as e:
            print(f"Warning: could not load existing jobs: {e}\n")

    return all_raw, seen_urls


def main():
    parser = argparse.ArgumentParser(description="Scrape Swiss electrical jobs")
    parser.add_argument("--query", type=str, help="Single search query")
    parser.add_argument("--location", type=str, help="Single location")
    parser.add_argument("--results", type=int, default=100, help="Results per query/location combo")
    parser.add_argument("--quick", action="store_true", help="Quick mode: single query only")
    args = parser.parse_args()

    all_raw, seen_urls = load_existing_jobs()
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

    total_combos = len(queries) * len(locations)
    print(f"Starting scrape: {len(queries)} queries × {len(locations)} locations = {total_combos} combos\n")

    for q in queries:
        for loc in locations:
            combo_count += 1
            results = scrape_swiss_jobs(q, loc, args.results)
            new_count = 0
            for r in results:
                url = r.get("job_url", "")
                if url and url not in seen_urls:
                    seen_urls.add(url)
                    all_raw.append(r)
                    new_count += 1
                    title = safe_str(r.get("title"))
                    company = safe_str(r.get("company"))
                    location = parse_location(safe_str(r.get("location")))
                    print(f"    ✓ {title} — {company} ({location})")
            dupe_count = len(results) - new_count
            if dupe_count > 0:
                print(f"    ({dupe_count} duplicates skipped)")
            print(f"    → [{combo_count}/{total_combos}] {len(all_raw)} unique jobs\n")

            # Save after every query/location combo so progress is never lost
            save_results(all_raw, f"(combo {combo_count}/{total_combos})")

    print(f"\nDone! Total unique raw jobs: {len(all_raw)}")
    save_results(all_raw, "(final)")
    print_quality_summary(all_raw)


if __name__ == "__main__":
    main()

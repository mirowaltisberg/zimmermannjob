"""Shared deny-first Zimmermann classifier backed by src/config/job-safety.json."""

from __future__ import annotations

import hashlib
import json
import re
import unicodedata
from pathlib import Path
from typing import Any

CONFIG_PATH = Path(__file__).resolve().parents[1] / "src" / "config" / "job-safety.json"
CONFIG = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
ID_PATTERN = re.compile(CONFIG["idPattern"])
STANDALONE_EFZ = re.compile(r"(?:^|[^\w])efz(?:$|[^\w])", re.IGNORECASE)


def normalize(value: Any) -> str:
    if not isinstance(value, str):
        return ""
    return re.sub(r"\s+", " ", unicodedata.normalize("NFKC", value).casefold()).strip()


def classify_zimmermann_title(title_value: Any) -> dict[str, Any]:
    title = normalize(title_value)
    if not title:
        return {"disposition": "REJECT", "reason": "missing-title"}

    if any(pattern in title for pattern in CONFIG["hardNegativeTitlePatterns"]):
        return {"disposition": "REJECT", "reason": "hard-negative-title"}

    specific = next(
        (rule for rule in CONFIG["highSpecificityTitles"] if re.search(rule["pattern"], title, re.IGNORECASE)),
        None,
    )
    has_trade_context = any(pattern in title for pattern in CONFIG["tradeContextPatterns"])
    broad = None
    if has_trade_context:
        broad = next(
            (
                rule
                for rule in CONFIG["broadTitlesRequiringTradeContext"]
                if re.search(rule["pattern"], title, re.IGNORECASE)
            ),
            None,
        )
    match = specific or broad

    # Description/body text is never inspected here by design.
    if not match:
        return {"disposition": "REJECT", "reason": "no-zimmermann-title-signal"}

    if any(pattern in title for pattern in CONFIG["otherTradeTitlePatterns"]):
        return {"disposition": "REVIEW", "reason": "mixed-trade-title"}

    efz_suffix = " EFZ" if STANDALONE_EFZ.search(title) else ""
    return {
        "disposition": "ACCEPT",
        "reason": "specific-zimmermann-title" if specific else "broad-role-with-zimmermann-context",
        "publicTitle": f"{match['publicTitle']}{efz_suffix}",
        "profile": match["profile"],
    }


def validate_raw_job_identity(job: Any) -> str | None:
    if not isinstance(job, dict):
        return "invalid-job"
    if job.get("trade") != CONFIG["trade"]:
        return "wrong-trade"
    job_id = job.get("id")
    job_url = job.get("jobUrl")
    if not isinstance(job_id, str) or not ID_PATTERN.fullmatch(job_id):
        return "invalid-id"
    if not isinstance(job_url, str) or not re.match(r"^https?://", job_url, re.IGNORECASE):
        return "invalid-job-url"
    digest = hashlib.md5(job_url.encode("utf-8")).hexdigest()[:12]
    if job_id != f"scraped-{CONFIG['trade']}-{digest}":
        return "id-url-mismatch"
    source = job.get("source")
    if source is not None and (
        not isinstance(source, str) or source.casefold() not in CONFIG["allowedSources"]
    ):
        return "invalid-source"
    return None


def profile_for(profile: str) -> dict[str, list[str]]:
    return CONFIG["profiles"][profile]

"""Verify Python classifier parity against the committed safety fixtures."""

from __future__ import annotations

import json
from pathlib import Path

from job_safety import classify_zimmermann_title, validate_raw_job_identity

FIXTURE_DIR = Path(__file__).resolve().parent / "fixtures"
FIXTURES = [
    FIXTURE_DIR / "job-safety-positive.json",
    FIXTURE_DIR / "job-safety-negative.json",
]


def main() -> int:
    checked = 0
    seen_ids: set[str] = set()

    for fixture_path in FIXTURES:
        payload = json.loads(fixture_path.read_text(encoding="utf-8"))
        jobs = payload.get("jobs") if isinstance(payload, dict) else None
        if not isinstance(jobs, list) or not jobs:
            raise RuntimeError(f"{fixture_path.name} has no jobs")

        for job in jobs:
            identity_error = validate_raw_job_identity(job)
            expected_identity_error = job.get("expectedIdentityError")
            if identity_error != expected_identity_error:
                raise RuntimeError(
                    f"Fixture {checked + 1} identity was {identity_error or 'valid'}, "
                    f"expected {expected_identity_error or 'valid'}"
                )

            job_id = job["id"]
            if job_id in seen_ids:
                raise RuntimeError(f"Duplicate fixture ID at position {checked + 1}")
            seen_ids.add(job_id)

            result = classify_zimmermann_title(job.get("title"))
            if result["disposition"] != job.get("expectedDisposition"):
                raise RuntimeError(
                    f"Fixture {checked + 1} classified {result['disposition']}, "
                    f"expected {job.get('expectedDisposition')}"
                )
            expected_title = job.get("expectedPublicTitle")
            if expected_title and result.get("publicTitle") != expected_title:
                raise RuntimeError(f"Fixture {checked + 1} has the wrong controlled public title")
            checked += 1

    print(f"Python trade-safety parity passed for {checked} fixtures.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

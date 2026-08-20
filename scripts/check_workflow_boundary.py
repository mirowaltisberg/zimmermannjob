"""Fail if the scheduled scraper can publish without explicit approval."""

from pathlib import Path


workflow = Path(".github/workflows/scrape.yml").read_text(encoding="utf-8")
approval = (
    "    if: ${{ github.event_name == 'workflow_dispatch' && "
    "inputs.confirm_publish == 'PUBLISH' && "
    "vars.ZIMMERMANN_PUBLISHING_APPROVED == 'true' }}"
)

assert workflow.count("      max-parallel: 2") == 1, "scrape concurrency must be capped at two"
assert "      max-parallel: 5" not in workflow, "unsafe five-worker concurrency remains"
assert workflow.count(approval) == 1, "publish approval guard is missing or duplicated"
assert workflow.count("      confirm_publish:") == 1, "manual publish input is missing"
assert "        required: false" in workflow, "manual publish input must default closed"
assert '        default: ""' in workflow, "manual publish input default must be empty"

scrape, separator, publish = workflow.partition("  publish:\n")
assert separator, "publish job is missing"
job_preamble, steps_separator, _ = publish.partition("    steps:\n")
assert steps_separator, "publish steps are missing"
assert approval in job_preamble, "approval guard is not at publish-job scope"
assert "github.event_name == 'workflow_dispatch'" in job_preamble, (
    "scheduled events must be unable to enter the publish job"
)
assert "inputs.confirm_publish == 'PUBLISH'" in job_preamble, (
    "publish job requires the exact per-run confirmation"
)
assert "SUPABASE_SERVICE_ROLE_KEY" not in scrape, "scrape job can access the service-role key"
assert "secrets." not in scrape, "scrape job must remain entirely secret-free"
assert publish.count("SUPABASE_SERVICE_ROLE_KEY") == 2, "publisher service-role mapping changed"

print(
    "Workflow boundary check passed: scheduled publishing is impossible, manual publishing "
    "requires two-factor approval, and concurrency is capped."
)

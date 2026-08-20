import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  assertNoForbiddenPublicFields,
  assertPublicJobListing,
  serializePublicJob,
} from "./public-job-boundary";
import { buildPublicJobCopy } from "./job-public";
import type { JobListing } from "./job-types";

const safeJob: JobListing = {
  id: "scraped-zimmermann-0123456789ab",
  title: "Zimmermann EFZ",
  location: "Zürich",
  type: "Festanstellung",
  workload: "80-100%",
  description: "Kontrollierter öffentlicher Beschreibungstext.",
  responsibilities: ["Installationen fachgerecht ausführen"],
  requirements: ["Ausbildung im Zimmermannbereich"],
  benefits: [],
  datePosted: "2026-08-19",
  isNew: true,
  isUrgent: false,
};

function containsExactEmployer(value: string, company: string): boolean {
  const escaped = company.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(
    `(?:^|[^\\p{L}\\p{N}])${escaped}(?:$|[^\\p{L}\\p{N}])`,
    "iu",
  ).test(value);
}

test("serializes only the explicit public JobListing allowlist", () => {
  const serialized = serializePublicJob(safeJob);
  assert.deepEqual(serialized, safeJob);
  assertPublicJobListing(serialized);
  assert.equal(Object.hasOwn(serialized, "source"), false);
});

test("rejects every forbidden exposure fixture, including nested JSON-LD", () => {
  const fixtureUrl = new URL("../../scripts/fixtures/public-job-exposure.json", import.meta.url);
  const fixture = JSON.parse(readFileSync(fixtureUrl, "utf8")) as {
    cases: Array<{ name: string; payload: unknown }>;
  };

  assert.ok(fixture.cases.length >= 10);
  for (const entry of fixture.cases) {
    assert.throws(
      () => assertNoForbiddenPublicFields(entry.payload, entry.name),
      /forbidden field/,
      entry.name
    );
  }
});

test("rejects unreviewed fields even when they are not known secret names", () => {
  assert.throws(
    () => assertPublicJobListing({ ...safeJob, experimentalRank: 7 } as JobListing),
    /unreviewed field/
  );
});

test("replaces outward fields that contain an exact Unicode-delimited employer", () => {
  const fixtureUrl = new URL(
    "../../scripts/fixtures/public-copy-sanitization.json",
    import.meta.url,
  );
  const fixture = JSON.parse(readFileSync(fixtureUrl, "utf8")) as {
    cases: Array<{
      company: string;
      location: string;
      type: string;
      workload: string;
      expected: { location: string; type: string; workload: string };
    }>;
  };

  for (const entry of fixture.cases) {
    const publicCopy = buildPublicJobCopy({
      title: "Zimmermann EFZ",
      company: entry.company,
      location: entry.location,
      type: entry.type,
      workload: entry.workload,
    });
    assert.deepEqual(
      {
        location: publicCopy.location,
        type: publicCopy.type,
        workload: publicCopy.workload,
      },
      entry.expected,
    );
    assert.equal(containsExactEmployer(JSON.stringify(publicCopy), entry.company), false);
  }
});

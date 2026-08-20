import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import {
  mapVerifiedDbRow,
  PUBLICATION_SELECT_FIELDS,
  type DbRow,
} from "./scraped-jobs";

const jobUrl = "https://jobs.example.ch/verified-db-row";
const validId = `scraped-zimmermann-${createHash("md5").update(jobUrl).digest("hex").slice(0, 12)}`;
const todayMs = Date.parse(`${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`);

function dateWithOffset(offsetDays: number): string {
  return new Date(todayMs + offsetDays * 86_400_000).toISOString().slice(0, 10);
}

const validRow: DbRow = {
  id: validId,
  title: "Zimmermann EFZ",
  company: "Internal employer",
  location: "Zürich",
  type: "Festanstellung",
  workload: "100%",
  description: "Raw description",
  date_posted: dateWithOffset(0),
  is_new: true,
  is_urgent: false,
  salary: "",
  job_url: jobUrl,
  source: "indeed",
  is_remote: false,
};

test("Supabase publication select includes the raw identity fields needed for verification", () => {
  assert.ok(PUBLICATION_SELECT_FIELDS.includes("job_url"));
  assert.ok(PUBLICATION_SELECT_FIELDS.includes("source"));
  assert.equal(PUBLICATION_SELECT_FIELDS.includes("company_url"), false);
});

test("mapped database rows pass only when their raw identity is valid", () => {
  assert.deepEqual(mapVerifiedDbRow(validRow)?.id, validId);
  assert.equal(mapVerifiedDbRow({ ...validRow, source: "unapproved" }), null);
  assert.equal(mapVerifiedDbRow({ ...validRow, job_url: "" }), null);
  assert.equal(mapVerifiedDbRow({ ...validRow, id: "scraped-zimmermann-000000000000" }), null);
});

test("mapped database rows enforce the public freshness window", () => {
  assert.deepEqual(mapVerifiedDbRow({ ...validRow, date_posted: dateWithOffset(-35) })?.id, validId);
  assert.deepEqual(mapVerifiedDbRow({ ...validRow, date_posted: dateWithOffset(1) })?.id, validId);
  assert.equal(mapVerifiedDbRow({ ...validRow, date_posted: dateWithOffset(-36) }), null);
  assert.equal(mapVerifiedDbRow({ ...validRow, date_posted: dateWithOffset(2) }), null);
  assert.equal(mapVerifiedDbRow({ ...validRow, date_posted: "2026-02-30" }), null);
  assert.equal(mapVerifiedDbRow({ ...validRow, date_posted: null }), null);
});

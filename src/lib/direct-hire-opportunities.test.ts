import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { assertDirectHireOpportunity, buildDirectHireOpportunities, DIRECT_HIRE_FEED_TARGET } from "./direct-hire-opportunities";
import { assertPublicJobListing } from "./public-job-boundary";
import type { DirectHireOpportunity, JobListing } from "./job-types";

function buildForRows(visibleRealRows: number): DirectHireOpportunity[] {
  return buildDirectHireOpportunities({
    visibleRealRows,
    offset: 0,
    preferences: { q: "CNC Abbund Zimmermann", loc: "8001 Zürich", type: "Festanstellung", workload: "80-100%", remote: "false" },
  });
}

test("fills only the first sparse real-result page exactly to twelve", () => {
  for (const [realRows, expected] of [[0, 12], [1, 11], [11, 1], [12, 0], [1_000, 0]] as const) {
    const opportunities = buildForRows(realRows);
    assert.equal(opportunities.length, expected, `${realRows} real rows`);
    assert.equal(Math.min(realRows, DIRECT_HIRE_FEED_TARGET) + opportunities.length, 12);
  }
  assert.deepEqual(buildDirectHireOpportunities({ visibleRealRows: 1, offset: 12, preferences: { q: "Zimmermann", loc: "Bern" } }), []);
});

test("uses deterministic controlled roles and validated preferences", () => {
  const first = buildForRows(0);
  assert.deepEqual(first, buildForRows(0));
  assert.equal(new Set(first.map((entry) => entry.id)).size, 12);
  assert.equal(first[0]?.role, "CNC-Maschinist/in Abbund");
  assert.equal(first[0]?.location, "8001 Zürich");
  assert.ok(first[0]?.preferenceSummary.includes("80–100% Pensum bevorzugt"));
  first.forEach(assertDirectHireOpportunity);
});

test("never echoes strange query, location, or filter input", () => {
  const strange = "<script>alert('arbeitgeber')</script> 😀 مرحبا ".repeat(20);
  const opportunities = buildDirectHireOpportunities({ visibleRealRows: 0, offset: 0, preferences: { q: strange, loc: strange, type: strange, workload: "999-1000%", remote: "any" } });
  const serialized = JSON.stringify(opportunities);
  assert.equal(opportunities.length, 12);
  assert.ok(opportunities.every((entry) => entry.location === "Ganze Schweiz"));
  assert.doesNotMatch(serialized, /script|alert|😀|مرحبا|999|1000/u);
  assert.doesNotMatch(serialized, /JobPosting|datePosted|salary|sourceUrl|jobUrl|application|\/jobs\//i);
  assert.ok(opportunities.every((entry) => entry.contactHref.startsWith("/kontakt?")));
});

test("cannot cross the public JobListing DTO boundary", () => {
  const opportunity = buildForRows(11)[0];
  assert.ok(opportunity);
  assert.throws(() => assertPublicJobListing(opportunity as unknown as JobListing), /unreviewed field/);
});

test("SSR, API, client, schema, and sitemap keep opportunities separate", () => {
  const appPage = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
  const apiRoute = readFileSync(new URL("../app/api/jobs/route.ts", import.meta.url), "utf8");
  const client = readFileSync(new URL("../app/_components/homepage-search.tsx", import.meta.url), "utf8");
  const sitemap = readFileSync(new URL("../app/sitemap.ts", import.meta.url), "utf8");
  assert.match(appPage, /initialData\.jobs\.map/);
  assert.doesNotMatch(appPage, /initialData\.opportunities\.map/);
  assert.match(apiRoute, /jobs: result\.jobs\.map\(serializePublicJob\)/);
  assert.doesNotMatch(apiRoute, /jobs:\s*\[[\s\S]*opportunit/i);
  assert.match(client, /opportunities\.map\(\(opportunity\)/);
  assert.doesNotMatch(client, /href=\{`\/jobs\/\$\{opportunity/);
  assert.match(client, /searchAbortRef\.current\?\.abort\(\)/);
  assert.match(client, /requestId !== searchRequestRef\.current/);
  assert.match(client, /setOpportunities\(data\.opportunities \?\? \[\]\)/);
  assert.doesNotMatch(sitemap, /DirectHire|direct-hire|opportunit/i);
});

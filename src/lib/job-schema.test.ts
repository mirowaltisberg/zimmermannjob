import assert from "node:assert/strict";
import test from "node:test";
import { buildJobPostingSchema, parseSwissJobAddress } from "./job-schema";
import type { JobListing } from "./job-types";

const job: JobListing = {
  id: "scraped-schema-test",
  title: "Fachkraft EFZ",
  location: "Zürich, Zurich",
  type: "Festanstellung",
  workload: "Nicht angegeben",
  description: "Eine echte ausgeschriebene Position in Zürich.",
  responsibilities: ["Facharbeiten ausführen"],
  requirements: ["Abgeschlossene Berufslehre"],
  benefits: [],
  datePosted: "2026-08-19",
  isNew: true,
  isUrgent: false,
  isRemote: true,
};

test("builds the required truthful Google JobPosting fields", () => {
  const schema = buildJobPostingSchema(job, {
    siteName: "jobs.example.ch",
    siteUrl: "https://jobs.example.ch",
    directApply: true,
  });

  assert.equal(schema["@type"], "JobPosting");
  assert.equal(schema.hiringOrganization.name, "confidential");
  assert.equal(schema.jobLocation.address.addressCountry, "CH");
  assert.equal(schema.jobLocation.address.addressLocality, "Zürich");
  assert.equal(schema.jobLocation.address.addressRegion, "ZH");
  assert.equal(schema.directApply, true);
  assert.match(schema.description, /^<p>/);
  assert.doesNotMatch(JSON.stringify(schema), /jobLocationType|applicantLocationRequirements/);
  assert.doesNotMatch(JSON.stringify(schema), /baseSalary|estimatedSalary/);
  assert.equal(schema.employmentType, undefined);
});

test("uses exact postal and street data only when present in the source location", () => {
  assert.deepEqual(parseSwissJobAddress("Hauptstrasse 5, 3013 Bern, Bern"), {
    "@type": "PostalAddress",
    addressCountry: "CH",
    addressLocality: "Bern",
    addressRegion: "BE",
    postalCode: "3013",
    streetAddress: "Hauptstrasse 5",
  });

  assert.deepEqual(parseSwissJobAddress("Nidwalden, Switzerland"), {
    "@type": "PostalAddress",
    addressCountry: "CH",
    addressRegion: "NW",
  });
});

test("escapes visible job copy and rejects evergreen profiles", () => {
  const escaped = buildJobPostingSchema(
    { ...job, description: "Sicher <script>alert(1)</script>" },
    { siteName: "jobs.example.ch", siteUrl: "https://jobs.example.ch", directApply: false },
  );
  assert.doesNotMatch(escaped.description, /<script>/);

  assert.throws(
    () => buildJobPostingSchema(
      { ...job, id: "direct-hire-test" },
      { siteName: "jobs.example.ch", siteUrl: "https://jobs.example.ch", directApply: false },
    ),
    /must never become JobPosting/,
  );
});

import assert from "node:assert/strict";
import test from "node:test";

import {
  hasPdfMagic,
  isAcceptableFormAge,
  isValidEmail,
  isValidPdfFilename,
  isValidPhone,
  readBoundedInteger,
} from "./application-validation";

test("validates applicant contact fields", () => {
  assert.equal(isValidEmail("person@example.ch"), true);
  assert.equal(isValidEmail("person@example"), false);
  assert.equal(isValidPhone("+41 79 123 45 67"), true);
  assert.equal(isValidPhone("call-me"), false);
});

test("accepts only bounded, path-free PDF filenames", () => {
  assert.equal(isValidPdfFilename("Lebenslauf Müller.pdf"), true);
  assert.equal(isValidPdfFilename("../../cv.pdf"), false);
  assert.equal(isValidPdfFilename("cv.docx"), false);
});

test("requires both PDF header and terminal EOF marker", () => {
  const cleanPdf = new TextEncoder().encode("%PDF-1.7\nbody\n%%EOF\n");
  const headerOnly = new TextEncoder().encode("%PDF-1.7\nbody\n");
  assert.equal(hasPdfMagic(cleanPdf), true);
  assert.equal(hasPdfMagic(headerOnly), false);
});

test("enforces a bounded form age", () => {
  const now = 1_800_000_000_000;
  assert.equal(isAcceptableFormAge(String(now - 4_000), now), true);
  assert.equal(isAcceptableFormAge(String(now - 1_000), now), false);
  assert.equal(isAcceptableFormAge(String(now - 8_000_000), now), false);
});

test("parses bounded integer settings", () => {
  assert.equal(readBoundedInteger(undefined, 3, 1, 20), 3);
  assert.equal(readBoundedInteger("10", 3, 1, 20), 10);
  assert.equal(readBoundedInteger("100", 3, 1, 20), null);
  assert.equal(readBoundedInteger("1.5", 3, 1, 20), null);
});

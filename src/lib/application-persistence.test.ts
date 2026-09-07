import assert from "node:assert/strict";
import test from "node:test";
import { applicationIdentity, parseApplicationAnalytics, recordApplicationSaved } from "./application-persistence";
import { readSavedApplication } from "./application-client";

const submission = "a0f095b7-1625-4b90-871b-9a58d57d5c42";
const fields = ["scraped-test", "Synthetischer Test", "cro@example.invalid", "0790000000", "cv.pdf"];
const pdf = Buffer.from("%PDF-1.4\nsynthetic\n%%EOF");
test("lost-response retries have the same opaque identity, independent jobs and edited dossiers do not", () => {
 const id = applicationIdentity("secret", "gaertnerjob.ch", submission, fields, pdf);
 assert.equal(id, applicationIdentity("secret", "gaertnerjob.ch", submission, fields, pdf));
 assert.match(id, /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/);
 assert.notEqual(id, applicationIdentity("secret", "sanitaerjobs.ch", submission, fields, pdf));
 assert.notEqual(id, applicationIdentity("secret", "gaertnerjob.ch", submission, [...fields,"edit"], pdf));
 assert.notEqual(id, applicationIdentity("secret", "gaertnerjob.ch", submission, fields, Buffer.from("different")));
});
test("HTTP success without a valid storage acknowledgement never reports success", async () => {
 for (const body of ["truncated", "{}", '{"success":false}', '{"success":true,"conversionId":"bad"}']) {
  await assert.rejects(readSavedApplication(new Response(body, {status:200})), /nicht bestätigt/);
 }
 await assert.rejects(readSavedApplication(new Response('{"error":"Bitte erneut versuchen"}', {status:503})), /erneut/);
 assert.deepEqual(await readSavedApplication(new Response(JSON.stringify({success:true,conversionId:submission,synthetic:true}), {status:202})), {conversionId:submission,synthetic:true});
});
test("measurement context requires consent and contains no arbitrary supplied fields", () => {
 assert.equal(parseApplicationAnalytics(""),null);
 assert.equal(parseApplicationAnalytics(JSON.stringify({sessionId:submission,sequence:1})),null);
 assert.equal(parseApplicationAnalytics(JSON.stringify({sessionId:submission,sequence:-1,consentVersion:"analytics-v1",synthetic:false})),null);
 const context=parseApplicationAnalytics(JSON.stringify({sessionId:submission,sequence:7,consentVersion:"analytics-v1",synthetic:false,email:"private@example.invalid"}));
 assert.deepEqual(context,{sessionId:submission,sequence:7,consentVersion:"analytics-v1",synthetic:false});
});
test("measurement is optional and its failure does not undo a saved application", async () => {
 let calls=0;
 const admin={from(){calls++;throw new Error("unavailable");}} as unknown as Parameters<typeof recordApplicationSaved>[0];
 await recordApplicationSaved(admin,null,"gaertnerjob.ch","scraped-test",submission,false);
 assert.equal(calls,0);
 await recordApplicationSaved(admin,{sessionId:submission,sequence:1,consentVersion:"analytics-v1",synthetic:true},"gaertnerjob.ch","scraped-test",submission,true);
 assert.equal(calls,1);
});

test("an ambiguous insert never removes a CV already committed or whose outcome is unknown", async () => {
 const { resolveApplicationInsert } = await import("./application-persistence");
 for (const scenario of [
  { data: { id: submission, cv_path: "current.pdf" }, error: null, deletes: 0, saved: true, unknown: false },
  { data: { id: submission, cv_path: "previous.pdf" }, error: null, deletes: 1, saved: true, unknown: false },
  { data: null, error: null, deletes: 1, saved: false, unknown: false },
  { data: null, error: { message: "timeout" }, deletes: 0, saved: false, unknown: true },
 ]) {
  const deleted: string[][] = [];
  const query = { select(){return this;}, eq(){return this;}, async maybeSingle(){return scenario;} };
  const admin = { from(){return query;}, storage: { from(){return { async remove(paths: string[]){deleted.push(paths);return {error:null};} };} } } as unknown as Parameters<typeof resolveApplicationInsert>[0];
  const result = await resolveApplicationInsert(admin,"cvs","current.pdf",submission);
  assert.equal(deleted.length,scenario.deletes);
  assert.equal(result.saved,scenario.saved);
  assert.equal(result.unknown,scenario.unknown);
 }
});

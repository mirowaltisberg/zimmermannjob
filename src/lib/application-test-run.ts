import { createHmac, timingSafeEqual } from "node:crypto";

/** Test markers on production require a short-lived signature scoped to a site and run. */
export function verifyApplicationTestRun(site: string, runId: unknown, token: unknown, secret: string | undefined, now = Date.now()): boolean {
  if (!secret || typeof runId !== "string" || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(runId) || typeof token !== "string") return false;
  const match = /^(\d{10})\.([A-Za-z0-9_-]{43})$/.exec(token);
  if (!match) return false;
  const expires = Number(match[1]);
  if (expires * 1000 <= now || expires * 1000 > now + 60 * 60 * 1000) return false;
  const expected = createHmac("sha256", secret).update(JSON.stringify(["cro-test-v1", site.replace(/^www\./, ""), runId, expires])).digest();
  const actual = Buffer.from(match[2], "base64url");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

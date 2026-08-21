import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const route = readFileSync("src/app/api/analytics/route.ts", "utf8");
const client = readFileSync("src/components/privacy-analytics.tsx", "utf8");
const analytics = readFileSync("src/lib/analytics.ts", "utf8");
const migration = readFileSync(
  "supabase/migrations/20260821105443_richer_job_data_and_private_analytics.sql",
  "utf8",
);

assert.match(route, /createAdminClient/);
assert.match(route, /site_analytics_events/);
assert.match(route, /isSameOrigin/);
assert.match(route, /MAX_EVENTS_PER_WINDOW/);
assert.match(route, /EVENT_FIELDS/);
assert.doesNotMatch(route, /\b(name|email|phone|cv_content|search_query|user_agent|ip_address)\b/i);
assert.doesNotMatch(client, /googletagmanager|facebook\.com|@vercel\/analytics|input\s*event|keydown/i);
assert.doesNotMatch(
  analytics,
  /new Set\(\[[^\]]*"(?:query_text|search_term|email|phone|name)"/i,
);

assert.match(migration, /enable row level security/i);
assert.match(
  migration,
  /revoke all privileges on table public\.site_analytics_events from anon, authenticated/i,
);
assert.match(
  migration,
  /grant select, insert, delete on table public\.site_analytics_events to service_role/i,
);
assert.match(migration, /with \(security_invoker = true\)/i);
assert.match(migration, /public\.analytics_session_journeys/i);
assert.match(migration, /public\.analytics_daily_summary/i);
assert.match(
  migration,
  /revoke all privileges on table public\.analytics_daily_summary from anon, authenticated/i,
);
assert.match(migration, /retention_expires_at/i);

console.log("Private analytics boundary check passed.");

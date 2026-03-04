import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// SEO-DECISION: Lazy initialization prevents build-time crashes when env vars
// are not available (e.g. during static page generation on Vercel).

let _supabase: SupabaseClient | null = null;

function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
}

function getSupabaseKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
}

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    if (!_supabase) {
      const url = getSupabaseUrl();
      const key = getSupabaseKey();
      if (!url || !key) {
        // Return a stub that safely returns empty results during build
        const stub = createBuildStub();
        return Reflect.get(stub, prop, receiver);
      }
      _supabase = createClient(url, key);
    }
    return Reflect.get(_supabase, prop, receiver);
  },
});

/**
 * Creates a minimal stub that returns empty query results.
 * Used during static page generation when Supabase env vars are unavailable.
 */
function createBuildStub(): Record<string, unknown> {
  const emptyQuery = {
    select: () => emptyQuery,
    eq: () => emptyQuery,
    order: () => emptyQuery,
    single: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
    then: (resolve: (value: { data: null; error: { message: string } }) => void) =>
      resolve({ data: null, error: { message: "Supabase not configured" } }),
  };

  return {
    from: () => emptyQuery,
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
        getPublicUrl: () => ({ data: { publicUrl: "" } }),
      }),
    },
  };
}

export function createAdminClient() {
  const url = getSupabaseUrl();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey || !url) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL is not set");
  }
  return createClient(url, serviceRoleKey);
}

import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;

function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
}

export function createAdminClient() {
  const url = getSupabaseUrl();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey || !url) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL is not set");
  }
  if (!adminClient) {
    adminClient = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return adminClient;
}

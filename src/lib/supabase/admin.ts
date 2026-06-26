import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client — NEVER import this in any client component.
 * Used only in Server Actions that need Supabase Admin API.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

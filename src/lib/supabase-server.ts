import { createClient } from "@supabase/supabase-js";

// Server-only client using the service role key — never expose this to the browser
export function createServerSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

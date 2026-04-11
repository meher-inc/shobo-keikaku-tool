// @ts-nocheck
// Server-only Supabase client using the service_role key.
// NEVER import this from client components.
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  // Surface misconfiguration at import time in dev/build logs.
  console.warn(
    "[supabase] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set. Server-side Supabase calls will fail."
  );
}

export const supabaseAdmin: any = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

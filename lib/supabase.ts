// @ts-nocheck
// Server-only Supabase client using the service_role key.
// NEVER import this from client components.
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
// 統合先（todokede-care-prod）では plan スキーマに置く。未設定なら従来どおり public。
export const supabaseDbSchema = process.env.SUPABASE_DB_SCHEMA || "public";

if (!supabaseUrl || !supabaseServiceRoleKey) {
  // Surface misconfiguration at import time in dev/build logs.
  console.warn(
    "[supabase] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set. Server-side Supabase calls will fail."
  );
}

export const supabaseAdmin: any = createClient(supabaseUrl, supabaseServiceRoleKey, {
  db: { schema: supabaseDbSchema },
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

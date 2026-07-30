import { createClient } from "@supabase/supabase-js";

import { requireSupabaseEnvVars } from "@/lib/supabase/env";

export function createAdminClient() {
  const env = requireSupabaseEnvVars([
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
  ]);

  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

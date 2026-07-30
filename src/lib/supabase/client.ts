import { createBrowserClient } from "@supabase/ssr";

import {
  getMissingSupabaseEnvVars,
  logMissingSupabaseEnvVars,
  SupabaseEnvError,
} from "@/lib/supabase/env";

export function createClient() {
  const missing = getMissingSupabaseEnvVars([
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ]);

  if (missing.length > 0) {
    logMissingSupabaseEnvVars(missing);
    throw new SupabaseEnvError(missing);
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

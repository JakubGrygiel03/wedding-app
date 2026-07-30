type SupabaseEnvKey =
  | "NEXT_PUBLIC_SUPABASE_URL"
  | "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  | "SUPABASE_SERVICE_ROLE_KEY";

export class SupabaseEnvError extends Error {
  readonly missing: SupabaseEnvKey[];

  constructor(missing: SupabaseEnvKey[]) {
    super(`Missing Supabase environment variables: ${missing.join(", ")}`);
    this.name = "SupabaseEnvError";
    this.missing = missing;
  }
}

function readEnv(name: SupabaseEnvKey): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

export function getMissingSupabaseEnvVars(
  required: SupabaseEnvKey[],
): SupabaseEnvKey[] {
  return required.filter((name) => !readEnv(name));
}

export function logMissingSupabaseEnvVars(missing: SupabaseEnvKey[]): void {
  for (const name of missing) {
    console.error(`[Supabase] Brakująca zmienna środowiskowa: ${name}`);
  }
}

export function requireSupabaseEnvVars(required: SupabaseEnvKey[]): {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
} {
  const missing = getMissingSupabaseEnvVars(required);

  if (missing.length > 0) {
    logMissingSupabaseEnvVars(missing);
    throw new SupabaseEnvError(missing);
  }

  const url = readEnv("NEXT_PUBLIC_SUPABASE_URL")!;

  return {
    NEXT_PUBLIC_SUPABASE_URL: url,
    ...(required.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY") && {
      NEXT_PUBLIC_SUPABASE_ANON_KEY: readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")!,
    }),
    ...(required.includes("SUPABASE_SERVICE_ROLE_KEY") && {
      SUPABASE_SERVICE_ROLE_KEY: readEnv("SUPABASE_SERVICE_ROLE_KEY")!,
    }),
  };
}

export function getSupabaseEnvErrorMessage(error: SupabaseEnvError): string {
  return `Brak konfiguracji Supabase: ${error.missing.join(", ")}`;
}

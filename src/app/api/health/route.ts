import { NextResponse } from "next/server";

import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";

import {
  getMissingSupabaseEnvVars,
  requireSupabaseEnvVars,
} from "@/lib/supabase/env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Public readiness probe for uptime monitors.
 * Does not expose secrets — only ok/degraded status and high-level errors.
 */
export async function GET() {
  const timestamp = new Date().toISOString();
  const missing = getMissingSupabaseEnvVars([
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ]);

  if (missing.length > 0) {
    return NextResponse.json(
      {
        ok: false,
        status: "misconfigured",
        database: "unknown",
        missingEnv: missing,
        timestamp,
      },
      { status: 503 },
    );
  }

  try {
    const env = requireSupabaseEnvVars([
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ]);

    const supabase = createSupabaseJsClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: { autoRefreshToken: false, persistSession: false },
      },
    );

    const { error } = await supabase
      .from("timeline_events")
      .select("id")
      .limit(1);

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          status: "degraded",
          database: "unreachable",
          error: error.message,
          timestamp,
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      ok: true,
      status: "healthy",
      database: "up",
      timestamp,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        ok: false,
        status: "degraded",
        database: "unreachable",
        error: message,
        timestamp,
      },
      { status: 503 },
    );
  }
}

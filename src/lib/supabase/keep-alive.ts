import { createAdminClient } from "@/lib/supabase/admin";
import {
  getSupabaseEnvErrorMessage,
  SupabaseEnvError,
} from "@/lib/supabase/env";

export type KeepAliveResult =
  | {
      ok: true;
      message: string;
      timestamp: string;
      checks: { timelineEvents: boolean; guests: boolean };
    }
  | {
      ok: false;
      error: string;
      timestamp: string;
      checks?: { timelineEvents?: boolean; guests?: boolean };
    };

/**
 * Touch two tables so free-tier Supabase sees real DB activity.
 * Uses the service-role client (no cookies / browser session).
 */
export async function pingSupabaseKeepAlive(): Promise<KeepAliveResult> {
  const timestamp = new Date().toISOString();

  try {
    const supabase = createAdminClient();

    const [timeline, guests] = await Promise.all([
      supabase.from("timeline_events").select("id").limit(1),
      supabase.from("guests").select("id").limit(1),
    ]);

    const checks = {
      timelineEvents: !timeline.error,
      guests: !guests.error,
    };

    if (timeline.error || guests.error) {
      const error =
        timeline.error?.message ??
        guests.error?.message ??
        "Supabase keep-alive query failed";

      console.error("[KeepAlive] Supabase ping failed:", {
        timeline: timeline.error?.message,
        guests: guests.error?.message,
      });

      return { ok: false, error, timestamp, checks };
    }

    return {
      ok: true,
      message: "Supabase activity recorded",
      timestamp,
      checks,
    };
  } catch (error) {
    if (error instanceof SupabaseEnvError) {
      return {
        ok: false,
        error: getSupabaseEnvErrorMessage(error),
        timestamp,
      };
    }

    const message =
      error instanceof Error ? error.message : "Unknown keep-alive error";
    console.error("[KeepAlive]", message);

    return { ok: false, error: message, timestamp };
  }
}

export function isAuthorizedCronRequest(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET?.trim();
  const authHeader = request.headers.get("authorization");
  const isVercelCron = request.headers.get("x-vercel-cron") === "1";
  const hasValidBearer =
    Boolean(cronSecret) && authHeader === `Bearer ${cronSecret}`;

  // Always accept Vercel Cron. Also accept Bearer when CRON_SECRET is configured
  // (GitHub Actions / manual curls).
  if (isVercelCron || hasValidBearer) {
    return true;
  }

  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  return false;
}

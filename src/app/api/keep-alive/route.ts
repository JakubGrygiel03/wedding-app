import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isAuthorizedCronRequest(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET?.trim();
  const authHeader = request.headers.get("authorization");
  const isVercelCron = request.headers.get("x-vercel-cron") === "1";

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  if (process.env.NODE_ENV === "production" && isVercelCron) {
    return true;
  }

  return process.env.NODE_ENV !== "production";
}

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("timeline_events")
      .select("id")
      .limit(1);

    if (error) {
      console.error("[KeepAlive] Supabase ping failed:", error.message);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 503 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Supabase activity recorded",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown keep-alive error";
    console.error("[KeepAlive]", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

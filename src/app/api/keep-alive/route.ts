import { NextResponse } from "next/server";

import {
  isAuthorizedCronRequest,
  pingSupabaseKeepAlive,
} from "@/lib/supabase/keep-alive";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await pingSupabaseKeepAlive();

  if (!result.ok) {
    return NextResponse.json(result, { status: 503 });
  }

  return NextResponse.json(result);
}

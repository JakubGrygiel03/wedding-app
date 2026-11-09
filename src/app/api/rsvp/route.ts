import { NextResponse } from "next/server";

import { persistRsvpSubmission } from "@/lib/rsvp/submit";
import { getClientKey } from "@/lib/security/client-key";
import { consumeRateLimit, RATE_LIMITS } from "@/lib/security/rate-limit";
import type { RsvpFormValues } from "@/lib/validations/rsvp";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RsvpRequestBody = {
  values?: RsvpFormValues;
  token?: string;
};

export async function POST(request: Request) {
  try {
    const clientKey = await getClientKey();
    const rate = consumeRateLimit(
      `rsvp:${clientKey}`,
      RATE_LIMITS.rsvpSubmit.limit,
      RATE_LIMITS.rsvpSubmit.windowMs,
    );

    if (!rate.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Zbyt wiele wysyłek z tej sieci. Spróbuj za ${rate.retryAfterSec} s.`,
        },
        { status: 429 },
      );
    }

    let body: RsvpRequestBody;

    try {
      body = (await request.json()) as RsvpRequestBody;
    } catch {
      return NextResponse.json(
        { success: false, error: "Nieprawidłowe dane formularza." },
        { status: 400 },
      );
    }

    if (!body.values || typeof body.values !== "object") {
      return NextResponse.json(
        { success: false, error: "Brak danych formularza." },
        { status: 400 },
      );
    }

    const result = await persistRsvpSubmission(body.values, body.token);

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    console.error("[RSVP] /api/rsvp POST failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Nie udało się zapisać odpowiedzi. Spróbuj ponownie za chwilę.",
      },
      { status: 500 },
    );
  }
}

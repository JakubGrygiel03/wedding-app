"use server";

import type { PostgrestError } from "@supabase/supabase-js";

import { isReservedAdminToken } from "@/lib/admin/expected-rsvp-storage";
import { persistRsvpSubmission } from "@/lib/rsvp/submit";
import { createClient } from "@/lib/supabase/server";
import { SupabaseEnvError } from "@/lib/supabase/env";
import { parseCarSeats } from "@/lib/car-seats";
import { getClientKey } from "@/lib/security/client-key";
import { consumeRateLimit, RATE_LIMITS } from "@/lib/security/rate-limit";
import type { RsvpFormValues } from "@/lib/validations/rsvp";

export type RsvpActionResult =
  | { success: true; token: string }
  | { success: false; error: string };

export type GuestRsvpData = {
  guestName: string;
  isAttending: boolean | null;
  plusOne: boolean;
  plusOneName: string | null;
  plusOneDiet: string | null;
  diet: string | null;
  availableCarSeats: number;
  transportNeeded: number;
  message: string | null;
};

function logSupabaseError(context: string, error: PostgrestError | Error): void {
  if ("code" in error) {
    console.error(`[RSVP] ${context}:`, {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    return;
  }

  console.error(`[RSVP] ${context}:`, error.message);
}

function mapGuestToFormValues(guest: {
  guest_name: string;
  is_attending: boolean | null;
  plus_one: boolean | null;
  plus_one_name: string | null;
  plus_one_diet: string | null;
  dietary_requirements: string | null;
  available_car_seats: number | null;
  transport_needed: number | null;
  message: string | null;
}): GuestRsvpData {
  return {
    guestName: guest.guest_name,
    isAttending: guest.is_attending,
    plusOne: guest.plus_one ?? false,
    plusOneName: guest.plus_one_name,
    plusOneDiet: guest.plus_one_diet,
    diet: guest.dietary_requirements,
    availableCarSeats: parseCarSeats(guest.available_car_seats),
    transportNeeded: parseCarSeats(guest.transport_needed),
    message: guest.message,
  };
}

export async function getGuestByToken(
  token: string,
): Promise<GuestRsvpData | null> {
  if (!token.trim() || isReservedAdminToken(token)) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("guests")
      .select(
        "guest_name, is_attending, plus_one, plus_one_name, plus_one_diet, dietary_requirements, available_car_seats, transport_needed, message",
      )
      .eq("token", token)
      .maybeSingle();

    if (error) {
      logSupabaseError("getGuestByToken", error);
      return null;
    }

    if (!data) return null;

    return mapGuestToFormValues(data);
  } catch (error) {
    if (error instanceof SupabaseEnvError) {
      console.error("[RSVP] getGuestByToken env error:", error.missing.join(", "));
      return null;
    }

    if (error instanceof Error) {
      logSupabaseError("getGuestByToken", error);
    }

    return null;
  }
}

/** Kept for compatibility; the public form uses POST /api/rsvp. */
export async function submitRsvp(
  values: RsvpFormValues,
  token?: string,
): Promise<RsvpActionResult> {
  const clientKey = await getClientKey();
  const rate = consumeRateLimit(
    `rsvp:${clientKey}`,
    RATE_LIMITS.rsvpSubmit.limit,
    RATE_LIMITS.rsvpSubmit.windowMs,
  );

  if (!rate.ok) {
    return {
      success: false,
      error: `Zbyt wiele wysyłek z tej sieci. Spróbuj za ${rate.retryAfterSec} s.`,
    };
  }

  return persistRsvpSubmission(values, token);
}

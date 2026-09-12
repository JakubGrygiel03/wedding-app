"use server";

import { revalidatePath } from "next/cache";
import type { PostgrestError } from "@supabase/supabase-js";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  getSupabaseEnvErrorMessage,
  SupabaseEnvError,
} from "@/lib/supabase/env";
import { isReservedAdminToken } from "@/lib/admin/expected-rsvp-storage";
import { parseCarSeats, serializeCarSeats } from "@/lib/car-seats";
import {
  rsvpSchema,
  type RsvpFormValues,
} from "@/lib/validations/rsvp";

export type RsvpActionResult =
  | { success: true; token: string }
  | { success: false; error: string };

export type GuestRsvpData = {
  guestName: string;
  isAttending: boolean | null;
  plusOne: boolean;
  plusOneDiet: string | null;
  diet: string | null;
  availableCarSeats: number;
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

function mapSupabaseError(error: PostgrestError | Error): string {
  if ("code" in error) {
    if (error.code === "42P01") {
      return "Tabela guests nie istnieje w Supabase. Uruchom migrację SQL.";
    }

    if (error.code === "PGRST204" || error.code === "42703") {
      return "Baza nie rozpoznaje jednego z pól formularza. Odśwież stronę i spróbuj ponownie.";
    }

    if (error.code === "PGRST301" || error.code === "42501") {
      return "Brak uprawnień do zapisu RSVP. Skontaktuj się z organizatorami.";
    }
  }

  const message = error.message.toLowerCase();

  if (
    message.includes("fetch failed") ||
    message.includes("network") ||
    message.includes("econnrefused") ||
    message.includes("failed to fetch")
  ) {
    return "Nie udało się połączyć z bazą danych. Sprawdź internet i spróbuj ponownie.";
  }

  return error.message;
}

function mapGuestToFormValues(guest: {
  guest_name: string;
  is_attending: boolean | null;
  plus_one: boolean | null;
  plus_one_name: string | null;
  plus_one_diet: string | null;
  dietary_requirements: string | null;
  message: string | null;
}): GuestRsvpData {
  return {
    guestName: guest.guest_name,
    isAttending: guest.is_attending,
    plusOne: guest.plus_one ?? false,
    plusOneDiet: guest.plus_one_diet,
    diet: guest.dietary_requirements,
    availableCarSeats: parseCarSeats(guest.plus_one_name),
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
        "guest_name, is_attending, plus_one, plus_one_name, plus_one_diet, dietary_requirements, message",
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

export async function submitRsvp(
  values: RsvpFormValues,
  token?: string,
): Promise<RsvpActionResult> {
  const parsed = rsvpSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane formularza.",
    };
  }

  const data = parsed.data;

  let supabase;

  try {
    supabase = createAdminClient();
  } catch (error) {
    if (error instanceof SupabaseEnvError) {
      return {
        success: false,
        error: getSupabaseEnvErrorMessage(error),
      };
    }

    throw error;
  }

  const payload = {
    guest_name: data.guestName,
    is_attending: data.isAttending,
    plus_one: data.isAttending ? data.plusOne : false,
    plus_one_name: data.isAttending ? serializeCarSeats(data.availableCarSeats) : "0",
    plus_one_diet:
      data.isAttending && data.plusOne ? data.plusOneDiet ?? null : null,
    dietary_requirements: data.isAttending ? data.diet : null,
    accommodation_needed: false,
    message: data.message?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  try {
    if (token?.trim()) {
      const { data: existing, error: fetchError } = await supabase
        .from("guests")
        .select("id")
        .eq("token", token.trim())
        .maybeSingle();

      if (fetchError) {
        logSupabaseError("fetch guest by token", fetchError);
        return { success: false, error: mapSupabaseError(fetchError) };
      }

      if (!existing) {
        return { success: false, error: "Nie znaleziono zaproszenia o podanym tokenie." };
      }

      const { error: updateError } = await supabase
        .from("guests")
        .update(payload)
        .eq("token", token.trim());

      if (updateError) {
        logSupabaseError("update guest RSVP", updateError);
        return {
          success: false,
          error: mapSupabaseError(updateError),
        };
      }

      revalidatePath("/");
      revalidatePath("/admin");
      revalidatePath(`/rsvp/${token.trim()}`);

      return { success: true, token: token.trim() };
    }

    const newToken = crypto.randomUUID();

    const { error: insertError } = await supabase.from("guests").insert({
      ...payload,
      token: newToken,
    });

    if (insertError) {
      logSupabaseError("insert guest RSVP", insertError);
      return {
        success: false,
        error: mapSupabaseError(insertError),
      };
    }

    revalidatePath("/");
    revalidatePath("/admin");

    return { success: true, token: newToken };
  } catch (error) {
    if (error instanceof Error) {
      logSupabaseError("unexpected submitRsvp error", error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.error("[RSVP] unexpected submitRsvp error:", error);

    return {
      success: false,
      error: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.",
    };
  }
}

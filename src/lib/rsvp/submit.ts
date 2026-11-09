import { revalidatePath } from "next/cache";
import type { PostgrestError } from "@supabase/supabase-js";

import { isReservedAdminToken } from "@/lib/admin/expected-rsvp-storage";
import { parseCarSeats } from "@/lib/car-seats";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getSupabaseEnvErrorMessage,
  SupabaseEnvError,
} from "@/lib/supabase/env";
import { getFriendlyDatabaseError } from "@/lib/supabase/errors";
import {
  rsvpSchema,
  type RsvpFormValues,
} from "@/lib/validations/rsvp";

export type RsvpSubmitResult =
  | { success: true; token: string }
  | { success: false; error: string };

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

  return getFriendlyDatabaseError(
    error,
    "Nie udało się zapisać odpowiedzi. Spróbuj ponownie za chwilę.",
  );
}

export async function persistRsvpSubmission(
  values: RsvpFormValues,
  token?: string,
): Promise<RsvpSubmitResult> {
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
    plus_one_name:
      data.isAttending && data.plusOne
        ? data.plusOneName?.trim() || null
        : null,
    plus_one_diet:
      data.isAttending && data.plusOne ? data.plusOneDiet ?? null : null,
    dietary_requirements: data.isAttending ? data.diet : null,
    available_car_seats: data.isAttending
      ? parseCarSeats(data.availableCarSeats)
      : 0,
    transport_needed: data.isAttending
      ? parseCarSeats(data.transportNeeded)
      : 0,
    accommodation_needed: false,
    message: data.message?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  try {
    const trimmedToken = token?.trim();

    if (trimmedToken) {
      if (isReservedAdminToken(trimmedToken)) {
        return {
          success: false,
          error: "Nieprawidłowy token zaproszenia.",
        };
      }

      const { data: existing, error: fetchError } = await supabase
        .from("guests")
        .select("id")
        .eq("token", trimmedToken)
        .maybeSingle();

      if (fetchError) {
        logSupabaseError("fetch guest by token", fetchError);
        return { success: false, error: mapSupabaseError(fetchError) };
      }

      if (!existing) {
        return {
          success: false,
          error: "Nie znaleziono zaproszenia o podanym tokenie.",
        };
      }

      const { error: updateError } = await supabase
        .from("guests")
        .update(payload)
        .eq("token", trimmedToken);

      if (updateError) {
        logSupabaseError("update guest RSVP", updateError);
        return {
          success: false,
          error: mapSupabaseError(updateError),
        };
      }

      revalidatePath("/");
      revalidatePath("/admin");
      revalidatePath(`/rsvp/${trimmedToken}`);

      return { success: true, token: trimmedToken };
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
      logSupabaseError("unexpected persistRsvpSubmission error", error);
      return {
        success: false,
        error: getFriendlyDatabaseError(
          error,
          "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.",
        ),
      };
    }

    console.error("[RSVP] unexpected persistRsvpSubmission error:", error);

    return {
      success: false,
      error: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.",
    };
  }
}

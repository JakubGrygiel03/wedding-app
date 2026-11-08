"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  clearAdminSession,
  getAdminPasswordSource,
  isAdminAuthenticated,
  setAdminSession,
  verifyAdminPassword,
} from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getSupabaseEnvErrorMessage,
  SupabaseEnvError,
} from "@/lib/supabase/env";
import { getFriendlyDatabaseError } from "@/lib/supabase/errors";
import {
  adminGuestSchema,
  type AdminGuestFormValues,
} from "@/lib/validations/admin-guest";
import {
  EXPECTED_RSVP_SETTING_TOKEN,
  filterGuestRows,
  isReservedAdminToken,
  parseExpectedRsvpCount,
} from "@/lib/admin/expected-rsvp-storage";
import { parseCarSeats } from "@/lib/car-seats";
import { getClientKey } from "@/lib/security/client-key";
import { consumeRateLimit, RATE_LIMITS } from "@/lib/security/rate-limit";
import { expectedRsvpCountSchema } from "@/lib/validations/admin-settings";

export type AdminMutationResult =
  | { success: true }
  | { success: false; error: string };

export type AdminCreateGuestResult =
  | { success: true; token: string }
  | { success: false; error: string };

export type AdminGuestRow = {
  id: string;
  guestName: string;
  isAttending: boolean | null;
  diet: string | null;
  plusOne: boolean;
  plusOneName: string | null;
  plusOneDiet: string | null;
  availableCarSeats: number;
  transportNeeded: number;
  message: string | null;
  updatedAt: string;
};

export type AdminStats = {
  totalGuests: number;
  attendingCount: number;
  declinedCount: number;
  pendingCount: number;
  respondedCount: number;
  dietCounts: Record<string, number>;
  plusOneCount: number;
  carSeatsCount: number;
  transportNeededCount: number;
};

export type AdminGuestsResult =
  | {
      success: true;
      guests: AdminGuestRow[];
      stats: AdminStats;
      expectedRsvpCount: number | null;
    }
  | { success: false; error: string };

function mapGuestRow(guest: {
  id: string;
  guest_name: string;
  is_attending: boolean | null;
  dietary_requirements: string | null;
  plus_one: boolean | null;
  plus_one_name: string | null;
  plus_one_diet: string | null;
  available_car_seats: number | null;
  transport_needed: number | null;
  message: string | null;
  updated_at: string;
}): AdminGuestRow {
  return {
    id: guest.id,
    guestName: guest.guest_name,
    isAttending: guest.is_attending,
    diet: guest.dietary_requirements,
    plusOne: guest.plus_one ?? false,
    plusOneName: guest.plus_one_name,
    plusOneDiet: guest.plus_one_diet,
    availableCarSeats: parseCarSeats(guest.available_car_seats),
    transportNeeded: parseCarSeats(guest.transport_needed),
    message: guest.message,
    updatedAt: guest.updated_at,
  };
}

function getGuestHeadcount(guest: AdminGuestRow): number {
  return 1 + (guest.plusOne ? 1 : 0);
}

function computeStats(guests: AdminGuestRow[]): AdminStats {
  const dietCounts: Record<string, number> = {};
  let totalGuests = 0;
  let attendingCount = 0;
  let declinedCount = 0;
  let pendingCount = 0;
  let respondedCount = 0;
  let plusOneCount = 0;
  let carSeatsCount = 0;
  let transportNeededCount = 0;

  for (const guest of guests) {
    const headcount = getGuestHeadcount(guest);
    totalGuests += headcount;

    if (guest.isAttending === true) {
      attendingCount += headcount;
      respondedCount += 1;

      if (guest.diet) {
        dietCounts[guest.diet] = (dietCounts[guest.diet] ?? 0) + 1;
      }

      if (guest.plusOne && guest.plusOneDiet) {
        dietCounts[guest.plusOneDiet] =
          (dietCounts[guest.plusOneDiet] ?? 0) + 1;
      }
    } else if (guest.isAttending === false) {
      declinedCount += 1;
      respondedCount += 1;
    } else {
      pendingCount += 1;
    }

    if (guest.plusOne) plusOneCount += 1;
    if (guest.isAttending === true) {
      carSeatsCount += guest.availableCarSeats;
      transportNeededCount += guest.transportNeeded;
    }
  }

  return {
    totalGuests,
    attendingCount,
    declinedCount,
    pendingCount,
    respondedCount,
    dietCounts,
    plusOneCount,
    carSeatsCount,
    transportNeededCount,
  };
}

async function fetchExpectedRsvpCount(
  supabase: ReturnType<typeof createAdminClient>,
): Promise<number | null> {
  const { data, error } = await supabase
    .from("guests")
    .select("message")
    .eq("token", EXPECTED_RSVP_SETTING_TOKEN)
    .maybeSingle();

  if (error) {
    console.error("[Admin] fetchExpectedRsvpCount:", error.message);
    return null;
  }

  return parseExpectedRsvpCount(data?.message);
}

export async function loginAdmin(
  password: string,
): Promise<{ success: false; error: string }> {
  const clientKey = await getClientKey();
  const rate = consumeRateLimit(
    `admin-login:${clientKey}`,
    RATE_LIMITS.adminLogin.limit,
    RATE_LIMITS.adminLogin.windowMs,
  );

  if (!rate.ok) {
    return {
      success: false,
      error: `Zbyt wiele prób logowania. Spróbuj za ${rate.retryAfterSec} s.`,
    };
  }

  const normalizedPassword = password.trim().replace(/\r/g, "");

  if (!(await verifyAdminPassword(normalizedPassword))) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "[Admin] Login failed — password mismatch.",
        `Source: ${getAdminPasswordSource()}.`,
        "Restart dev server after changing .env.local.",
      );
    }

    const restartHint =
      process.env.NODE_ENV === "development"
        ? " Upewnij się, że ADMIN_PASSWORD w .env.local jest poprawne i zrestartuj serwer (npm run dev)."
        : "";

    return {
      success: false,
      error: `Nieprawidłowe hasło.${restartHint}`,
    };
  }

  await setAdminSession(normalizedPassword);
  revalidatePath("/admin");
  redirect("/admin");
}

export async function logoutAdmin(): Promise<void> {
  await clearAdminSession();
  revalidatePath("/admin");
}

export async function getAdminGuests(): Promise<AdminGuestsResult> {
  if (!(await isAdminAuthenticated())) {
    return { success: false, error: "Brak autoryzacji." };
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("guests")
      .select(
        "id, token, guest_name, is_attending, dietary_requirements, plus_one, plus_one_name, plus_one_diet, available_car_seats, transport_needed, message, updated_at",
      )
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("[Admin] getAdminGuests:", error.message);
      return { success: false, error: getFriendlyDatabaseError(error) };
    }

    const guests = filterGuestRows(data ?? []).map(mapGuestRow);

    const expectedRsvpCount = await fetchExpectedRsvpCount(supabase);

    return {
      success: true,
      guests,
      stats: computeStats(guests),
      expectedRsvpCount,
    };
  } catch (error) {
    if (error instanceof SupabaseEnvError) {
      return { success: false, error: getSupabaseEnvErrorMessage(error) };
    }

    const message = error instanceof Error ? error.message : "Nieznany błąd.";
    console.error("[Admin] getAdminGuests:", message);

    return { success: false, error: getFriendlyDatabaseError(error) };
  }
}

function mapAdminGuestPayload(data: AdminGuestFormValues) {
  const isAttending = data.isAttending === true;

  return {
    guest_name: data.guestName,
    is_attending: data.isAttending,
    plus_one: isAttending ? data.plusOne : false,
    plus_one_name:
      isAttending && data.plusOne ? data.plusOneName?.trim() || null : null,
    plus_one_diet:
      isAttending && data.plusOne ? (data.plusOneDiet ?? null) : null,
    dietary_requirements: isAttending ? (data.diet ?? null) : null,
    available_car_seats: isAttending
      ? parseCarSeats(data.availableCarSeats)
      : 0,
    transport_needed: isAttending ? parseCarSeats(data.transportNeeded) : 0,
    accommodation_needed: false,
    message: data.message?.trim() || null,
    updated_at: new Date().toISOString(),
  };
}

export async function updateAdminGuest(
  guestId: string,
  values: AdminGuestFormValues,
): Promise<AdminMutationResult> {
  if (!(await isAdminAuthenticated())) {
    return { success: false, error: "Brak autoryzacji." };
  }

  const parsed = adminGuestSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane formularza.",
    };
  }

  const id = guestId.trim();

  if (!id) {
    return { success: false, error: "Brak identyfikatora gościa." };
  }

  try {
    const supabase = createAdminClient();
    const { data: existing, error: fetchError } = await supabase
      .from("guests")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) {
      console.error("[Admin] updateAdminGuest fetch:", fetchError.message);
      return { success: false, error: fetchError.message };
    }

    if (!existing) {
      return { success: false, error: "Nie znaleziono gościa." };
    }

    const { error: updateError } = await supabase
      .from("guests")
      .update(mapAdminGuestPayload(parsed.data))
      .eq("id", id);

    if (updateError) {
      console.error("[Admin] updateAdminGuest:", updateError.message);
      return { success: false, error: updateError.message };
    }

    revalidatePath("/admin");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    if (error instanceof SupabaseEnvError) {
      return { success: false, error: getSupabaseEnvErrorMessage(error) };
    }

    const message = error instanceof Error ? error.message : "Nieznany błąd.";
    console.error("[Admin] updateAdminGuest:", message);

    return { success: false, error: message };
  }
}

export async function setExpectedRsvpCount(
  count: number | null,
): Promise<AdminMutationResult> {
  if (!(await isAdminAuthenticated())) {
    return { success: false, error: "Brak autoryzacji." };
  }

  if (count !== null) {
    const parsed = expectedRsvpCountSchema.safeParse(count);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Nieprawidłowa liczba zaproszeń.",
      };
    }
  }

  try {
    const supabase = createAdminClient();
    const { data: existing, error: fetchError } = await supabase
      .from("guests")
      .select("id")
      .eq("token", EXPECTED_RSVP_SETTING_TOKEN)
      .maybeSingle();

    if (fetchError) {
      console.error("[Admin] setExpectedRsvpCount fetch:", fetchError.message);
      return { success: false, error: fetchError.message };
    }

    if (count === null) {
      if (existing) {
        const { error } = await supabase
          .from("guests")
          .delete()
          .eq("id", existing.id);

        if (error) {
          console.error("[Admin] setExpectedRsvpCount delete:", error.message);
          return { success: false, error: error.message };
        }
      }
    } else if (existing) {
      const { error } = await supabase
        .from("guests")
        .update({
          message: String(count),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (error) {
        console.error("[Admin] setExpectedRsvpCount update:", error.message);
        return { success: false, error: error.message };
      }
    } else {
      const { error } = await supabase.from("guests").insert({
        token: EXPECTED_RSVP_SETTING_TOKEN,
        guest_name: "[Ustawienie admina]",
        is_attending: null,
        plus_one: false,
        plus_one_diet: null,
        dietary_requirements: null,
        accommodation_needed: false,
        message: String(count),
      });

      if (error) {
        console.error("[Admin] setExpectedRsvpCount insert:", error.message);
        return { success: false, error: error.message };
      }
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    if (error instanceof SupabaseEnvError) {
      return { success: false, error: getSupabaseEnvErrorMessage(error) };
    }

    const message = error instanceof Error ? error.message : "Nieznany błąd.";
    console.error("[Admin] setExpectedRsvpCount:", message);

    return { success: false, error: message };
  }
}

export async function createAdminGuest(
  values: AdminGuestFormValues,
): Promise<AdminCreateGuestResult> {
  if (!(await isAdminAuthenticated())) {
    return { success: false, error: "Brak autoryzacji." };
  }

  const parsed = adminGuestSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane formularza.",
    };
  }

  const token = crypto.randomUUID();

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("guests").insert({
      ...mapAdminGuestPayload(parsed.data),
      token,
    });

    if (error) {
      console.error("[Admin] createAdminGuest:", error.message);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/");

    return { success: true, token };
  } catch (error) {
    if (error instanceof SupabaseEnvError) {
      return { success: false, error: getSupabaseEnvErrorMessage(error) };
    }

    const message = error instanceof Error ? error.message : "Nieznany błąd.";
    console.error("[Admin] createAdminGuest:", message);

    return { success: false, error: message };
  }
}

export async function deleteAdminGuest(
  guestId: string,
): Promise<AdminMutationResult> {
  if (!(await isAdminAuthenticated())) {
    return { success: false, error: "Brak autoryzacji." };
  }

  const id = guestId.trim();

  if (!id) {
    return { success: false, error: "Brak identyfikatora gościa." };
  }

  try {
    const supabase = createAdminClient();
    const { data: existing, error: fetchError } = await supabase
      .from("guests")
      .select("id, token")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) {
      console.error("[Admin] deleteAdminGuest fetch:", fetchError.message);
      return { success: false, error: fetchError.message };
    }

    if (!existing) {
      return { success: false, error: "Nie znaleziono gościa." };
    }

    if (isReservedAdminToken(existing.token)) {
      return {
        success: false,
        error: "Nie można usunąć wiersza ustawień admina.",
      };
    }

    const { error } = await supabase.from("guests").delete().eq("id", id);

    if (error) {
      console.error("[Admin] deleteAdminGuest:", error.message);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    if (error instanceof SupabaseEnvError) {
      return { success: false, error: getSupabaseEnvErrorMessage(error) };
    }

    const message = error instanceof Error ? error.message : "Nieznany błąd.";
    console.error("[Admin] deleteAdminGuest:", message);

    return { success: false, error: message };
  }
}

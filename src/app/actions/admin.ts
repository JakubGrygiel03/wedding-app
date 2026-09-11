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
import {
  adminGuestSchema,
  type AdminGuestFormValues,
} from "@/lib/validations/admin-guest";
import {
  EXPECTED_RSVP_SETTING_TOKEN,
  filterGuestRows,
  parseExpectedRsvpCount,
} from "@/lib/admin/expected-rsvp-storage";
import { parseCarSeats, serializeCarSeats } from "@/lib/car-seats";
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
  plusOneDiet: string | null;
  availableCarSeats: number;
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
  message: string | null;
  updated_at: string;
}): AdminGuestRow {
  return {
    id: guest.id,
    guestName: guest.guest_name,
    isAttending: guest.is_attending,
    diet: guest.dietary_requirements,
    plusOne: guest.plus_one ?? false,
    plusOneDiet: guest.plus_one_diet,
    availableCarSeats: parseCarSeats(guest.plus_one_name),
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
  const normalizedPassword = password.trim().replace(/\r/g, "");

  if (!verifyAdminPassword(normalizedPassword)) {
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

  await setAdminSession();
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
        "id, token, guest_name, is_attending, dietary_requirements, plus_one, plus_one_name, plus_one_diet, message, updated_at",
      )
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("[Admin] getAdminGuests:", error.message);
      return { success: false, error: error.message };
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

    return { success: false, error: message };
  }
}

function mapAdminGuestPayload(data: AdminGuestFormValues) {
  const isAttending = data.isAttending === true;

  return {
    guest_name: data.guestName,
    is_attending: data.isAttending,
    plus_one: isAttending ? data.plusOne : false,
    plus_one_name: isAttending ? serializeCarSeats(data.availableCarSeats) : "0",
    plus_one_diet:
      isAttending && data.plusOne ? (data.plusOneDiet ?? null) : null,
    dietary_requirements: isAttending ? (data.diet ?? null) : null,
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

    if (existing.token === EXPECTED_RSVP_SETTING_TOKEN) {
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

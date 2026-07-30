"use server";

import { revalidatePath } from "next/cache";

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

export type AdminGuestRow = {
  id: string;
  guestName: string;
  isAttending: boolean | null;
  diet: string | null;
  plusOne: boolean;
  plusOneDiet: string | null;
  accommodationNeeded: boolean;
  message: string | null;
  updatedAt: string;
};

export type AdminStats = {
  totalGuests: number;
  attendingCount: number;
  declinedCount: number;
  pendingCount: number;
  dietCounts: Record<string, number>;
  plusOneCount: number;
  accommodationCount: number;
};

export type AdminGuestsResult =
  | { success: true; guests: AdminGuestRow[]; stats: AdminStats }
  | { success: false; error: string };

function mapGuestRow(guest: {
  id: string;
  guest_name: string;
  is_attending: boolean | null;
  dietary_requirements: string | null;
  plus_one: boolean | null;
  plus_one_diet: string | null;
  accommodation_needed: boolean | null;
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
    accommodationNeeded: guest.accommodation_needed ?? false,
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
  let plusOneCount = 0;
  let accommodationCount = 0;

  for (const guest of guests) {
    const headcount = getGuestHeadcount(guest);
    totalGuests += headcount;

    if (guest.isAttending === true) {
      attendingCount += headcount;

      if (guest.diet) {
        dietCounts[guest.diet] = (dietCounts[guest.diet] ?? 0) + 1;
      }

      if (guest.plusOne && guest.plusOneDiet) {
        dietCounts[guest.plusOneDiet] =
          (dietCounts[guest.plusOneDiet] ?? 0) + 1;
      }
    } else if (guest.isAttending === false) {
      declinedCount += 1;
    } else {
      pendingCount += 1;
    }

    if (guest.plusOne) plusOneCount += 1;
    if (guest.accommodationNeeded) accommodationCount += 1;
  }

  return {
    totalGuests,
    attendingCount,
    declinedCount,
    pendingCount,
    dietCounts,
    plusOneCount,
    accommodationCount,
  };
}

export async function loginAdmin(
  password: string,
): Promise<{ success: boolean; error?: string }> {
  const normalizedPassword = password.trim().replace(/\r/g, "");

  if (!verifyAdminPassword(normalizedPassword)) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "[Admin] Login failed — password mismatch.",
        `Source: ${getAdminPasswordSource()}.`,
        "Restart dev server after changing .env.local.",
      );
    }

    return { success: false, error: "Nieprawidłowe hasło." };
  }

  await setAdminSession();
  revalidatePath("/admin");

  return { success: true };
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
        "id, guest_name, is_attending, dietary_requirements, plus_one, plus_one_diet, accommodation_needed, message, updated_at",
      )
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("[Admin] getAdminGuests:", error.message);
      return { success: false, error: error.message };
    }

    const guests = (data ?? []).map(mapGuestRow);

    return {
      success: true,
      guests,
      stats: computeStats(guests),
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

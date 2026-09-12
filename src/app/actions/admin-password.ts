"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { setAdminSession, verifyAdminPassword } from "@/lib/admin/auth";
import {
  createPasswordHash,
  saveStoredPasswordHash,
} from "@/lib/admin/password-storage";
import {
  getSupabaseEnvErrorMessage,
  SupabaseEnvError,
} from "@/lib/supabase/env";
import { changeAdminPasswordSchema } from "@/lib/validations/admin-password";

export async function changeAdminPassword(values: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<{ success: false; error: string }> {
  const parsed = changeAdminPasswordSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane formularza.",
    };
  }

  const { currentPassword, newPassword } = parsed.data;

  if (!(await verifyAdminPassword(currentPassword))) {
    return { success: false, error: "Obecne hasło jest nieprawidłowe." };
  }

  try {
    await saveStoredPasswordHash(createPasswordHash(newPassword));
    await setAdminSession(newPassword);
  } catch (error) {
    if (error instanceof SupabaseEnvError) {
      return { success: false, error: getSupabaseEnvErrorMessage(error) };
    }

    const message = error instanceof Error ? error.message : "Nieznany błąd.";
    console.error("[Admin] changeAdminPassword:", message);
    return { success: false, error: "Nie udało się zapisać nowego hasła." };
  }

  revalidatePath("/admin");
  redirect("/admin");
}

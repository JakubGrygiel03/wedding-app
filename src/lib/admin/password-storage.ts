import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

import { createAdminClient } from "@/lib/supabase/admin";
import { ADMIN_PASSWORD_SETTING_TOKEN } from "@/lib/admin/expected-rsvp-storage";

const HASH_PREFIX = "scrypt";
const KEY_LENGTH = 64;

export function createPasswordHash(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${HASH_PREFIX}:${salt}:${hash}`;
}

export function verifyStoredPasswordHash(password: string, stored: string): boolean {
  const [prefix, salt, hash] = stored.split(":");

  if (prefix !== HASH_PREFIX || !salt || !hash) {
    return false;
  }

  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, KEY_LENGTH);

  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(expected, actual);
}

export async function getStoredPasswordHash(): Promise<string | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("guests")
      .select("message")
      .eq("token", ADMIN_PASSWORD_SETTING_TOKEN)
      .maybeSingle();

    if (error) {
      console.error("[Admin] getStoredPasswordHash:", error.message);
      return null;
    }

    const value = data?.message?.trim();
    return value?.startsWith(`${HASH_PREFIX}:`) ? value : null;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Admin] getStoredPasswordHash:", message);
    return null;
  }
}

export async function saveStoredPasswordHash(hash: string): Promise<void> {
  const supabase = createAdminClient();
  const { data: existing, error: fetchError } = await supabase
    .from("guests")
    .select("id")
    .eq("token", ADMIN_PASSWORD_SETTING_TOKEN)
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  const payload = {
    message: hash,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    const { error } = await supabase.from("guests").update(payload).eq("id", existing.id);
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await supabase.from("guests").insert({
    token: ADMIN_PASSWORD_SETTING_TOKEN,
    guest_name: "[Hasło admina]",
    is_attending: null,
    plus_one: false,
    plus_one_diet: null,
    dietary_requirements: null,
    accommodation_needed: false,
    message: hash,
  });

  if (error) {
    throw new Error(error.message);
  }
}

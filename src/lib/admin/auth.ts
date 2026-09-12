import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

import {
  getStoredPasswordHash,
  verifyStoredPasswordHash,
} from "@/lib/admin/password-storage";

const ADMIN_COOKIE = "wedding_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24; // 24h
const SESSION_SALT = "wedding-admin-session";

const FALLBACK_ADMIN_PASSWORD = "wedding-admin-2027";

function normalizePassword(value: string): string {
  return value.trim().replace(/^\uFEFF/, "").replace(/\r/g, "");
}

function readEnvPassword(
  name: "ADMIN_PASSWORD" | "NEXT_PUBLIC_ADMIN_PASSWORD",
): string | undefined {
  const raw = process.env[name];

  if (raw == null) return undefined;

  const normalized = normalizePassword(raw);
  return normalized.length > 0 ? normalized : undefined;
}

export function getAdminPassword(): string {
  return (
    readEnvPassword("ADMIN_PASSWORD") ??
    readEnvPassword("NEXT_PUBLIC_ADMIN_PASSWORD") ??
    FALLBACK_ADMIN_PASSWORD
  );
}

export function getAdminPasswordSource():
  | "ADMIN_PASSWORD"
  | "NEXT_PUBLIC_ADMIN_PASSWORD"
  | "fallback" {
  if (readEnvPassword("ADMIN_PASSWORD")) return "ADMIN_PASSWORD";
  if (readEnvPassword("NEXT_PUBLIC_ADMIN_PASSWORD")) {
    return "NEXT_PUBLIC_ADMIN_PASSWORD";
  }
  return "fallback";
}

function hashPassword(value: string): string {
  return createHash("sha256")
    .update(`${normalizePassword(value)}:${SESSION_SALT}`)
    .digest("hex");
}

function hashesEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);

  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}

function createEnvSessionToken(): string {
  return hashPassword(getAdminPassword());
}

function createStoredSessionToken(storedHash: string): string {
  return hashPassword(storedHash);
}

export async function verifyAdminPassword(input: string): Promise<boolean> {
  const normalizedInput = normalizePassword(input);

  if (!normalizedInput) {
    return false;
  }

  if (hashesEqual(hashPassword(normalizedInput), createEnvSessionToken())) {
    return true;
  }

  const storedHash = await getStoredPasswordHash();
  return Boolean(storedHash && verifyStoredPasswordHash(normalizedInput, storedHash));
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE)?.value;

  if (!session) {
    return false;
  }

  if (hashesEqual(session, createEnvSessionToken())) {
    return true;
  }

  const storedHash = await getStoredPasswordHash();
  return Boolean(storedHash && hashesEqual(session, createStoredSessionToken(storedHash)));
}

export async function setAdminSession(password?: string): Promise<void> {
  const cookieStore = await cookies();
  const token = password
    ? await createSessionTokenForPassword(password)
    : createEnvSessionToken();

  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

async function createSessionTokenForPassword(password: string): Promise<string> {
  const normalized = normalizePassword(password);

  if (hashesEqual(hashPassword(normalized), createEnvSessionToken())) {
    return createEnvSessionToken();
  }

  const storedHash = await getStoredPasswordHash();
  if (storedHash && verifyStoredPasswordHash(normalized, storedHash)) {
    return createStoredSessionToken(storedHash);
  }

  return hashPassword(normalized);
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}

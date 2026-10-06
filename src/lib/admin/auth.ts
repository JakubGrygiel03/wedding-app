import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

import {
  getStoredPasswordHash,
  verifyStoredPasswordHash,
} from "@/lib/admin/password-storage";

const ADMIN_COOKIE = "wedding_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24;
const SESSION_SALT = "wedding-admin-session";

function normalizePassword(value: string): string {
  return value.trim().replace(/^\uFEFF/, "").replace(/\r/g, "");
}

function readEnvPassword(): string | undefined {
  const raw = process.env.ADMIN_PASSWORD;
  if (raw == null) return undefined;

  const normalized = normalizePassword(raw);
  return normalized.length > 0 ? normalized : undefined;
}

export function getAdminPassword(): string {
  return readEnvPassword() ?? "";
}

export function getAdminPasswordSource(): "ADMIN_PASSWORD" | "stored" {
  if (readEnvPassword()) return "ADMIN_PASSWORD";
  return "stored";
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

function createEnvSessionToken(): string | null {
  const password = getAdminPassword();
  if (!password) return null;
  return hashPassword(password);
}

function createStoredSessionToken(storedHash: string): string {
  return hashPassword(storedHash);
}

export async function verifyAdminPassword(input: string): Promise<boolean> {
  const normalizedInput = normalizePassword(input);
  if (!normalizedInput) return false;

  const envToken = createEnvSessionToken();
  if (envToken && hashesEqual(hashPassword(normalizedInput), envToken)) {
    return true;
  }

  const storedHash = await getStoredPasswordHash();
  return Boolean(
    storedHash && verifyStoredPasswordHash(normalizedInput, storedHash),
  );
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!session) return false;

  const envToken = createEnvSessionToken();
  if (envToken && hashesEqual(session, envToken)) return true;

  const storedHash = await getStoredPasswordHash();
  return Boolean(
    storedHash && hashesEqual(session, createStoredSessionToken(storedHash)),
  );
}

export async function setAdminSession(password?: string): Promise<void> {
  const cookieStore = await cookies();
  const token = password
    ? await createSessionTokenForPassword(password)
    : createEnvSessionToken();

  if (!token) {
    throw new Error("Cannot create admin session without a password.");
  }

  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

async function createSessionTokenForPassword(password: string): Promise<string | null> {
  const normalized = normalizePassword(password);
  if (!normalized) return null;

  const envToken = createEnvSessionToken();
  if (envToken && hashesEqual(hashPassword(normalized), envToken)) {
    return envToken;
  }

  const storedHash = await getStoredPasswordHash();
  if (storedHash && verifyStoredPasswordHash(normalized, storedHash)) {
    return createStoredSessionToken(storedHash);
  }

  return null;
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}

import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const ADMIN_COOKIE = "wedding_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24; // 24h
const SESSION_SALT = "wedding-admin-session";

const FALLBACK_ADMIN_PASSWORD = "wedding-admin-2027";

function normalizePassword(value: string): string {
  return value.trim().replace(/\r/g, "");
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

function createSessionToken(password: string): string {
  return hashPassword(password);
}

export function verifyAdminPassword(input: string): boolean {
  const expected = getAdminPassword();
  const normalizedInput = normalizePassword(input);

  if (!normalizedInput) {
    return false;
  }

  const expectedHash = hashPassword(expected);
  const inputHash = hashPassword(normalizedInput);

  return timingSafeEqual(Buffer.from(expectedHash), Buffer.from(inputHash));
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE)?.value;
  const expected = createSessionToken(getAdminPassword());

  if (!session || session.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(session), Buffer.from(expected));
}

export async function setAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, createSessionToken(getAdminPassword()), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}

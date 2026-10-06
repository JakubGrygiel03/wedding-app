import { headers } from "next/headers";

/** Best-effort client key for rate limits (Vercel sets x-forwarded-for). */
export async function getClientKey(): Promise<string> {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = headerStore.get("x-real-ip")?.trim();
  return forwarded || realIp || "unknown";
}

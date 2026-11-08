/**
 * Turn raw Supabase / network / Cloudflare HTML errors into short Polish copy.
 * Never surface HTML dumps (e.g. Cloudflare 521) in the UI.
 */
export function getFriendlyDatabaseError(
  error: unknown,
  fallback = "Nie udało się połączyć z bazą danych. Spróbuj ponownie za chwilę.",
): string {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";

  const message = raw.toLowerCase();
  const looksLikeHtml =
    raw.includes("<!DOCTYPE") ||
    raw.includes("<html") ||
    raw.includes("cf-error") ||
    raw.includes("Error code 521") ||
    raw.includes("Web server is down");

  if (
    looksLikeHtml ||
    message.includes("error code 521") ||
    message.includes("web server is down") ||
    message.includes("enotfound") ||
    message.includes("econnrefused") ||
    message.includes("econnreset") ||
    message.includes("fetch failed") ||
    message.includes("failed to fetch") ||
    message.includes("network") ||
    message.includes("paused")
  ) {
    return "Baza Supabase jest niedostępna (prawdopodobnie pauza free-tier). Wejdź na supabase.com/dashboard, kliknij Restore przy projekcie wedding i odśwież stronę. Dane gości nie giną przy pauzie.";
  }

  if (raw.trim().length === 0 || raw.length > 240) {
    return fallback;
  }

  return raw;
}

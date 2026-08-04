import type { AdminStats } from "@/app/actions/admin";

export type RsvpProgress = {
  expectedCount: number | null;
  respondedCount: number;
  awaitingResponses: number | null;
  progressPercent: number | null;
  dbPendingCount: number;
};

export function computeRsvpProgress(
  stats: AdminStats,
  expectedCount: number | null,
): RsvpProgress {
  const respondedCount = stats.respondedCount;
  const awaitingResponses =
    expectedCount !== null
      ? Math.max(expectedCount - respondedCount, 0)
      : null;
  const progressPercent =
    expectedCount !== null && expectedCount > 0
      ? Math.min(Math.round((respondedCount / expectedCount) * 100), 100)
      : null;

  return {
    expectedCount,
    respondedCount,
    awaitingResponses,
    progressPercent,
    dbPendingCount: stats.pendingCount,
  };
}

export function parseExpectedCountInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = Number.parseInt(trimmed, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

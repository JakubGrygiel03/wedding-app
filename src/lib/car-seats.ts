/** Car-seat count is stored in unused `plus_one_name` until a dedicated column exists. */

export function parseCarSeats(value: string | number | null | undefined): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return clampCarSeats(value);
  }

  const parsed = Number.parseInt(String(value ?? "0"), 10);
  return Number.isFinite(parsed) ? clampCarSeats(parsed) : 0;
}

export function serializeCarSeats(value: number): string {
  return String(clampCarSeats(value));
}

function clampCarSeats(value: number): number {
  return Math.max(0, Math.min(9, Math.trunc(value)));
}

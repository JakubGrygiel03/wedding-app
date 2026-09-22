/** Clamp guest-provided seat/transport counts to a safe 0–9 range. */

export function parseCarSeats(value: string | number | null | undefined): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return clampCarSeats(value);
  }

  const parsed = Number.parseInt(String(value ?? "0"), 10);
  return Number.isFinite(parsed) ? clampCarSeats(parsed) : 0;
}

export function clampCarSeats(value: number): number {
  return Math.max(0, Math.min(9, Math.trunc(value)));
}

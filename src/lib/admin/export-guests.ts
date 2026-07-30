import { DIET_OPTIONS } from "@/lib/validations/rsvp";
import type { AdminGuestRow, AdminStats } from "@/app/actions/admin";

function formatAttendance(value: boolean | null): string {
  if (value === true) return "Tak";
  if (value === false) return "Nie";
  return "Oczekuje";
}

function formatBoolean(value: boolean): string {
  return value ? "Tak" : "Nie";
}

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

export function guestsToCsv(guests: AdminGuestRow[]): string {
  const headers = [
    "Imię",
    "Obecność",
    "Dieta",
    "+1",
    "Dieta +1",
    "Nocleg",
    "Wiadomość",
    "Zaktualizowano",
  ];

  const rows = guests.map((guest) =>
    [
      guest.guestName,
      formatAttendance(guest.isAttending),
      guest.diet ?? "",
      formatBoolean(guest.plusOne),
      guest.plusOneDiet ?? "",
      formatBoolean(guest.accommodationNeeded),
      guest.message ?? "",
      guest.updatedAt,
    ]
      .map((cell) => escapeCsvCell(cell))
      .join(","),
  );

  return `\uFEFF${[headers.join(","), ...rows].join("\r\n")}`;
}

export function getOrderedDietCounts(
  dietCounts: AdminStats["dietCounts"],
): { label: string; count: number }[] {
  const knownLabels = new Set<string>(DIET_OPTIONS);

  const known = DIET_OPTIONS.map((label) => ({
    label,
    count: dietCounts[label] ?? 0,
  })).filter((item) => item.count > 0);

  const unknown = Object.entries(dietCounts)
    .filter(([label]) => !knownLabels.has(label))
    .map(([label, count]) => ({ label, count: count as number }));

  return [...known, ...unknown];
}

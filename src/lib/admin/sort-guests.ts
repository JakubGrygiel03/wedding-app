import type { AdminGuestRow } from "@/app/actions/admin";

export type GuestSortColumn =
  | "guestName"
  | "isAttending"
  | "diet"
  | "plusOne"
  | "plusOneDiet"
  | "availableCarSeats"
  | "message";

export type SortDirection = "asc" | "desc";

function compareText(a: string | null | undefined, b: string | null | undefined): number {
  const left = (a ?? "").trim().toLocaleLowerCase("pl");
  const right = (b ?? "").trim().toLocaleLowerCase("pl");

  if (!left && !right) return 0;
  if (!left) return 1;
  if (!right) return -1;

  return left.localeCompare(right, "pl");
}

function compareAttendance(
  a: boolean | null,
  b: boolean | null,
): number {
  const rank = (value: boolean | null) => {
    if (value === true) return 2;
    if (value === null) return 1;
    return 0;
  };

  return rank(a) - rank(b);
}

function compareBoolean(a: boolean, b: boolean): number {
  return Number(a) - Number(b);
}

function compareNumber(a: number, b: number): number {
  return a - b;
}

function compareGuests(
  a: AdminGuestRow,
  b: AdminGuestRow,
  column: GuestSortColumn,
): number {
  switch (column) {
    case "guestName":
      return compareText(a.guestName, b.guestName);
    case "isAttending":
      return compareAttendance(a.isAttending, b.isAttending);
    case "diet":
      return compareText(a.diet, b.diet);
    case "plusOne":
      return compareBoolean(a.plusOne, b.plusOne);
    case "plusOneDiet":
      return compareText(a.plusOneDiet, b.plusOneDiet);
    case "availableCarSeats":
      return compareNumber(a.availableCarSeats, b.availableCarSeats);
    case "message":
      return compareText(a.message, b.message);
    default:
      return 0;
  }
}

export function sortGuestRows(
  guests: AdminGuestRow[],
  column: GuestSortColumn,
  direction: SortDirection,
): AdminGuestRow[] {
  const factor = direction === "asc" ? 1 : -1;

  return [...guests].sort(
    (a, b) => compareGuests(a, b, column) * factor,
  );
}

export const GUEST_SORT_LABELS: Record<GuestSortColumn, string> = {
  guestName: "Imię",
  isAttending: "Obecność",
  diet: "Dieta",
  plusOne: "+1",
  plusOneDiet: "Dieta +1",
  availableCarSeats: "Miejsca w aucie",
  message: "Wiadomość",
};

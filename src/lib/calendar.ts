export interface WeddingCalendarEvent {
  title: string;
  description?: string;
  location: string;
  /** ISO local datetime, e.g. 2027-01-16T16:00:00 */
  start: string;
  /** ISO local datetime; defaults to end of day if omitted */
  end?: string;
}

function parseLocalIso(iso: string): Date {
  const [datePart, timePart = "00:00:00"] = iso.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes, seconds = 0] = timePart.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes, seconds);
}

function formatGoogleCalendarDate(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  );
}

function formatIcsUtc(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

export function buildGoogleCalendarUrl(event: WeddingCalendarEvent): string {
  const start = parseLocalIso(event.start);
  const end = event.end
    ? parseLocalIso(event.end)
    : new Date(start.getTime() + 8 * 60 * 60 * 1000);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${formatGoogleCalendarDate(start)}/${formatGoogleCalendarDate(end)}`,
    location: event.location,
  });

  if (event.description) {
    params.set("details", event.description);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildIcsFileContent(
  event: WeddingCalendarEvent,
  uid?: string,
): string {
  const start = parseLocalIso(event.start);
  const end = event.end
    ? parseLocalIso(event.end)
    : new Date(start.getTime() + 8 * 60 * 60 * 1000);
  const stamp = formatIcsUtc(new Date());
  const eventUid =
    uid ?? `wedding-${start.getTime()}@adrianna-jan-wedding.app`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Adrianna & Jan Wedding//PL",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${eventUid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${formatGoogleCalendarDate(start)}`,
    `DTEND:${formatGoogleCalendarDate(end)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `LOCATION:${escapeIcsText(event.location)}`,
  ];

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`);
  }

  lines.push("END:VEVENT", "END:VCALENDAR");

  return `${lines.join("\r\n")}\r\n`;
}

export function downloadIcsFile(
  event: WeddingCalendarEvent,
  filename = "slub-adrianna-jan.ics",
): void {
  const content = buildIcsFileContent(event);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export const DEFAULT_WEDDING_CALENDAR_EVENT: WeddingCalendarEvent = {
  title: "Ślub i Wesele Adrianny i Jana",
  description:
    "Zapraszamy na ślub i wesele Adrianny i Jana. Szczegóły harmonogramu znajdziesz na stronie zaproszenia.",
  location: "Hotel Trylogia, ul. Poniatowskiego 46/46A, 05-220 Zielonka",
  start: "2027-01-16T16:00:00",
  end: "2027-01-17T02:00:00",
};

/** Shared wedding content — single source of truth for dates and copy. */

/**
 * Flip to `true` to show the public schedule and the admin Harmonogram tab.
 * All schedule code stays in the repo while this is off.
 */
export const SHOW_SCHEDULE = false;

export const RSVP_DEADLINE_ISO = "2026-11-01";

/** Human-readable deadline shown in FAQ, RSVP form, etc. */
export const RSVP_DEADLINE_LABEL = "1 listopada 2026 r.";

export const RSVP_DEADLINE_SHORT = "1.11.2026";

export const CEREMONY = {
  datetimeIso: "2027-01-16T16:00:00",
  dateLabel: "16 stycznia 2027",
  timeLabel: "16:00",
  displayDateTime: "sobota, 16 stycznia 2027, godz. 16:00",
  placeName: "Kościół pw. Matki Bożej Częstochowskiej",
  city: "Wołomin",
  address: "ul. Kościelna 54",
} as const;

export const RECEPTION = {
  datetimeIso: "2027-01-16T17:30:00",
  timeLabel: "17:30",
  endsAtIso: "2027-01-17T03:30:00",
  placeName: "Hotel Trylogia",
  city: "Sala Rycerska",
  address: "ul. Poniatowskiego 46/46A, 05-220 Zielonka",
} as const;

/** Contact numbers — update here when needed. */
export const BRIDE_CONTACT = {
  name: "Adrianna",
  label: "Panna Młoda (Adrianna)",
  phone: "888704363",
  phoneDisplay: "888 704 363",
} as const;

export const GROOM_CONTACT = {
  name: "Jan",
  label: "Pan Młody (Jan)",
  phone: "731707704",
  phoneDisplay: "731 707 704",
} as const;

export const RSVP_CONTACT_OPTIONS = [BRIDE_CONTACT, GROOM_CONTACT] as const;

export function formatRsvpDeadlineMessage(): string {
  return `Prosimy o wypełnienie formularza do ${RSVP_DEADLINE_LABEL}, wasza odpowiedź pomoże nam lepiej zaplanować ten wyjątkowy dzień.`;
}

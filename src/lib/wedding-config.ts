/** Shared wedding content — single source of truth for dates and copy. */

export const RSVP_DEADLINE_ISO = "2026-11-15";

/** Human-readable deadline shown in FAQ, RSVP form, etc. */
export const RSVP_DEADLINE_LABEL = "15 listopada 2026 r.";

export const RSVP_DEADLINE_SHORT = "15.11.2026";

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

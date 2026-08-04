/** Reserved guest row token — stores expected RSVP count in `message`. */
export const EXPECTED_RSVP_SETTING_TOKEN = "__expected_rsvp_setting__";

export function isExpectedRsvpSettingToken(token: string | null | undefined): boolean {
  return token === EXPECTED_RSVP_SETTING_TOKEN;
}

export function filterGuestRows<T extends { token?: string | null }>(rows: T[]): T[] {
  return rows.filter((row) => !isExpectedRsvpSettingToken(row.token));
}

export function parseExpectedRsvpCount(message: string | null | undefined): number | null {
  if (!message?.trim()) return null;

  const parsed = Number.parseInt(message.trim(), 10);
  return Number.isNaN(parsed) ? null : parsed;
}

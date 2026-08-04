import { z } from "zod";

export const expectedRsvpCountSchema = z
  .number()
  .int("Podaj liczbę całkowitą.")
  .min(1, "Liczba zaproszeń musi być co najmniej 1.")
  .max(9999, "Liczba zaproszeń nie może przekraczać 9999.");

export type ExpectedRsvpCountInput = z.infer<typeof expectedRsvpCountSchema>;

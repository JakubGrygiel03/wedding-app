import { z } from "zod";

export const DIET_OPTIONS = [
  "Standardowa",
  "Wegetariańska",
  "Wegańska",
  "Bezglutenowa",
  "Bez laktozy",
] as const;

export type DietOption = (typeof DIET_OPTIONS)[number];

const seatCountSchema = z
  .number({ message: "Podaj liczbę całkowitą." })
  .int("Podaj liczbę całkowitą.")
  .min(0, "Liczba nie może być ujemna.")
  .max(9, "Podaj liczbę od 0 do 9.");

export const rsvpSchema = z
  .object({
    guestName: z
      .string()
      .trim()
      .min(2, "Podaj imię i nazwisko (min. 2 znaki)."),
    isAttending: z.boolean({
      message: "Potwierdź, czy weźmiesz udział w weselu.",
    }),
    plusOne: z.boolean(),
    plusOneName: z
      .string()
      .trim()
      .max(120, "Imię i nazwisko może mieć maksymalnie 120 znaków.")
      .optional(),
    plusOneDiet: z.enum(DIET_OPTIONS).optional(),
    diet: z.enum(DIET_OPTIONS, {
      message: "Wybierz preferencje dietetyczne.",
    }),
    availableCarSeats: seatCountSchema,
    transportNeeded: seatCountSchema,
    message: z
      .string()
      .trim()
      .max(500, "Wiadomość może mieć maksymalnie 500 znaków.")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (!(data.isAttending && data.plusOne)) return;

    if (!data.plusOneName || data.plusOneName.length < 2) {
      ctx.addIssue({
        code: "custom",
        message: "Podaj imię i nazwisko osoby towarzyszącej.",
        path: ["plusOneName"],
      });
    }

    if (!data.plusOneDiet) {
      ctx.addIssue({
        code: "custom",
        message: "Wybierz preferencje dietetyczne osoby towarzyszącej.",
        path: ["plusOneDiet"],
      });
    }
  });

export type RsvpFormValues = z.infer<typeof rsvpSchema>;

export const rsvpDefaultValues: RsvpFormValues = {
  guestName: "",
  isAttending: true,
  plusOne: false,
  plusOneName: undefined,
  plusOneDiet: undefined,
  diet: "Standardowa",
  availableCarSeats: 0,
  transportNeeded: 0,
  message: "",
};

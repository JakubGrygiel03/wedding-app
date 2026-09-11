import { z } from "zod";

export const DIET_OPTIONS = [
  "Standardowa",
  "Wegetariańska",
  "Wegańska",
  "Bezglutenowa",
  "Bez laktozy",
] as const;

export type DietOption = (typeof DIET_OPTIONS)[number];

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
    plusOneDiet: z.enum(DIET_OPTIONS).optional(),
    diet: z.enum(DIET_OPTIONS, {
      message: "Wybierz preferencje dietetyczne.",
    }),
    availableCarSeats: z
      .number({ message: "Podaj liczbę wolnych miejsc w aucie." })
      .int("Podaj liczbę całkowitą.")
      .min(0, "Liczba miejsc nie może być ujemna.")
      .max(9, "Podaj liczbę miejsc od 0 do 9."),
    message: z
      .string()
      .trim()
      .max(500, "Wiadomość może mieć maksymalnie 500 znaków.")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isAttending && data.plusOne && !data.plusOneDiet) {
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
  plusOneDiet: undefined,
  diet: "Standardowa",
  availableCarSeats: 0,
  message: "",
};

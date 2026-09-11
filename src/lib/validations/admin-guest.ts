import { z } from "zod";

import { DIET_OPTIONS } from "@/lib/validations/rsvp";

export const adminGuestSchema = z
  .object({
    guestName: z
      .string()
      .trim()
      .min(2, "Podaj imię i nazwisko (min. 2 znaki)."),
    isAttending: z.boolean().nullable(),
    plusOne: z.boolean(),
    plusOneDiet: z.enum(DIET_OPTIONS).optional(),
    diet: z.enum(DIET_OPTIONS).optional().nullable(),
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
    if (data.isAttending === true) {
      if (!data.diet) {
        ctx.addIssue({
          code: "custom",
          message: "Wybierz preferencje dietetyczne.",
          path: ["diet"],
        });
      }

      if (data.plusOne && !data.plusOneDiet) {
        ctx.addIssue({
          code: "custom",
          message: "Wybierz preferencje dietetyczne osoby towarzyszącej.",
          path: ["plusOneDiet"],
        });
      }
    }
  });

export type AdminGuestFormValues = z.infer<typeof adminGuestSchema>;

export const adminGuestDefaultValues: AdminGuestFormValues = {
  guestName: "",
  isAttending: null,
  plusOne: false,
  plusOneDiet: undefined,
  diet: "Standardowa",
  availableCarSeats: 0,
  message: "",
};

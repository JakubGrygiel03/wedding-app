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
    accommodationNeeded: z.boolean(),
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
  accommodationNeeded: false,
  message: "",
};

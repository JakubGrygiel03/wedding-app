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
    accommodationNeeded: z.boolean(),
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
  accommodationNeeded: false,
  message: "",
};

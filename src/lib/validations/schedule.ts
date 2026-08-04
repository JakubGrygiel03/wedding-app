import { z } from "zod";

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export const scheduleEventSchema = z.object({
  title: z.string().trim().min(1, "Podaj tytuł wydarzenia."),
  eventTime: z
    .string()
    .trim()
    .regex(timePattern, "Podaj godzinę w formacie HH:MM (np. 14:30)."),
  description: z
    .string()
    .trim()
    .max(1000, "Opis może mieć maksymalnie 1000 znaków.")
    .optional(),
  orderIndex: z
    .number()
    .int("Kolejność musi być liczbą całkowitą.")
    .min(0, "Kolejność nie może być ujemna."),
});

export type ScheduleEventFormValues = z.infer<typeof scheduleEventSchema>;

export const scheduleEventDefaultValues: ScheduleEventFormValues = {
  title: "",
  eventTime: "12:00",
  description: "",
  orderIndex: 0,
};

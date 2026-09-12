import { z } from "zod";

export const changeAdminPasswordSchema = z
  .object({
    currentPassword: z.string().trim().min(1, "Podaj obecne hasło."),
    newPassword: z
      .string()
      .min(8, "Nowe hasło musi mieć co najmniej 8 znaków.")
      .max(128, "Hasło nie może przekraczać 128 znaków."),
    confirmPassword: z.string().min(1, "Potwierdź nowe hasło."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Hasła nie są takie same.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "Nowe hasło musi różnić się od obecnego.",
    path: ["newPassword"],
  });

export type ChangeAdminPasswordValues = z.infer<typeof changeAdminPasswordSchema>;

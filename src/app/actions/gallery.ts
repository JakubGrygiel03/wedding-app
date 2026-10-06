"use server";

import { isAdminAuthenticated } from "@/lib/admin/auth";
import {
  imageValidationMessage,
  validateImageUpload,
} from "@/lib/media/image-constraints";

/**
 * Gallery files stay on an external album (photographer / Google Photos).
 * This guard exists so an admin upload UI cannot fill Vercel or Supabase storage.
 */
export async function uploadGalleryImage(input: {
  byteLength: number;
  mimeType: string;
  currentFileCount: number;
}): Promise<{ success: false; error: string }> {
  if (!(await isAdminAuthenticated())) {
    return { success: false, error: "Brak autoryzacji." };
  }

  const validationError = validateImageUpload(input);
  if (validationError) {
    return { success: false, error: imageValidationMessage(validationError) };
  }

  return {
    success: false,
    error:
      "Zdjęcia z wesela trzymaj w albumie zewnętrznym. Ta strona nie zapisuje kolejnych kopii w storage.",
  };
}

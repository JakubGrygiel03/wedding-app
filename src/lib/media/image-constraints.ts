/** Hard limits so admin uploads cannot fill storage or RAM. */

export const IMAGE_CONSTRAINTS = {
  maxBytes: 1_200_000,
  maxWidth: 1920,
  maxHeight: 1920,
  maxFiles: 24,
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"] as const,
} as const;

export type ImageValidationError =
  | "too-large"
  | "unsupported-type"
  | "too-many"
  | "empty";

export function validateImageUpload(input: {
  byteLength: number;
  mimeType: string;
  currentFileCount: number;
}): ImageValidationError | null {
  if (input.byteLength <= 0) return "empty";
  if (input.currentFileCount >= IMAGE_CONSTRAINTS.maxFiles) return "too-many";
  if (input.byteLength > IMAGE_CONSTRAINTS.maxBytes) return "too-large";

  const allowed: readonly string[] = IMAGE_CONSTRAINTS.allowedMimeTypes;
  if (!allowed.includes(input.mimeType)) return "unsupported-type";

  return null;
}

export function imageValidationMessage(error: ImageValidationError): string {
  switch (error) {
    case "too-large":
      return "Zdjęcie jest za duże. Wrzuć plik do 1,2 MB (najlepiej WebP/JPEG).";
    case "unsupported-type":
      return "Dozwolone są tylko JPEG, PNG i WebP.";
    case "too-many":
      return "Osiągnięto limit zdjęć w storage. Usuń stare pliki albo użyj albumu zewnętrznego.";
    case "empty":
      return "Plik jest pusty.";
  }
}

/** Wedding palette — see WEDDING_CONCEPT.md */
export const weddingTheme = {
  primary: "#4A6B5D",
  accent: "#D4AF37",
  background: "#FAF9F6",
  surface: "#FFFFFF",
  text: "#1A1A1A",
} as const;

export type WeddingTheme = typeof weddingTheme;

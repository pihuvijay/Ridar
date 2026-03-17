import { SPACING, BORDER_RADIUS, FONT_SIZES } from "./colors";

export type ThemeColors = {
  primary: string;
  background: string;
  cardBackground: string;
  text: string;
  textSecondary: string;
  textLight: string;
  border: string;
  primaryLight: string;
  success: string;
};

export const LIGHT_THEME: ThemeColors = {
  primary: "#1a4d2e",
  background: "#ffffff",
  cardBackground: "#ffffff",
  text: "#1a4d2e",
  textSecondary: "#1a4d2e70",
  textLight: "#ffffff",
  border: "#1a4d2e33",
  primaryLight: "#f0f4f1",
  success: "#0ea574",
};

export const DARK_THEME: ThemeColors = {
  primary: "#e6f7ee",
  background: "#0b1220",
  cardBackground: "#0f1724",
  text: "#e6f7ee",
  textSecondary: "#cbd5e1",
  textLight: "#ffffff",
  border: "#1f2937",
  primaryLight: "#0b1220",
  success: "#34d399",
};

export { SPACING, BORDER_RADIUS, FONT_SIZES };

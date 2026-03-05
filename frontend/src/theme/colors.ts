// Forest Green Theme Color Palette
export const COLORS = {
  // Primary Green
  primary: '#1a4d2e',
  primaryHover: '#2d5f4d',
  primaryLight: '#f0f4f1', // bg-[#1a4d2e]/5 equivalent
  primaryVeryLight: '#e8ede8', // bg-[#1a4d2e]/10 equivalent

  // Backgrounds
  background: '#ffffff',
  backgroundAlt: '#f9f9f9',
  cardBackground: '#ffffff',

  // Text Colors
  text: '#1a4d2e', // Primary text
  textSecondary: '#1a4d2e70', // text-[#1a4d2e]/70
  textLight: '#ffffff',
  textLightSecondary: '#e8ede8',

  // Borders
  border: '#1a4d2e33', // border-[#1a4d2e]/20
  borderLight: '#d0d5db',
  borderDark: '#1a4d2e',

  // Status Colors (Kept as requested)
  success: '#0ea574', // Green for positive actions
  warning: '#fbbf24', // Yellow for warnings
  danger: '#dc2626', // Red for warnings/reports
  info: '#3b82f6', // Blue for information

  // Accent Colors
  accentYellow: '#fcd34d', // Creator crown badges
  accentGreen: '#10b981', // Alternative green for accents

  // Utility
  disabled: '#9ca3af',
  overlay: '#00000047', // Slight black overlay
};

// Common style constants
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FONT_WEIGHTS = {
  light: '300' as const,
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

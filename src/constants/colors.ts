// Premium color palette for the Guitar Patch Manager app
export const COLORS = {
  background: '#0E0E0F',
  surface: '#1A1A1E',
  primary: '#F5A623', // amber - active LED
  secondary: '#3A86FF', // electric blue
  textPrimary: '#F0F0F0',
  textSecondary: '#7A7A8A',
  border: '#2C2C34',
  danger: '#E03E3E',
  ledOff: '#3A3A42',
} as const;

// Categorized badge colors matching each G1 patch module type
export const BADGE_COLORS = {
  DRIVE: '#FF6B35',
  COMP: '#9B59B6',
  MODULATION: '#3A86FF',
  DELAY: '#2ECC71',
  REVERB: '#1ABC9C',
  ZNR: '#F39C12',
  EQ: '#95A5A6',
} as const;

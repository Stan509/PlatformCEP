/** Rayons (spec §7) — petit 8, standard 12, grand 16, très grand 20–24. */
export const radii = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  full: '9999px',
} as const;

export const radiusDefinitions = {
  small: radii.sm,
  standard: radii.md,
  large: radii.lg,
  'very-large': radii.xl,
} as const;

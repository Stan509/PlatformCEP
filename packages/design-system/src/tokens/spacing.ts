/**
 * Grille d'espacement de base 4 px (spec §6).
 * Les interfaces doivent respirer : privilégier les grands espacements.
 */
export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '24px',
  6: '32px',
  7: '40px',
  8: '48px',
  9: '64px',
  10: '80px',
  11: '96px',
} as const;

export type SpacingToken = keyof typeof spacing;

/** Alias sémantiques lisibles pour les composants. */
export const inset = {
  xs: spacing[1],
  sm: spacing[2],
  md: spacing[3],
  lg: spacing[4],
  xl: spacing[5],
  '2xl': spacing[6],
  '3xl': spacing[7],
} as const;

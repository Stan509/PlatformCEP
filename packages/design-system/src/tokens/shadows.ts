/**
 * Élévations / ombres (spec §7) — très discrètes, jamais lourdes.
 * Les ombres servent uniquement à distinguer une surface flottante.
 */
export const shadows = {
  none: 'none',
  xs: '0 1px 2px rgba(17, 24, 39, 0.05)',
  sm: '0 1px 3px rgba(17, 24, 39, 0.08)',
  md: '0 4px 12px rgba(17, 24, 39, 0.08)',
  lg: '0 10px 28px rgba(17, 24, 39, 0.12)',
  modal: '0 24px 60px rgba(17, 24, 39, 0.20)',
} as const;

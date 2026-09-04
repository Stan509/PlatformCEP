/**
 * Breakpoints (spec §43) — mobile-first pour le public, desktop-first pour
 * l'admin, device-first pour les APK. La valeur `px` sert aux media queries.
 */
export const breakpoints = {
  mobile: 480,
  tablet: 768,
  laptop: 1024,
  desktop: 1280,
  'large-desktop': 1536,
} as const;

export const media = {
  upMobile: `@media (min-width: ${breakpoints.mobile}px)`,
  upTablet: `@media (min-width: ${breakpoints.tablet}px)`,
  upLaptop: `@media (min-width: ${breakpoints.laptop}px)`,
  upDesktop: `@media (min-width: ${breakpoints.desktop}px)`,
} as const;

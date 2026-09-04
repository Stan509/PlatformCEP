/**
 * Typographie — police principale « Inter ».
 * Hiérarchie définie par le Design Complet (§5) et le Document Maître (§14).
 * Pour les interfaces bureau de vote, le texte ne descend jamais sous 18 px
 * et les actions principales se situent entre 20 et 26 px.
 */
export const fonts = {
  family: '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  } as const,
} as const;

export const fontSizes = {
  caption: '0.75rem', // 12px
  'caption-lg': '0.8125rem', // 13px
  small: '0.875rem', // 14px
  body: '1rem', // 16px
  'body-lg': '1.125rem', // 18px
  h3: '1.375rem', // 22px
  h2: '1.75rem', // 28px
  'h2-lg': '2rem', // 32px
  h1: '2.25rem', // 36px
  display: '3rem', // 48px
} as const;

export const lineHeights = {
  tight: 1.2,
  snug: 1.35,
  normal: 1.55,
  relaxed: 1.7,
} as const;

export const letterSpacing = {
  tight: '-0.01em',
  normal: '0',
  wide: '0.02em',
} as const;

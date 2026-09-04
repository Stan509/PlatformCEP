/**
 * Animations (spec §49) — micro-interactions 150–250 ms,
 * transitions majeures 250–400 ms. Aucune animation décorative pendant une
 * opération électorale critique. Respect de `prefers-reduced-motion`.
 */
export const motion = {
  duration: {
    fast: '150ms',
    normal: '250ms',
    slow: '400ms',
  } as const,
  easing: {
    easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  } as const,
} as const;

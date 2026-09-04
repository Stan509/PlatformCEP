import { breakpoints } from '../tokens/breakpoints.js';
import { colors } from '../tokens/colors.js';
import { motion } from '../tokens/motion.js';
import { radii } from '../tokens/radius.js';
import { shadows } from '../tokens/shadows.js';
import { spacing } from '../tokens/spacing.js';
import { fonts, fontSizes, lineHeights } from '../tokens/typography.js';

/**
 * Thème agrégé — unique source de vérité visuelle.
 * Les composants ne lisent pas les couleurs en dur : ils passent par ce thème
 * ou par les variables CSS générées (`cep-*`).
 */
export const theme = {
  colors,
  spacing,
  radii,
  shadows,
  motion,
  breakpoints,
  fonts,
  fontSizes,
  lineHeights,
} as const;

export type Theme = typeof theme;

/** Transforme l'objet thème en paires `--cep-*` (camelCase → kebab-case). */
function toKebab(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/** Génère le bloc `:root { --cep-...: ... }` à partir des tokens. */
export function themeToCssVariables(t: Theme): string {
  const entries: string[] = [];
  const push = (key: string, val: string | number) => {
    entries.push(`  --cep-${toKebab(key)}: ${val};`);
  };

  Object.entries(t.colors).forEach(([k, v]) => push(`color-${k}`, v));
  Object.entries(t.spacing).forEach(([k, v]) => push(`space-${k}`, v));
  Object.entries(t.radii).forEach(([k, v]) => push(`radius-${k}`, v));
  Object.entries(t.shadows).forEach(([k, v]) => push(`shadow-${k}`, v));
  Object.entries(t.fontSizes).forEach(([k, v]) => push(`font-size-${k}`, v));
  Object.entries(t.breakpoints).forEach(([k, v]) => push(`bp-${k}`, v));

  push('font-family', t.fonts.family);
  push('font-weight-regular', t.fonts.weights.regular);
  push('font-weight-medium', t.fonts.weights.medium);
  push('font-weight-semibold', t.fonts.weights.semibold);
  push('font-weight-bold', t.fonts.weights.bold);
  push('line-height-tight', t.lineHeights.tight);
  push('line-height-snug', t.lineHeights.snug);
  push('line-height-normal', t.lineHeights.normal);
  push('line-height-relaxed', t.lineHeights.relaxed);
  push('duration-fast', t.motion.duration.fast);
  push('duration-normal', t.motion.duration.normal);
  push('duration-slow', t.motion.duration.slow);
  push('easing-ease-out', t.motion.easing.easeOut);
  push('easing-ease-in-out', t.motion.easing.easeInOut);

  return `:root {\n${entries.join('\n')}\n}`;
}

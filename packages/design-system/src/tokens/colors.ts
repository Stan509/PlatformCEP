/**
 * @cep/design-system — Palette officielle CEP.
 *
 * RÈGLE DE NEUTRALITÉ : aucune couleur ne doit être associée à un candidat,
 * un parti, une région ou un camp politique. Les couleurs d'état (Success /
 * Warning / Danger) sont strictement sémantiques et ne décorent jamais.
 */
export const colors = {
  // Identité institutionnelle
  'cep-blue': '#0A4A7A', // couleur institutionnelle principale
  'deep-blue': '#073B61', // navigation, titres forts
  'light-blue': '#EAF4FB', // surfaces institutionnelles
  white: '#FFFFFF', // surfaces principales

  // Surfaces & texte
  background: '#F5F7F9', // arrière-plan général
  surface: '#FFFFFF', // cartes / panneaux
  text: '#111827', // texte principal
  'text-secondary': '#667085', // texte secondaire
  'text-muted': '#98A2B3', // texte atténué
  border: '#E4E7EC', // séparateurs

  // États sémantiques
  success: '#168A5B',
  'success-surface': '#E7F5EE',
  'success-text': '#0E6B45',
  warning: '#D98A00',
  'warning-surface': '#FDF3E3',
  'warning-text': '#A56A00',
  danger: '#C93636',
  'danger-surface': '#FBEAEA',
  'danger-text': '#A82A2A',

  // États interactifs & focus
  'cep-blue-hover': '#0E5E94',
  'cep-blue-active': '#083A5E',
  'focus-ring': 'rgba(10, 74, 122, 0.35)',
  'overlay': 'rgba(17, 24, 39, 0.45)',
} as const;

export type ColorToken = keyof typeof colors;

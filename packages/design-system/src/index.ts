/**
 * @cep/design-system — point d'entrée.
 * Exporte les tokens, le thème (objet + générateur CSS var) et les composants.
 */
export * from './tokens/index.js';
export { theme, themeToCssVariables } from './theme/index.js';
export type { Theme } from './theme/index.js';
export * from './components/index.js';
export { useAsync } from './hooks/useAsync.js';
export type { AsyncState, UseAsyncResult } from './hooks/useAsync.js';
export { useOnline } from './hooks/useOnline.js';

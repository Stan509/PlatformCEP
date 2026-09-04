import { useContext } from 'react';
import { I18nContext } from './context.js';
import type { I18nContextValue } from './types.js';

/** Hook d'accès aux traductions. À utiliser uniquement sous <I18nProvider>. */
export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within <I18nProvider>.');
  }
  return ctx;
}

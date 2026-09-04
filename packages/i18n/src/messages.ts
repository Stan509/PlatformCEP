import { LanguageCode } from '@cep/shared-types';
import ht from '../locales/ht.json';
import fr from '../locales/fr.json';
import en from '../locales/en.json';

/**
 * Registre des messages par langue.
 * Les fichiers `.json` dans `locales/` sont la source de vérité éditable.
 * L'import JSON est embarqué par le bundler (Vite/apps) au build.
 */
export const messages: Record<LanguageCode, Record<string, unknown>> = {
  ht,
  fr,
  en,
};

export const supportedLanguages: readonly LanguageCode[] = ['ht', 'fr', 'en'];

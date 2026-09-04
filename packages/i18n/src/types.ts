import type { LanguageCode } from '@cep/shared-types';

/** Paramètres de traduction : interpolation + pluralisation par count. */
export interface TranslateParams {
  count?: number;
  [key: string]: string | number | undefined;
}

/** Signature de la fonction de traduction. */
export type TFunction = (key: string, params?: TranslateParams) => string;

export interface I18nContextValue {
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  t: TFunction;
}

import { useMemo, useState } from 'react';
import type { JSX, ReactNode } from 'react';
import type { LanguageCode } from '@cep/shared-types';
import { I18nContext } from './context.js';
import { messages } from './messages.js';
import type { TranslateParams } from './types.js';

const STORAGE_KEY = 'cep.lang';

/** Langue par défaut : Kreyòl (ordre institutionnel Kreyòl → Français → English). */
const DEFAULT_LANG: LanguageCode = 'ht';

function getStoredLang(): LanguageCode {
  if (typeof window === 'undefined') return DEFAULT_LANG;
  const raw = window.localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
  return raw === 'ht' || raw === 'fr' || raw === 'en' ? raw : DEFAULT_LANG;
}

function lookup(obj: unknown, dottedKey: string): unknown {
  let current: unknown = obj;
  for (const part of dottedKey.split('.')) {
    if (current === null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

/** Interpole `{param}` et `{count}` dans une chaîne. */
function interpolate(template: string, params?: TranslateParams): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = params?.[name];
    if (value === undefined) return match;
    return String(value);
  });
}

export function I18nProvider({ children }: { children: ReactNode }): JSX.Element {
  const [lang, setLangState] = useState<LanguageCode>(getStoredLang);

  const setLang = (next: LanguageCode) => {
    setLangState(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.setAttribute('lang', next);
    }
  };

  const value = useMemo(() => {
    const t = (key: string, params?: TranslateParams): string => {
      const dict = messages[lang];
      let candidateKey = key;

      // Pluralisation basique : <key>_one / <key>_other selon la langue.
      if (typeof params?.count === 'number') {
        const isOne =
          lang === 'en' ? params.count === 1 : lang === 'fr' ? params.count < 2 : params.count === 1;
        candidateKey = isOne ? `${key}_one` : `${key}_many`;
        let value = lookup(dict, candidateKey);
        if (typeof value !== 'string') {
          value = lookup(dict, `${key}_other`) ?? lookup(dict, key);
        }
        return interpolate(String(value ?? key), params);
      }

      const value = lookup(dict, candidateKey);
      return interpolate(typeof value === 'string' ? value : key, params);
    };

    return { lang, setLang, t };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

import type { JSX } from 'react';
import type { LanguageCode } from '@cep/shared-types';
import { useI18n, supportedLanguages } from '@cep/i18n';

const LABEL_KEY: Record<LanguageCode, string> = {
  ht: 'common.language.ht',
  fr: 'common.language.fr',
  en: 'common.language.en',
};

/**
 * Sélecteur de langue CEP — la langue sélectionnée est persistante (localStorage).
 * L'ordre proposé est institutionnel : Kreyòl → Français → English.
 */
export function LanguageSwitcher(): JSX.Element {
  const { lang, setLang, t } = useI18n();
  return (
    <div role="group" aria-label={t('common.language.label')} style={{ display: 'inline-flex', gap: 'var(--cep-space-1)' }}>
      {supportedLanguages.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          style={{
            cursor: 'pointer',
            font: 'inherit',
            fontSize: 'var(--cep-font-size-caption-lg)',
            fontWeight: lang === code ? 600 : 400,
            padding: 'var(--cep-space-1) var(--cep-space-3)',
            border: '1px solid var(--cep-color-border)',
            borderRadius: 'var(--cep-radius-full)',
            background: lang === code ? 'var(--cep-color-light-blue)' : 'var(--cep-color-white)',
            color: lang === code ? 'var(--cep-color-cep-blue)' : 'var(--cep-color-text-secondary)',
          }}
        >
          {t(LABEL_KEY[code])}
        </button>
      ))}
    </div>
  );
}

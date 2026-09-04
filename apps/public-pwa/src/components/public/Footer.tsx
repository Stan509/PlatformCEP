import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { LanguageSwitcher } from '@cep/design-system';

const LINKS = [
  { key: 'home', labelKey: 'public.nav.home' },
  { key: 'legal', labelKey: 'public.cycle.step1' },
  { key: 'privacy', labelKey: 'public.nav.info' },
  { key: 'contact', labelKey: 'public.nav.help' },
];

/** Pied de page institutionnel — minimisation, liens officiels. */
export function Footer(): JSX.Element {
  const { t } = useI18n();
  return (
    <footer
      style={{
        marginTop: 'auto',
        padding: 'var(--cep-space-6) var(--cep-space-6)',
        background: 'var(--cep-color-background)',
        borderTop: '1px solid var(--cep-color-border)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cep-space-3)', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--cep-space-4)' }}>
          <strong style={{ color: 'var(--cep-color-deep-blue)' }}>CEP — Konsèy Elektoral Pwovizwa</strong>
          <LanguageSwitcher />
        </div>
        <div style={{ display: 'flex', gap: 'var(--cep-space-5)', flexWrap: 'wrap' }}>
          {LINKS.map((link) => (
            <span key={link.key} style={{ color: 'var(--cep-color-text-secondary)', fontSize: 'var(--cep-font-size-small)' }}>
              {t(link.labelKey)}
            </span>
          ))}
        </div>
        <p style={{ color: 'var(--cep-color-text-muted)', fontSize: 'var(--cep-font-size-caption)', margin: 0 }}>
          {t('common.states.empty')}
        </p>
      </div>
    </footer>
  );
}

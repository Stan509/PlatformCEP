import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { LanguageSwitcher } from '@cep/design-system';
import type { Route } from '../../router';
import { navigate } from '../../router';

const NAV: { key: string; route: Route }[] = [
  { key: 'home', route: 'home' },
  { key: 'results', route: 'results' },
  { key: 'candidates', route: 'candidates' },
  { key: 'info', route: 'info' },
  { key: 'diaspora', route: 'diaspora' },
  { key: 'help', route: 'help' },
];

/** En-tête institutionnel — logo CEP (placeholder), navigation, langue. */
export function Header({ route }: { route: Route }): JSX.Element {
  const { t } = useI18n();
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--cep-space-5)',
        padding: 'var(--cep-space-4) var(--cep-space-6)',
        background: 'var(--cep-color-white)',
        borderBottom: '1px solid var(--cep-color-border)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        flexWrap: 'wrap',
      }}
    >
      <button
        type="button"
        aria-label={t('public.nav.home')}
        onClick={() => navigate('home')}
        style={{ border: 'none', background: 'none', cursor: 'pointer' }}
      >
        {/* Logo officiel CEP à intégrer ; ici placeholder institutionnel discret. */}
        <strong style={{ color: 'var(--cep-color-deep-blue)', fontSize: '1.25rem' }}>CEP</strong>
      </button>
      <nav aria-label="main" style={{ display: 'flex', gap: 'var(--cep-space-4)', flexWrap: 'wrap' }}>
        {NAV.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => navigate(item.route)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 'var(--cep-font-size-small)',
              color: route === item.route ? 'var(--cep-color-cep-blue)' : 'var(--cep-color-text-secondary)',
              fontWeight: route === item.route ? 600 : 400,
              padding: 'var(--cep-space-1) var(--cep-space-2)',
            }}
          >
            {t(`public.nav.${item.key}`)}
          </button>
        ))}
      </nav>
      <LanguageSwitcher />
    </header>
  );
}

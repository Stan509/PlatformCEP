import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { LanguageSwitcher } from '@cep/design-system';
import type { Route } from '../../router';
import { navigate } from '../../router';

const NAV: { key: string; route: Route; highlight?: boolean }[] = [
  { key: 'home', route: 'home' },
  { key: 'vote', route: 'vote', highlight: true },
  { key: 'check-status', route: 'check-status' },
  { key: 'register', route: 'register' },
  { key: 'candidates', route: 'candidates' },
  { key: 'results', route: 'results' },
  { key: 'diaspora', route: 'diaspora' },
  { key: 'info', route: 'info' },
  { key: 'help', route: 'help' },
];

/** En-tête institutionnel — logo CEP, navigation, langue. */
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
        style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
      >
        <div style={{
          background: 'var(--cep-color-deep-blue)',
          color: 'white',
          fontWeight: 900,
          padding: '4px 10px',
          borderRadius: '4px',
          letterSpacing: '1px'
        }}>
          CEP
        </div>
        <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
          <strong style={{ color: 'var(--cep-color-deep-blue)', fontSize: '1.05rem', display: 'block' }}>Conseil Électoral Provisoire</strong>
          <span style={{ fontSize: '0.75rem', color: '#666' }}>République d'Haïti</span>
        </div>
      </button>

      <nav aria-label="main" style={{ display: 'flex', gap: 'var(--cep-space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
        {NAV.map((item) => {
          if (item.highlight) {
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => navigate(item.route)}
                style={{
                  background: route === item.route ? '#001A4D' : 'var(--cep-color-deep-blue)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: 'var(--cep-font-size-small)',
                  fontWeight: 700,
                  padding: '6px 16px',
                  boxShadow: '0 2px 8px rgba(0, 32, 96, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🗳️</span> Voter (Isit la)
              </button>
            );
          }

          const labels: Record<string, string> = {
            'check-status': 'Vérifier Statut',
            'register': 'S\'inscrire',
            'diaspora': 'Diaspora'
          };
          const label = labels[item.key] || t(`public.nav.${item.key}`);

          return (
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
              {label}
            </button>
          );
        })}
      </nav>

      <LanguageSwitcher />
    </header>
  );
}

import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { LanguageSwitcher } from '@cep/design-system';
import type { Route } from '../../router';
import { navigate } from '../../router';

interface HeaderProps {
  route: Route;
}

const PRIMARY_NAV: { key: string; route: Route; highlight?: boolean }[] = [
  { key: 'home', route: 'home' },
  { key: 'vote', route: 'vote', highlight: true },
  { key: 'checkStatus', route: 'check-status' },
  { key: 'results', route: 'results' },
  { key: 'diaspora', route: 'diaspora' },
];

/** En-tête institutionnel CEP — Logo compact, navigation desktop & sélecteur de langue compact. */
export function Header({ route }: HeaderProps): JSX.Element {
  const { t } = useI18n();

  return (
    <header
      style={{
        background: 'var(--cep-color-white)',
        borderBottom: '1px solid var(--cep-color-border)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: 'var(--cep-shadow-xs)',
      }}
    >
      <div
        className="cep-header-container"
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: 'var(--cep-space-2) var(--cep-space-5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--cep-space-3)',
        }}
      >
        {/* Brand / Logo CEP — Ultra-compact sur Mobile */}
        <button
          type="button"
          aria-label={t('public.nav.home')}
          onClick={() => navigate('home')}
          style={{
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--cep-space-2)',
            padding: 0,
          }}
        >
          <div
            style={{
              background: 'var(--cep-color-cep-blue)',
              color: 'var(--cep-color-white)',
              fontWeight: 800,
              fontSize: '0.95rem',
              padding: '4px 8px',
              borderRadius: 'var(--cep-radius-sm)',
              letterSpacing: '1px',
              boxShadow: 'var(--cep-shadow-xs)',
              lineHeight: 1,
            }}
          >
            CEP
          </div>
          <div style={{ textAlign: 'left', lineHeight: 1.15 }}>
            <strong
              style={{
                color: 'var(--cep-color-deep-blue)',
                fontSize: '0.95rem',
                display: 'block',
                fontWeight: 700,
              }}
            >
              Conseil Électoral Provisoire
            </strong>
            <span className="cep-header-sub" style={{ fontSize: '0.7rem', color: 'var(--cep-color-text-secondary)' }}>
              République d'Haïti
            </span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav
          className="cep-desktop-nav"
          aria-label="main"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--cep-space-2)',
          }}
        >
          {PRIMARY_NAV.map((item) => {
            const isActive = route === item.route;

            if (item.highlight) {
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => navigate(item.route)}
                  style={{
                    background: isActive ? 'var(--cep-color-cep-blue-active)' : 'var(--cep-color-cep-blue)',
                    color: 'var(--cep-color-white)',
                    border: 'none',
                    borderRadius: 'var(--cep-radius-full)',
                    cursor: 'pointer',
                    fontSize: 'var(--cep-font-size-small)',
                    fontWeight: 700,
                    padding: '6px 16px',
                    boxShadow: 'var(--cep-shadow-sm)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>🗳️</span> {t('public.nav.vote')}
                </button>
              );
            }

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => navigate(item.route)}
                style={{
                  background: isActive ? 'var(--cep-color-light-blue)' : 'transparent',
                  border: 'none',
                  borderRadius: 'var(--cep-radius-sm)',
                  cursor: 'pointer',
                  fontSize: 'var(--cep-font-size-small)',
                  color: isActive ? 'var(--cep-color-cep-blue)' : 'var(--cep-color-text)',
                  fontWeight: isActive ? 600 : 500,
                  padding: '6px 12px',
                  transition: 'all 0.15s ease',
                }}
              >
                {t(`public.nav.${item.key}`)}
              </button>
            );
          })}
        </nav>

        {/* Compact Language Selector Component */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Embedded Responsive CSS Rules */}
      <style>{`
        @media (max-width: 768px) {
          .cep-desktop-nav {
            display: none !important;
          }
          .cep-header-sub {
            display: none !important;
          }
          .cep-header-container {
            padding: 8px 12px !important;
          }
        }
      `}</style>
    </header>
  );
}

import { useState } from 'react';
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

/** En-tête institutionnel CEP — Logo, navigation simplifiée & responsive, sélecteur de langue. */
export function Header({ route }: HeaderProps): JSX.Element {
  const { t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (r: Route) => {
    navigate(r);
    setMobileMenuOpen(false);
  };

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
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: 'var(--cep-space-3) var(--cep-space-5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--cep-space-4)',
        }}
      >
        {/* Brand / Logo CEP */}
        <button
          type="button"
          aria-label={t('public.nav.home')}
          onClick={() => handleNav('home')}
          style={{
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--cep-space-3)',
            padding: 0,
          }}
        >
          <div
            style={{
              background: 'var(--cep-color-cep-blue)',
              color: 'var(--cep-color-white)',
              fontWeight: 800,
              fontSize: '1.1rem',
              padding: '6px 12px',
              borderRadius: 'var(--cep-radius-sm)',
              letterSpacing: '1px',
              boxShadow: 'var(--cep-shadow-xs)',
            }}
          >
            CEP
          </div>
          <div style={{ textAlign: 'left', lineHeight: 1.25 }}>
            <strong
              style={{
                color: 'var(--cep-color-deep-blue)',
                fontSize: '1.05rem',
                display: 'block',
                fontWeight: 700,
              }}
            >
              Conseil Électoral Provisoire
            </strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--cep-color-text-secondary)' }}>
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
                  onClick={() => handleNav(item.route)}
                  style={{
                    background: isActive ? 'var(--cep-color-cep-blue-active)' : 'var(--cep-color-cep-blue)',
                    color: 'var(--cep-color-white)',
                    border: 'none',
                    borderRadius: 'var(--cep-radius-full)',
                    cursor: 'pointer',
                    fontSize: 'var(--cep-font-size-small)',
                    fontWeight: 700,
                    padding: '8px 18px',
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
                onClick={() => handleNav(item.route)}
                style={{
                  background: isActive ? 'var(--cep-color-light-blue)' : 'transparent',
                  border: 'none',
                  borderRadius: 'var(--cep-radius-sm)',
                  cursor: 'pointer',
                  fontSize: 'var(--cep-font-size-small)',
                  color: isActive ? 'var(--cep-color-cep-blue)' : 'var(--cep-color-text)',
                  fontWeight: isActive ? 600 : 500,
                  padding: '8px 14px',
                  transition: 'all 0.15s ease',
                }}
              >
                {t(`public.nav.${item.key}`)}
              </button>
            );
          })}
        </nav>

        {/* Language & Mobile Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cep-space-3)' }}>
          <LanguageSwitcher />

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            className="cep-mobile-toggle"
            aria-label={t('public.nav.menu')}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'var(--cep-color-background)',
              border: '1px solid var(--cep-color-border)',
              borderRadius: 'var(--cep-radius-sm)',
              padding: '6px 12px',
              fontSize: '1rem',
              cursor: 'pointer',
              color: 'var(--cep-color-text)',
              display: 'none', // Controlled via CSS media queries
            }}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Collapsible Menu */}
      {mobileMenuOpen && (
        <div
          className="cep-mobile-drawer"
          style={{
            background: 'var(--cep-color-surface)',
            borderTop: '1px solid var(--cep-color-border)',
            padding: 'var(--cep-space-4) var(--cep-space-5)',
            display: 'flex',
            flexDirection: 'column',
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
                  onClick={() => handleNav(item.route)}
                  style={{
                    background: 'var(--cep-color-cep-blue)',
                    color: 'var(--cep-color-white)',
                    border: 'none',
                    borderRadius: 'var(--cep-radius-md)',
                    padding: '12px',
                    fontWeight: 700,
                    fontSize: '1rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    marginTop: 'var(--cep-space-2)',
                  }}
                >
                  🗳️ {t('public.nav.vote')}
                </button>
              );
            }

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleNav(item.route)}
                style={{
                  background: isActive ? 'var(--cep-color-light-blue)' : 'transparent',
                  border: 'none',
                  borderRadius: 'var(--cep-radius-sm)',
                  padding: '10px 14px',
                  textAlign: 'left',
                  fontSize: '0.95rem',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--cep-color-cep-blue)' : 'var(--cep-color-text)',
                  cursor: 'pointer',
                }}
              >
                {t(`public.nav.${item.key}`)}
              </button>
            );
          })}
        </div>
      )}

      {/* Embedded CSS for responsive breakpoint */}
      <style>{`
        @media (max-width: 768px) {
          .cep-desktop-nav {
            display: none !important;
          }
          .cep-mobile-toggle {
            display: inline-block !important;
          }
        }
      `}</style>
    </header>
  );
}

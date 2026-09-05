import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import type { Route } from '../../router';
import { navigate } from '../../router';

interface MobileBottomNavProps {
  currentRoute: Route;
}

const NAV_ITEMS: { key: string; route: Route; icon: string; labelFr: string; labelHt: string; labelEn: string }[] = [
  { key: 'home', route: 'home', icon: '🏠', labelFr: 'Accueil', labelHt: 'Akèy', labelEn: 'Home' },
  { key: 'vote', route: 'vote', icon: '🗳️', labelFr: 'Voter', labelHt: 'Vote', labelEn: 'Vote' },
  { key: 'checkStatus', route: 'check-status', icon: '🔍', labelFr: 'Statut', labelHt: 'Estati', labelEn: 'Status' },
  { key: 'results', route: 'results', icon: '📊', labelFr: 'Résultats', labelHt: 'Rezilta', labelEn: 'Results' },
  { key: 'diaspora', route: 'diaspora', icon: '🌐', labelFr: 'Diaspora', labelHt: 'Diyaspora', labelEn: 'Diaspora' },
];

/** Barre de navigation mobile fixe en bas de l'écran avec icônes explicites et indicateur de page active. */
export function MobileBottomNav({ currentRoute }: MobileBottomNavProps): JSX.Element {
  const { lang } = useI18n();

  return (
    <nav
      className="cep-mobile-bottom-nav"
      aria-label="Navigation mobile"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '64px',
        background: 'var(--cep-color-white)',
        borderTop: '1px solid var(--cep-color-border)',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.08)',
        zIndex: 999,
        display: 'none', // Controlled via CSS media query (@media max-width 768px)
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '0 4px',
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = currentRoute === item.route;
        const label = lang === 'ht' ? item.labelHt : lang === 'en' ? item.labelEn : item.labelFr;

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => navigate(item.route)}
            style={{
              flex: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: isActive ? 'var(--cep-color-cep-blue)' : 'var(--cep-color-text-secondary)',
              position: 'relative',
              transition: 'all 0.15s ease',
            }}
          >
            {/* Active Indicator Bar at Top */}
            {isActive && (
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  width: '32px',
                  height: '3px',
                  background: 'var(--cep-color-cep-blue)',
                  borderRadius: '0 0 4px 4px',
                }}
              />
            )}

            {/* Icon */}
            <span
              style={{
                fontSize: isActive ? '1.35rem' : '1.2rem',
                transform: isActive ? 'scale(1.1)' : 'scale(1)',
                transition: 'transform 0.15s ease',
              }}
            >
              {item.icon}
            </span>

            {/* Explicit Label */}
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--cep-color-cep-blue)' : 'var(--cep-color-text-secondary)',
                lineHeight: 1.1,
              }}
            >
              {label}
            </span>
          </button>
        );
      })}

      <style>{`
        @media (max-width: 768px) {
          .cep-mobile-bottom-nav {
            display: flex !important;
          }
          body {
            padding-bottom: 64px !important;
          }
        }
      `}</style>
    </nav>
  );
}

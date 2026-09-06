import type { JSX } from 'react';
import { useI18n } from '@cep/i18n';
import { LanguageSwitcher, StatusIndicator } from '@cep/design-system';
import type { AdminRoute } from '../../router';
import { ROUTE_META_REGISTRY, adminNavigate } from '../../router';
import { adminApi } from '../../lib/api';
import type { UserAccount } from '../../lib/mockData';
import { USER_ACCOUNTS } from '../../lib/mockData';
import { useViewMode } from '../../context/ViewModeContext';

interface TopbarProps {
  route: AdminRoute;
  user: UserAccount;
  onSwitchUser?: (user: UserAccount) => void;
  onLogout?: () => void;
}

/** Topbar admin CEP V3 — Élection active, statut système, Dual Mode Switcher & Persona Switcher. */
export function Topbar({ route, user, onSwitchUser, onLogout }: TopbarProps): JSX.Element {
  const { t } = useI18n();
  const { viewMode, setViewMode, isInstitutional, isTechnical } = useViewMode();

  const routeMeta = ROUTE_META_REGISTRY[route];
  const routeTitle = routeMeta ? routeMeta.label : 'Tableau de bord';

  const handleSelectPersona = (username: string) => {
    const selected = USER_ACCOUNTS.find((u) => u.username === username);
    if (selected) {
      adminApi.login(selected.username, selected.password).then((res) => {
        if (res.user && onSwitchUser) {
          onSwitchUser(res.user);
          window.location.hash = '#dashboard';
          window.location.reload();
        }
      });
    }
  };

  const scopeLabel = user.scope?.departments?.includes('ALL')
    ? 'Portée : National'
    : `Scope : ${user.scope?.departments?.join(', ') || user.department || 'National'}`;

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--cep-space-4)',
        padding: 'var(--cep-space-3) var(--cep-space-5)',
        background: 'var(--cep-color-white)',
        borderBottom: '1px solid var(--cep-color-border)',
        flexWrap: 'wrap',
      }}
    >
      {/* Route Title & System Status */}
      <div style={{ display: 'flex', gap: 'var(--cep-space-4)', alignItems: 'center', flexWrap: 'wrap' }}>
        <strong style={{ fontSize: '1.2rem', color: 'var(--cep-color-deep-blue)' }}>{routeTitle}</strong>
        <StatusIndicator tone="success" label={t('admin.topbar.systemStatus')} />
        <span
          style={{
            fontSize: '0.75rem',
            background: '#eef4ff',
            color: '#003893',
            padding: '2px 8px',
            borderRadius: 12,
            fontWeight: 700,
            border: '1px solid #b8d1f9',
          }}
        >
          📍 {scopeLabel}
        </span>

        {/* DUAL MODE TOGGLE SWITCH */}
        <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', padding: '3px', borderRadius: 20, border: '1px solid #cbd5e1' }}>
          <button
            type="button"
            onClick={() => setViewMode('institutionnel')}
            title="Mode épuré pour les membres et conseillers du CEP"
            style={{
              background: isInstitutional ? '#003893' : 'transparent',
              color: isInstitutional ? '#ffffff' : '#475569',
              border: 'none',
              padding: '4px 12px',
              borderRadius: 16,
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: isInstitutional ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            🏛️ Mode Institutionnel
          </button>
          <button
            type="button"
            onClick={() => setViewMode('technique')}
            title="Mode complet pour ingénieurs IT et auditeurs"
            style={{
              background: isTechnical ? '#003893' : 'transparent',
              color: isTechnical ? '#ffffff' : '#475569',
              border: 'none',
              padding: '4px 12px',
              borderRadius: 16,
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: isTechnical ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            ⚙️ Mode Technique
          </button>
        </div>
      </div>

      {/* User Persona Quick Switcher & Actions */}
      <div style={{ display: 'flex', gap: 'var(--cep-space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Quick Persona Switcher for UI validation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8f9fa', padding: '4px 8px', borderRadius: 6, border: '1px solid #e0e0e0' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#5f6368' }}>🎭 Commuter Profil (RBAC Test) :</span>
          <select
            value={user.username}
            onChange={(e) => handleSelectPersona(e.target.value)}
            style={{ fontSize: '0.78rem', padding: '3px 6px', borderRadius: 4, border: '1px solid #ccc', fontWeight: 600, background: '#fff', color: '#003893', cursor: 'pointer' }}
          >
            {USER_ACCOUNTS.map((acc) => (
              <option key={acc.id} value={acc.username}>
                {acc.fullName} ({acc.role})
              </option>
            ))}
          </select>
        </div>

        {/* User Scope Link Badge */}
        <button
          type="button"
          onClick={() => adminNavigate('my-scope')}
          style={{
            background: 'var(--cep-color-deep-blue)',
            color: 'white',
            border: 'none',
            padding: '4px 10px',
            borderRadius: 'var(--cep-radius-md)',
            fontSize: '0.78rem',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
          }}
        >
          <span>👤 {user.fullName}</span>
          <span style={{ opacity: 0.75 }}>({user.role})</span>
        </button>

        <LanguageSwitcher />

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            style={{
              background: '#fce8e6',
              color: '#c5221f',
              border: 'none',
              padding: '4px 10px',
              borderRadius: 4,
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Déconnexion
          </button>
        )}
      </div>
    </header>
  );
}
